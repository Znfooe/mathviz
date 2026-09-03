/**
 * 回归分析场景渲染器
 * 渲染散点图、拟合线、最小二乘法演示、残差可视化等
 */

import { useMemo, useState, useEffect } from 'react'
import Plot from '../../../ThemedPlot'
import type { Data } from 'plotly.js'
import type { SceneRendererProps } from '../SceneRendererFactory'
import MathFormula from '../../../../components/MathFormula/MathFormula'

// 生成示例数据
function generateData(n: number = 20, slope: number = 2, intercept: number = 1, noise: number = 2) {
  const data: { x: number; y: number }[] = []
  for (let i = 0; i < n; i++) {
    const x = i / 2
    const y = slope * x + intercept + (Math.random() - 0.5) * noise
    data.push({ x, y })
  }
  return data
}

// 计算回归线参数
function calculateRegression(data: { x: number; y: number }[]) {
  const n = data.length
  const sumX = data.reduce((sum, p) => sum + p.x, 0)
  const sumY = data.reduce((sum, p) => sum + p.y, 0)
  const sumXY = data.reduce((sum, p) => sum + p.x * p.y, 0)
  const sumX2 = data.reduce((sum, p) => sum + p.x * p.x, 0)
  const sumY2 = data.reduce((sum, p) => sum + p.y * p.y, 0)

  const meanX = sumX / n
  const meanY = sumY / n

  // 斜率 a = Cov(X,Y) / Var(X)
  const slope = (sumXY - n * meanX * meanY) / (sumX2 - n * meanX * meanX)
  // 截距 b = mean(Y) - a * mean(X)
  const intercept = meanY - slope * meanX

  // 相关系数 r
  const numerator = sumXY - n * meanX * meanY
  const denominator = Math.sqrt((sumX2 - n * meanX * meanX) * (sumY2 - n * meanY * meanY))
  const r = numerator / denominator

  // 残差平方和
  const rss = data.reduce((sum, p) => {
    const predicted = slope * p.x + intercept
    return sum + Math.pow(p.y - predicted, 2)
  }, 0)

  return { slope, intercept, r, rss, meanX, meanY }
}

// 标题场景
function TitleScene({ sceneId }: { sceneId: string }) {
  const titles: Record<string, { title: string; subtitle: string }> = {
    'intro-1': { title: '回归分析', subtitle: '用直线拟合数据' },
    'summary-1': { title: '总结回顾', subtitle: '回归分析的核心思想' },
    'summary-5': { title: '感谢观看', subtitle: '探索数据中的规律' },
  }
  const { title, subtitle } = titles[sceneId] || { title: '回归分析', subtitle: '' }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{title}</h1>
      <p className="text-xl md:text-2xl text-white/70">{subtitle}</p>
    </div>
  )
}

// 散点图场景
function ScatterPlotScene({ showLine = false }: { showLine?: boolean }) {
  const [data] = useState(() => generateData(20, 2, 1, 3))
  const regression = useMemo(() => calculateRegression(data), [data])

  const traces: Data[] = [
    {
      x: data.map(p => p.x),
      y: data.map(p => p.y),
      type: 'scatter',
      mode: 'markers',
      marker: { size: 10, color: '#3b82f6' },
      name: '数据点',
    },
  ]

  if (showLine) {
    const xMin = Math.min(...data.map(p => p.x))
    const xMax = Math.max(...data.map(p => p.x))
    traces.push({
      x: [xMin, xMax],
      y: [regression.slope * xMin + regression.intercept, regression.slope * xMax + regression.intercept],
      type: 'scatter',
      mode: 'lines',
      line: { color: '#ef4444', width: 3 },
      name: '回归线',
    })
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Plot
        data={traces}
        layout={{
          autosize: true,
          height: 450,
          margin: { t: 30, r: 30, b: 50, l: 60 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.05)',
          xaxis: {
            title: { text: 'x' },
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
          },
          yaxis: {
            title: { text: 'y' },
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
          },
          showlegend: true,
          legend: {
            font: { color: 'white' },
            bgcolor: 'rgba(0,0,0,0.5)',
          },
        }}
        config={{ responsive: true, displayModeBar: false, displaylogo: false }}
        className="w-full"
      />
    </div>
  )
}

// 最小二乘法演示场景
function LeastSquaresScene({ animate = false }: { animate?: boolean }) {
  const [data] = useState(() => generateData(15, 2, 1, 2))
  const regression = useMemo(() => calculateRegression(data), [data])
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    if (!animate) return
    const timer = setInterval(() => {
      setFrame(f => (f + 1) % 60)
    }, 100)
    return () => clearInterval(timer)
  }, [animate])

  // 动画：展示不同斜率的拟合效果
  const currentSlope = animate
    ? regression.slope + Math.sin(frame / 10) * 0.5
    : regression.slope
  const currentIntercept = animate
    ? regression.intercept + Math.cos(frame / 10) * 0.5
    : regression.intercept

  const xMin = Math.min(...data.map(p => p.x))
  const xMax = Math.max(...data.map(p => p.x))

  // 计算当前线的残差平方和
  const currentRSS = data.reduce((sum, p) => {
    const predicted = currentSlope * p.x + currentIntercept
    return sum + Math.pow(p.y - predicted, 2)
  }, 0)

  const traces: Data[] = [
    {
      x: data.map(p => p.x),
      y: data.map(p => p.y),
      type: 'scatter',
      mode: 'markers',
      marker: { size: 10, color: '#3b82f6' },
      name: '数据点',
    },
    {
      x: [xMin, xMax],
      y: [currentSlope * xMin + currentIntercept, currentSlope * xMax + currentIntercept],
      type: 'scatter',
      mode: 'lines',
      line: { color: animate ? '#fbbf24' : '#ef4444', width: 3 },
      name: animate ? '尝试拟合' : '最佳拟合',
    },
  ]

  // 添加残差线
  data.forEach(p => {
    const predicted = currentSlope * p.x + currentIntercept
    traces.push({
      x: [p.x, p.x],
      y: [p.y, predicted],
      type: 'scatter',
      mode: 'lines',
      line: { color: '#22c55e', width: 1, dash: 'dot' },
      showlegend: false,
    })
  })

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <Plot
        data={traces}
        layout={{
          autosize: true,
          height: 400,
          margin: { t: 30, r: 30, b: 50, l: 60 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.05)',
          xaxis: {
            title: { text: 'x' },
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
          },
          yaxis: {
            title: { text: 'y' },
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
          },
          showlegend: false,
        }}
        config={{ responsive: true, displayModeBar: false, displaylogo: false }}
        className="w-full"
      />
      <div className="text-white/80 text-sm font-mono">
        {animate ? (
          <>
            <p>当前斜率: {currentSlope.toFixed(2)}</p>
            <p>残差平方和: {currentRSS.toFixed(2)}</p>
            <p className="text-green-400 mt-2">最小值: {regression.rss.toFixed(2)}</p>
          </>
        ) : (
          <>
            <p>斜率 a = {regression.slope.toFixed(2)}</p>
            <p>截距 b = {regression.intercept.toFixed(2)}</p>
            <p>残差平方和 = {regression.rss.toFixed(2)}</p>
          </>
        )}
      </div>
    </div>
  )
}

// 残差可视化场景
function ResidualScene() {
  const [data] = useState(() => generateData(20, 2, 1, 3))
  const regression = useMemo(() => calculateRegression(data), [data])

  // 计算残差
  const residuals = data.map(p => ({
    x: p.x,
    residual: p.y - (regression.slope * p.x + regression.intercept),
  }))

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Plot
        data={[
          {
            x: residuals.map(r => r.x),
            y: residuals.map(r => r.residual),
            type: 'scatter',
            mode: 'markers',
            marker: { size: 8, color: '#22c55e' },
            name: '残差',
          },
          {
            x: [Math.min(...residuals.map(r => r.x)), Math.max(...residuals.map(r => r.x))],
            y: [0, 0],
            type: 'scatter',
            mode: 'lines',
            line: { color: 'rgba(255,255,255,0.3)', width: 2, dash: 'dash' },
            name: 'y = 0',
          },
        ]}
        layout={{
          autosize: true,
          height: 400,
          margin: { t: 30, r: 30, b: 50, l: 60 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.05)',
          xaxis: {
            title: { text: 'x' },
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
          },
          yaxis: {
            title: { text: '残差 (y - ŷ)' },
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

// 公式场景
function FormulaScene({ formulaType }: { formulaType: string }) {
  const formulas: Record<string, { formula: string; description: string }> = {
    'regression-line': {
      formula: 'y = ax + b',
      description: '回归直线方程',
    },
    'slope': {
      formula: 'a = \\frac{\\sum(x_i - \\bar{x})(y_i - \\bar{y})}{\\sum(x_i - \\bar{x})^2} = \\frac{Cov(X,Y)}{Var(X)}',
      description: '斜率计算公式',
    },
    'intercept': {
      formula: 'b = \\bar{y} - a\\bar{x}',
      description: '截距计算公式',
    },
    'residual': {
      formula: 'RSS = \\sum_{i=1}^{n}(y_i - \\hat{y}_i)^2 = \\sum_{i=1}^{n}(y_i - ax_i - b)^2',
      description: '残差平方和（最小二乘法目标）',
    },
    'correlation': {
      formula: 'r = \\frac{\\sum(x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum(x_i - \\bar{x})^2 \\sum(y_i - \\bar{y})^2}}',
      description: '相关系数（-1 ≤ r ≤ 1）',
    },
    'r-squared': {
      formula: 'R^2 = r^2 = 1 - \\frac{RSS}{TSS}',
      description: '决定系数（拟合优度）',
    },
  }

  const { formula, description } = formulas[formulaType] || formulas['regression-line']

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <div className="p-8 bg-white/10 rounded-2xl backdrop-blur">
        <MathFormula formula={formula} className="text-2xl" />
      </div>
      <p className="text-white/70 text-lg">{description}</p>
    </div>
  )
}

// 相关系数演示场景
function CorrelationScene() {
  const [rValue, setRValue] = useState(0.8)

  // 生成稳定的随机噪声种子（使用 useState 初始化函数）
  const [noiseSeed] = useState(() => {
    const seed: number[] = []
    for (let i = 0; i < 30; i++) {
      seed.push(Math.random())
    }
    return seed
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setRValue(r => {
        const newR = r + 0.05
        return newR > 1 ? -1 : newR
      })
    }, 200)
    return () => clearInterval(timer)
  }, [])

  // 根据相关系数生成数据
  const data = useMemo(() => {
    const points: { x: number; y: number }[] = []
    const n = 30
    for (let i = 0; i < n; i++) {
      const x = i / 3
      const noise = (noiseSeed[i] - 0.5) * 5 * (1 - Math.abs(rValue))
      const y = rValue * x + noise + 5
      points.push({ x, y })
    }
    return points
  }, [rValue, noiseSeed])

  const regression = useMemo(() => calculateRegression(data), [data])
  const xMin = Math.min(...data.map(p => p.x))
  const xMax = Math.max(...data.map(p => p.x))

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <Plot
        data={[
          {
            x: data.map(p => p.x),
            y: data.map(p => p.y),
            type: 'scatter',
            mode: 'markers',
            marker: { size: 8, color: '#3b82f6' },
          },
          {
            x: [xMin, xMax],
            y: [regression.slope * xMin + regression.intercept, regression.slope * xMax + regression.intercept],
            type: 'scatter',
            mode: 'lines',
            line: { color: '#ef4444', width: 2 },
          },
        ]}
        layout={{
          autosize: true,
          height: 350,
          margin: { t: 20, r: 30, b: 40, l: 50 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.05)',
          xaxis: {
            title: { text: 'x' },
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
          },
          yaxis: {
            title: { text: 'y' },
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
          },
          showlegend: false,
        }}
        config={{ responsive: true, displayModeBar: false, displaylogo: false }}
        className="w-full"
      />
      <div className="text-white text-lg font-mono">
        <p>相关系数 r = {regression.r.toFixed(3)}</p>
        <p className="text-sm text-white/60 mt-2">
          {Math.abs(regression.r) > 0.8 ? '强相关' : Math.abs(regression.r) > 0.5 ? '中等相关' : '弱相关'}
        </p>
      </div>
    </div>
  )
}

// 应用场景
function ApplicationScene({ sceneId }: { sceneId: string }) {
  const apps: Record<string, { title: string; items: string[]; icon: string }> = {
    'applications-1': {
      title: '回归分析的应用',
      items: ['经济学：收入与消费', '医学：剂量与疗效', '机器学习：预测模型', '社会科学：变量关系'],
      icon: '📊',
    },
    'applications-2': {
      title: '经济学应用',
      items: ['需求预测', '价格分析', '市场趋势', '投资决策'],
      icon: '💰',
    },
    'applications-3': {
      title: '医学应用',
      items: ['药物剂量优化', '疾病风险评估', '治疗效果预测', '临床试验分析'],
      icon: '⚕️',
    },
    'applications-4': {
      title: '机器学习',
      items: ['线性回归模型', '特征工程', '预测分析', '模型评估'],
      icon: '🤖',
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

// 注意事项场景
function CautionScene({ sceneId }: { sceneId: string }) {
  const cautions: Record<string, { title: string; items: string[] }> = {
    'caution-1': {
      title: '使用回归分析的注意事项',
      items: ['相关不等于因果', '注意异常值影响', '检查线性假设', '避免过度外推'],
    },
    'caution-2': {
      title: '相关不等于因果',
      items: ['两个变量相关不代表有因果关系', '可能存在第三变量影响', '需要理论支持和实验验证', '谨慎解释结果'],
    },
    'caution-3': {
      title: '异常值的影响',
      items: ['异常值可能严重影响回归线', '需要识别和处理异常值', '考虑使用稳健回归方法', '分析异常值的原因'],
    },
    'caution-4': {
      title: '线性假设',
      items: ['数据应该呈线性关系', '非线性数据需要转换', '可以使用散点图检查', '考虑多项式回归等方法'],
    },
  }

  const caution = cautions[sceneId] || cautions['caution-1']

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="text-6xl">⚠️</div>
      <h2 className="text-3xl font-bold text-white">{caution.title}</h2>
      <ul className="space-y-3 text-white/80 text-lg max-w-2xl">
        {caution.items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// 主渲染器
export default function RegressionSceneRenderer({ scene }: SceneRendererProps) {
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
  if (sceneConfig.type === 'formula') {
    if (sceneConfig.id.includes('slope')) {
      return <FormulaScene formulaType="slope" />
    }
    if (sceneConfig.id.includes('intercept')) {
      return <FormulaScene formulaType="intercept" />
    }
    if (sceneConfig.id.includes('residual')) {
      return <FormulaScene formulaType="residual" />
    }
    if (sceneConfig.id.includes('correlation')) {
      return <FormulaScene formulaType="correlation" />
    }
    return <FormulaScene formulaType="regression-line" />
  }

  // 根据 section 和 scene 决定显示什么
  switch (sectionId) {
    case 'intro':
      return <ScatterPlotScene showLine={false} />

    case 'scatter-plot':
      if (sceneConfig.id.includes('scatter-plot-3') || sceneConfig.id.includes('scatter-plot-4')) {
        return <ScatterPlotScene showLine={true} />
      }
      return <ScatterPlotScene showLine={false} />

    case 'best-fit':
      if (sceneConfig.id.includes('best-fit-3') || sceneConfig.id.includes('best-fit-4')) {
        return <ResidualScene />
      }
      return <ScatterPlotScene showLine={true} />

    case 'least-squares':
      if (sceneConfig.id.includes('least-squares-1')) {
        return <FormulaScene formulaType="residual" />
      }
      if (sceneConfig.id.includes('least-squares-2')) {
        return <FormulaScene formulaType="slope" />
      }
      if (sceneConfig.id.includes('least-squares-3')) {
        return <FormulaScene formulaType="intercept" />
      }
      return <LeastSquaresScene animate={false} />

    case 'demo':
      if (sceneConfig.id.includes('demo-2')) {
        return <ResidualScene />
      }
      if (sceneConfig.id.includes('demo-4')) {
        return <LeastSquaresScene animate={true} />
      }
      return <LeastSquaresScene animate={false} />

    case 'correlation':
      if (sceneConfig.id.includes('correlation-1') || sceneConfig.id.includes('correlation-2') || sceneConfig.id.includes('correlation-3')) {
        return <CorrelationScene />
      }
      if (sceneConfig.id.includes('correlation-4')) {
        return <FormulaScene formulaType="r-squared" />
      }
      return <FormulaScene formulaType="correlation" />

    case 'prediction':
      return <ScatterPlotScene showLine={true} />

    case 'caution':
      return <CautionScene sceneId={sceneConfig.id} />

    case 'applications':
      return <ApplicationScene sceneId={sceneConfig.id} />

    case 'summary':
      if (sceneConfig.id.includes('summary-2')) {
        return <ScatterPlotScene showLine={true} />
      }
      if (sceneConfig.id.includes('summary-3')) {
        return <LeastSquaresScene animate={false} />
      }
      if (sceneConfig.id.includes('summary-4')) {
        return <CorrelationScene />
      }
      return <TitleScene sceneId={sceneConfig.id} />

    default:
      return <ScatterPlotScene showLine={true} />
  }
}
