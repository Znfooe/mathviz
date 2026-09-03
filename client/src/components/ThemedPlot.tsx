import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import Plot, { PlotParams } from 'react-plotly.js'
import { useFullscreenParam } from '../contexts/FullscreenParamContext'

/**
 * 主题化 Plotly 组件
 * - 强制白色背景
 * - 🔒 锁定坐标系范围：参数变化时保持坐标轴不动，只变曲线
 * - 🔒 禁用滚轮缩放（scrollZoom: false）
 * - 点击全屏按钮后，用 portal 创建真正的全屏 overlay
 */
export default function ThemedPlot(props: PlotParams & { title?: string }) {
  const [isOverlay, setIsOverlay] = useState(false)
  const [showPanel, setShowPanel] = useState(true)
  const { panel } = useFullscreenParam()
  const overlayRef = useRef<HTMLDivElement>(null)

  // 🔒 坐标系 range 智能锁定
  // 策略：
  //  1) 首次 / 切曲线类型（span 突变 >2 倍）：在实验给定 range 基础上再扩 INIT_PAD，
  //     保证一开始视野宽裕、函数完整可见
  //  2) 参数微调：坐标系纹丝不动，只有曲线在变
  //  3) 函数跑出边界：只扩不缩 —— 超出方向扩展 GROW_PAD 余量，缩回来时不回缩（避免来回跳）
  const lockedRange = useRef<{
    x?: [number, number]
    y?: [number, number]
  }>({})

  const INIT_PAD = 0.25  // 首次锁定时，相对 span 额外扩 25%
  const GROW_PAD = 0.1   // 超出边界扩展时，留 10% 余量

  // 数据结构签名：trace 的 type/name/mode 组合
  // 调参数时签名不变；切曲线类型 / 换图时 name 或 type 变化 → 签名改变
  const dataSignature = (() => {
    const traces = (props.data || []) as Array<Record<string, unknown>>
    return traces
      .map(t => [t.type, t.name ?? '', t.mode ?? ''].join('|'))
      .join(';')
  })()
  const lastSigRef = useRef<string | undefined>(undefined)

  // 首次/重置：range 两端各加 span*ratio 的 padding
  const withPadding = (r: [number, number], ratio: number): [number, number] => {
    const span = r[1] - r[0]
    const pad = span * ratio
    return [r[0] - pad, r[1] + pad]
  }

  // 核心：根据实验传入的 rawRange，更新锁定值
  const resolveLocked = (
    locked: [number, number] | undefined,
    raw: [number, number]
  ): [number, number] => {
    // ① 还没锁过（首次渲染 / 切曲线类型后重置）→ 加 padding 锁定
    if (!locked) return withPadding(raw, INIT_PAD)
    // ② 只扩不缩：raw 超出 locked 边界时，扩展该方向（带余量）；否则保持不动
    //    注意：参数大幅调小（raw 缩很多）也保持不动，坐标系绝不回缩跳动
    const span = locked[1] - locked[0]
    const pad = span * GROW_PAD
    return [
      raw[0] < locked[0] ? raw[0] - pad : locked[0],
      raw[1] > locked[1] ? raw[1] + pad : locked[1],
    ]
  }

  // 🔒 处理 layout：锁定 xaxis/yaxis range
  const processedLayout = useMemo(() => {
    const raw = props.layout as Record<string, unknown> | undefined
    if (!raw) return raw

    // 数据结构变了（切曲线类型 / 换图）→ 清空锁定，让坐标系按新曲线重新适配
    if (lastSigRef.current !== undefined && lastSigRef.current !== dataSignature) {
      lockedRange.current = {}
    }
    lastSigRef.current = dataSignature

    const layout = { ...raw } as Record<string, unknown>

    const rawXAxis = { ...((layout.xaxis as Record<string, unknown> | undefined) || {}) }
    const rawYAxis = { ...((layout.yaxis as Record<string, unknown> | undefined) || {}) }
    const rawXRange = rawXAxis.range as [number, number] | undefined
    const rawYRange = rawYAxis.range as [number, number] | undefined

    if (rawXRange) {
      lockedRange.current.x = resolveLocked(lockedRange.current.x, rawXRange)
      rawXAxis.range = lockedRange.current.x
      // 锁定期间禁止 autorange 抢回控制权
      rawXAxis.autorange = false
      // 双保险：禁止用户拖拽/框选改变该轴范围（坐标系绝对稳定）
      rawXAxis.fixedrange = true
    }

    if (rawYRange) {
      lockedRange.current.y = resolveLocked(lockedRange.current.y, rawYRange)
      rawYAxis.range = lockedRange.current.y
      rawYAxis.autorange = false
      rawYAxis.fixedrange = true
    }

    layout.xaxis = rawXAxis
    layout.yaxis = rawYAxis
    return layout
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.layout, dataSignature])

  const title = props.title || ''

  // ESC 退出
  useEffect(() => {
    if (!isOverlay) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOverlay(false) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [isOverlay])

  const exit = useCallback(() => setIsOverlay(false), [])

  // 基础配置 —— 🔒 禁用滚轮缩放
  const baseConfig = {
    responsive: true,
    displaylogo: false,
    displayModeBar: true,
    scrollZoom: false,  // 🔒 关键：禁止滚轮当缩放
    modeBarButtonsToRemove: [
      'lasso2d', 'select2d', 'toggleSpikelines',
      'hoverClosestCartesian', 'hoverCompareCartesian',
    ],
    ...props.config,
  }

  // 基础 layout —— 🔒 使用锁后的 layout
  const baseLayout = {
    autosize: true,
    margin: { t: 30, r: 30, b: 30, l: 30 },
    paper_bgcolor: '#ffffff',
    plot_bgcolor: '#ffffff',
    font: { color: '#333333' },
    ...processedLayout,
  }

  // overlay layout
  const overlayLayout = {
    ...baseLayout,
    height: undefined,
    width: undefined,
  }

  return (
    <>
      {/* 普通模式 */}
      <div className="themed-plot-wrapper relative group">
        <Plot {...props} layout={baseLayout} config={baseConfig} />

        {/* 全屏按钮 */}
        <button
          onClick={() => setIsOverlay(true)}
          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/95 hover:bg-white rounded-lg p-1.5 shadow-sm border border-slate-200 hover:border-slate-300"
          title="全屏显示"
          style={{ color: '#333' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* 全屏 overlay —— portal 到 body */}
      {isOverlay && createPortal(
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[9999] flex flex-col"
          style={{ background: '#f8fafc' }}
        >
          {/* 顶部栏 */}
          <div className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
            style={{ borderColor: '#e2e8f0', background: '#ffffff' }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={exit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md hover:bg-slate-100 transition-colors"
                style={{ color: '#334155' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                </svg>
                退出全屏
              </button>
              {title && (
                <span className="text-sm font-medium text-slate-600">{title}</span>
              )}
              <span className="text-xs text-slate-400 hidden sm:inline">ESC 退出 · 滚轮已锁定</span>
            </div>

            {/* 参数面板切换按钮 */}
            {panel && (
              <button
                onClick={() => setShowPanel(s => !s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-all ${
                  showPanel ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                {showPanel ? '收起参数' : '参数面板'}
              </button>
            )}
          </div>

          {/* 主体 */}
          <div className="flex-1 flex min-h-0 relative">
            {/* Plotly */}
            <div className="flex-1 min-w-0 min-h-0 p-4">
              <div className="w-full h-full bg-white rounded-lg border" style={{ borderColor: '#e2e8f0' }}>
                <Plot
                  {...props}
                  layout={overlayLayout}
                  config={baseConfig}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>

            {/* 参数面板（可折叠） */}
            {panel && (
              <div
                className={`border-l transition-all duration-300 flex-shrink-0 overflow-hidden ${
                  showPanel ? 'w-80' : 'w-0'
                }`}
                style={{ borderColor: '#e2e8f0', background: '#f1f5f9' }}
              >
                <div className="w-80 p-4 h-full overflow-y-auto">
                  {panel.render()}
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
