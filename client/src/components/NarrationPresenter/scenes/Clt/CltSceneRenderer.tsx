/**
 * 中心极限定理场景渲染器
 * 渲染样本均值分布、正态分布逼近等可视化
 */

import { useMemo, useState, useEffect } from 'react'
import Plot from '../../../ThemedPlot'
import type { SceneRendererProps } from '../SceneRendererFactory'
import MathFormula from '../../../../components/MathFormula/MathFormula'

// 标题场景
function TitleScene({ sceneId }: { sceneId: string }) {
  const titles: Record<string, { title: string; subtitle: string }> = {
    'intro-1': { title: '中心极限定理', subtitle: '为什么正态分布无处不在' },
    'summary-1': { title: '总结回顾', subtitle: '中心极限定理的核心思想' },
    'summary-5': { title: '感谢观看', subtitle: '探索统计之美' },
  }
  const { title, subtitle } = titles[sceneId] || { title: '中心极限定理', subtitle: '' }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{title}</h1>
      <p className="text-xl md:text-2xl text-white/70">{subtitle}</p>
    </div>
  )
}

// 生成不同分布的随机数
function generateSamples(distribution: string, count: number): number[] {
  const samples: number[] = []

  switch (distribution) {
    case 'uniform':
      // 均匀分布 [0, 1]
      for (let i = 0; i < count; i++) {
        samples.push(Math.random())
      }
      break

    case 'exponential':
      // 指数分布
      for (let i = 0; i < count; i++) {
        samples.push(-Math.log(1 - Math.random()))
      }
      break

    case 'bimodal':
      // 双峰分布
      for (let i = 0; i < count; i++) {
        if (Math.random() < 0.5) {
          samples.push(Math.random() * 0.4 + 0.1)
        } else {
          samples.push(Math.random() * 0.4 + 0.5)
        }
      }
      break

    case 'dice':
      // 骰子分布 [1, 6]
      for (let i = 0; i < count; i++) {
        samples.push(Math.floor(Math.random() * 6) + 1)
      }
      break

    default:
      // 默认均匀分布
      for (let i = 0; i < count; i++) {
        samples.push(Math.random())
      }
  }

  return samples
}

// 计算样本均值
function calculateSampleMeans(
  distribution: string,
  sampleSize: number,
  numSamples: number
): number[] {
  const means: number[] = []

  for (let i = 0; i < numSamples; i++) {
    const samples = generateSamples(distribution, sampleSize)
    const mean = samples.reduce((sum, val) => sum + val, 0) / sampleSize
    means.push(mean)
  }

  return means
}

// 正态分布概率密度函数
function normalPDF(x: number, mean: number, std: number): number {
  const coefficient = 1 / (std * Math.sqrt(2 * Math.PI))
  const exponent = -Math.pow(x - mean, 2) / (2 * std * std)
  return coefficient * Math.exp(exponent)
}

// 抽样动画场景
function SamplingScene({
  sampleSize = 5,
  distribution = 'uniform',
  animate = false
}: {
  sampleSize?: number
  distribution?: string
  animate?: boolean
}) {
  const [frame, setFrame] = useState(0)
  const maxFrames = 100

  useEffect(() => {
    if (!animate) return

    const timer = setInterval(() => {
      setFrame(f => (f + 1) % maxFrames)
    }, 100)

    return () => clearInterval(timer)
  }, [animate])

  const data = useMemo(() => {
    const numSamples = Math.min(frame * 10 + 50, 1000)
    const means = calculateSampleMeans(distribution, sampleSize, numSamples)

    return means
  }, [frame, sampleSize, distribution])

  // 计算直方图
  const histogramData = useMemo(() => {
    const bins = 30
    const min = Math.min(...data)
    const max = Math.max(...data)
    const binWidth = (max - min) / bins

    const counts = new Array(bins).fill(0)
    data.forEach(val => {
      const binIndex = Math.min(Math.floor((val - min) / binWidth), bins - 1)
      counts[binIndex]++
    })

    const x = Array.from({ length: bins }, (_, i) => min + (i + 0.5) * binWidth)

    return { x, y: counts }
  }, [data])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <Plot
        data={[
          {
            x: histogramData.x,
            y: histogramData.y,
            type: 'bar',
            marker: { color: '#3b82f6' },
            name: '样本均值',
          },
        ]}
        layout={{
          autosize: true,
          height: 400,
          margin: { t: 30, r: 30, b: 50, l: 60 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.05)',
          xaxis: {
            title: { text: '样本均值' },
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
          },
          yaxis: {
            title: { text: '频数' },
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
          },
          showlegend: false,
        }}
        config={{ responsive: true, displayModeBar: false, displaylogo: false }}
        className="w-full"
      />
      <p className="text-white/60 text-sm">
        样本量: {sampleSize} | 抽样次数: {data.length}
      </p>
    </div>
  )
}

// 分布对比场景
function DistributionScene({
  sampleSize = 30,
  distribution = 'uniform'
}: {
  sampleSize?: number
  distribution?: string
}) {
  const data = useMemo(() => {
    const numSamples = 1000
    const means = calculateSampleMeans(distribution, sampleSize, numSamples)

    // 计算均值和标准差
    const mean = means.reduce((sum, val) => sum + val, 0) / means.length
    const variance = means.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / means.length
    const std = Math.sqrt(variance)

    return { means, mean, std }
  }, [sampleSize, distribution])

  // 生成正态分布曲线
  const normalCurve = useMemo(() => {
    const mean = data.mean
    const std = data.std
    const x: number[] = []
    const y: number[] = []

    const min = mean - 4 * std
    const max = mean + 4 * std
    const steps = 100

    for (let i = 0; i <= steps; i++) {
      const xVal = min + (max - min) * i / steps
      x.push(xVal)
      y.push(normalPDF(xVal, mean, std) * data.means.length * 0.1) // 缩放以匹配直方图
    }

    return { x, y }
  }, [data])

  // 计算直方图
  const histogramData = useMemo(() => {
    const bins = 30
    const min = Math.min(...data.means)
    const max = Math.max(...data.means)
    const binWidth = (max - min) / bins

    const counts = new Array(bins).fill(0)
    data.means.forEach(val => {
      const binIndex = Math.min(Math.floor((val - min) / binWidth), bins - 1)
      counts[binIndex]++
    })

    const x = Array.from({ length: bins }, (_, i) => min + (i + 0.5) * binWidth)

    return { x, y: counts }
  }, [data.means])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <Plot
        data={[
          {
            x: histogramData.x,
            y: histogramData.y,
            type: 'bar',
            marker: { color: '#3b82f6', opacity: 0.7 },
            name: '样本均值分布',
          },
          {
            x: normalCurve.x,
            y: normalCurve.y,
            type: 'scatter',
            mode: 'lines',
            line: { color: '#ef4444', width: 3 },
            name: '正态分布',
          },
        ]}
        layout={{
          autosize: true,
          height: 400,
          margin: { t: 30, r: 30, b: 50, l: 60 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.05)',
          xaxis: {
            title: { text: '样本均值' },
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
          },
          yaxis: {
            title: { text: '频数' },
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
          },
          legend: {
            font: { color: 'white' },
            bgcolor: 'rgba(0,0,0,0.5)',
          },
        }}
        config={{ responsive: true, displayModeBar: false, displaylogo: false }}
        className="w-full"
      />
      <p className="text-white/60 text-sm">
        样本量: {sampleSize} | 均值: {data.mean.toFixed(3)} | 标准差: {data.std.toFixed(3)}
      </p>
    </div>
  )
}

// 骰子实验场景
function DiceScene({ numDice = 1 }: { numDice?: number }) {
  const data = useMemo(() => {
    const numSamples = 1000
    const sums: number[] = []
    const seed = numDice // Use numDice as seed to ensure stable results

    for (let i = 0; i < numSamples; i++) {
      let sum = 0
      for (let j = 0; j < numDice; j++) {
        // Use a seeded random approach for stable rendering
        const pseudoRandom = Math.sin(seed * 1000 + i * numDice + j) * 10000
        sum += Math.floor((pseudoRandom - Math.floor(pseudoRandom)) * 6) + 1
      }
      sums.push(sum)
    }

    return sums
  }, [numDice])

  // 计算直方图
  const histogramData = useMemo(() => {
    const min = numDice
    const max = numDice * 6
    const bins = max - min + 1

    const counts = new Array(bins).fill(0)
    data.forEach(val => {
      counts[val - min]++
    })

    const x = Array.from({ length: bins }, (_, i) => min + i)

    return { x, y: counts }
  }, [data, numDice])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <Plot
        data={[
          {
            x: histogramData.x,
            y: histogramData.y,
            type: 'bar',
            marker: { color: '#10b981' },
            name: '骰子点数和',
          },
        ]}
        layout={{
          autosize: true,
          height: 400,
          margin: { t: 30, r: 30, b: 50, l: 60 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.05)',
          xaxis: {
            title: { text: '点数和' },
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
          },
          yaxis: {
            title: { text: '频数' },
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
          },
          showlegend: false,
        }}
        config={{ responsive: true, displayModeBar: false, displaylogo: false }}
        className="w-full"
      />
      <p className="text-white/60 text-sm">
        掷 {numDice} 个骰子，共 {data.length} 次实验
      </p>
    </div>
  )
}

// 公式场景
function FormulaScene({ formulaType }: { formulaType: string }) {
  const formulas: Record<string, { formula: string; description: string }> = {
    'clt': {
      formula: '\\bar{X}_n \\xrightarrow{d} N(\\mu, \\frac{\\sigma^2}{n})',
      description: '样本均值依分布收敛到正态分布',
    },
    'mean': {
      formula: 'E[\\bar{X}] = \\mu',
      description: '样本均值的期望等于总体均值',
    },
    'variance': {
      formula: 'Var(\\bar{X}) = \\frac{\\sigma^2}{n}',
      description: '样本均值的方差等于总体方差除以样本量',
    },
    'std': {
      formula: 'SD(\\bar{X}) = \\frac{\\sigma}{\\sqrt{n}}',
      description: '样本均值的标准差（标准误）',
    },
  }

  const { formula, description } = formulas[formulaType] || formulas['clt']

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <div className="p-8 bg-white/10 rounded-2xl backdrop-blur">
        <MathFormula formula={formula} className="text-2xl" />
      </div>
      <p className="text-white/70 text-lg">{description}</p>
    </div>
  )
}

// 应用场景
function ApplicationScene({ sceneId }: { sceneId: string }) {
  const apps: Record<string, { title: string; items: string[]; icon: string }> = {
    'applications-1': {
      title: '中心极限定理的应用',
      items: ['统计推断', '置信区间', '假设检验', '质量控制'],
      icon: '📊',
    },
    'applications-2': {
      title: '统计推断',
      items: ['构造置信区间', '进行假设检验', '估计总体参数', '评估估计精度'],
      icon: '🔍',
    },
    'applications-3': {
      title: '质量控制',
      items: ['产品尺寸控制', '过程能力分析', '控制图设计', '抽样检验'],
      icon: '⚙️',
    },
    'applications-4': {
      title: '民意调查',
      items: ['样本比例估计', '误差范围计算', '样本量确定', '结果可靠性'],
      icon: '📈',
    },
  }

  const app = apps[sceneId] || apps['applications-1']

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="text-6xl">{app.icon}</div>
      <h2 className="text-3xl font-bold text-white">{app.title}</h2>
      <ul className="space-y-2 text-white/80 text-lg">
        {app.items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

// 样本量对比场景
function SampleSizeComparisonScene() {
  const data = useMemo(() => {
    const sampleSizes = [5, 10, 30, 50]
    return sampleSizes.map(n => {
      const means = calculateSampleMeans('uniform', n, 500)
      const mean = means.reduce((sum, val) => sum + val, 0) / means.length
      const variance = means.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / means.length
      const std = Math.sqrt(variance)

      return { n, means, mean, std }
    })
  }, [])

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="grid grid-cols-2 gap-4 w-full max-w-4xl p-4">
        {data.map(({ n, means }) => {
          // 计算直方图
          const bins = 20
          const min = Math.min(...means)
          const max = Math.max(...means)
          const binWidth = (max - min) / bins

          const counts = new Array(bins).fill(0)
          means.forEach(val => {
            const binIndex = Math.min(Math.floor((val - min) / binWidth), bins - 1)
            counts[binIndex]++
          })

          const x = Array.from({ length: bins }, (_, i) => min + (i + 0.5) * binWidth)

          return (
            <div key={n} className="bg-white/5 rounded-lg p-2">
              <Plot
                data={[
                  {
                    x,
                    y: counts,
                    type: 'bar',
                    marker: { color: '#8b5cf6' },
                  },
                ]}
                layout={{
                  autosize: true,
                  height: 200,
                  margin: { t: 30, r: 10, b: 30, l: 40 },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  title: {
                    text: `n = ${n}`,
                    font: { color: 'white', size: 14 },
                  },
                  xaxis: {
                    color: 'white',
                    gridcolor: 'rgba(255,255,255,0.1)',
                    showticklabels: false,
                  },
                  yaxis: {
                    color: 'white',
                    gridcolor: 'rgba(255,255,255,0.1)',
                    showticklabels: false,
                  },
                  showlegend: false,
                }}
                config={{ responsive: true, displayModeBar: false, displaylogo: false }}
                className="w-full"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 主渲染器
export default function CltSceneRenderer({ scene }: SceneRendererProps) {
  if (!scene) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white/50 text-lg">加载中...</div>
      </div>
    )
  }

  const { sectionId, scene: sceneConfig } = scene

  // 标题场景
  if (sceneConfig.type === 'title' || sceneConfig.id.includes('intro-1') || sceneConfig.id.includes('summary')) {
    return <TitleScene sceneId={sceneConfig.id} />
  }

  // 应用场景
  if (sceneConfig.type === 'application' || sceneConfig.id.includes('applications')) {
    return <ApplicationScene sceneId={sceneConfig.id} />
  }

  // 公式场景
  if (sceneConfig.type === 'formula' || sceneConfig.id.includes('parameters')) {
    if (sceneConfig.id.includes('parameters-2')) {
      return <FormulaScene formulaType="mean" />
    }
    if (sceneConfig.id.includes('parameters-3')) {
      return <FormulaScene formulaType="std" />
    }
    return <FormulaScene formulaType="clt" />
  }

  // 根据 section 和 scene 决定显示什么
  switch (sectionId) {
    case 'intro':
      return <TitleScene sceneId={sceneConfig.id} />

    case 'theorem':
      if (sceneConfig.id.includes('theorem-1')) {
        return <FormulaScene formulaType="clt" />
      }
      return <DistributionScene sampleSize={30} distribution="uniform" />

    case 'dice-example':
      if (sceneConfig.id.includes('dice-example-2')) {
        return <DiceScene numDice={1} />
      }
      if (sceneConfig.id.includes('dice-example-3')) {
        return <DiceScene numDice={2} />
      }
      if (sceneConfig.id.includes('dice-example-4')) {
        return <DiceScene numDice={5} />
      }
      return <DiceScene numDice={1} />

    case 'simulation':
      if (sceneConfig.id.includes('simulation-3')) {
        return <SamplingScene sampleSize={5} distribution="uniform" animate />
      }
      if (sceneConfig.id.includes('simulation-4')) {
        return <SamplingScene sampleSize={30} distribution="uniform" animate />
      }
      return <SamplingScene sampleSize={10} distribution="uniform" animate />

    case 'different-distributions':
      if (sceneConfig.id.includes('different-distributions-2')) {
        return <DistributionScene sampleSize={30} distribution="exponential" />
      }
      if (sceneConfig.id.includes('different-distributions-3')) {
        return <DistributionScene sampleSize={30} distribution="bimodal" />
      }
      return <DistributionScene sampleSize={30} distribution="uniform" />

    case 'parameters':
      return <FormulaScene formulaType="clt" />

    case 'sample-size':
      if (sceneConfig.id.includes('sample-size-1')) {
        return <SampleSizeComparisonScene />
      }
      return <DistributionScene sampleSize={30} distribution="uniform" />

    case 'applications':
      return <ApplicationScene sceneId={sceneConfig.id} />

    case 'summary':
      if (sceneConfig.id.includes('summary-2')) {
        return <FormulaScene formulaType="clt" />
      }
      if (sceneConfig.id.includes('summary-4')) {
        return <DistributionScene sampleSize={30} distribution="uniform" />
      }
      return <TitleScene sceneId={sceneConfig.id} />

    default:
      return <DistributionScene sampleSize={30} distribution="uniform" />
  }
}
