/**
 * 贝叶斯定理场景渲染器
 * 渲染先验概率、后验概率、贝叶斯更新动画等可视化
 */

import { useMemo, useState, useEffect, useRef } from 'react'
import Plot from '../../../ThemedPlot'
import type { Data } from 'plotly.js'
import type { SceneRendererProps } from '../SceneRendererFactory'
import MathFormula from '../../../../components/MathFormula/MathFormula'

// 标题场景
function TitleScene({ sceneId }: { sceneId: string }) {
  const titles: Record<string, { title: string; subtitle: string }> = {
    'intro-welcome': { title: '贝叶斯定理', subtitle: '从先验到后验的概率推理' },
    'summary-intro': { title: '总结回顾', subtitle: '贝叶斯定理的核心思想' },
    'summary-end': { title: '感谢观看', subtitle: '理性更新你的信念' },
  }
  const { title, subtitle } = titles[sceneId] || { title: '贝叶斯定理', subtitle: '' }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{title}</h1>
      <p className="text-xl md:text-2xl text-white/70">{subtitle}</p>
    </div>
  )
}

// 概率条形图场景
function ProbabilityBarScene({
  priorProb = 0.01,
  posteriorProb = 0.083,
  showPosterior = false,
  label = '患病概率'
}: {
  priorProb?: number
  posteriorProb?: number
  showPosterior?: boolean
  label?: string
}) {
  const data: Data[] = [
    {
      x: ['先验概率'],
      y: [priorProb * 100],
      type: 'bar',
      marker: { color: '#3b82f6' },
      text: [`${(priorProb * 100).toFixed(1)}%`],
      textposition: 'outside',
      name: '先验',
    },
  ]

  if (showPosterior) {
    data.push({
      x: ['后验概率'],
      y: [posteriorProb * 100],
      type: 'bar',
      marker: { color: '#ef4444' },
      text: [`${(posteriorProb * 100).toFixed(1)}%`],
      textposition: 'outside',
      name: '后验',
    })
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h3 className="text-white text-xl mb-4">{label}</h3>
      <Plot
        data={data}
        layout={{
          autosize: true,
          height: 400,
          margin: { t: 40, r: 30, b: 80, l: 60 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.05)',
          xaxis: {
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
          },
          yaxis: {
            title: { text: '概率 (%)' },
            range: [0, Math.max(priorProb, posteriorProb) * 120],
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
          },
          showlegend: false,
          font: { color: 'white', size: 14 },
        }}
        config={{ responsive: true, displayModeBar: false, displaylogo: false }}
        className="w-full"
      />
    </div>
  )
}

// 贝叶斯更新动画场景
function BayesUpdateScene({ animate = false }: { animate?: boolean }) {
  const [frame, setFrame] = useState(0)
  const maxFrames = 100

  useEffect(() => {
    if (!animate) return

    const timer = setInterval(() => {
      setFrame(f => (f < maxFrames ? f + 1 : 0))
    }, 50)
    return () => clearInterval(timer)
  }, [animate])

  // 贝叶斯更新：从先验到后验的过渡
  const priorMean = 0.5
  const priorStd = 0.2
  const posteriorMean = 0.7
  const posteriorStd = 0.1

  const t = frame / maxFrames
  const currentMean = priorMean + (posteriorMean - priorMean) * t
  const currentStd = priorStd + (posteriorStd - priorStd) * t

  const xValues = useMemo(() => {
    const x: number[] = []
    for (let i = 0; i <= 100; i++) {
      x.push(i / 100)
    }
    return x
  }, [])

  const yValues = useMemo(() => {
    return xValues.map(x => {
      const exponent = -Math.pow(x - currentMean, 2) / (2 * currentStd * currentStd)
      return Math.exp(exponent) / (currentStd * Math.sqrt(2 * Math.PI))
    })
  }, [xValues, currentMean, currentStd])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h3 className="text-white text-xl mb-4">
        {t < 0.1 ? '先验分布' : t > 0.9 ? '后验分布' : '贝叶斯更新中...'}
      </h3>
      <Plot
        data={[
          {
            x: xValues,
            y: yValues,
            type: 'scatter',
            mode: 'lines',
            fill: 'tozeroy',
            line: { color: '#8b5cf6', width: 3 },
            fillcolor: 'rgba(139, 92, 246, 0.3)',
          },
        ]}
        layout={{
          autosize: true,
          height: 400,
          margin: { t: 20, r: 30, b: 60, l: 60 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.05)',
          xaxis: {
            title: { text: '参数 θ' },
            range: [0, 1],
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
          },
          yaxis: {
            title: { text: '概率密度' },
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
          },
          showlegend: false,
        }}
        config={{ responsive: true, displayModeBar: false, displaylogo: false }}
        className="w-full"
      />
    </div>
  )
}

// 条件概率树形图场景
function ProbabilityTreeScene({
  showEvidence = false,
  highlightPath = false
}: {
  showEvidence?: boolean
  highlightPath?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    ctx.fillStyle = 'rgba(30, 41, 59, 1)'
    ctx.fillRect(0, 0, width, height)

    // 树的节点位置
    const root = { x: width / 2, y: 50 }
    const diseaseYes = { x: width / 3, y: 200 }
    const diseaseNo = { x: 2 * width / 3, y: 200 }
    const testPosGivenDis = { x: width / 4, y: 350 }
    const testNegGivenDis = { x: 5 * width / 12, y: 350 }
    const testPosGivenNoDis = { x: 7 * width / 12, y: 350 }
    const testNegGivenNoDis = { x: 3 * width / 4, y: 350 }

    // 绘制连线
    const drawLine = (from: { x: number; y: number }, to: { x: number; y: number }, color: string, width: number) => {
      ctx.strokeStyle = color
      ctx.lineWidth = width
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.stroke()
    }

    // 绘制节点
    const drawNode = (pos: { x: number; y: number }, text: string, color: string) => {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 25, 0, 2 * Math.PI)
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = 'white'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, pos.x, pos.y)
    }

    // 绘制概率标签
    const drawLabel = (pos: { x: number; y: number }, text: string) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(text, pos.x, pos.y)
    }

    // 高亮路径
    const highlightColor = highlightPath ? '#ef4444' : 'rgba(255,255,255,0.3)'
    const normalColor = 'rgba(255,255,255,0.3)'

    // 绘制树结构
    drawLine(root, diseaseYes, highlightPath ? highlightColor : normalColor, highlightPath ? 3 : 2)
    drawLine(root, diseaseNo, normalColor, 2)
    drawLine(diseaseYes, testPosGivenDis, highlightPath ? highlightColor : normalColor, highlightPath ? 3 : 2)
    drawLine(diseaseYes, testNegGivenDis, normalColor, 2)
    drawLine(diseaseNo, testPosGivenNoDis, normalColor, 2)
    drawLine(diseaseNo, testNegGivenNoDis, normalColor, 2)

    // 绘制节点
    drawNode(root, '人群', '#3b82f6')
    drawNode(diseaseYes, '患病', highlightPath ? '#ef4444' : '#8b5cf6')
    drawNode(diseaseNo, '健康', '#10b981')

    if (showEvidence) {
      drawNode(testPosGivenDis, '阳性', highlightPath ? '#ef4444' : '#f59e0b')
      drawNode(testNegGivenDis, '阴性', '#6b7280')
      drawNode(testPosGivenNoDis, '阳性', '#f59e0b')
      drawNode(testNegGivenNoDis, '阴性', '#6b7280')
    }

    // 绘制概率标签
    drawLabel({ x: (root.x + diseaseYes.x) / 2 - 20, y: (root.y + diseaseYes.y) / 2 }, 'P(D)=1%')
    drawLabel({ x: (root.x + diseaseNo.x) / 2 + 20, y: (root.y + diseaseNo.y) / 2 }, 'P(¬D)=99%')

    if (showEvidence) {
      drawLabel({ x: (diseaseYes.x + testPosGivenDis.x) / 2 - 15, y: (diseaseYes.y + testPosGivenDis.y) / 2 }, 'P(+|D)=90%')
      drawLabel({ x: (diseaseYes.x + testNegGivenDis.x) / 2 + 15, y: (diseaseYes.y + testNegGivenDis.y) / 2 }, 'P(-|D)=10%')
      drawLabel({ x: (diseaseNo.x + testPosGivenNoDis.x) / 2 - 15, y: (diseaseNo.y + testPosGivenNoDis.y) / 2 }, 'P(+|¬D)=9%')
      drawLabel({ x: (diseaseNo.x + testNegGivenNoDis.x) / 2 + 15, y: (diseaseNo.y + testNegGivenNoDis.y) / 2 }, 'P(-|¬D)=91%')
    }

  }, [showEvidence, highlightPath])

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={600}
        height={450}
        className="max-w-full border border-white/10 rounded"
      />
    </div>
  )
}

// 公式场景
function FormulaScene({ formulaType }: { formulaType: string }) {
  const formulas: Record<string, { formula: string; description: string }> = {
    'bayes': {
      formula: 'P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}',
      description: '贝叶斯定理 - 从先验到后验',
    },
    'bayes-expanded': {
      formula: 'P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B|A) \\cdot P(A) + P(B|\\neg A) \\cdot P(\\neg A)}',
      description: '贝叶斯定理展开式',
    },
    'medical': {
      formula: 'P(D|+) = \\frac{P(+|D) \\cdot P(D)}{P(+|D) \\cdot P(D) + P(+|\\neg D) \\cdot P(\\neg D)}',
      description: '医学诊断中的贝叶斯定理',
    },
    'odds': {
      formula: '\\frac{P(A|B)}{P(\\neg A|B)} = \\frac{P(B|A)}{P(B|\\neg A)} \\cdot \\frac{P(A)}{P(\\neg A)}',
      description: '贝叶斯因子形式',
    },
  }

  const { formula, description } = formulas[formulaType] || formulas['bayes']

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <div className="p-8 bg-white/10 rounded-2xl backdrop-blur">
        <MathFormula formula={formula} className="text-2xl" />
      </div>
      <p className="text-white/70 text-lg text-center max-w-2xl">{description}</p>
    </div>
  )
}

// 医学诊断应用场景
function MedicalDiagnosisScene({ step = 0 }: { step?: number }) {
  const steps = [
    {
      title: '医学诊断问题',
      description: '某种疾病在人群中的患病率为 1%',
      icon: '🏥',
    },
    {
      title: '检测准确率',
      description: '检测的灵敏度为 90%（真阳性率），特异度为 91%（真阴性率）',
      icon: '🔬',
    },
    {
      title: '问题',
      description: '如果检测结果为阳性，实际患病的概率是多少？',
      icon: '❓',
    },
    {
      title: '直觉答案',
      description: '很多人会认为是 90%，但实际上...',
      icon: '🤔',
    },
    {
      title: '贝叶斯计算',
      description: 'P(D|+) = (0.9 × 0.01) / (0.9 × 0.01 + 0.09 × 0.99) ≈ 8.3%',
      icon: '📊',
    },
    {
      title: '结论',
      description: '即使检测阳性，实际患病概率仅约 8.3%！',
      icon: '💡',
    },
  ]

  const currentStep = steps[Math.min(step, steps.length - 1)]

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-8">
      <div className="text-6xl">{currentStep.icon}</div>
      <h2 className="text-3xl font-bold text-white text-center">{currentStep.title}</h2>
      <p className="text-white/80 text-xl text-center max-w-2xl leading-relaxed">
        {currentStep.description}
      </p>
    </div>
  )
}

// 应用场景
function ApplicationScene({ sceneId }: { sceneId: string }) {
  const apps: Record<string, { title: string; items: string[]; icon: string }> = {
    'app-intro': {
      title: '贝叶斯定理的应用',
      items: ['医学诊断', '垃圾邮件过滤', '机器学习', '司法推理'],
      icon: '🎯',
    },
    'app-medical': {
      title: '医学诊断',
      items: ['疾病筛查', '症状分析', '治疗方案选择', '预后评估'],
      icon: '🏥',
    },
    'app-ml': {
      title: '机器学习',
      items: ['朴素贝叶斯分类器', '贝叶斯网络', '参数估计', '模型选择'],
      icon: '🤖',
    },
    'app-spam': {
      title: '垃圾邮件过滤',
      items: ['词频分析', '先验概率学习', '实时更新', '误判率优化'],
      icon: '📧',
    },
  }

  const app = apps[sceneId] || apps['app-intro']

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="text-6xl">{app.icon}</div>
      <h2 className="text-3xl font-bold text-white">{app.title}</h2>
      <ul className="space-y-2 text-white/80 text-lg">
        {app.items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

// 先验后验对比场景
function PriorPosteriorComparisonScene() {
  const xValues = useMemo(() => {
    const x: number[] = []
    for (let i = 0; i <= 100; i++) {
      x.push(i / 100)
    }
    return x
  }, [])

  const priorValues = useMemo(() => {
    return xValues.map(x => {
      const mean = 0.5
      const std = 0.2
      const exponent = -Math.pow(x - mean, 2) / (2 * std * std)
      return Math.exp(exponent) / (std * Math.sqrt(2 * Math.PI))
    })
  }, [xValues])

  const posteriorValues = useMemo(() => {
    return xValues.map(x => {
      const mean = 0.7
      const std = 0.1
      const exponent = -Math.pow(x - mean, 2) / (2 * std * std)
      return Math.exp(exponent) / (std * Math.sqrt(2 * Math.PI))
    })
  }, [xValues])

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Plot
        data={[
          {
            x: xValues,
            y: priorValues,
            type: 'scatter',
            mode: 'lines',
            name: '先验分布',
            line: { color: '#3b82f6', width: 3 },
          },
          {
            x: xValues,
            y: posteriorValues,
            type: 'scatter',
            mode: 'lines',
            name: '后验分布',
            line: { color: '#ef4444', width: 3 },
          },
        ]}
        layout={{
          autosize: true,
          height: 450,
          margin: { t: 40, r: 30, b: 60, l: 60 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.05)',
          xaxis: {
            title: { text: '参数 θ' },
            range: [0, 1],
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
          },
          yaxis: {
            title: { text: '概率密度' },
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
          },
          legend: {
            font: { color: 'white' },
            bgcolor: 'rgba(0,0,0,0.5)',
            x: 0.7,
            y: 0.95,
          },
        }}
        config={{ responsive: true, displayModeBar: false, displaylogo: false }}
        className="w-full"
      />
    </div>
  )
}

// 主渲染器
export default function BayesSceneRenderer({ scene }: SceneRendererProps) {
  if (!scene) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white/50 text-lg">加载中...</div>
      </div>
    )
  }

  const { sectionId, scene: sceneConfig, lineState } = scene

  // 标题场景
  if (sceneConfig.type === 'title') {
    return <TitleScene sceneId={sceneConfig.id} />
  }

  // 应用场景
  if (sceneConfig.type === 'application') {
    return <ApplicationScene sceneId={sceneConfig.id} />
  }

  // 公式场景
  if (sceneConfig.type === 'formula') {
    if (sceneConfig.id.includes('expanded')) {
      return <FormulaScene formulaType="bayes-expanded" />
    }
    if (sceneConfig.id.includes('medical')) {
      return <FormulaScene formulaType="medical" />
    }
    if (sceneConfig.id.includes('odds')) {
      return <FormulaScene formulaType="odds" />
    }
    return <FormulaScene formulaType="bayes" />
  }

  // 根据 section 和 scene 决定显示什么
  switch (sectionId) {
    case 'intro':
      if (sceneConfig.id.includes('probability')) {
        return <ProbabilityBarScene priorProb={0.01} label="先验概率示例" />
      }
      if (sceneConfig.id.includes('update')) {
        return <BayesUpdateScene />
      }
      return <FormulaScene formulaType="bayes" />

    case 'concept':
      if (sceneConfig.id.includes('prior')) {
        return <ProbabilityBarScene priorProb={0.01} label="先验概率" />
      }
      if (sceneConfig.id.includes('posterior')) {
        return <ProbabilityBarScene priorProb={0.01} posteriorProb={0.083} showPosterior label="先验 vs 后验" />
      }
      if (sceneConfig.id.includes('formula')) {
        return <FormulaScene formulaType="bayes" />
      }
      if (sceneConfig.id.includes('tree')) {
        return <ProbabilityTreeScene />
      }
      return <PriorPosteriorComparisonScene />

    case 'medical': {
      const step = (lineState?.params?.step as number) || 0
      if (sceneConfig.id.includes('diagnosis')) {
        return <MedicalDiagnosisScene step={step} />
      }
      if (sceneConfig.id.includes('tree')) {
        const showEvidence = Boolean(lineState?.show?.evidence)
        const highlightPath = Boolean(lineState?.highlight?.includes('path'))
        return <ProbabilityTreeScene showEvidence={showEvidence} highlightPath={highlightPath} />
      }
      if (sceneConfig.id.includes('calculation')) {
        return <FormulaScene formulaType="medical" />
      }
      if (sceneConfig.id.includes('result')) {
        return <ProbabilityBarScene priorProb={0.01} posteriorProb={0.083} showPosterior label="诊断结果" />
      }
      return <MedicalDiagnosisScene step={step} />
    }

    case 'update':
      if (sceneConfig.id.includes('animation')) {
        return <BayesUpdateScene animate />
      }
      if (sceneConfig.id.includes('comparison')) {
        return <PriorPosteriorComparisonScene />
      }
      return <BayesUpdateScene />

    case 'application':
      return <ApplicationScene sceneId={sceneConfig.id} />

    case 'summary':
      if (sceneConfig.id.includes('formula')) {
        return <FormulaScene formulaType="bayes" />
      }
      if (sceneConfig.id.includes('comparison')) {
        return <PriorPosteriorComparisonScene />
      }
      if (sceneConfig.id.includes('insight')) {
        return <BayesUpdateScene animate />
      }
      return <ProbabilityBarScene priorProb={0.01} posteriorProb={0.083} showPosterior label="贝叶斯推理" />

    default:
      return <FormulaScene formulaType="bayes" />
  }
}
