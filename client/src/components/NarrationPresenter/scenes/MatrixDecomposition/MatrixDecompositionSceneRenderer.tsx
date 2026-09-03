/**
 * 矩阵分解场景渲染器
 * 渲染 LU/QR/SVD 分解、矩阵热力图等可视化
 */

import { useState, useEffect, useRef } from 'react'
import Plot from '../../../ThemedPlot'
import type { Data } from 'plotly.js'
import type { SceneRendererProps } from '../SceneRendererFactory'
import MathFormula from '../../../../components/MathFormula/MathFormula'

// 标题场景
function TitleScene({ sceneId }: { sceneId: string }) {
  const titles: Record<string, { title: string; subtitle: string }> = {
    'intro-welcome': { title: '矩阵分解', subtitle: '将复杂矩阵分解为简单矩阵的乘积' },
    'summary-intro': { title: '总结回顾', subtitle: '矩阵分解的核心思想' },
    'summary-end': { title: '感谢观看', subtitle: '探索矩阵分解之美' },
  }
  const { title, subtitle } = titles[sceneId] || { title: '矩阵分解', subtitle: '' }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{title}</h1>
      <p className="text-xl md:text-2xl text-white/70">{subtitle}</p>
    </div>
  )
}

// 矩阵热力图场景
function MatrixHeatmapScene({
  matrix,
  title = '矩阵可视化',
  colorscale = 'RdBu',
  showValues = true
}: {
  matrix: number[][]
  title?: string
  colorscale?: string
  showValues?: boolean
}) {
  const data: Data[] = [
    {
      z: matrix,
      type: 'heatmap',
      colorscale: colorscale as 'RdBu' | 'Viridis' | 'Blues' | 'Reds' | 'Greens' | 'Oranges',
      showscale: true,
      text: showValues ? matrix.map(row => row.map(val => val.toFixed(2))) : undefined,
      texttemplate: showValues ? '%{text}' : undefined,
      textfont: { color: 'white', size: 12 },
      hoverongaps: false,
    } as Data,
  ]

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <h3 className="text-white text-xl">{title}</h3>
      <Plot
        data={data}
        layout={{
          autosize: true,
          height: 400,
          margin: { t: 20, r: 80, b: 40, l: 60 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.05)',
          xaxis: {
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
            showgrid: false,
          },
          yaxis: {
            color: 'white',
            gridcolor: 'rgba(255,255,255,0.1)',
            showgrid: false,
            autorange: 'reversed',
          },
          font: { color: 'white', size: 12 },
        }}
        config={{ responsive: true, displayModeBar: false, displaylogo: false }}
        className="w-full"
      />
    </div>
  )
}

// LU 分解场景
function LUDecompositionScene({ animate = false }: { animate?: boolean }) {
  const [step, setStep] = useState(0)
  const maxSteps = 3

  useEffect(() => {
    if (!animate) return
    const timer = setInterval(() => {
      setStep(s => (s < maxSteps ? s + 1 : 0))
    }, 2000)
    return () => clearInterval(timer)
  }, [animate])

  // 示例矩阵 A = [[4, 3], [6, 3]]
  const A = [[4, 3], [6, 3]]
  const L = [[1, 0], [1.5, 1]]
  const U = [[4, 3], [0, -1.5]]

  const matrices = [
    { matrix: A, title: '原矩阵 A', color: 'Viridis' },
    { matrix: L, title: '下三角矩阵 L', color: 'Blues' },
    { matrix: U, title: '上三角矩阵 U', color: 'Reds' },
  ]

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
      <div className="text-white text-center">
        <h3 className="text-2xl font-bold mb-2">LU 分解</h3>
        <p className="text-white/70">A = L × U</p>
      </div>

      <div className="flex gap-4 items-center">
        {step === 0 && (
          <MatrixHeatmapScene
            matrix={matrices[0].matrix}
            title={matrices[0].title}
            colorscale={matrices[0].color}
          />
        )}
        {step >= 1 && (
          <>
            <MatrixHeatmapScene
              matrix={matrices[1].matrix}
              title={matrices[1].title}
              colorscale={matrices[1].color}
            />
            {step >= 2 && (
              <>
                <div className="text-white text-3xl">×</div>
                <MatrixHeatmapScene
                  matrix={matrices[2].matrix}
                  title={matrices[2].title}
                  colorscale={matrices[2].color}
                />
              </>
            )}
          </>
        )}
      </div>

      {animate && (
        <div className="text-white/70 text-sm">
          步骤 {step + 1} / {maxSteps + 1}
        </div>
      )}
    </div>
  )
}

// QR 分解场景
function QRDecompositionScene({ animate = false }: { animate?: boolean }) {
  const [step, setStep] = useState(0)
  const maxSteps = 2

  useEffect(() => {
    if (!animate) return
    const timer = setInterval(() => {
      setStep(s => (s < maxSteps ? s + 1 : 0))
    }, 2000)
    return () => clearInterval(timer)
  }, [animate])

  // 示例矩阵 A = [[1, 1], [1, 0], [0, 1]]
  const A = [[1, 1], [1, 0], [0, 1]]
  // Q 是正交矩阵
  const Q = [[0.707, 0.408], [0.707, -0.408], [0, 0.816]]
  // R 是上三角矩阵
  const R = [[1.414, 0.707], [0, 1.225]]

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
      <div className="text-white text-center">
        <h3 className="text-2xl font-bold mb-2">QR 分解</h3>
        <p className="text-white/70">A = Q × R (Q 正交, R 上三角)</p>
      </div>

      <div className="flex gap-4 items-center flex-wrap justify-center">
        {step === 0 && (
          <MatrixHeatmapScene
            matrix={A}
            title="原矩阵 A"
            colorscale="Viridis"
          />
        )}
        {step >= 1 && (
          <>
            <MatrixHeatmapScene
              matrix={Q}
              title="正交矩阵 Q"
              colorscale="Greens"
            />
            {step >= 2 && (
              <>
                <div className="text-white text-3xl">×</div>
                <MatrixHeatmapScene
                  matrix={R}
                  title="上三角矩阵 R"
                  colorscale="Oranges"
                />
              </>
            )}
          </>
        )}
      </div>

      {animate && (
        <div className="text-white/70 text-sm">
          步骤 {step + 1} / {maxSteps + 1}
        </div>
      )}
    </div>
  )
}

// SVD 分解场景
function SVDDecompositionScene({ animate = false }: { animate?: boolean }) {
  const [step, setStep] = useState(0)
  const maxSteps = 3

  useEffect(() => {
    if (!animate) return
    const timer = setInterval(() => {
      setStep(s => (s < maxSteps ? s + 1 : 0))
    }, 2000)
    return () => clearInterval(timer)
  }, [animate])

  // 示例矩阵 A = [[3, 1], [1, 3]]
  const A = [[3, 1], [1, 3]]
  // U 是左奇异向量
  const U = [[0.707, -0.707], [0.707, 0.707]]
  // Σ 是奇异值对角矩阵
  const Sigma = [[4, 0], [0, 2]]
  // V^T 是右奇异向量的转置
  const VT = [[0.707, 0.707], [-0.707, 0.707]]

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
      <div className="text-white text-center">
        <h3 className="text-2xl font-bold mb-2">SVD 奇异值分解</h3>
        <p className="text-white/70">A = U × Σ × V^T</p>
      </div>

      <div className="flex gap-3 items-center flex-wrap justify-center">
        {step === 0 && (
          <MatrixHeatmapScene
            matrix={A}
            title="原矩阵 A"
            colorscale="Viridis"
          />
        )}
        {step >= 1 && (
          <>
            <MatrixHeatmapScene
              matrix={U}
              title="左奇异向量 U"
              colorscale="Blues"
            />
            {step >= 2 && (
              <>
                <div className="text-white text-2xl">×</div>
                <MatrixHeatmapScene
                  matrix={Sigma}
                  title="奇异值 Σ"
                  colorscale="Reds"
                />
                {step >= 3 && (
                  <>
                    <div className="text-white text-2xl">×</div>
                    <MatrixHeatmapScene
                      matrix={VT}
                      title="右奇异向量 V^T"
                      colorscale="Greens"
                    />
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      {animate && (
        <div className="text-white/70 text-sm">
          步骤 {step + 1} / {maxSteps + 1}
        </div>
      )}
    </div>
  )
}

// 分解过程动画场景
function DecompositionAnimationScene({
  decompositionType = 'LU'
}: {
  decompositionType?: 'LU' | 'QR' | 'SVD'
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame(f => (f + 1) % 100)
    }, 50)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // 清空画布
    ctx.fillStyle = 'rgba(30, 41, 59, 1)'
    ctx.fillRect(0, 0, width, height)

    // 绘制分解过程的可视化
    const progress = frame / 100
    const centerX = width / 2
    const centerY = height / 2

    // 绘制原矩阵
    ctx.fillStyle = 'rgba(59, 130, 246, 0.5)'
    ctx.fillRect(centerX - 100, centerY - 100, 200, 200)

    // 根据分解类型绘制不同的动画
    if (decompositionType === 'LU') {
      // L 矩阵（下三角）
      ctx.fillStyle = `rgba(34, 197, 94, ${progress})`
      ctx.beginPath()
      ctx.moveTo(centerX - 100, centerY - 100)
      ctx.lineTo(centerX - 100, centerY + 100)
      ctx.lineTo(centerX, centerY + 100)
      ctx.closePath()
      ctx.fill()

      // U 矩阵（上三角）
      ctx.fillStyle = `rgba(239, 68, 68, ${progress})`
      ctx.beginPath()
      ctx.moveTo(centerX - 100, centerY - 100)
      ctx.lineTo(centerX + 100, centerY - 100)
      ctx.lineTo(centerX + 100, centerY + 100)
      ctx.closePath()
      ctx.fill()
    } else if (decompositionType === 'QR') {
      // Q 矩阵（正交）
      const angle = progress * Math.PI / 4
      ctx.save()
      ctx.translate(centerX - 50, centerY)
      ctx.rotate(angle)
      ctx.fillStyle = `rgba(34, 197, 94, ${progress})`
      ctx.fillRect(-40, -40, 80, 80)
      ctx.restore()

      // R 矩阵（上三角）
      ctx.fillStyle = `rgba(251, 146, 60, ${progress})`
      ctx.beginPath()
      ctx.moveTo(centerX + 50, centerY - 40)
      ctx.lineTo(centerX + 130, centerY - 40)
      ctx.lineTo(centerX + 130, centerY + 40)
      ctx.closePath()
      ctx.fill()
    } else if (decompositionType === 'SVD') {
      // U, Σ, V^T 的可视化
      const offset = progress * 150

      // U
      ctx.fillStyle = `rgba(59, 130, 246, ${progress})`
      ctx.fillRect(centerX - 200 + offset, centerY - 50, 80, 100)

      // Σ
      ctx.fillStyle = `rgba(239, 68, 68, ${progress})`
      ctx.fillRect(centerX - 40, centerY - 50, 80, 100)

      // V^T
      ctx.fillStyle = `rgba(34, 197, 94, ${progress})`
      ctx.fillRect(centerX + 120 - offset, centerY - 50, 80, 100)
    }

    // 绘制标签
    ctx.fillStyle = 'white'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${decompositionType} 分解动画`, centerX, 30)
  }, [frame, decompositionType])

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="max-w-full border border-white/10 rounded"
      />
    </div>
  )
}

// 公式场景
function FormulaScene({ formulaType }: { formulaType: string }) {
  const formulas: Record<string, { formula: string; description: string }> = {
    'lu': {
      formula: 'A = LU',
      description: 'LU 分解：L 是下三角矩阵，U 是上三角矩阵',
    },
    'lu-detailed': {
      formula: 'A = \\begin{bmatrix} a_{11} & a_{12} \\\\ a_{21} & a_{22} \\end{bmatrix} = \\begin{bmatrix} 1 & 0 \\\\ l_{21} & 1 \\end{bmatrix} \\begin{bmatrix} u_{11} & u_{12} \\\\ 0 & u_{22} \\end{bmatrix}',
      description: 'LU 分解的矩阵形式',
    },
    'qr': {
      formula: 'A = QR',
      description: 'QR 分解：Q 是正交矩阵，R 是上三角矩阵',
    },
    'qr-orthogonal': {
      formula: 'Q^TQ = I',
      description: 'Q 是正交矩阵，满足 Q^T Q = I',
    },
    'svd': {
      formula: 'A = U\\Sigma V^T',
      description: 'SVD 奇异值分解：U 和 V 是正交矩阵，Σ 是对角矩阵',
    },
    'svd-detailed': {
      formula: 'A = \\sum_{i=1}^{r} \\sigma_i u_i v_i^T',
      description: 'SVD 的外积展开形式',
    },
    'eigenvalue': {
      formula: 'A = Q\\Lambda Q^{-1}',
      description: '特征值分解（对角化）',
    },
    'cholesky': {
      formula: 'A = LL^T',
      description: 'Cholesky 分解：适用于正定矩阵',
    },
  }

  const { formula, description } = formulas[formulaType] || formulas['lu']

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <div className="p-8 bg-white/10 rounded-2xl backdrop-blur max-w-4xl">
        <MathFormula formula={formula} className="text-xl md:text-2xl" />
      </div>
      <p className="text-white/70 text-lg text-center max-w-2xl">{description}</p>
    </div>
  )
}

// 应用场景
function ApplicationScene({ sceneId }: { sceneId: string }) {
  const apps: Record<string, { title: string; items: string[]; icon: string }> = {
    'app-intro': {
      title: '矩阵分解的应用',
      items: ['线性方程组求解', '最小二乘法', '图像压缩', '推荐系统'],
      icon: '🎯',
    },
    'app-lu': {
      title: 'LU 分解应用',
      items: ['求解线性方程组', '计算行列式', '矩阵求逆', '数值稳定性'],
      icon: '🔢',
    },
    'app-qr': {
      title: 'QR 分解应用',
      items: ['最小二乘法', '特征值计算', '正交化过程', '线性回归'],
      icon: '📐',
    },
    'app-svd': {
      title: 'SVD 分解应用',
      items: ['主成分分析 (PCA)', '图像压缩', '推荐系统', '降维技术'],
      icon: '🎨',
    },
    'app-ml': {
      title: '机器学习应用',
      items: ['特征提取', '数据降维', '协同过滤', '潜在语义分析'],
      icon: '🤖',
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
            <span className="w-2 h-2 bg-blue-400 rounded-full" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

// 比较场景
function ComparisonScene() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 px-8">
      <h2 className="text-3xl font-bold text-white">矩阵分解方法对比</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
        <div className="bg-blue-500/20 p-6 rounded-lg border border-blue-500/30">
          <h3 className="text-xl font-bold text-blue-300 mb-3">LU 分解</h3>
          <ul className="space-y-2 text-white/80 text-sm">
            <li>• 适用于方阵</li>
            <li>• 求解线性方程组</li>
            <li>• 计算复杂度 O(n³)</li>
            <li>• 需要主元选择</li>
          </ul>
        </div>
        <div className="bg-green-500/20 p-6 rounded-lg border border-green-500/30">
          <h3 className="text-xl font-bold text-green-300 mb-3">QR 分解</h3>
          <ul className="space-y-2 text-white/80 text-sm">
            <li>• 适用于任意矩阵</li>
            <li>• 最小二乘法</li>
            <li>• 数值稳定性好</li>
            <li>• 正交化过程</li>
          </ul>
        </div>
        <div className="bg-purple-500/20 p-6 rounded-lg border border-purple-500/30">
          <h3 className="text-xl font-bold text-purple-300 mb-3">SVD 分解</h3>
          <ul className="space-y-2 text-white/80 text-sm">
            <li>• 适用于任意矩阵</li>
            <li>• 降维和压缩</li>
            <li>• 揭示矩阵结构</li>
            <li>• 应用最广泛</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// 主渲染器
export default function MatrixDecompositionSceneRenderer({ scene }: SceneRendererProps) {
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
    const formulaType = lineState?.params?.formulaType as string || 'lu'
    return <FormulaScene formulaType={formulaType} />
  }

  // 根据 section 和 scene 决定显示什么
  switch (sectionId) {
    case 'intro':
      if (sceneConfig.id.includes('matrix')) {
        const matrix = [[4, 3, 2], [6, 3, 1], [2, 5, 8]]
        return <MatrixHeatmapScene matrix={matrix} title="示例矩阵" />
      }
      if (sceneConfig.id.includes('decomp')) {
        return <FormulaScene formulaType="lu" />
      }
      return <TitleScene sceneId="intro-welcome" />

    case 'lu':
      if (sceneConfig.id.includes('formula')) {
        return <FormulaScene formulaType="lu-detailed" />
      }
      if (sceneConfig.id.includes('animation')) {
        return <DecompositionAnimationScene decompositionType="LU" />
      }
      if (sceneConfig.id.includes('demo')) {
        return <LUDecompositionScene animate />
      }
      return <LUDecompositionScene />

    case 'qr':
      if (sceneConfig.id.includes('formula')) {
        return <FormulaScene formulaType="qr" />
      }
      if (sceneConfig.id.includes('orthogonal')) {
        return <FormulaScene formulaType="qr-orthogonal" />
      }
      if (sceneConfig.id.includes('animation')) {
        return <DecompositionAnimationScene decompositionType="QR" />
      }
      if (sceneConfig.id.includes('demo')) {
        return <QRDecompositionScene animate />
      }
      return <QRDecompositionScene />

    case 'svd':
      if (sceneConfig.id.includes('formula')) {
        return <FormulaScene formulaType="svd" />
      }
      if (sceneConfig.id.includes('detailed')) {
        return <FormulaScene formulaType="svd-detailed" />
      }
      if (sceneConfig.id.includes('animation')) {
        return <DecompositionAnimationScene decompositionType="SVD" />
      }
      if (sceneConfig.id.includes('demo')) {
        return <SVDDecompositionScene animate />
      }
      return <SVDDecompositionScene />

    case 'comparison':
      return <ComparisonScene />

    case 'applications':
      return <ApplicationScene sceneId={sceneConfig.id} />

    case 'summary':
      if (sceneConfig.id.includes('comparison')) {
        return <ComparisonScene />
      }
      if (sceneConfig.id.includes('svd')) {
        return <SVDDecompositionScene animate />
      }
      if (sceneConfig.id.includes('formula')) {
        return <FormulaScene formulaType="svd" />
      }
      return <ComparisonScene />

    default: {
      const defaultMatrix = [[4, 3, 2], [6, 3, 1], [2, 5, 8]]
      return <MatrixHeatmapScene matrix={defaultMatrix} title="矩阵可视化" />
    }
  }
}
