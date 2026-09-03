import { CSSProperties, ElementType, ReactNode, useEffect, useRef, useState } from 'react'
import { useInView } from '../../hooks/useInView'

// Apple 风缓动：快速起步、悠长收尾
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

type RevealProps = {
  children: ReactNode
  /** 进场延迟（秒），用于错位 stagger */
  delay?: number
  /** 初始纵向位移（px） */
  y?: number
  /** 初始横向位移（px），用于左右错位进场 */
  x?: number
  /** 初始缩放（大小动态） */
  scale?: number
  className?: string
  style?: CSSProperties
  as?: ElementType
}

/**
 * 滚动进场容器：进入视口时 位移+缩放+透明度 缓入缓出。
 * 只用 transform/opacity（GPU 友好），尊重 reduced-motion。
 */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  x = 0,
  scale = 1,
  className,
  style,
  as: Tag = 'div',
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        // 进场后用 none（而非 translate3d(0,0,0)）：非 none 的 transform 会
        // 创建 containing block，导致内部 position:sticky 元素失效
        transform: inView ? 'none' : `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
        opacity: inView ? 1 : 0,
        transition: `transform 0.9s ${EASE} ${delay}s, opacity 0.9s ${EASE} ${delay}s`,
        willChange: 'transform, opacity',
        ...style,
      }}
    >
      {children}
    </Tag>
  )
}

/**
 * 数字滚动计数（easeOutExpo，rAF 驱动），进入视口后开始。
 */
export function CountUp({
  value,
  duration = 1.4,
  delay = 0,
  className,
  style,
}: {
  value: number
  duration?: number
  delay?: number
  className?: string
  style?: CSSProperties
}) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.4 })
  const [display, setDisplay] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!inView || startedRef.current) return
    startedRef.current = true

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setDisplay(value)
      return
    }

    let raf = 0
    let startTs = 0
    const timer = setTimeout(() => {
      const tick = (ts: number) => {
        if (!startTs) startTs = ts
        const t = Math.min((ts - startTs) / (duration * 1000), 1)
        // easeOutExpo：1 - 2^(-10t)
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
        setDisplay(Math.round(eased * value))
        if (t < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, delay * 1000)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [inView, value, duration, delay])

  return (
    <span ref={ref} className={className} style={style}>
      {display}
    </span>
  )
}
