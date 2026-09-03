/**
 * 数学之美 · 交互式数学可视化平台 —— 零依赖本地服务器 + 自动更新引擎
 *
 * 功能：
 *  - 纯内置模块，无需 npm install，Windows / macOS / Linux 通用
 *  - 静态服务（SPA 回退、音频 Range 请求）
 *  - 自动更新：检查 GitHub Release → 后台下载 → 校验 → 原子替换 web/
 *  - 断点自愈：更新中断后重启自动回滚/续完，保证平台永远能启动
 *
 * 用法：node server.js
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { exec } = require('child_process');

const ROOT = __dirname;
const WEB_DIR = path.join(ROOT, 'web');
const UPDATE_DIR = path.join(ROOT, 'update');
const STAGING_DIR = path.join(UPDATE_DIR, 'staging');
const BACKUP_DIR = path.join(ROOT, 'web.bak');
const ARCHIVE_PATH = path.join(UPDATE_DIR, 'download.tar.gz');
const STATE_PATH = path.join(UPDATE_DIR, 'state.json');
const DEFAULT_PORT = parseInt(process.env.PORT || '8088', 10);
const REPO = 'Znfooe/mathviz';

// ----------------------------------------------------------------------
// 版本
// ----------------------------------------------------------------------
function readVersion() {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8'));
  } catch {
    return { version: '1.0.0', appName: '数学之美' };
  }
}
const CURRENT_VERSION = readVersion().version;

// ----------------------------------------------------------------------
// 更新状态
// ----------------------------------------------------------------------
const updateState = {
  phase: 'idle', // idle | downloading | downloaded | applying | done | error
  percent: 0,
  message: '',
  version: null,
  error: null,
};
function saveState() {
  try {
    fs.mkdirSync(UPDATE_DIR, { recursive: true });
    fs.writeFileSync(STATE_PATH, JSON.stringify(updateState, null, 2));
  } catch {}
}
function setPhase(phase, patch = {}) {
  Object.assign(updateState, patch, { phase });
  saveState();
}

// ----------------------------------------------------------------------
// 启动自愈：修复/回滚中断的更新，保证 web/ 完整可用
// ----------------------------------------------------------------------
function selfHeal() {
  try {
    const webOk = fs.existsSync(path.join(WEB_DIR, 'index.html'));
    const stagingRoot = findStagingRoot();
    const stagingOk = stagingRoot && fs.existsSync(path.join(stagingRoot, 'web', 'index.html'));

    // 1. 回滚：web 损坏但有备份 → 还原备份
    if (!webOk && fs.existsSync(BACKUP_DIR)) {
      console.log('[update] web/ incomplete, restoring backup...');
      rimraf(WEB_DIR);
      fs.renameSync(BACKUP_DIR, WEB_DIR);
      console.log('[update] backup restored.');
      return;
    }
    // 2. 续完：staging 完整但替换没做完（web 损坏且无备份）
    if (!webOk && stagingOk) {
      console.log('[update] resuming interrupted update...');
      applyStaging(stagingRoot);
      return;
    }
    // 3. 正常：web 完整 → 清理备份与残留 staging
    if (webOk && fs.existsSync(BACKUP_DIR)) rimraf(BACKUP_DIR);
    if (stagingRoot) rimraf(STAGING_DIR);
    try { fs.unlinkSync(ARCHIVE_PATH); } catch {}
  } catch (e) {
    console.log('[update] self-heal warning:', e.message);
  }
}
function findStagingRoot() {
  if (!fs.existsSync(STAGING_DIR)) return null;
  const entries = fs.readdirSync(STAGING_DIR, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.isDirectory()) {
      const candidate = path.join(STAGING_DIR, ent.name);
      if (fs.existsSync(path.join(candidate, 'web', 'index.html'))) return candidate;
    }
  }
  return null;
}
function rimraf(target) {
  try { fs.rmSync(target, { recursive: true, force: true }); } catch {}
}

// ----------------------------------------------------------------------
// 静态服务
// ----------------------------------------------------------------------
const MIME = {
  '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4',
  '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8', '.map': 'application/json; charset=utf-8', '.wasm': 'application/wasm',
};
function sendFile(res, filePath, stat, range) {
  const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
  if (range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range);
    let start = m && m[1] ? parseInt(m[1], 10) : 0;
    let end = m && m[2] ? parseInt(m[2], 10) : stat.size - 1;
    if (isNaN(end) || end >= stat.size) end = stat.size - 1;
    if (start > end) { res.writeHead(416); return res.end(); }
    res.writeHead(206, {
      'Content-Type': type,
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Content-Length': end - start + 1,
      'Accept-Ranges': 'bytes',
    });
    return fs.createReadStream(filePath, { start, end }).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': stat.size, 'Accept-Ranges': 'bytes' });
  fs.createReadStream(filePath).pipe(res);
}

// ----------------------------------------------------------------------
// 更新 API
// ----------------------------------------------------------------------
function httpGet(url, opts, cb) {
  const mod = url.startsWith('http:') ? http : https
  return mod.get(url, opts, cb)
}

function httpsGetJson(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('too many redirects'));
    httpGet(
      url,
      { headers: { 'User-Agent': 'mathviz-updater', Accept: 'application/vnd.github+json' }, timeout: 20000 },
      (resp) => {
        if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
          resp.resume();
          return resolve(httpsGetJson(resp.headers.location, redirects + 1));
        }
        if (resp.statusCode !== 200) {
          resp.resume();
          return reject(new Error(`HTTP ${resp.statusCode}`));
        }
        let data = '';
        resp.on('data', (c) => (data += c));
        resp.on('end', () => {
          try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
        });
      },
    )
      .on('error', reject)
      .on('timeout', function () { this.destroy(new Error('timeout')); });
  });
}

function downloadToFile(url, dest, onProgress, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('too many redirects'));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);
    httpGet(url, { headers: { 'User-Agent': 'mathviz-updater' }, timeout: 30000 }, (resp) => {
      if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
        file.close();
        try { fs.unlinkSync(dest); } catch {}
        const next = resp.headers.location.startsWith('http')
          ? resp.headers.location
          : new URL(resp.headers.location, url).href;
        return resolve(downloadToFile(next, dest, onProgress, redirects + 1));
      }
      if (resp.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(dest); } catch {}
        return reject(new Error(`下载失败：HTTP ${resp.statusCode}`));
      }
      const total = parseInt(resp.headers['content-length'] || '0', 10);
      let received = 0;
      resp.on('data', (chunk) => {
        received += chunk.length;
        if (total) onProgress(Math.min(99, Math.round((received / total) * 100)), received, total);
      });
      resp.pipe(file);
      file.on('finish', () => file.close(() => resolve({ received, total })));
    })
      .on('error', (e) => {
        file.close();
        try { fs.unlinkSync(dest); } catch {}
        reject(e);
      });
  });
}

function compareVersions(a, b) {
  const pa = String(a).replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b).replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }
  return 0;
}

async function handleCheckUpdate() {
  const release = await httpsGetJson(`https://api.github.com/repos/${REPO}/releases/latest`);
  const latest = (release.tag_name || '').replace(/^v/, '');
  const asset = (release.assets || []).find((a) => /-lite\.tar\.gz$/.test(a.name));
  return {
    current: CURRENT_VERSION,
    latest,
    hasUpdate: compareVersions(latest, CURRENT_VERSION) > 0,
    name: release.name || release.tag_name,
    notes: (release.body || '').slice(0, 2000),
    asset: asset ? { name: asset.name, url: asset.browser_download_url, size: asset.size } : null,
    publishedAt: release.published_at,
  };
}

function startDownload(info) {
  if (updateState.phase === 'downloading' || updateState.phase === 'applying') return;
  if (!info || !info.asset) {
    setPhase('error', { error: '未找到更新包（lite tar.gz）' });
    return;
  }
  setPhase('downloading', { percent: 0, message: '正在后台下载更新…', error: null, version: info.latest });
  downloadToFile(info.asset.url, ARCHIVE_PATH, (percent) =>
    setPhase('downloading', { percent, message: `正在后台下载更新… ${percent}%` }),
  )
    .then(({ received, total }) => {
      // 完整性校验：体积与 GitHub 声明偏差不超过 1%
      if (total && info.asset.size && Math.abs(received - info.asset.size) / info.asset.size > 0.01) {
        throw new Error('下载文件不完整，请重试');
      }
      setPhase('downloaded', { percent: 100, message: '更新包下载完成，等待安装' });
    })
    .catch((e) => {
      setPhase('error', { error: `下载失败：${e.message}。请检查网络后重试。` });
    });
}

/** 解压 staging 并执行替换（同步流程，通常 3~8 秒） */
function applyStaging(stagingRoot) {
  // 1. 备份音频：新包（lite）不含 audio，需要把旧音频保留
  const oldAudio = path.join(WEB_DIR, 'audio');
  const hasOldAudio = fs.existsSync(oldAudio);
  const newHasAudio = fs.existsSync(path.join(stagingRoot, 'web', 'audio'));

  // 2. 备份旧 web
  rimraf(BACKUP_DIR);
  fs.renameSync(WEB_DIR, BACKUP_DIR);

  // 3. 部署新 web（同盘 rename 为原子操作）
  fs.renameSync(path.join(stagingRoot, 'web'), WEB_DIR);

  // 4. 音频回迁
  if (hasOldAudio && !newHasAudio) {
    fs.renameSync(path.join(BACKUP_DIR, 'audio'), path.join(WEB_DIR, 'audio'));
  }

  // 5. 更新启动器与根文件（server.js 运行中覆盖，下次重启生效）
  const rootFiles = ['server.js', 'start.sh', '启动平台-Windows.bat', '使用说明.txt', 'version.json', 'README.md'];
  for (const f of rootFiles) {
    const src = path.join(stagingRoot, f);
    if (fs.existsSync(src)) {
      try { fs.copyFileSync(src, path.join(ROOT, f)); } catch (e) { console.log('[update] skip root file', f, e.message); }
    }
  }

  // 6. 清理
  rimraf(BACKUP_DIR);
  rimraf(STAGING_DIR);
  try { fs.unlinkSync(ARCHIVE_PATH); } catch {}

  const newVersion = (() => {
    try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8')).version; } catch { return null; }
  })();
  setPhase('done', { percent: 100, message: '更新安装完成', version: newVersion || updateState.version });
}

function startApply() {
  if (updateState.phase === 'applying') return;
  if (updateState.phase !== 'downloaded') {
    setPhase('error', { error: '更新包尚未下载完成' });
    return;
  }
  setPhase('applying', { percent: 0, message: '正在安装更新…' });
  // 解压（系统 tar：Windows 10+ / macOS / Linux 均内置）
  rimraf(STAGING_DIR);
  fs.mkdirSync(STAGING_DIR, { recursive: true });
  execFile('tar', ['-xzf', ARCHIVE_PATH, '-C', STAGING_DIR], (err) => {
    if (err) {
      setPhase('error', { error: '解压失败：' + err.message });
      return;
    }
    const stagingRoot = findStagingRoot();
    if (!stagingRoot) {
      setPhase('error', { error: '更新包校验失败：缺少 web/index.html，已中止（平台不受影响）' });
      return;
    }
    try {
      applyStaging(stagingRoot);
    } catch (e) {
      // 替换失败 → 尝试回滚
      try {
        if (!fs.existsSync(path.join(WEB_DIR, 'index.html')) && fs.existsSync(BACKUP_DIR)) {
          rimraf(WEB_DIR);
          fs.renameSync(BACKUP_DIR, WEB_DIR);
        }
      } catch {}
      setPhase('error', { error: '安装失败：' + e.message + '（已尝试自动回滚）' });
    }
  });
}

// ----------------------------------------------------------------------
// HTTP 服务
// ----------------------------------------------------------------------
function sendJson(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const urlPath = req.url.split('?')[0];

  // ---- 更新 API ----
  if (urlPath === '/api/version' && req.method === 'GET') {
    return sendJson(res, 200, { version: CURRENT_VERSION, ...readVersion() });
  }
  if (urlPath === '/api/update/progress' && req.method === 'GET') {
    return sendJson(res, 200, updateState);
  }
  if (urlPath === '/api/check-update' && req.method === 'GET') {
    try {
      const info = await handleCheckUpdate();
      return sendJson(res, 200, info);
    } catch (e) {
      return sendJson(res, 200, { current: CURRENT_VERSION, error: '检查更新失败：' + e.message, offline: true });
    }
  }
  if (urlPath === '/api/update/start' && req.method === 'POST') {
    const body = await readBody(req);
    if (updateState.phase === 'downloading' || updateState.phase === 'applying') {
      return sendJson(res, 200, { ok: false, message: '更新已在进行中' });
    }
    startDownload(body);
    return sendJson(res, 200, { ok: true });
  }
  if (urlPath === '/api/update/apply' && req.method === 'POST') {
    startApply();
    return sendJson(res, 200, { ok: true });
  }

  // ---- 静态文件 ----
  let filePath;
  try { filePath = path.normalize(path.join(WEB_DIR, decodeURIComponent(urlPath))); }
  catch { res.writeHead(400); return res.end(); }
  if (!filePath.startsWith(WEB_DIR)) { res.writeHead(403); return res.end(); }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) {
      const idx = path.join(filePath, 'index.html');
      return fs.stat(idx, (e2, s2) => (e2 ? spaFallback(res) : sendFile(res, idx, s2, req.headers.range)));
    }
    if (err) return spaFallback(res, filePath);
    sendFile(res, filePath, stat, req.headers.range);
  });
});
function spaFallback(res, notFoundPath) {
  const index = path.join(WEB_DIR, 'index.html');
  fs.stat(index, (err, stat) => {
    if (err) { res.writeHead(404); return res.end('Not Found'); }
    if (notFoundPath && path.extname(notFoundPath)) { res.writeHead(404); return res.end('Not Found'); }
    sendFile(res, index, stat);
  });
}

function findPort(port, cb) {
  const tester = http.createServer();
  tester.on('error', () => findPort(port + 1, cb));
  tester.listen(port, '127.0.0.1', () => tester.close(() => cb(port)));
}

selfHeal();
findPort(DEFAULT_PORT, (port) => {
  server.listen(port, '127.0.0.1', () => {
    const url = `http://localhost:${port}`;
    console.log('');
    console.log('  ==================================================');
    console.log(`    ${readVersion().appName}  v${CURRENT_VERSION}`);
    console.log('  ==================================================');
    console.log('');
    console.log(`  平台地址:  ${url}`);
    console.log('  浏览器应已自动打开；如未打开，请手动复制上面的地址。');
    console.log('  关闭本窗口或按 Ctrl+C 即可停止服务。');
    console.log('');
    const opener =
      process.platform === 'win32' ? `start "" "${url}"`
      : process.platform === 'darwin' ? `open "${url}"`
      : `xdg-open "${url}" >/dev/null 2>&1 || true`;
    exec(opener, () => {});
  });
});
