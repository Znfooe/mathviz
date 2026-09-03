import type { ReactNode } from 'react'

/**
 * 实验页面统一布局组件
 * 
 * 结构：
 * ┌─────────────────────────────────────────────┐
 * │ 标题 + 副标题 + 讲解按钮                       │
 * ├──────────────────────┬──────────────────────┤
 * │                      │  参数控制面板            │
 * │    主图表区域          │  知识点/说明            │
 * │    (较小宽度)          │  步骤控制              │
 * │                      │  其他辅助面板            │
 * ├──────────────────────┴──────────────────────┤
 * │  次图表（如讲解层）或其他说明卡片               │
 * └─────────────────────────────────────────────┘
 */
interface ExperimentShellProps {
  title: string
  subtitle?: string
  onOpenNarration?: () => void
  children: {
    /** 左列：主图表区 */
    mainChart?: ReactNode
    /** 左列底部：次图表或其他展示 */
    secondaryCharts?: ReactNode
    /** 右列：参数面板（自动叠加） */
    controls?: ReactNode[]
    /** 底部说明卡片 */
    footer?: ReactNode
  }
  /** 是否用紧凑模式（图表更小） */
  compact?: boolean
}

export default function ExperimentShell({
  title,
  subtitle,
  onOpenNarration,
  children,
  compact = false,
}: ExperimentShellProps) {
  return (
    <div className="experiment-shell space-y-5">
      {/* 标题栏 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--content-text)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm"
              style={{ color: 'var(--content-text-muted)' }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {onOpenNarration && (
          <button
            onClick={onOpenNarration}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95 flex-shrink-0"
            style={{
              background: 'var(--content-accent)',
              color: 'var(--content-accent-text)',
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            讲解演示
          </button>
        )}
      </div>

      {/* 主体：左图 + 右控制面板 */}
      <div className={`grid grid-cols-1 ${compact ? 'lg:grid-cols-5' : 'lg:grid-cols-3'} gap-5`}>
        {/* 左列 */}
        <div className={compact ? 'lg:col-span-3 space-y-5' : 'lg:col-span-2 space-y-5'}>
          {/* 主图表 */}
          {children.mainChart && (
            <div className="rounded-xl border overflow-hidden"
              style={{
                background: 'var(--content-card-bg)',
                borderColor: 'var(--content-border)',
              }}
            >
              {children.mainChart}
            </div>
          )}

          {/* 次图表 */}
          {children.secondaryCharts && (
            <div className="rounded-xl border overflow-hidden"
              style={{
                background: 'var(--content-card-bg)',
                borderColor: 'var(--content-border)',
              }}
            >
              {children.secondaryCharts}
            </div>
          )}
        </div>

        {/* 右列：控制面板堆叠 */}
        <div className="lg:col-span-1 space-y-4">
          {children.controls?.map((ctrl, i) => (
            <div key={i}>{ctrl}</div>
          ))}
        </div>
      </div>

      {/* 底部说明 */}
      {children.footer && (
        <div className="rounded-xl border p-5"
          style={{
            background: 'var(--content-card-bg)',
            borderColor: 'var(--content-border)',
          }}
        >
          {children.footer}
        </div>
      )}
    </div>
  )
}
