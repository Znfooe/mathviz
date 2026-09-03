/**
 * 线性函数场景渲染器
 * 渲染一次函数的直线图形、斜率演示、截距演示等可视化
 */

import { useMemo, useState, useEffect } from 'react'
import Plot from '../../../ThemedPlot'
import type { Data } from 'plotly.js'
import type { SceneRendererProps } from '../SceneRendererFactory'
import MathFormula from '../../../../components/MathFormula/MathFormula'

// 标题场景
function TitleScene({ sceneId }: { sceneId: string }) {
  const titles: Record<string, { title: string; subtitle: string }> = {
    'intro-1': { title: '一次函数', subtitle: '探索斜率和截距对直线的影响' },
    'summary-1': { title: '总结回顾', subtitle: '一次函数的核心概念' },
    'summary-4': { title: '感谢观看', subtitle: '继续探索数学之美' },
  }
  const { title, subtitle } = titles[sceneId] || { title: '一次函数', subtitle: '' }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{title}</h1>
      <p className="text-xl md:text-2xl text-white/70">{subtitle}</p>
    </div>
  )
}

// 直线图形场景
function LineScene({
  slope = 1,
  intercept = 0,
  showGrid = true,
  showIntercepts = true,
  showSlopeTriangle = false,
  interactive = false,
}: {
  slope?: number
  intercept?: number
  showGrid?: boolean
  showIntercepts?: boolean
  showSlopeTriangle?: boolean
  interactive?: boolean
}) {
  // Use local state for interactive mode, otherwise use props
  const [localK, setLocalK] = useState(slope)
  const [localB, setLocalB] = useState(intercept)

  const k = interactive ? localK : slope
  const b = interactive ? localB : intercept

  // 生成直线数据
  const lineData = useMemo(() => {
    const xRange = [-5, 5]
    const x = []
    const y = []

    for (let xi = xRange[0]; xi <= xRange[1]; xi += 0.1) {
      x.push(xi)
      y.push(k * xi + b)
    }

    return { x, y }
  }, [k, b])

  // 计算截距点
  const intercepts = useMemo(() => {
    const yIntercept = { x: 0, y: b }
    const xIntercept = k !== 0 ? { x: -b / k, y: 0 } : null

    return { yIntercept, xIntercept }
  }, [k, b])

  // 生成斜率三角形数据
  const slopeTriangleData = useMemo(() => {
    if (!showSlopeTriangle) return null

    // 从 (0, b) 开始，水平走 1，垂直走 k
    const x = [0, 1, 1, 0]
    const y = [b, b, b + k, b]

    return { x, y }
  }, [k, b, showSlopeTriangle])

  const traces: Data[] = [
    // 主直线
    {
      x: lineData.x,
      y: lineData.y,
      type: 'scatter',
      mode: 'lines',
      line: {
        color: '#3b82f6',
        width: 3,
      },
      name: `y = ${k.toFixed(1)}x + ${b.toFixed(1)}`,
    } as Data,
  ]

  // 添加 y 轴截距点
  if (showIntercepts) {
    traces.push({
      x: [intercepts.yIntercept.x],
      y: [intercepts.yIntercept.y],
      type: 'scatter',
      mode: 'markers',
      marker: {
        size: 10,
        color: '#22c55e',
        symbol: 'circle',
      },
      name: `y 轴截距 (0, ${b.toFixed(1)})`,
    } as Data)

    // 添加 x 轴截距点
    if (intercepts.xIntercept && Math.abs(intercepts.xIntercept.x) <= 5) {
      traces.push({
        x: [intercepts.xIntercept.x],
        y: [intercepts.xIntercept.y],
        type: 'scatter',
        mode: 'markers',
        marker: {
          size: 10,
          color: '#ef4444',
          symbol: 'circle',
        },
        name: `x 轴截距 (${intercepts.xIntercept.x.toFixed(1)}, 0)`,
      } as Data)
    }
  }

  // 添加斜率三角形
  if (slopeTriangleData) {
    traces.push({
      x: slopeTriangleData.x,
      y: slopeTriangleData.y,
      type: 'scatter',
      mode: 'lines',
      line: {
        color: '#f59e0b',
        width: 2,
        dash: 'dash',
      },
      name: '斜率三角形',
      fill: 'toself',
      fillcolor: 'rgba(245, 158, 11, 0.1)',
    } as Data)
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <Plot
        data={traces}
        layout={{
          autosize: true,
          height: 450,
          margin: { t: 20, r: 30, b: 50, l: 60 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.05)',
          xaxis: {
            title: { text: 'x' },
            color: 'white',
            gridcolor: showGrid ? 'rgba(255,255,255,0.1)' : 'transparent',
            zeroline: true,
            zerolinecolor: 'rgba(255,255,255,0.3)',
            range: [-5, 5],
          },
          yaxis: {
            title: { text: 'y' },
            color: 'white',
            gridcolor: showGrid ? 'rgba(255,255,255,0.1)' : 'transparent',
            zeroline: true,
            zerolinecolor: 'rgba(255,255,255,0.3)',
            range: [-10, 10],
          },
          showlegend: true,
          legend: {
            font: { color: 'white' },
            bgcolor: 'rgba(0,0,0,0.5)',
            x: 0.02,
            y: 0.98,
          },
        }}
        config={{ responsive: true, displayModeBar: false, displaylogo: false }}
        className="w-full"
      />
      {interactive && (
        <div className="flex flex-col gap-4 w-full max-w-md px-4">
          <div className="flex flex-col gap-2">
            <label className="text-white text-sm">
              斜率 k = {k.toFixed(1)}
            </label>
            <input
              type="range"
              min="-3"
              max="3"
              step="0.1"
              value={k}
              onChange={(e) => setLocalK(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white text-sm">
              截距 b = {b.toFixed(1)}
            </label>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.1"
              value={b}
              onChange={(e) => setLocalB(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// 斜率演示场景
function SlopeScene({ highlightSlope }: { highlightSlope?: 'positive' | 'negative' | 'zero' }) {
  const slopes = [
    { k: 2, b: 0, color: '#3b82f6', name: 'k = 2 (正斜率)', type: 'positive' },
    { k: 0, b: 0, color: '#22c55e', name: 'k = 0 (零斜率)', type: 'zero' },
    { k: -2, b: 0, color: '#ef4444', name: 'k = -2 (负斜率)', type: 'negative' },
  ]

  const traces: Data[] = slopes.map(({ k, b, color, name, type }) => {
    const x = []
    const y = []

    for (let xi = -5; xi <= 5; xi += 0.1) {
      x.push(xi)
      y.push(k * xi + b)
    }

    const isHighlighted = highlightSlope === type
    return {
      x,
      y,
      type: 'scatter',
      mode: 'lines',
      line: {
        color,
        width: isHighlighted ? 4 : 2,
      },
      name,
      opacity: isHighlighted ? 1 : 0.5,
    } as Data
  })

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Plot
        data={traces}
        layout={{
          autosize: true,
          height: 450,
          margin: { t: 20, r: 30, b: 50, l: 60 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.05)',
          xaxis: {
            title: { text: 'x' },
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
            zeroline: true,
            zerolinecolor: 'rgba(255,255,255,0.3)',
            range: [-5, 5],
          },
          yaxis: {
            title: { text: 'y' },
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
            zeroline: true,
            zerolinecolor: 'rgba(255,255,255,0.3)',
            range: [-10, 10],
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

// 截距演示场景
function InterceptScene({ animateIntercept = false }: { animateIntercept?: boolean }) {
  const [b, setB] = useState(0)

  useEffect(() => {
    if (!animateIntercept) return

    const timer = setInterval(() => {
      setB((prev) => {
        const next = prev + 0.1
        return next > 5 ? -5 : next
      })
    }, 50)

    return () => clearInterval(timer)
  }, [animateIntercept])

  const lines = [
    { k: 1, b: b - 2, color: '#3b82f6', name: `y = x + ${(b - 2).toFixed(1)}` },
    { k: 1, b: b, color: '#22c55e', name: `y = x + ${b.toFixed(1)}` },
    { k: 1, b: b + 2, color: '#ef4444', name: `y = x + ${(b + 2).toFixed(1)}` },
  ]

  const traces: Data[] = lines.map(({ k, b, color, name }) => {
    const x = []
    const y = []

    for (let xi = -5; xi <= 5; xi += 0.1) {
      x.push(xi)
      y.push(k * xi + b)
    }

    return {
      x,
      y,
      type: 'scatter',
      mode: 'lines',
      line: {
        color,
        width: 3,
      },
      name,
    } as Data
  })

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Plot
        data={traces}
        layout={{
          autosize: true,
          height: 450,
          margin: { t: 20, r: 30, b: 50, l: 60 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.05)',
          xaxis: {
            title: { text: 'x' },
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
            zeroline: true,
            zerolinecolor: 'rgba(255,255,255,0.3)',
            range: [-5, 5],
          },
          yaxis: {
            title: { text: 'y' },
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
            zeroline: true,
            zerolinecolor: 'rgba(255,255,255,0.3)',
            range: [-10, 10],
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

// 参数变化动画场景
function ParameterScene({ animateSlope = true }: { animateSlope?: boolean }) {
  const [k, setK] = useState(-2)

  useEffect(() => {
    if (!animateSlope) return

    const timer = setInterval(() => {
      setK((prev) => {
        const next = prev + 0.05
        return next > 2 ? -2 : next
      })
    }, 50)

    return () => clearInterval(timer)
  }, [animateSlope])

  const lineData = useMemo(() => {
    const x = []
    const y = []

    for (let xi = -5; xi <= 5; xi += 0.1) {
      x.push(xi)
      y.push(k * xi)
    }

    return { x, y }
  }, [k])

  const traces: Data[] = [
    {
      x: lineData.x,
      y: lineData.y,
      type: 'scatter',
      mode: 'lines',
      line: {
        color: '#3b82f6',
        width: 3,
      },
      name: `y = ${k.toFixed(2)}x`,
    } as Data,
  ]

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <Plot
        data={traces}
        layout={{
          autosize: true,
          height: 450,
          margin: { t: 20, r: 30, b: 50, l: 60 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.05)',
          xaxis: {
            title: { text: 'x' },
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
            zeroline: true,
            zerolinecolor: 'rgba(255,255,255,0.3)',
            range: [-5, 5],
          },
          yaxis: {
            title: { text: 'y' },
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
            zeroline: true,
            zerolinecolor: 'rgba(255,255,255,0.3)',
            range: [-10, 10],
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
      <div className="text-white/70 text-sm">
        斜率从 -2 变化到 2
      </div>
    </div>
  )
}

// 公式场景
function FormulaScene({ formulaType }: { formulaType: string }) {
  const formulas: Record<string, { formula: string; description: string }> = {
    'general': {
      formula: 'y = kx + b',
      description: '一次函数的一般形式',
    },
    'slope': {
      formula: 'k = \\frac{\\Delta y}{\\Delta x} = \\frac{y_2 - y_1}{x_2 - x_1}',
      description: '斜率的计算公式',
    },
    'y-intercept': {
      formula: 'b = y|_{x=0}',
      description: 'y 轴截距：当 x = 0 时 y 的值',
    },
    'x-intercept': {
      formula: 'x|_{y=0} = -\\frac{b}{k}',
      description: 'x 轴截距：当 y = 0 时 x 的值',
    },
    'point-slope': {
      formula: 'y - y_1 = k(x - x_1)',
      description: '点斜式：已知一点和斜率',
    },
  }

  const { formula, description } = formulas[formulaType] || formulas['general']

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <div className="p-8 bg-white/10 rounded-2xl backdrop-blur">
        <MathFormula formula={formula} className="text-2xl" />
      </div>
      <p className="text-white/70 text-lg text-center max-w-2xl">{description}</p>
    </div>
  )
}

// 应用场景
function ApplicationScene({ sceneId }: { sceneId: string }) {
  const apps: Record<string, { title: string; items: string[]; icon: string }> = {
    'application-1': {
      title: '出租车计费',
      items: ['起步价：截距 b', '每公里单价：斜率 k', '里程：自变量 x', '总费用：y = kx + b'],
      icon: '🚕',
    },
    'application-2': {
      title: '手机话费',
      items: ['月租费：截距 b', '通话单价：斜率 k', '通话时长：自变量 x', '总费用：y = kx + b'],
      icon: '📱',
    },
    'application-3': {
      title: '水电费',
      items: ['基本费用：截距 b', '单位价格：斜率 k', '用量：自变量 x', '总费用：y = kx + b'],
      icon: '💡',
    },
  }

  const app = apps[sceneId] || apps['application-1']

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

// 典型例子场景
function ExampleScene({ exampleType }: { exampleType: string }) {
  const examples: Record<string, { k: number; b: number; description: string }> = {
    'y=x': { k: 1, b: 0, description: 'y = x：最简单的一次函数，斜率为 1，经过原点' },
    'y=-x': { k: -1, b: 0, description: 'y = -x：斜率为 -1，经过原点，方向相反' },
    'y=2x+1': { k: 2, b: 1, description: 'y = 2x + 1：斜率为 2，更陡，向上平移 1 个单位' },
  }

  const example = examples[exampleType] || examples['y=x']

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <LineScene
        slope={example.k}
        intercept={example.b}
        showGrid={true}
        showIntercepts={true}
        showSlopeTriangle={true}
      />
      <p className="text-white/70 text-center max-w-2xl px-4">{example.description}</p>
    </div>
  )
}

// 主渲染器
export default function LinearSceneRenderer({ scene, isInteractive }: SceneRendererProps) {
  if (!scene) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white/50 text-lg">加载中...</div>
      </div>
    )
  }

  const { sectionId, scene: sceneConfig } = scene

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
    if (sceneConfig.id.includes('slope')) {
      return <FormulaScene formulaType="slope" />
    }
    if (sceneConfig.id.includes('intercept')) {
      return <FormulaScene formulaType="y-intercept" />
    }
    return <FormulaScene formulaType="general" />
  }

  // 根据 section 和 scene 决定显示什么
  switch (sectionId) {
    case 'intro':
      if (sceneConfig.id === 'intro-1') {
        return <TitleScene sceneId={sceneConfig.id} />
      }
      if (sceneConfig.id.includes('2')) {
        return <LineScene slope={1} intercept={2} showGrid={true} showIntercepts={true} />
      }
      return <LineScene slope={1} intercept={0} showGrid={true} showIntercepts={false} />

    case 'formula':
      if (sceneConfig.id.includes('1')) {
        return <FormulaScene formulaType="general" />
      }
      if (sceneConfig.id.includes('2')) {
        return <FormulaScene formulaType="slope" />
      }
      if (sceneConfig.id.includes('3')) {
        return <FormulaScene formulaType="y-intercept" />
      }
      if (sceneConfig.id.includes('4')) {
        return <LineScene slope={0} intercept={2} showGrid={true} showIntercepts={true} />
      }
      return <FormulaScene formulaType="general" />

    case 'slope':
      if (sceneConfig.id.includes('1')) {
        return <LineScene slope={1} intercept={0} showGrid={true} showIntercepts={false} showSlopeTriangle={true} />
      }
      if (sceneConfig.id.includes('2')) {
        return <SlopeScene highlightSlope="positive" />
      }
      if (sceneConfig.id.includes('3')) {
        return <SlopeScene highlightSlope="negative" />
      }
      if (sceneConfig.id.includes('4')) {
        return <SlopeScene />
      }
      if (sceneConfig.id.includes('5')) {
        return <LineScene slope={1} intercept={0} showGrid={true} showIntercepts={true} interactive={isInteractive} />
      }
      return <SlopeScene />

    case 'intercept':
      if (sceneConfig.id.includes('1')) {
        return <FormulaScene formulaType="y-intercept" />
      }
      if (sceneConfig.id.includes('2')) {
        return <InterceptScene animateIntercept={false} />
      }
      if (sceneConfig.id.includes('3')) {
        return <FormulaScene formulaType="x-intercept" />
      }
      if (sceneConfig.id.includes('4')) {
        return <LineScene slope={1} intercept={0} showGrid={true} showIntercepts={true} interactive={isInteractive} />
      }
      return <InterceptScene />

    case 'graph':
      if (sceneConfig.id.includes('1')) {
        return <LineScene slope={1} intercept={2} showGrid={true} showIntercepts={true} showSlopeTriangle={false} />
      }
      if (sceneConfig.id.includes('2')) {
        return <LineScene slope={1} intercept={2} showGrid={true} showIntercepts={true} showSlopeTriangle={true} />
      }
      if (sceneConfig.id.includes('3')) {
        return <LineScene slope={1} intercept={2} showGrid={true} showIntercepts={true} showSlopeTriangle={true} interactive={isInteractive} />
      }
      return <LineScene slope={1} intercept={2} showGrid={true} showIntercepts={true} />

    case 'animation':
      if (sceneConfig.id.includes('1') || sceneConfig.id.includes('2') || sceneConfig.id.includes('3')) {
        return <ParameterScene animateSlope={true} />
      }
      return <ParameterScene animateSlope={true} />

    case 'examples':
      if (sceneConfig.id.includes('2')) {
        return <ExampleScene exampleType="y=x" />
      }
      if (sceneConfig.id.includes('3')) {
        return <ExampleScene exampleType="y=-x" />
      }
      if (sceneConfig.id.includes('4')) {
        return <ExampleScene exampleType="y=2x+1" />
      }
      return <LineScene slope={1} intercept={0} showGrid={true} showIntercepts={true} />

    case 'application':
      return <ApplicationScene sceneId={sceneConfig.id} />

    case 'summary':
      if (sceneConfig.id === 'summary-1') {
        return <TitleScene sceneId={sceneConfig.id} />
      }
      if (sceneConfig.id.includes('2')) {
        return <FormulaScene formulaType="general" />
      }
      if (sceneConfig.id.includes('3')) {
        return <SlopeScene />
      }
      if (sceneConfig.id.includes('4')) {
        return <TitleScene sceneId={sceneConfig.id} />
      }
      return <LineScene slope={1} intercept={0} showGrid={true} showIntercepts={true} />

    default:
      return <LineScene slope={1} intercept={0} showGrid={true} showIntercepts={true} />
  }
}
