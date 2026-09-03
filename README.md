# 数学之美 · 交互式数学可视化平台（MathViz）

> 一个面向**课堂教学**与**自主探索**的交互式数学实验平台：抽象的数学概念，全部变成可以亲手调参、实时变化的图形与动画。

---

## ⚠️ 项目来源与开源协议（请务必阅读）

本项目由 **Znfooe** 基于 **zhangifonly（zhangzhen）** 的开源项目**二次开发**而来，谨向原作者致谢。
原始项目采用 PolyForm Noncommercial 1.0.0 协议，协议原文见 [LICENSE-PolyForm-Noncommercial.md](./LICENSE-PolyForm-Noncommercial.md)。

本项目以 **GNU General Public License v3.0（GPL-3.0）** 发布，协议全文见 [LICENSE](./LICENSE)。

您可以自由地：

- ✅ **使用** —— 用于课堂教学、个人学习、公益科普
- ✅ **修改** —— 按自己的需求调整、扩展实验内容
- ✅ **分发** —— 拷贝、分享给任何人

但必须遵守 GPL-3.0 的** copyleft（传染性开源）**条款：

- 🔗 **任何基于本项目的衍生作品（修改、扩展、二次开发），都必须以相同的 GPL-3.0 协议开源，并公开完整源代码**
- 📢 分发时必须保留原作者署名与本协议声明
- 🚫 遵循原项目 PolyForm Noncommercial 协议，**禁止商业用途**

> 简单来说：**欢迎拿去用、拿去改，但改完也必须免费公开源代码，不允许闭源商用。**

---

## 🎯 目标人群

| 人群 | 使用场景 |
| --- | --- |
| 👩‍🏫 **数学教师**（中小学/大学） | 课堂大屏演示：全屏模式 + 实时调参，把"讲不动"的抽象概念直接演出来 |
| 👨‍🎓 **学生** | 课后自主探索：拖动滑块观察函数变化，建立直觉理解 |
| 🎨 **数学爱好者 / 科普创作者** | 欣赏数学之美，制作演示素材 |
| 💻 **开发者 / 教育技术团队** | 在 GPL-3.0 协议下二次开发，共建教学资源 |

---

## ✨ 平台功能

- **65+ 个交互式数学实验**，覆盖：
  - 极坐标曲线（玫瑰线、心形线……）、三角函数、泰勒展开
  - 线性代数、矩阵分解、特征值、PCA 主成分分析
  - 概率统计：蒙特卡洛方法、马尔可夫链、回归分析
  - 微积分：拉普拉斯变换、热传导方程、小波分析
  - 数论：黄金分割、威尔逊定理、排列组合
  - 几何曲面：螺旋面/悬链面、惠特尼伞、博弈论、信号处理……
- **参数实时调控**：每个实验都配有滑块 + 数字输入框，参数无上限
- **坐标系智能锁定**：调参数时背景坐标系保持不动，只有曲线在变；曲线超出视野才自动扩大
- **全屏演示模式**：一键进入全屏，图表撑满整个屏幕，内置可折叠参数面板，支持 ESC 退出
- **AI 语音讲解**：双音色（晓晓/云希）普通话语音旁白，随实验同步播放
- **主题自定义**：背景色、卡片色、文字色、强调色自由搭配，自动适配对比度
- **防误触设计**：全屏时滚轮不会误缩放图表，适合课堂无线翻页笔/触控板环境

---

## 📦 下载（面向普通使用者）

前往 **[Releases 页面](https://github.com/Znfooe/mathviz/releases)** 下载：

| 文件 | 大小 | 说明 |
| --- | --- | --- |
| `mathviz-v1.0.0-full.zip` | 约 650 MB | **完整版**：含全部 AI 语音讲解，推荐课堂使用 |
| `mathviz-v1.0.0-lite.zip` | 约 18 MB | **轻量版**：不含语音，适合快速体验或网络部署 |

> 两个版本功能完全一致，仅区别于是否内置语音音频。

### 系统要求

- **Windows 10/11**、**macOS 11+** 或 **主流 Linux 发行版**
- [Node.js](https://nodejs.org/) **LTS 版本**（唯一依赖，免费，安装一路下一步即可）
- 无需联网、无需安装其他任何东西

### Windows 使用

1. 解压 zip
2. 双击 **`启动平台-Windows.bat`**
3. 浏览器会自动打开平台（默认地址 `http://localhost:8088`）
4. 关闭黑色命令行窗口即停止服务

### macOS / Linux 使用

```bash
unzip mathviz-v1.0.0-full.zip
cd mathviz-v1.0.0
chmod +x start.sh
./start.sh
```

浏览器会自动打开；如未打开，手动访问终端中提示的地址。

---

## 🖥️ 服务器部署（面向学校/机构）

平台构建产物为**纯静态网站**，部署非常简单：

1. 下载发布包并解压
2. 将包内 **`web/` 目录**的全部内容上传到任意静态 Web 服务器：
   - **nginx**：放入站点根目录，配置 SPA 回退 `try_files $uri /index.html;`
   - **宝塔面板 /  IIS / cPanel**：指向 `web/` 目录即可
   - **Vercel / Netlify / GitHub Pages**：直接拖拽或导入 `web/` 目录
3. 无需 Node.js、无需后端服务、无需数据库

语音音频在 `web/audio/` 目录，随静态资源一起分发即可。

---

## 🛠️ 开发者指南（面向二次开发）

```bash
# 1. 克隆仓库
git clone https://github.com/Znfooe/mathviz.git
cd mathviz

# 2. 安装全部依赖（根目录 + client + server）
npm run install:all

# 3. 启动开发环境（前端 http://localhost:5173 + 后端 http://localhost:3001）
npm run dev
```

构建生产版本：

```bash
cd client
npm run build      # 产物输出到 client/dist/
```

技术栈：**React 19 + TypeScript + Vite + Tailwind CSS + Plotly.js**，后端为 Express + LowDB（仅用于缺陷反馈收集，非核心）。

### 📌 二次开发提醒

根据 GPL-3.0 协议，您的衍生作品**必须**：

1. 以 GPL-3.0 协议开源
2. 保留本项目与原作者 zhangifonly（zhangzhen）的署名
3. 公开您修改后的完整源代码

---

## 📁 项目结构

```
mathviz/
├── client/            # 前端（React + Vite）
│   ├── src/
│   │   ├── experiments/   # 65+ 个数学实验
│   │   ├── components/    # ThemedPlot、参数面板、布局等
│   │   └── contexts/      # 主题、全屏参数等 Context
│   └── public/audio/      # AI 语音讲解音频
├── server/            # 可选后端（缺陷反馈 API）
├── start.bat / start.ps1   # Windows 开发环境一键启动
└── release/           # 发布包构建目录
```

---

## 🙏 致谢

- 原作者 **[zhangifonly](https://github.com/zhangifonly)（zhangzhen）** 创造了本项目的前身
- 所有数学实验灵感来源于经典数学教学内容
- 语音由微软 TTS 双音色生成
