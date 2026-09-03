import { useEffect } from 'react'
import { useFullscreenParam } from '../../contexts/FullscreenParamContext'

interface SliderParam {
  key: string
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
}

interface ParameterPanelProps {
  title: string
  params: SliderParam[]
  onChange: (key: string, value: number) => void
  className?: string
}

export default function ParameterPanel({ title, params, onChange, className = '' }: ParameterPanelProps) {
  // 自动向全屏系统注册自己，让全屏模式也能调参数
  const { registerPanel, unregisterPanel } = useFullscreenParam()
  useEffect(() => {
    registerPanel(() => {
      // 这个函数会在 ThemedPlot 全屏 overlay 里被调用
      // 直接复用当前组件的 props 渲染一个独立实例
      return (
        <div className="rounded-xl shadow-sm border overflow-hidden"
          style={{
            background: 'var(--content-card-bg)',
            borderColor: 'var(--content-border)',
          }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--content-border)' }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--content-accent)' }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--content-accent-text)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--content-text)' }}>{title}</h3>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {params.map((param) => {
              const step = param.step || 1
              const decimals = step < 1 ? (step.toString().split('.')[1]?.length || 2) : 0
              const percentage = Math.min(100, Math.max(0, ((param.value - param.min) / (param.max - param.min)) * 100))
              return (
                <div key={param.key} className="group">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <label className="text-sm font-medium flex-shrink-0" style={{ color: 'var(--content-text)' }}>{param.label}</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={param.value}
                        step={step}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value)
                          if (!isNaN(v)) onChange(param.key, v)
                        }}
                        className="w-16 text-right text-sm font-semibold tabular-nums rounded-md border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                        style={{ background: 'var(--content-bg)', borderColor: 'var(--content-border)', color: 'var(--content-text)' }}
                      />
                      {param.unit && <span className="text-xs flex-shrink-0" style={{ color: 'var(--content-text-muted)' }}>{param.unit}</span>}
                    </div>
                  </div>
                  <div className="relative h-5 flex items-center">
                    <div className="absolute inset-x-0 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--content-bg)' }}>
                      <div className="h-full rounded-full transition-all duration-150" style={{ width: `${percentage}%`, background: 'var(--content-accent)' }} />
                    </div>
                    <input
                      type="range" min={param.min} max={param.max} step={step}
                      value={Math.min(param.max, Math.max(param.min, param.value))}
                      onChange={(e) => onChange(param.key, parseFloat(e.target.value))}
                      className="relative w-full h-5 appearance-none bg-transparent cursor-pointer z-10"
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-[10px]" style={{ color: 'var(--content-text-muted)' }}>
                    <span>参考 {param.min}~{param.max}{param.unit || ''}</span>
                    {decimals > 0 && <span>精度 ±{step}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }, title)
    return () => unregisterPanel()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, params, onChange])
  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden transition-all duration-300 ${className}`}
      style={{
        background: 'var(--content-card-bg)',
        borderColor: 'var(--content-border)',
      }}
    >
      {/* 标题栏 */}
      <div className="px-4 py-3 border-b"
        style={{ borderColor: 'var(--content-border)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'var(--content-accent)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              style={{ color: 'var(--content-accent-text)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--content-text)' }}>{title}</h3>
        </div>
      </div>

      {/* 参数列表 */}
      <div className="p-4 space-y-4">
        {params.map((param) => {
          const step = param.step || 1
          const decimals = step < 1 ? (step.toString().split('.')[1]?.length || 2) : 0
          const percentage = Math.min(100, Math.max(0, ((param.value - param.min) / (param.max - param.min)) * 100))

          return (
            <div key={param.key} className="group">
              {/* label + 输入框 + 单位 */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <label className="text-sm font-medium flex-shrink-0" style={{ color: 'var(--content-text)' }}>
                  {param.label}
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={param.value}
                    step={step}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value)
                      if (!isNaN(v)) onChange(param.key, v)
                    }}
                    onBlur={(e) => {
                      // blur 时为空则恢复 min
                      if (e.target.value === '') onChange(param.key, param.min)
                    }}
                    className="w-16 text-right text-sm font-semibold tabular-nums rounded-md border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                    style={{
                      background: 'var(--content-bg)',
                      borderColor: 'var(--content-border)',
                      color: 'var(--content-text)',
                    }}
                  />
                  {param.unit && (
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--content-text-muted)' }}>
                      {param.unit}
                    </span>
                  )}
                </div>
              </div>

              {/* 滑块（参考范围，不硬性限制） */}
              <div className="relative h-5 flex items-center">
                <div className="absolute inset-x-0 h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'var(--content-bg)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-150"
                    style={{
                      width: `${percentage}%`,
                      background: 'var(--content-accent)',
                    }}
                  />
                </div>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={step}
                  value={Math.min(param.max, Math.max(param.min, param.value))}
                  onChange={(e) => onChange(param.key, parseFloat(e.target.value))}
                  className="relative w-full h-5 appearance-none bg-transparent cursor-pointer z-10 slider-thumb"
                  style={{
                    // 自定义 thumb
                  }}
                />
              </div>

              {/* 参考范围提示（小） */}
              <div className="flex justify-between mt-1 text-[10px]"
                style={{ color: 'var(--content-text-muted)' }}
              >
                <span>参考 {param.min}~{param.max}{param.unit || ''}</span>
                {decimals > 0 && (
                  <span>精度 ±{step}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
