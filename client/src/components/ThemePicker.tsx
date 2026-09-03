import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Palette, RotateCcw, Check, Square, Settings2, X } from 'lucide-react'
import { useTheme, PRESETS } from '../contexts/ThemeContext'

type VarKey = 'accent' | 'sidebarText' | 'contentText' | 'contentTextMuted'

interface VarDef {
  key: VarKey
  cssVar: string
  label: string
}

const ADVANCED_VARS: VarDef[] = [
  { key: 'accent',          cssVar: '--sidebar-accent',       label: '选中背景色' },
  { key: 'sidebarText',     cssVar: '--sidebar-text',         label: '侧边栏文字色' },
  { key: 'contentText',     cssVar: '--content-text',         label: '右侧卡片文字色' },
  { key: 'contentTextMuted',cssVar: '--content-text-muted',   label: '右侧次级文字色' },
]

export default function ThemePicker() {
  const { theme, setTheme, applyPreset, reset } = useTheme()
  const [open, setOpen] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  // 高级面板里的值（直接操作 DOM CSS 变量，不走 React state）
  const [varValues, setVarValues] = useState<Record<VarKey, string>>({
    accent: theme.accentOverride || '',
    sidebarText: getVar('--sidebar-text'),
    contentText: getVar('--content-text'),
    contentTextMuted: getVar('--content-text-muted'),
  })

  function getVar(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  }

  // 当高级面板打开时，同步一次当前值
  function syncVars() {
    setVarValues({
      accent: getVar('--sidebar-accent') || theme.accentOverride || '',
      sidebarText: getVar('--sidebar-text'),
      contentText: getVar('--content-text'),
      contentTextMuted: getVar('--content-text-muted'),
    })
  }

  function applyVar(key: VarKey, cssVar: string, value: string) {
    // accent 特殊：走 ThemeState 触发完整重算
    if (key === 'accent') {
      setTheme({ accentOverride: value })
    } else {
      // 其他直接写 CSS 变量
      document.documentElement.style.setProperty(cssVar, value)
    }
    setVarValues(prev => ({ ...prev, [key]: value }))
  }

  function resetVar(key: VarKey) {
    if (key === 'accent') {
      setTheme({ accentOverride: undefined })  // 清空覆盖，让它自动推导
      syncVars()
    } else {
      // 重新 applyToDOM 会重新推导
      reset()
      setTimeout(syncVars, 0)
    }
  }

  function deriveDefaultAccent(bg: string): string {
    // 默认 accent：浅色背景用黑，深色背景用淡绿
    return isDark(bg) ? '#6ee7b7' : '#111111'
  }

  function isDark(hex: string): boolean {
    const h = hex.replace('#', '')
    return (parseInt(h.substr(0,2),16)*0.299 + parseInt(h.substr(2,2),16)*0.587 + parseInt(h.substr(4,2),16)*0.114) / 255 < 0.5
  }

  const isPresetActive = (p: typeof PRESETS[number]) =>
    theme.bg === p.bg

  const panel = open && typeof document !== 'undefined' && createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
      <div
        className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
        style={{
          bottom: '80px',
          left: '20px',
          width: '280px',
          maxHeight: 'calc(100vh - 100px)',
        }}
      >
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* 预设方案 */}
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-2 tracking-wide uppercase">
              预设方案
            </div>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((p) => {
                const active = isPresetActive(p)
                return (
                  <button
                    key={p.name}
                    onClick={() => { applyPreset(p); setAdvancedOpen(false) }}
                    className="group relative aspect-square rounded-lg border transition-all hover:scale-[1.05]"
                    style={{ borderColor: active ? p.accent : '#e5e5e5', background: p.bg }}
                    title={p.name}
                  >
                    <div className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full" style={{ background: p.accent }} />
                    {active && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: p.accent }}>
                        <Check className="w-2.5 h-2.5" strokeWidth={3}
                          style={{ color: p.accent === '#ffffff' ? '#111' : '#fff' }} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* 主面板 - 只有背景色 */}
          {!advancedOpen && (
            <>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-2 tracking-wide uppercase">
                  背景色（统一）
                </div>
                <div className="flex items-center gap-3">
                  <Square className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-600 flex-1">背景色（侧边栏 + 右侧）</span>
                  <input
                    type="color"
                    value={theme.bg}
                    onChange={(e) => setTheme({ bg: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border border-gray-200 bg-white"
                  />
                  <span className="text-[11px] font-mono text-gray-400 w-14 uppercase">{theme.bg}</span>
                </div>
              </div>

              {/* 自定义颜色按钮 */}
              <button
                onClick={() => { setAdvancedOpen(true); setTimeout(syncVars, 0) }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-colors"
              >
                <Settings2 className="w-3.5 h-3.5" />
                自定义颜色
              </button>
            </>
          )}

          {/* 高级自定义面板 */}
          {advancedOpen && (
            <>
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                  自定义颜色
                </div>
                <button
                  onClick={() => setAdvancedOpen(false)}
                  className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-[10px] text-gray-400 leading-relaxed">
                下面这些会覆盖自动推导的值
              </div>
              <div className="space-y-2.5">
                {ADVANCED_VARS.map(({ key, cssVar, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 flex-1">{label}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={varValues[key] || '#000000'}
                        onChange={(e) => applyVar(key, cssVar, e.target.value)}
                        className="w-7 h-7 rounded cursor-pointer border border-gray-200 bg-white"
                      />
                      <button
                        onClick={() => resetVar(key)}
                        className="p-0.5 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100"
                        title="重置"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="h-px bg-gray-100" />

          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            恢复默认
          </button>
        </div>
      </div>
    </>,
    document.body
  )

  return (
    <div style={{ position: 'sticky', bottom: 0 }}>
      <button
        onClick={() => { setOpen(!open); if (open === false) setAdvancedOpen(false) }}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs transition-colors hover:bg-white/10"
        style={{ color: 'var(--sidebar-text-muted)' }}
      >
        <Palette className="w-4 h-4" />
        <span>主题设置</span>
        <span
          className="ml-auto w-4 h-4 rounded-full border border-white/20"
          style={{ background: `linear-gradient(135deg, ${theme.bg} 0%, ${getVar('--sidebar-accent')} 100%)` }}
        />
      </button>
      {panel}
    </div>
  )
}
