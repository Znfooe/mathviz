import { useCallback, useEffect, useRef, useState } from 'react'
import {
  RefreshCw,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Loader2,
  Power,
  Info,
} from 'lucide-react'

/**
 * 更新状态机：
 * disabled（dev/无更新服务）→ idle → checking → available / up-to-date
 * → downloading(%) → downloaded → (confirm) → applying → done | error
 */
type Phase =
  | 'disabled'
  | 'unsupported'
  | 'idle'
  | 'checking'
  | 'up-to-date'
  | 'available'
  | 'downloading'
  | 'downloaded'
  | 'applying'
  | 'done'
  | 'error'

type UpdateInfo = {
  current: string
  latest: string
  hasUpdate: boolean
  name?: string
  notes?: string
  asset?: { name: string; url: string; size: number } | null
}

const LS_DISMISS = 'mathviz.update.dismissedVersion'

// 手动检查事件（侧边栏按钮 dispatch）
export const CHECK_UPDATE_EVENT = 'mathviz:check-update'

async function fetchJson(url: string, opts?: RequestInit) {
  const resp = await fetch(url, opts)
  const ct = resp.headers.get('content-type') || ''
  if (!resp.ok || !ct.includes('application/json')) return null
  return resp.json()
}

export default function UpdateManager() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [info, setInfo] = useState<UpdateInfo | null>(null)
  const [percent, setPercent] = useState(0)
  const [message, setMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const pollRef = useRef<number | null>(null)
  const autoCheckedRef = useRef(false)

  const stopPolling = () => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  // 轮询服务端下载/安装进度
  const startPolling = useCallback(() => {
    stopPolling()
    pollRef.current = window.setInterval(async () => {
      const s = await fetchJson('/api/update/progress')
      if (!s) return
      if (s.phase === 'downloading') {
        setPhase('downloading')
        setPercent(s.percent || 0)
        setMessage(s.message || '')
      } else if (s.phase === 'downloaded') {
        stopPolling()
        setPhase('downloaded')
        setPercent(100)
      } else if (s.phase === 'applying') {
        setPhase('applying')
        setMessage(s.message || '正在安装更新…')
      } else if (s.phase === 'done') {
        stopPolling()
        setPhase('done')
        setMessage(s.message || '')
      } else if (s.phase === 'error') {
        stopPolling()
        setPhase('error')
        setErrorMsg(s.error || '更新失败')
      }
    }, 1000)
  }, [])

  const check = useCallback(
    async (isManual = false) => {
      setErrorMsg('')
      setPhase('checking')
      const result = await fetchJson('/api/check-update')
      // dev 模式或静态部署：没有更新服务 → 静默禁用
      if (!result || (result.offline === undefined && result.hasUpdate === undefined)) {
        if (result && result.offline) {
          setPhase('idle')
          if (isManual) {
            setErrorMsg(result.error || '无法连接更新服务器')
            setPhase('error')
            setToastVisible(true)
          }
          return
        }
        // dev / 静态部署：没有更新服务
        if (isManual) {
          setPhase('unsupported')
          setToastVisible(true)
        } else {
          setPhase('disabled')
        }
        return
      }
      if (result.offline) {
        setPhase('idle')
        if (isManual) {
          setErrorMsg(result.error || '无法连接更新服务器，请检查网络后重试')
          setPhase('error')
          setToastVisible(true)
        }
        return
      }
      setInfo(result)
      if (result.hasUpdate) {
        const dismissed = localStorage.getItem(LS_DISMISS)
        if (dismissed === result.latest && !isManual) {
          setPhase('idle')
          return
        }
        setPhase('available')
        setToastVisible(true)
      } else {
        setPhase('up-to-date')
        if (isManual) setToastVisible(true)
        else window.setTimeout(() => setPhase('idle'), 3000)
      }
    },
    [],
  )

  // 打开后 5 秒自动静默检查（仅一次）
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!autoCheckedRef.current) {
        autoCheckedRef.current = true
        check(false)
      }
    }, 5000)
    const onManual = () => {
      setToastVisible(true)
      check(true)
    }
    window.addEventListener(CHECK_UPDATE_EVENT, onManual)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener(CHECK_UPDATE_EVENT, onManual)
      stopPolling()
    }
  }, [check])

  const startDownload = async () => {
    if (!info?.asset) return
    setPhase('downloading')
    setPercent(0)
    setToastVisible(true)
    await fetch('/api/update/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latest: info.latest,
        asset: { name: info.asset.name, url: info.asset.url, size: info.asset.size },
      }),
    })
    startPolling()
  }

  const confirmApply = () => {
    setShowConfirm(false)
    setPhase('applying')
    fetch('/api/update/apply', { method: 'POST' })
    startPolling()
  }

  const dismiss = () => {
    if (info?.latest) localStorage.setItem(LS_DISMISS, info.latest)
    setToastVisible(false)
    setShowConfirm(false)
    setPhase('idle')
  }

  // 安装中：全屏不可关闭遮罩
  if (phase === 'applying') {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
      >
        <div
          className="w-full max-w-md rounded-3xl p-8 text-center shadow-2xl"
          style={{ background: 'var(--content-card-bg)' }}
        >
          <div className="mx-auto mb-5 w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-muted)' }}>
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: 'var(--content-accent)' }} />
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--content-text)' }}>
            正在安装更新…
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--content-text-muted)' }}>
            {message || '正在替换平台文件，大约需要几秒到十几秒'}
          </p>
          <p className="mt-4 text-xs font-medium" style={{ color: '#e11d48' }}>
            请勿关闭本平台窗口、请勿断开电源或网络，
            <br />
            否则可能导致文件缺失、平台无法启动。
          </p>
        </div>
      </div>
    )
  }

  // 安装完成：重启提示
  if (phase === 'done') {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}>
        <div className="w-full max-w-md rounded-3xl p-8 text-center shadow-2xl" style={{ background: 'var(--content-card-bg)' }}>
          <div className="mx-auto mb-5 w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-muted)' }}>
            <CheckCircle2 className="w-7 h-7" style={{ color: '#10b981' }} />
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--content-text)' }}>
            更新安装完成
          </h3>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--content-text-muted)' }}>
            新版本 v{info?.latest || ''} 已就绪。
            <br />
            请关闭当前平台窗口，然后重新双击
            <br />
            <span className="font-semibold" style={{ color: 'var(--content-text)' }}>
              「启动平台-Windows.bat」（macOS / Linux 运行 ./start.sh）
            </span>
            ，重启后即为新版。
          </p>
          <div
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
            style={{ background: 'var(--content-accent)', color: 'var(--content-accent-text)' }}
          >
            <Power className="w-4 h-4" />
            请重启平台
          </div>
        </div>
      </div>
    )
  }

  if (!toastVisible || phase === 'disabled') return null

  // 安装前强制确认 modal
  if (showConfirm) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}>
        <div className="w-full max-w-md rounded-3xl p-7 md:p-8 shadow-2xl" style={{ background: 'var(--content-card-bg)' }}>
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(225,29,72,0.1)' }}>
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--content-text)' }}>
                即将开始安装更新
              </h3>
              <div className="text-sm leading-relaxed space-y-2" style={{ color: 'var(--content-text-muted)' }}>
                <p>
                  更新包 <span className="font-semibold" style={{ color: 'var(--content-text)' }}>v{info?.current} → v{info?.latest}</span> 已下载完成并通过完整性校验。
                </p>
                <p className="font-medium text-rose-600">
                  安装期间（约几秒到十几秒）请勿关闭平台窗口、请勿断开电源或网络，否则可能出现功能缺失、导致平台无法启动。
                </p>
                <p>安装完成后需要重启平台生效。</p>
              </div>
            </div>
          </div>
          <div className="mt-7 flex gap-3 justify-end">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-5 py-2.5 rounded-full text-sm font-medium border"
              style={{ borderColor: 'var(--content-border)', color: 'var(--content-text-muted)' }}
            >
              再等等
            </button>
            <button
              onClick={confirmApply}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
              style={{ background: 'var(--content-accent)', color: 'var(--content-accent-text)' }}
            >
              <Download className="w-4 h-4" />
              确认开始更新
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---- 右下角 Toast ----
  return (
    <div className="fixed right-4 bottom-4 md:right-6 md:bottom-6 z-[9998] w-[calc(100%-2rem)] max-w-sm">
      <div
        className="rounded-3xl border p-4 md:p-5 shadow-2xl"
        style={{ background: 'var(--content-card-bg)', borderColor: 'var(--content-border)' }}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--bg-muted)' }}>
            {phase === 'checking' && <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--content-accent)' }} />}
            {phase === 'available' && <Sparkles className="w-5 h-5" style={{ color: 'var(--content-accent)' }} />}
            {(phase === 'downloading' || phase === 'downloaded') && <Download className="w-5 h-5" style={{ color: 'var(--content-accent)' }} />}
            {phase === 'up-to-date' && <CheckCircle2 className="w-5 h-5" style={{ color: '#10b981' }} />}
            {phase === 'error' && <AlertTriangle className="w-5 h-5 text-rose-500" />}
            {phase === 'unsupported' && <Info className="w-5 h-5" style={{ color: 'var(--content-accent)' }} />}
            {phase === 'idle' && <RefreshCw className="w-5 h-5" style={{ color: 'var(--content-text-muted)' }} />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold" style={{ color: 'var(--content-text)' }}>
                {phase === 'checking' && '正在检测更新…'}
                {phase === 'available' && `发现新版本 v${info?.latest}`}
                {phase === 'downloading' && '正在后台下载更新'}
                {phase === 'downloaded' && '更新包已就绪'}
                {phase === 'up-to-date' && `已是最新版本 v${info?.current || ''}`}
                {phase === 'error' && '更新遇到问题'}
                {phase === 'unsupported' && '当前环境不支持在线更新'}
              </span>
              {(phase === 'available' || phase === 'up-to-date' || phase === 'error' || phase === 'unsupported') && (
                <button onClick={dismiss} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity" aria-label="关闭">
                  <X className="w-4 h-4" style={{ color: 'var(--content-text)' }} />
                </button>
              )}
            </div>

            <p className="mt-1 text-xs leading-relaxed line-clamp-3" style={{ color: 'var(--content-text-muted)' }}>
              {phase === 'checking' && '正在连接更新服务器…'}
              {phase === 'available' && (info?.notes?.split('\n')[0] || '新版本已发布，建议立即更新。')}
              {phase === 'downloading' && (message || `下载中… ${percent}%，您可以继续正常使用平台`)}
              {phase === 'downloaded' && '完整性校验通过，点击下方按钮开始安装（需重启平台生效）'}
              {phase === 'up-to-date' && '当前运行的就是最新版本，无需更新。'}
              {phase === 'error' && errorMsg}
            </p>
            {phase === 'unsupported' && (
              <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--content-text-muted)' }}>
                在线更新仅在下载的发布版中可用（双击「启动平台-Windows.bat」或运行 ./start.sh）。开发预览与静态托管部署请重新下载发布包。
              </p>
            )}

            {/* 下载进度条 */}
            {phase === 'downloading' && (
              <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${percent}%`, background: 'var(--content-accent)' }}
                />
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              {phase === 'available' && (
                <>
                  <button
                    onClick={startDownload}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold"
                    style={{ background: 'var(--content-accent)', color: 'var(--content-accent-text)' }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    后台更新
                  </button>
                  <button
                    onClick={dismiss}
                    className="px-4 py-2 rounded-full text-xs font-medium"
                    style={{ color: 'var(--content-text-muted)' }}
                  >
                    稍后
                  </button>
                </>
              )}
              {phase === 'downloaded' && (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold"
                  style={{ background: 'var(--content-accent)', color: 'var(--content-accent-text)' }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  立即安装
                </button>
              )}
              {phase === 'error' && (
                <button
                  onClick={() => check(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border"
                  style={{ borderColor: 'var(--content-border)', color: 'var(--content-text)' }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  重试
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
