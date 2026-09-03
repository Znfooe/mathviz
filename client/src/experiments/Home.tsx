import { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowUpRight, Heart, SearchX, Film, ListOrdered, Sigma, Star } from 'lucide-react'
import { experiments } from './catalog'
import type { DifficultyLevel, Experiment } from './catalog'
import { makeFuse, buildIndex, searchExperiments } from './searchExperiments'
import { topicIconMap, resolveIcon } from '../utils/iconMap'
import { Reveal, CountUp } from '../components/motion/Reveal'
import { useFavorites } from '../contexts/FavoritesContext'

// ------------------------------------------------------------------
// 难度配置：黑白简约体系，仅保留一个彩色圆点作为难度识别
// ------------------------------------------------------------------
const difficultyConfig: Record<
  DifficultyLevel,
  { label: string; ageRange: string; dot: string }
> = {
  beginner:     { label: '入门级', ageRange: '小学 6-12 岁', dot: '#10b981' },
  elementary:   { label: '基础级', ageRange: '初中 12-15 岁', dot: '#3b82f6' },
  intermediate: { label: '中级',   ageRange: '高中 15-18 岁', dot: '#f59e0b' },
  advanced:     { label: '高级',   ageRange: '大学本科',      dot: '#8b5cf6' },
  expert:       { label: '专业级', ageRange: '研究生 +',      dot: '#f43f5e' },
}
const LEVEL_ORDER = Object.keys(difficultyConfig) as DifficultyLevel[]

const topicCategories = [
  { id: 'geometry',       label: '几何' },
  { id: 'algebra',        label: '代数' },
  { id: 'calculus',       label: '微积分' },
  { id: 'probability',    label: '概率统计' },
  { id: 'linear-algebra', label: '线性代数' },
  { id: 'analysis',       label: '分析' },
  { id: 'discrete',       label: '离散数学' },
  { id: 'applied',        label: '应用数学' },
]

// Hero 背景叠层符号（错位 + 不同视差速度 + 液体漂浮）
const HERO_SYMBOLS = [
  { char: '∑', className: 'top-[-6%] right-[4%]  text-[180px] md:text-[260px]', speed: 0.10,  float: 'float-symbol-a' },
  { char: '∫', className: 'top-[38%] left-[-4%] text-[220px] md:text-[320px]', speed: -0.07, float: 'float-symbol-b' },
  { char: 'π', className: 'bottom-[-10%] right-[16%] text-[150px] md:text-[210px]', speed: 0.06, float: 'float-symbol-b' },
  { char: '∞', className: 'top-[16%] right-[32%] text-[110px] md:text-[160px] hidden md:block', speed: -0.12, float: 'float-symbol-a' },
  { char: '√', className: 'bottom-[8%] left-[24%] text-[130px] md:text-[190px] hidden md:block', speed: 0.14, float: 'float-symbol-b' },
]

function groupByDifficulty(exps: Experiment[]) {
  const groups: Record<DifficultyLevel, Experiment[]> = {
    beginner: [], elementary: [], intermediate: [], advanced: [], expert: [],
  }
  exps.forEach((e) => groups[e.difficulty].push(e))
  return groups
}

/** Hero 背景符号视差：scroll 时 rAF 合帧，直接写 DOM transform（外层管视差，内层管漂浮） */
function useParallax() {
  const layersRef = useRef<(HTMLDivElement | null)[]>([])
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = window.scrollY
        layersRef.current.forEach((el, i) => {
          if (el) el.style.transform = `translate3d(0, ${(y * HERO_SYMBOLS[i].speed).toFixed(1)}px, 0)`
        })
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])
  return layersRef
}

export default function Home() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all')
  const [selectedTopic, setSelectedTopic] = useState<string | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const now = new Date()
  const isValentineSeason = now.getMonth() === 1 && now.getDate() >= 12 && now.getDate() <= 16

  const fuse = useMemo(() => makeFuse(buildIndex(experiments)), [])
  const searchMatched = useMemo(
    () => searchExperiments(experiments, searchQuery, fuse),
    [searchQuery, fuse],
  )
  const filteredExperiments = searchMatched.filter(
    (exp) =>
      (selectedDifficulty === 'all' || exp.difficulty === selectedDifficulty) &&
      (selectedTopic === 'all' || exp.topics.includes(selectedTopic)),
  )
  const groupedExperiments = groupByDifficulty(filteredExperiments)

  const difficultyStats = useMemo(() => {
    const stats = {} as Record<DifficultyLevel, number>
    LEVEL_ORDER.forEach((l) => (stats[l] = experiments.filter((e) => e.difficulty === l).length))
    return stats
  }, [])

  const layersRef = useParallax()

  return (
    <div className="relative max-w-7xl mx-auto">
      {/* ============ 情人节横幅 ============ */}
      {isValentineSeason && (
        <Link
          to="/valentine"
          className="group relative block overflow-hidden rounded-3xl border border-rose-200 bg-[#fff1f3] p-4 md:p-5 mb-10 md:mb-14 transition-shadow duration-500 hover:shadow-[0_20px_44px_-18px_rgba(244,63,94,0.35)]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/30 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
              <Heart className="w-6 h-6 md:w-7 md:h-7 text-white" fill="currentColor" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base md:text-lg font-bold text-rose-600">情人节快乐 · 四种数学表白函数</div>
              <div className="text-rose-400 text-xs md:text-sm mt-0.5">
                心形参数方程 · 笛卡尔心形线 · 隐函数心形 · 简洁心形 — 点击查看沉浸式动画
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 text-rose-400 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </Link>
      )}

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden pt-6 md:pt-16 pb-12 md:pb-20">
        {/* 背景叠层：错位数学符号，视差 + 液体漂浮 */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {HERO_SYMBOLS.map((s, i) => (
            <div
              key={i}
              ref={(el) => { layersRef.current[i] = el }}
              className={`absolute ${s.className} will-change-transform`}
            >
              <span
                className={`block font-serif font-bold leading-none select-none ${s.float}`}
                style={{ color: 'var(--content-text)', opacity: 0.055 }}
              >
                {s.char}
              </span>
            </div>
          ))}
        </div>

        <div className="relative">
          <Reveal y={16}>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs md:text-sm font-medium"
              style={{ borderColor: 'var(--content-border)', color: 'var(--content-text-muted)', background: 'var(--content-card-bg)' }}
            >
              <span className="pulse-dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--content-accent)' }} />
              交互式数学可视化平台
            </div>
          </Reveal>

          <h1
            className="animate-glitch-in mt-6 md:mt-8 text-[clamp(2.75rem,7vw,5.75rem)] font-bold tracking-tight leading-[1.05]"
            style={{ color: 'var(--content-text)' }}
          >
            数学之美
          </h1>

          <Reveal y={24} delay={0.25}>
            <p
              className="mt-5 md:mt-6 max-w-2xl text-base md:text-2xl leading-relaxed"
              style={{ color: 'var(--content-text-muted)' }}
            >
              通过交互式可视化，探索数学的奥秘与美感。
              <br className="hidden md:block" />
              拖动参数、改变条件，让每一个抽象概念在你眼前流动起来。
            </p>
          </Reveal>

          {/* 滚动提示：线条下落 */}
          <Reveal delay={0.6} y={10}>
            <div className="mt-10 md:mt-14 flex items-center gap-3" style={{ color: 'var(--content-text-muted)' }}>
              <div className="animate-line-drop w-px h-10" style={{ background: 'var(--content-text-muted)', opacity: 0.4 }} />
              <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ 难度统计/筛选条（Apple 对比表式 hairline slim strip） ============ */}
      <Reveal y={16}>
        <div
          className="flex overflow-x-auto md:overflow-visible no-scrollbar border-y mb-8 md:mb-12 snap-x snap-mandatory"
          style={{ borderColor: 'var(--content-border)' }}
        >
          {[
            { key: 'all' as const, label: '全部', ageRange: '全部学段', dot: '', count: experiments.length },
            ...LEVEL_ORDER.map((l) => ({
              key: l as DifficultyLevel | 'all',
              label: difficultyConfig[l].label,
              ageRange: difficultyConfig[l].ageRange,
              dot: difficultyConfig[l].dot,
              count: difficultyStats[l],
            })),
          ].map((item, i) => {
            const active = selectedDifficulty === item.key
            return (
              <button
                key={item.key}
                title={item.ageRange}
                onClick={() =>
                  setSelectedDifficulty(item.key === 'all' || active ? 'all' : (item.key as DifficultyLevel))
                }
                className={`stat-item group relative shrink-0 snap-start flex-1 min-w-[92px] px-2 py-3 md:py-3.5 flex flex-col items-center justify-center gap-0.5 border-l first:border-l-0 transition-colors duration-300 hover:bg-[var(--bg-muted)] ${
                  active ? 'is-active' : ''
                }`}
                style={{ borderColor: 'var(--content-border)' }}
              >
                <CountUp
                  value={item.count}
                  delay={0.1 + i * 0.07}
                  className="block text-lg md:text-2xl font-bold tabular-nums leading-tight"
                />
                <span
                  className="flex items-center gap-1.5 text-xs md:text-[13px] font-medium leading-tight whitespace-nowrap"
                  style={{ color: active ? 'var(--content-text)' : 'var(--content-text-muted)' }}
                >
                  {item.dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: item.dot }} />}
                  {item.label}
                  <span className="hidden xl:inline text-[10px] font-normal" style={{ color: 'var(--content-text-muted)' }}>
                    · {item.ageRange}
                  </span>
                </span>
                <span
                  className="stat-underline absolute left-1/2 -translate-x-1/2 bottom-0 h-0.5 w-8 md:w-10"
                  style={{ background: 'var(--content-accent)' }}
                />
              </button>
            )
          })}
        </div>
      </Reveal>

      {/* ============ 筛选栏（sticky 玻璃态） ============ */}
      <Reveal y={20}>
        <div
          className="sticky top-3 md:top-5 z-30 rounded-3xl border p-3 md:p-4 mb-10 md:mb-14 backdrop-blur-xl"
          style={{
            borderColor: 'var(--content-border)',
            background: 'color-mix(in srgb, var(--content-card-bg) 82%, transparent)',
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative md:w-72 shrink-0">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 w-[18px] h-[18px]"
                style={{ color: 'var(--content-text-muted)' }}
              />
              <input
                type="text"
                placeholder="搜索实验…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-full border text-sm outline-none transition-all duration-300 focus:scale-[1.02]"
                style={{
                  borderColor: 'var(--content-border)',
                  background: 'var(--bg-muted)',
                  color: 'var(--content-text)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--content-accent)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--content-border)')}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto md:overflow-visible pb-1 md:pb-0 md:flex-wrap no-scrollbar">
              <button
                onClick={() => setSelectedTopic('all')}
                className={`liquid-pill shrink-0 px-4 py-2 rounded-full text-xs md:text-sm font-medium border ${selectedTopic === 'all' ? 'is-active' : ''}`}
                style={{
                  borderColor: 'var(--content-border)',
                  color: selectedTopic === 'all' ? 'var(--content-accent-text)' : 'var(--content-text-muted)',
                }}
              >
                全部
              </button>
              {topicCategories.map((topic) => {
                const IconComp = topicIconMap[topic.id] || Sigma
                const active = selectedTopic === topic.id
                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(active ? 'all' : topic.id)}
                    className={`liquid-pill shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs md:text-sm font-medium border whitespace-nowrap ${active ? 'is-active' : ''}`}
                    style={{
                      borderColor: 'var(--content-border)',
                      color: active ? 'var(--content-accent-text)' : 'var(--content-text-muted)',
                    }}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    {topic.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </Reveal>

      {/* ============ 实验列表 ============ */}
      {selectedDifficulty === 'all' ? (
        LEVEL_ORDER.map((level, sectionIdx) => {
          const list = groupedExperiments[level]
          if (list.length === 0) return null
          const cfg = difficultyConfig[level]
          return (
            <section key={level} className="mb-12 md:mb-20 scroll-mt-32">
              <Reveal y={20} className="relative mb-6 md:mb-9">
                {/* 叠层大序号：错位美感 */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none select-none absolute -top-10 md:-top-14 left-0 text-[72px] md:text-[120px] font-bold leading-none tracking-tighter"
                  style={{ color: 'var(--content-text)', opacity: 0.05 }}
                >
                  {String(sectionIdx + 1).padStart(2, '0')}
                </span>
                <div className="relative flex items-baseline gap-3 md:gap-4 pl-1">
                  <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full shrink-0 translate-y-[-2px]" style={{ background: cfg.dot }} />
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: 'var(--content-text)' }}>
                    {cfg.label}
                  </h2>
                  <span className="text-xs md:text-sm" style={{ color: 'var(--content-text-muted)' }}>
                    {cfg.ageRange}
                  </span>
                  <span className="text-xs md:text-sm" style={{ color: 'var(--content-text-muted)', opacity: 0.6 }}>
                    · {list.length} 个实验
                  </span>
                </div>
              </Reveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {list.map((exp, i) => (
                  <Reveal key={exp.path} y={28} delay={Math.min(i * 0.06, 0.42)} scale={0.97}>
                    <ExperimentCard experiment={exp} />
                  </Reveal>
                ))}
              </div>
            </section>
          )
        })
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredExperiments.map((exp, i) => (
            <Reveal key={exp.path} y={28} delay={Math.min(i * 0.06, 0.42)} scale={0.97}>
              <ExperimentCard experiment={exp} />
            </Reveal>
          ))}
        </div>
      )}

      {/* ============ 空状态 ============ */}
      {filteredExperiments.length === 0 && (
        <Reveal y={20}>
          <div className="text-center py-20 md:py-28">
            <div
              className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-5 rounded-3xl flex items-center justify-center"
              style={{ background: 'var(--bg-muted)', color: 'var(--content-text-muted)' }}
            >
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-1.5" style={{ color: 'var(--content-text)' }}>
              没有找到匹配的实验
            </h3>
            <p className="text-sm" style={{ color: 'var(--content-text-muted)' }}>
              试试更换关键词，或重置筛选条件
            </p>
          </div>
        </Reveal>
      )}
    </div>
  )
}

// ------------------------------------------------------------------
// 实验卡片：液体填充图标 + hover 上浮 + 箭头滑入
// ------------------------------------------------------------------
function ExperimentCard({ experiment }: { experiment: Experiment }) {
  const cfg = difficultyConfig[experiment.difficulty]
  const IconComp = resolveIcon(experiment.path)
  const { isFavorite, toggleFavorite } = useFavorites()
  const fav = isFavorite(experiment.path)

  return (
    <Link
      to={experiment.path}
      className="group relative flex h-full flex-col rounded-3xl border p-6 md:p-7 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_28px_56px_-20px_rgba(0,0,0,0.18)] active:scale-[0.98]"
      style={{ background: 'var(--content-card-bg)', borderColor: 'var(--content-border)' }}
    >
      <div className="flex items-start justify-between">
        <div
          className="liquid-icon w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--bg-muted)', color: 'var(--content-text)' }}
        >
          <IconComp className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleFavorite(experiment.path)
            }}
            aria-label={fav ? `取消收藏 ${experiment.title}` : `收藏 ${experiment.title}`}
            aria-pressed={fav}
            title={fav ? '取消收藏' : '收藏'}
            className={`p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
              fav ? 'opacity-100' : 'opacity-35 group-hover:opacity-70'
            }`}
          >
            <Star
              className={`w-5 h-5 transition-all duration-300 ${
                fav ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_6px_rgba(251,191,36,0.45)]' : ''
              }`}
              style={fav ? undefined : { color: 'var(--content-text)' }}
            />
          </button>
          <ArrowUpRight
            className="card-arrow w-5 h-5"
            style={{ color: 'var(--content-text)' }}
          />
        </div>
      </div>

      <h3
        className="mt-5 text-base md:text-lg font-bold tracking-tight"
        style={{ color: 'var(--content-text)' }}
      >
        {experiment.title}
      </h3>
      <p
        className="mt-2 text-xs md:text-sm leading-relaxed line-clamp-2 flex-1"
        style={{ color: 'var(--content-text-muted)' }}
      >
        {experiment.description}
      </p>

      <div className="mt-4 flex items-center gap-1.5 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
          style={{ background: 'var(--bg-muted)', color: 'var(--content-text-muted)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
          {cfg.label}
        </span>
        {experiment.hasAnimation && (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
            style={{ background: 'var(--bg-muted)', color: 'var(--content-text-muted)' }}
          >
            <Film className="w-3 h-3" />
            动画
          </span>
        )}
        {experiment.hasSteps && (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium hidden sm:inline-flex"
            style={{ background: 'var(--bg-muted)', color: 'var(--content-text-muted)' }}
          >
            <ListOrdered className="w-3 h-3" />
            步骤
          </span>
        )}
      </div>
    </Link>
  )
}
