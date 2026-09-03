/**
 * 插值场景渲染器
 * 可视化拉格朗日插值、样条插值和龙格现象
 */

import { useMemo, useState, useEffect } from 'react'
import Plot from '../../../ThemedPlot'
import type { SceneRendererProps } from '../SceneRendererFactory'
import MathFormula from '../../../MathFormula/MathFormula'

// 标题场景
function TitleScene({ sceneId }: { sceneId: string }) {
  const titles: Record<string, { title: string; subtitle: string }> = {
    'intro-1': { title: '插值', subtitle: '探索数据点之间的曲线拟合' },
    'sum-1': { title: '总结回顾', subtitle: '插值的核心思想' },
  }
  const { title, subtitle } = titles[sceneId] || { title: '插值', subtitle: '' }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{title}</h1>
      <p className="text-xl md:text-2xl text-white/70">{subtitle}</p>
    </div>
  )
}

// 拉格朗日插值基函数
function lagrangeBasis(x: number, i: number, xPoints: number[]): number {
  let result = 1
  for (let j = 0; j < xPoints.length; j++) {
    if (j !== i) {
      result *= (x - xPoints[j]) / (xPoints[i] - xPoints[j])
    }
  }
  return result
}

// 拉格朗日插值
function lagrangeInterpolation(x: number, xPoints: number[], yPoints: number[]): number {
  let result = 0
  for (let i = 0; i < xPoints.length; i++) {
    result += yPoints[i] * lagrangeBasis(x, i, xPoints)
  }
  return result
}

// 三次样条插值（自然边界条件）
function cubicSplineInterpolation(
  x: number,
  xPoints: number[],
  yPoints: number[]
): number {
  const n = xPoints.length - 1

  // 找到 x 所在的区间
  let i = 0
  for (i = 0; i < n; i++) {
    if (x >= xPoints[i] && x <= xPoints[i + 1]) {
      break
    }
  }
  if (i >= n) i = n - 1

  // 简化的三次样条（使用 Catmull-Rom 样条）
  const t = (x - xPoints[i]) / (xPoints[i + 1] - xPoints[i])

  // 获取控制点
  const p0 = i > 0 ? yPoints[i - 1] : yPoints[i]
  const p1 = yPoints[i]
  const p2 = yPoints[i + 1]
  const p3 = i < n - 1 ? yPoints[i + 2] : yPoints[i + 1]

  // Catmull-Rom 样条公式
  const t2 = t * t
  const t3 = t2 * t

  return 0.5 * (
    (2 * p1) +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t3
  )
}

// 拉格朗日插值场景
function LagrangeScene() {
  // 默认数据点
  const [dataPoints] = useState<{ x: number[]; y: number[] }>({
    x: [-2, -1, 0, 1, 2],
    y: [4, 1, 0, 1, 4],
  })

  const plotData = useMemo(() => {
    const xValues: number[] = []
    const yValues: number[] = []

    const xMin = Math.min(...dataPoints.x) - 0.5
    const xMax = Math.max(...dataPoints.x) + 0.5
    const step = (xMax - xMin) / 200

    for (let x = xMin; x <= xMax; x += step) {
      xValues.push(x)
      yValues.push(lagrangeInterpolation(x, dataPoints.x, dataPoints.y))
    }

    return { x: xValues, y: yValues }
  }, [dataPoints])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <Plot
        data={[
          {
            x: plotData.x,
            y: plotData.y,
            type: 'scatter',
            mode: 'lines',
            line: { color: '#3b82f6', width: 3 },
            name: '拉格朗日插值',
          },
          {
            x: dataPoints.x,
            y: dataPoints.y,
            type: 'scatter',
            mode: 'markers',
            marker: { color: '#ef4444', size: 12 },
            name: '数据点',
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
            zeroline: true,
            zerolinecolor: 'rgba(255,255,255,0.3)',
          },
          yaxis: {
            title: { text: 'y' },
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
            zeroline: true,
            zerolinecolor: 'rgba(255,255,255,0.3)',
          },
          legend: {
            font: { color: 'white' },
            bgcolor: 'rgba(0,0,0,0.5)',
          },
          showlegend: true,
        }}
        config={{ responsive: true, displayModeBar: false, displaylogo: false }}
        className="w-full"
      />

      <div className="text-white/70 text-sm text-center">
        {dataPoints.x.length} 个点确定一个 {dataPoints.x.length - 1} 次多项式
      </div>
    </div>
  )
}

// 样条插值场景
function SplineScene() {
  const [dataPoints] = useState<{ x: number[]; y: number[] }>({
    x: [-3, -2, -1, 0, 1, 2, 3],
    y: [0, 2, 1, 0, 1, 2, 0],
  })

  const plotData = useMemo(() => {
    const xValues: number[] = []
    const yValues: number[] = []

    const xMin = Math.min(...dataPoints.x)
    const xMax = Math.max(...dataPoints.x)
    const step = (xMax - xMin) / 200

    for (let x = xMin; x <= xMax; x += step) {
      xValues.push(x)
      yValues.push(cubicSplineInterpolation(x, dataPoints.x, dataPoints.y))
    }

    return { x: xValues, y: yValues }
  }, [dataPoints])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <Plot
        data={[
          {
            x: plotData.x,
            y: plotData.y,
            type: 'scatter',
            mode: 'lines',
            line: { color: '#22c55e', width: 3 },
            name: '三次样条插值',
          },
          {
            x: dataPoints.x,
            y: dataPoints.y,
            type: 'scatter',
            mode: 'markers',
            marker: { color: '#ef4444', size: 12 },
            name: '数据点',
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
            zeroline: true,
            zerolinecolor: 'rgba(255,255,255,0.3)',
          },
          yaxis: {
            title: { text: 'y' },
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
            zeroline: true,
            zerolinecolor: 'rgba(255,255,255,0.3)',
          },
          legend: {
            font: { color: 'white' },
            bgcolor: 'rgba(0,0,0,0.5)',
          },
          showlegend: true,
        }}
        config={{ responsive: true, displayModeBar: false, displaylogo: false }}
        className="w-full"
      />

      <div className="text-white/70 text-sm text-center">
        分段三次多项式，在连接点处光滑
      </div>
    </div>
  )
}

// 方法对比场景
function ComparisonScene() {
  const [dataPoints] = useState<{ x: number[]; y: number[] }>({
    x: [-2, -1, 0, 1, 2],
    y: [1, 3, 2, 3, 1],
  })

  const plotData = useMemo(() => {
    const xMin = Math.min(...dataPoints.x) - 0.5
    const xMax = Math.max(...dataPoints.x) + 0.5
    const step = (xMax - xMin) / 200

    const lagrangeData: { x: number[]; y: number[] } = { x: [], y: [] }
    const splineData: { x: number[]; y: number[] } = { x: [], y: [] }

    for (let x = xMin; x <= xMax; x += step) {
      lagrangeData.x.push(x)
      lagrangeData.y.push(lagrangeInterpolation(x, dataPoints.x, dataPoints.y))

      splineData.x.push(x)
      splineData.y.push(cubicSplineInterpolation(x, dataPoints.x, dataPoints.y))
    }

    return { lagrange: lagrangeData, spline: splineData }
  }, [dataPoints])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <Plot
        data={[
          {
            x: plotData.lagrange.x,
            y: plotData.lagrange.y,
            type: 'scatter',
            mode: 'lines',
            line: { color: '#3b82f6', width: 2, dash: 'dash' },
            name: '拉格朗日插值',
          },
          {
            x: plotData.spline.x,
            y: plotData.spline.y,
            type: 'scatter',
            mode: 'lines',
            line: { color: '#22c55e', width: 3 },
            name: '样条插值',
          },
          {
            x: dataPoints.x,
            y: dataPoints.y,
            type: 'scatter',
            mode: 'markers',
            marker: { color: '#ef4444', size: 12 },
            name: '数据点',
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
            zeroline: true,
            zerolinecolor: 'rgba(255,255,255,0.3)',
          },
          yaxis: {
            title: { text: 'y' },
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
            zeroline: true,
            zerolinecolor: 'rgba(255,255,255,0.3)',
          },
          legend: {
            font: { color: 'white' },
            bgcolor: 'rgba(0,0,0,0.5)',
          },
          showlegend: true,
        }}
        config={{ responsive: true, displayModeBar: false, displaylogo: false }}
        className="w-full"
      />

      <div className="text-white/70 text-sm text-center">
        样条插值通常比拉格朗日插值更加平滑稳定
      </div>
    </div>
  )
}

// 龙格现象演示场景
function RungePhenomenonScene() {
  const [numPoints, setNumPoints] = useState(7)

  useEffect(() => {
    const timer = setInterval(() => {
      setNumPoints(prev => {
        const next = prev + 1
        return next > 11 ? 5 : next
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const plotData = useMemo(() => {
    // 龙格函数: f(x) = 1 / (1 + 25x²)
    const rungeFunction = (x: number) => 1 / (1 + 25 * x * x)

    // 生成等距数据点
    const dataPoints: { x: number[]; y: number[] } = { x: [], y: [] }
    for (let i = 0; i < numPoints; i++) {
      const x = -1 + (2 * i) / (numPoints - 1)
      dataPoints.x.push(x)
      dataPoints.y.push(rungeFunction(x))
    }

    // 原函数
    const originalData: { x: number[]; y: number[] } = { x: [], y: [] }
    for (let x = -1; x <= 1; x += 0.01) {
      originalData.x.push(x)
      originalData.y.push(rungeFunction(x))
    }

    // 拉格朗日插值
    const interpolationData: { x: number[]; y: number[] } = { x: [], y: [] }
    for (let x = -1; x <= 1; x += 0.01) {
      interpolationData.x.push(x)
      interpolationData.y.push(lagrangeInterpolation(x, dataPoints.x, dataPoints.y))
    }

    return { original: originalData, interpolation: interpolationData, points: dataPoints }
  }, [numPoints])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <Plot
        data={[
          {
            x: plotData.original.x,
            y: plotData.original.y,
            type: 'scatter',
            mode: 'lines',
            line: { color: '#22c55e', width: 3 },
            name: '原函数 1/(1+25x²)',
          },
          {
            x: plotData.interpolation.x,
            y: plotData.interpolation.y,
            type: 'scatter',
            mode: 'lines',
            line: { color: '#3b82f6', width: 2, dash: 'dash' },
            name: '拉格朗日插值',
          },
          {
            x: plotData.points.x,
            y: plotData.points.y,
            type: 'scatter',
            mode: 'markers',
            marker: { color: '#ef4444', size: 10 },
            name: '插值点',
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
            range: [-1.1, 1.1],
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
            zeroline: true,
            zerolinecolor: 'rgba(255,255,255,0.3)',
          },
          yaxis: {
            title: { text: 'y' },
            range: [-0.5, 1.5],
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
            zeroline: true,
            zerolinecolor: 'rgba(255,255,255,0.3)',
          },
          legend: {
            font: { color: 'white' },
            bgcolor: 'rgba(0,0,0,0.5)',
          },
          showlegend: true,
        }}
        config={{ responsive: true, displayModeBar: false, displaylogo: false }}
        className="w-full"
      />

      <div className="text-white text-center space-y-2">
        <div className="text-lg">插值点数: {numPoints}</div>
        <div className="text-sm text-white/70">
          注意边缘的振荡现象 - 这就是龙格现象
        </div>
      </div>
    </div>
  )
}

// 公式场景
function FormulaScene({ formulaType }: { formulaType: string }) {
  const formulas: Record<string, { formula: string; description: string }> = {
    'lagrange': {
      formula: 'P(x) = \\sum_{i=0}^{n} y_i \\prod_{j=0, j\\neq i}^{n} \\frac{x - x_j}{x_i - x_j}',
      description: '拉格朗日插值公式',
    },
    'lagrange-basis': {
      formula: 'L_i(x) = \\prod_{j=0, j\\neq i}^{n} \\frac{x - x_j}{x_i - x_j}',
      description: '拉格朗日基函数',
    },
    'spline': {
      formula: 'S(x) = a_i + b_i(x-x_i) + c_i(x-x_i)^2 + d_i(x-x_i)^3',
      description: '三次样条在区间 [x_i, x_{i+1}] 上的表达式',
    },
    'spline-continuity': {
      formula: 'S\'\'(x_i^-) = S\'\'(x_i^+), \\quad S\'(x_i^-) = S\'(x_i^+)',
      description: '样条在连接点处的光滑条件',
    },
  }

  const { formula, description } = formulas[formulaType] || formulas['lagrange']

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <div className="p-8 bg-white/10 rounded-2xl backdrop-blur max-w-4xl">
        <MathFormula formula={formula} className="text-xl md:text-2xl" />
      </div>
      <p className="text-white/70 text-lg text-center max-w-2xl px-4">{description}</p>
    </div>
  )
}

// 应用场景
function ApplicationScene({ sceneId }: { sceneId: string }) {
  const apps: Record<string, { title: string; items: string[]; icon: string }> = {
    'app-1': {
      title: '插值的应用',
      items: ['图像处理 - 图片缩放', '动画制作 - 关键帧插值', '科学计算 - 数据拟合', 'CAD设计 - 曲线建模'],
      icon: '🎨',
    },
    'app-2': {
      title: '图像处理',
      items: ['双线性插值', '双三次插值', '图片放大', '纹理映射'],
      icon: '🖼️',
    },
    'app-3': {
      title: '动画制作',
      items: ['关键帧之间的过渡', '运动路径平滑', '变形动画', '相机运动'],
      icon: '🎬',
    },
    'app-4': {
      title: '科学计算',
      items: ['离散数据估计', '数值微分', '数值积分', '函数逼近'],
      icon: '🔬',
    },
  }

  const app = apps[sceneId] || apps['app-1']

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

// 概念场景
function ConceptScene({ sceneId }: { sceneId: string }) {
  const concepts: Record<string, { title: string; description: string; points: string[] }> = {
    'concept-1': {
      title: '什么是插值？',
      description: '插值是构造一个函数，使它精确通过给定的数据点',
      points: [
        '已知若干数据点 (x₀, y₀), (x₁, y₁), ..., (xₙ, yₙ)',
        '构造函数 f(x) 使得 f(xᵢ) = yᵢ',
        '用于估计数据点之间的值',
      ],
    },
    'concept-2': {
      title: '插值 vs 回归',
      description: '插值曲线必须经过每一个数据点',
      points: [
        '插值：曲线精确通过所有点',
        '回归：曲线尽可能接近所有点',
        '插值用于精确数据，回归用于有噪声的数据',
      ],
    },
    'concept-3': {
      title: '线性插值',
      description: '最简单的插值方法',
      points: [
        '用直线连接相邻的点',
        '简单快速，但不够平滑',
        '适合数据点密集的情况',
      ],
    },
  }

  const concept = concepts[sceneId] || concepts['concept-1']

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-8">
      <h2 className="text-3xl font-bold text-white">{concept.title}</h2>
      <p className="text-xl text-white/80 text-center max-w-2xl">{concept.description}</p>
      <ul className="space-y-3 text-white/70 text-lg max-w-2xl">
        {concept.points.map((point, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-sm">
              {i + 1}
            </span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// 主渲染器
export default function InterpolationSceneRenderer({ scene }: SceneRendererProps) {
  if (!scene) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white/50 text-lg">加载中...</div>
      </div>
    )
  }

  const { sectionId, scene: sceneConfig } = scene

  // 标题场景
  if (sceneConfig.type === 'title' || sceneConfig.id.includes('intro-1') || sceneConfig.id.includes('sum-1')) {
    return <TitleScene sceneId={sceneConfig.id} />
  }

  // 应用场景
  if (sceneConfig.type === 'application' || sceneConfig.id.includes('app-')) {
    return <ApplicationScene sceneId={sceneConfig.id} />
  }

  // 公式场景
  if (sceneConfig.type === 'formula') {
    return <FormulaScene formulaType="lagrange" />
  }

  // 根据 section 和 scene 决定显示什么
  switch (sectionId) {
    case 'intro':
      if (sceneConfig.id.includes('intro-1')) {
        return <TitleScene sceneId={sceneConfig.id} />
      }
      if (sceneConfig.id.includes('intro-2') || sceneConfig.id.includes('intro-3')) {
        return <LagrangeScene />
      }
      return <ConceptScene sceneId="concept-1" />

    case 'concept':
      if (sceneConfig.id.includes('concept-1')) {
        return <ConceptScene sceneId="concept-1" />
      }
      if (sceneConfig.id.includes('concept-2')) {
        return <ConceptScene sceneId="concept-2" />
      }
      if (sceneConfig.id.includes('concept-3')) {
        return <ConceptScene sceneId="concept-3" />
      }
      return <LagrangeScene />

    case 'lagrange':
      if (sceneConfig.id.includes('lag-1') || sceneConfig.id.includes('lag-2')) {
        return <LagrangeScene />
      }
      if (sceneConfig.id.includes('lag-3') || sceneConfig.id.includes('lag-4')) {
        return <RungePhenomenonScene />
      }
      return <LagrangeScene />

    case 'spline':
      if (sceneConfig.id.includes('spline-1') || sceneConfig.id.includes('spline-2')) {
        return <SplineScene />
      }
      if (sceneConfig.id.includes('spline-3') || sceneConfig.id.includes('spline-4')) {
        return <ComparisonScene />
      }
      return <SplineScene />

    case 'application':
      return <ApplicationScene sceneId={sceneConfig.id} />

    case 'summary':
      if (sceneConfig.id.includes('sum-1')) {
        return <TitleScene sceneId="sum-1" />
      }
      if (sceneConfig.id.includes('sum-2')) {
        return <ComparisonScene />
      }
      if (sceneConfig.id.includes('sum-3')) {
        return <ApplicationScene sceneId="app-1" />
      }
      return <TitleScene sceneId="sum-1" />

    default:
      return <LagrangeScene />
  }
}
