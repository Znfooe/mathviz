import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'

// ============ 预设方案 ============
export interface ThemePreset {
  name: string
  bg: string       // 统一背景色（侧边栏 + 右侧共享）
  accent?: string   // 可选，自定义选中色；不填则自动比 bg 深一点
}

export const PRESETS: ThemePreset[] = [
  { name: '默认·淡绿', bg: '#d4f1e0' },
  { name: '薄荷清新', bg: '#e0f5ea' },
  { name: '海洋蓝',   bg: '#e6eef8' },
  { name: '淡雅紫',   bg: '#ede4f7' },
  { name: '极简白',   bg: '#ffffff' },
  { name: '深夜黑',   bg: '#111111' },
  { name: '日落橙',   bg: '#fde8d0' },
  { name: '樱花粉',   bg: '#fce4ec' },
]

// ============ 主题状态（只暴露 1 项，选中色自动推导） ============
export interface ThemeState {
  bg: string
  accentOverride?: string  // 可选：用户在高级面板手动覆盖的选中色
}

interface ThemeContextType {
  theme: ThemeState
  setTheme: (t: Partial<ThemeState>) => void
  applyPreset: (p: ThemePreset) => void
  reset: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

const STORAGE_KEY = 'mathviz-theme-v5'
const DEFAULT: ThemeState = PRESETS[0]

// ============ 颜色工具函数 ============
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ]
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function isDark(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5
}

// 让颜色向白色或黑色方向偏移（amount 0~1）
function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(
    Math.round(r + (255 - r) * amount),
    Math.round(g + (255 - g) * amount),
    Math.round(b + (255 - b) * amount),
  )
}

function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(
    Math.round(r * (1 - amount)),
    Math.round(g * (1 - amount)),
    Math.round(b * (1 - amount)),
  )
}

// 根据背景色自动推导卡片背景（浅背景 → 更白，深背景 → 稍浅）
function deriveCardBg(bg: string): string {
  if (isDark(bg)) {
    return lighten(bg, 0.15)
  } else {
    return lighten(bg, 0.25)
  }
}

// 根据背景色选文字色（对比度优先）
function deriveText(bg: string): string {
  return isDark(bg) ? '#ffffff' : '#111111'
}

function deriveTextMuted(bg: string): string {
  return isDark(bg) ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)'
}

function deriveBorder(bg: string): string {
  return isDark(bg) ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
}

function deriveBgHover(bg: string): string {
  return isDark(bg) ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
}

// ============ 应用到 DOM ============
// 根据 bg 自动推导选中色：比 bg 深 25%（让用户感觉到是"在这个背景上被选中了"）
function deriveAccent(bg: string): string {
  // 如果 bg 本身已经很深（深色主题），用一个柔和的亮色作对比
  if (isDark(bg)) return '#1f1f1f'
  return darken(bg, 0.25)
}

function applyToDOM(bg: string, accentOverride?: string) {
  const r = document.documentElement

  // accent = 用户手动覆盖的，或者自动比 bg 深 25%
  const accent = accentOverride || deriveAccent(bg)

  // 所有自动推导的颜色
  const cardBg = deriveCardBg(bg)
  const text = deriveText(bg)                // 背景上的文字色
  const textMuted = deriveTextMuted(bg)
  const cardText = deriveText(cardBg)        // 卡片上的文字色（关键！用户要的）
  const cardTextMuted = deriveTextMuted(cardBg)
  const accentText = isDark(accent) ? '#ffffff' : '#111111'

  // 统一背景（侧边栏 + 右侧共享）
  r.style.setProperty('--sidebar-bg', bg)
  r.style.setProperty('--content-bg', bg)

  // 卡片（自动比背景浅）
  r.style.setProperty('--sidebar-card-bg', cardBg)
  r.style.setProperty('--content-card-bg', cardBg)

  // 选中色（accent）= 比 bg 深一点，选中态用液体填充动画
  r.style.setProperty('--sidebar-accent', accent)
  r.style.setProperty('--content-accent', accent)
  r.style.setProperty('--sidebar-accent-text', accentText)
  r.style.setProperty('--content-accent-text', accentText)
  r.style.setProperty('--sidebar-logo-bg', accent)

  // 侧边栏文字（直接放 bg 上的）
  r.style.setProperty('--sidebar-text', text)
  r.style.setProperty('--sidebar-text-muted', textMuted)
  r.style.setProperty('--sidebar-border', deriveBorder(bg))
  r.style.setProperty('--sidebar-bg-hover', deriveBgHover(bg))

  // 右侧卡片文字（关键！图标颜色也会走这里）
  r.style.setProperty('--content-text', cardText)
  r.style.setProperty('--content-text-muted', cardTextMuted)
  r.style.setProperty('--content-border', deriveBorder(cardBg))
}

// ============ Provider ============
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeState>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY)
      return s ? { ...DEFAULT, ...JSON.parse(s) } : DEFAULT
    } catch { return DEFAULT }
  })

  useEffect(() => { applyToDOM(theme.bg, theme.accentOverride) }, [])

  const setTheme = useCallback((partial: Partial<ThemeState>) => {
    setThemeState(prev => {
      const next = { ...prev, ...partial }
      applyToDOM(next.bg, next.accentOverride)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  const applyPreset = useCallback((p: ThemePreset) => {
    applyToDOM(p.bg, p.accent)
    setTheme({ bg: p.bg, accentOverride: p.accent })
  }, [setTheme])

  const reset = useCallback(() => applyPreset(DEFAULT), [applyPreset])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, applyPreset, reset }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
