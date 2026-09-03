import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  Sprout, BookOpen, Book, GraduationCap, FlaskConical, ChevronRight, Search, X, RefreshCw,
} from 'lucide-react'
import ThemePicker from '../ThemePicker'
import { resolveIcon } from '../../utils/iconMap'
import { buildPinyinIndex } from '../../experiments/searchExperiments'
import { CHECK_UPDATE_EVENT } from '../Update/UpdateManager'

interface NavCategory {
  name: string
  icon: LucideIcon
  items: { path: string; label: string; icon: string }[]
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navCategories: NavCategory[] = [
  {
    name: '入门级',
    icon: Sprout,
    items: [
      { path: '/basic-arithmetic', label: '加减乘除', icon: '➕' },
      { path: '/fractions', label: '分数可视化', icon: '🥧' },
      { path: '/geometry-shapes', label: '基础几何', icon: '📐' },
      { path: '/set-theory', label: '集合论', icon: '⭕' },
      { path: '/golden-ratio', label: '黄金分割', icon: '🐚' },
      { path: '/number-theory', label: '数论探索', icon: '🔢' },
      { path: '/pascal-triangle', label: '帕斯卡三角', icon: '🔺' },
      { path: '/even-odd', label: '奇偶数与整除', icon: '🔢' },
      { path: '/roman-numerals', label: '罗马数字', icon: '🏛️' },
      { path: '/symmetry', label: '对称之美', icon: '🦋' },
      { path: '/tangram', label: '七巧板', icon: '🧩' },
      { path: '/clock-angles', label: '时钟与角度', icon: '🕐' },
      { path: '/pigeonhole', label: '鸽巢原理', icon: '🕳️' },
      { path: '/dice-probability', label: '骰子与古典概率', icon: '🎲' },
      { path: '/fibonacci-nature', label: '斐波那契与自然', icon: '🌻' },
      { path: '/prime-factorization', label: '质因数分解', icon: '🧬' },
      { path: '/number-bases', label: '进制转换', icon: '🔢' },
      { path: '/digital-root', label: '数字根与弃九验算', icon: '9️⃣' },
      { path: '/monty-hall', label: '蒙提霍尔问题', icon: '🚪' },
      { path: '/caesar-cipher', label: '凯撒密码', icon: '🔐' },
      { path: '/triangular-numbers', label: '三角形数与图形数', icon: '🔺' },
      { path: '/lucas-numbers', label: '卢卡斯数', icon: '🔗' },
      { path: '/happy-numbers', label: '快乐数', icon: '😊' },
    ],
  },
  {
    name: '基础级',
    icon: BookOpen,
    items: [
      { path: '/linear-function', label: '一次函数', icon: '📏' },
      { path: '/quadratic-function', label: '二次函数', icon: '📐' },
      { path: '/pythagorean', label: '勾股定理', icon: '📏' },
      { path: '/trigonometry', label: '三角函数', icon: '📐' },
      { path: '/polar', label: '极坐标图形', icon: '🌸' },
      { path: '/probability', label: '概率分布', icon: '🎲' },
      { path: '/bezier', label: '贝塞尔曲线', icon: '✏️' },
      { path: '/cycloid', label: '旋轮线家族', icon: '🎡' },
      { path: '/monte-carlo', label: '蒙特卡洛', icon: '🎯' },
      { path: '/inequalities', label: '不等式与数轴', icon: '⚖️' },
      { path: '/linear-system', label: '二元一次方程组', icon: '📐' },
      { path: '/similar-triangles', label: '相似三角形', icon: '🔺' },
      { path: '/circle-geometry', label: '圆的几何', icon: '⭕' },
      { path: '/stats-basics', label: '统计初步', icon: '📊' },
      { path: '/absolute-value', label: '绝对值函数', icon: '📈' },
      { path: '/sequences', label: '等差等比数列', icon: '🔗' },
      { path: '/tower-of-hanoi', label: '汉诺塔', icon: '🗼' },
      { path: '/magic-square', label: '幻方', icon: '🔯' },
      { path: '/sieve-eratosthenes', label: '埃氏筛法', icon: '🧮' },
      { path: '/collatz', label: '考拉兹猜想', icon: '🎢' },
      { path: '/perfect-numbers', label: '完全数与亲和数', icon: '💯' },
      { path: '/tessellation', label: '密铺镶嵌', icon: '🔷' },
      { path: '/pythagoras-tree', label: '毕达哥拉斯树', icon: '🌳' },
      { path: '/euclidean-algorithm', label: '欧几里得算法', icon: '🔢' },
      { path: '/function-transform', label: '函数图象变换', icon: '↔️' },
      { path: '/piecewise-function', label: '分段函数', icon: '📊' },
      { path: '/inverse-function', label: '反函数', icon: '🔄' },
      { path: '/binomial-theorem', label: '二项式定理', icon: '🔺' },
      { path: '/birthday-paradox', label: '生日悖论', icon: '🎂' },
      { path: '/sorting-algorithms', label: '排序算法可视化', icon: '📊' },
      { path: '/spirograph', label: '万花尺', icon: '🎨' },
      { path: '/sierpinski-triangle', label: '谢尔宾斯基三角', icon: '🔺' },
      { path: '/koch-snowflake', label: '科赫雪花', icon: '❄️' },
      { path: '/look-and-say', label: '外观数列', icon: '👀' },
      { path: '/kaprekar', label: '卡普雷卡常数', icon: '🔢' },
      { path: '/bisection-method', label: '二分法求根', icon: '✂️' },
      { path: '/projectile-motion', label: '抛体运动', icon: '🏀' },
      { path: '/galton-board', label: '高尔顿板', icon: '🔻' },
    ],
  },
  {
    name: '中级',
    icon: Book,
    items: [
      { path: '/conic-sections', label: '圆锥曲线', icon: '🔵' },
      { path: '/calculus', label: '微积分', icon: '∫' },
      { path: '/taylor', label: '泰勒级数', icon: 'Σ' },
      { path: '/complex', label: '复数与复平面', icon: 'ℂ' },
      { path: '/parametric', label: '参数方程', icon: '〰️' },
      { path: '/lissajous', label: '利萨茹与玫瑰', icon: '🌹' },
      { path: '/ulam-spiral', label: '素数螺旋', icon: '🌀' },
      { path: '/vector-field', label: '向量场', icon: '➡️' },
      { path: '/numerical-integration', label: '数值积分', icon: '∫' },
      { path: '/interpolation', label: '插值方法', icon: '📈' },
      { path: '/exponential-log', label: '指数与对数', icon: '📉' },
      { path: '/matrix-transform', label: '矩阵变换', icon: '🔲' },
      { path: '/dot-cross-product', label: '点积与叉积', icon: '✖️' },
      { path: '/parabola-optics', label: '抛物线与光学', icon: '🔦' },
      { path: '/sine-superposition', label: '波的叠加', icon: '〰️' },
      { path: '/combinatorial-proof', label: '组合恒等式', icon: '🎯' },
      { path: '/modular-arithmetic', label: '模运算与同余', icon: '🕰️' },
      { path: '/continued-fraction', label: '连分数', icon: '➗' },
      { path: '/epidemic-sir', label: 'SIR传染病模型', icon: '🦠' },
      { path: '/game-of-life', label: '康威生命游戏', icon: '🦠' },
      { path: '/permutation-combination', label: '排列组合', icon: '🎯' },
      { path: '/triangle-centers', label: '三角形四心', icon: '📐' },
      { path: '/circle-packing', label: '圆填充', icon: '🔵' },
      { path: '/reuleaux', label: '等宽曲线', icon: '🔺' },
      { path: '/pick-theorem', label: '皮克定理', icon: '📍' },
      { path: '/convex-hull', label: '凸包算法', icon: '📎' },
      { path: '/improper-integral', label: '反常积分', icon: '♾️' },
      { path: '/solid-of-revolution', label: '旋转体体积', icon: '🏺' },
      { path: '/riemann-sum', label: '黎曼和', icon: '📊' },
      { path: '/mean-value-theorem', label: '中值定理', icon: '📐' },
      { path: '/integer-partition', label: '整数分拆', icon: '🧩' },
      { path: '/logarithm-spiral', label: '对数螺线', icon: '🐚' },
      { path: '/rational-asymptotes', label: '有理函数与渐近线', icon: '📉' },
      { path: '/partial-fractions', label: '部分分式分解', icon: '➗' },
      { path: '/composite-function', label: '复合函数', icon: '🔗' },
      { path: '/vieta-formulas', label: '韦达定理', icon: '🔗' },
      { path: '/polynomial-roots', label: '多项式求根', icon: '📈' },
      { path: '/directional-derivative', label: '方向导数', icon: '🧭' },
      { path: '/partial-derivative', label: '偏导数与梯度', icon: '📈' },
      { path: '/confidence-interval', label: '置信区间', icon: '📏' },
      { path: '/law-large-numbers', label: '大数定律', icon: '🎲' },
      { path: '/orthogonal-projection', label: '正交投影', icon: '📐' },
      { path: '/determinant-geometry', label: '行列式的几何意义', icon: '🔲' },
      { path: '/kmeans', label: 'K-means聚类', icon: '🎯' },
      { path: '/perceptron', label: '感知机', icon: '🧠' },
      { path: '/pendulum-phase', label: '单摆相空间', icon: '⏱️' },
      { path: '/minimum-spanning-tree', label: '最小生成树', icon: '🌳' },
      { path: '/huffman-coding', label: '哈夫曼编码', icon: '🗜️' },
      { path: '/divide-conquer', label: '分治算法', icon: '✂️' },
      { path: '/bfs-dfs', label: '广度与深度优先搜索', icon: '🔍' },
      { path: '/euler-hamilton-path', label: '欧拉与哈密顿回路', icon: '🌉' },
      { path: '/graph-coloring', label: '图着色', icon: '🎨' },
      { path: '/dijkstra', label: 'Dijkstra最短路', icon: '🗺️' },
      { path: '/a-star', label: 'A星寻路', icon: '⭐' },
      { path: '/line-clipping', label: '线段裁剪', icon: '✂️' },
      { path: '/point-in-polygon', label: '点在多边形内', icon: '📍' },
      { path: '/marching-squares', label: '行进方块', icon: '🗺️' },
      { path: '/quadtree', label: '四叉树', icon: '🔲' },
      { path: '/cantor-set', label: '康托三分集', icon: '┅' },
      { path: '/levy-c-curve', label: '列维C形曲线', icon: '〽️' },
      { path: '/hilbert-curve', label: '希尔伯特曲线', icon: '🌀' },
      { path: '/dragon-curve', label: '龙形曲线', icon: '🐉' },
      { path: '/sierpinski-carpet', label: '谢尔宾斯基地毯', icon: '🟫' },
      { path: '/gray-code', label: '格雷码', icon: '🔃' },
      { path: '/josephus-problem', label: '约瑟夫问题', icon: '⭕' },
      { path: '/one-time-pad', label: '一次一密', icon: '🎲' },
      { path: '/vigenere-cipher', label: '维吉尼亚密码', icon: '🔑' },
      { path: '/pythagorean-triples', label: '勾股数', icon: '📐' },
      { path: '/fast-exponentiation', label: '快速幂', icon: '⚡' },
      { path: '/fermat-little', label: '费马小定理', icon: '🎩' },
      { path: '/farey-sequence', label: '法里数列', icon: '➗' },
      { path: '/euler-totient', label: '欧拉函数', icon: '🔢' },
      { path: '/catmull-rom', label: 'Catmull-Rom样条', icon: '〰️' },
      { path: '/nyquist-sampling', label: '奈奎斯特采样', icon: '📊' },
      { path: '/convolution', label: '卷积', icon: '🔁' },
      { path: '/aliasing', label: '混叠现象', icon: '🌀' },
      { path: '/secant-method', label: '割线法', icon: '📏' },
      { path: '/fixed-point-iteration', label: '不动点迭代', icon: '🎯' },
      { path: '/cramers-rule', label: '克拉默法则', icon: '📊' },
      { path: '/markov-stationary', label: '马氏链稳态', icon: '⚖️' },
      { path: '/power-iteration', label: '幂迭代', icon: '🔄' },
      { path: '/damped-oscillation', label: '阻尼振荡', icon: '🌊' },
      { path: '/tent-map', label: '帐篷映射', icon: '⛺' },
      { path: '/softmax', label: 'Softmax函数', icon: '🎚️' },
      { path: '/knn', label: 'K近邻分类', icon: '🎯' },
      { path: '/coupon-collector', label: '赠券收集问题', icon: '🎟️' },
      { path: '/gamblers-ruin', label: '赌徒破产', icon: '🎰' },
      { path: '/buffon-needle', label: '蒲丰投针', icon: '📌' },
      { path: '/benfords-law', label: '本福特定律', icon: '1️⃣' },
      { path: '/latin-square', label: '拉丁方', icon: '🔲' },
      { path: '/inclusion-exclusion', label: '容斥原理', icon: '🔵' },
      { path: '/derangements', label: '错排问题', icon: '✉️' },
      { path: '/hyperbolic-paraboloid', label: '双曲抛物面', icon: '🏇' },
      { path: '/quadric-surfaces', label: '二次曲面分类', icon: '🥚' },
      { path: '/supertoroid', label: '超环面族', icon: '🍩' },
      { path: '/superquadric', label: '超二次曲面', icon: '🎲' },
      { path: '/surface-revolution', label: '旋转曲面', icon: '🏺' },
      { path: '/monkey-saddle', label: '猴鞍面', icon: '🐒' },
      { path: '/seashell-surface', label: '海螺曲面', icon: '🐌' },
      { path: '/viviani-curve', label: '维维亚尼曲线', icon: '🎽' },
      { path: '/conical-spiral', label: '圆锥螺线', icon: '🐚' },
      { path: '/spherical-spiral', label: '球面螺线', icon: '🧭' },
      { path: '/platonic-solids', label: '柏拉图立体', icon: '🎲' },
      { path: '/prism-antiprism', label: '棱柱与反棱柱', icon: '🔷' },
      { path: '/geodesic-shortest-path', label: '球面测地线', icon: '✈️' },
      { path: '/map-projections', label: '地图投影失真', icon: '🗺️' },
      { path: '/tetrahedron-volume', label: '四面体体积', icon: '📐' },
      { path: '/solid-angle', label: '立体角球面度', icon: '🔆' },
      { path: '/dual-polyhedra', label: '对偶多面体', icon: '🔷' },
      { path: '/descartes-defect', label: 'Descartes 角亏', icon: '📐' },
      { path: '/truncation', label: '截角变换', icon: '⚽' },
      { path: '/polyhedron-slice', label: '多面体截面', icon: '🔪' },
      { path: '/cavalieri', label: 'Cavalieri 原理', icon: '🍰' },
      { path: '/prismatoid', label: '拟柱体公式', icon: '📐' },
      { path: '/dandelin', label: 'Dandelin 双球', icon: '🔮' },
      { path: '/focus-directrix', label: '焦点准线统一定义', icon: '🎯' },
      { path: '/conic-reflection', label: '圆锥曲线反射', icon: '🔦' },
      { path: '/gershgorin', label: 'Gershgorin 圆盘', icon: '⭕' },
    ],
  },
  {
    name: '高级',
    icon: GraduationCap,
    items: [
      { path: '/linear-algebra', label: '线性代数', icon: '▦' },
      { path: '/matrix-decomposition', label: '矩阵分解', icon: '🔢' },
      { path: '/ode', label: '微分方程', icon: '📈' },
      { path: '/fourier', label: '傅里叶变换', icon: '📊' },
      { path: '/fourier-series', label: '傅里叶级数', icon: '🎵' },
      { path: '/fourier-drawing', label: '傅里叶绘图', icon: '✏️' },
      { path: '/pca', label: '主成分分析', icon: '📊' },
      { path: '/regression', label: '回归分析', icon: '📉' },
      { path: '/clt', label: '中心极限定理', icon: '🔔' },
      { path: '/bayes', label: '贝叶斯定理', icon: '🧮' },
      { path: '/markov-chain', label: '马尔可夫链', icon: '🔗' },
      { path: '/newton-method', label: '牛顿法求根', icon: '🎯' },
      { path: '/gradient-descent', label: '梯度下降', icon: '⬇️' },
      { path: '/optimization', label: '优化算法', icon: '🎯' },
      { path: '/signal-processing', label: '信号处理', icon: '📡' },
      { path: '/eigen-visualization', label: '特征值与特征向量', icon: '🎚️' },
      { path: '/svd', label: '奇异值分解', icon: '🖼️' },
      { path: '/gram-schmidt', label: '施密特正交化', icon: '📏' },
      { path: '/lagrange-multiplier', label: '拉格朗日乘数', icon: '⛰️' },
      { path: '/green-theorem', label: '格林公式', icon: '🌀' },
      { path: '/residue-theorem', label: '留数定理', icon: '🔵' },
      { path: '/power-series', label: '幂级数收敛', icon: '♾️' },
      { path: '/gaussian-process', label: '高斯过程', icon: '📶' },
      { path: '/kalman-filter', label: '卡尔曼滤波', icon: '🛰️' },
      { path: '/simulated-annealing', label: '模拟退火', icon: '🔥' },
      { path: '/cryptography', label: '密码学基础', icon: '🔐' },
      { path: '/euler-identity', label: '欧拉恒等式', icon: '🔷' },
      { path: '/laplace', label: '拉普拉斯变换', icon: '🔄' },
      { path: '/mobius', label: '莫比乌斯环', icon: '♾️' },
      { path: '/numerical-analysis', label: '数值分析', icon: '🔢' },
      { path: '/reaction-diffusion', label: '反应扩散', icon: '🐆' },
      { path: '/steiner-chain', label: '斯坦纳链', icon: '⛓️' },
      { path: '/delaunay-triangulation', label: 'Delaunay三角剖分', icon: '🔺' },
      { path: '/spherical-geometry', label: '球面几何', icon: '🌍' },
      { path: '/inversive-geometry', label: '反演几何', icon: '🔄' },
      { path: '/euler-line', label: '欧拉线', icon: '📏' },
      { path: '/nine-point-circle', label: '九点圆', icon: '⭕' },
      { path: '/series-convergence', label: '级数收敛判别', icon: '➕' },
      { path: '/arc-length-curvature', label: '弧长与曲率', icon: '〰️' },
      { path: '/epsilon-delta', label: 'ε-δ极限定义', icon: '🎯' },
      { path: '/prime-counting', label: '素数计数与素数定理', icon: '📊' },
      { path: '/pell-equation', label: '佩尔方程', icon: '♾️' },
      { path: '/gaussian-integers', label: '高斯整数', icon: '🔷' },
      { path: '/quadratic-residue', label: '二次剩余', icon: '🔲' },
      { path: '/chinese-remainder', label: '中国剩余定理', icon: '🏮' },
      { path: '/laplacian', label: '拉普拉斯算子', icon: '🌡️' },
      { path: '/vector-calculus-field', label: '保守场与势函数', icon: '⛰️' },
      { path: '/jacobian', label: '雅可比矩阵', icon: '🔲' },
      { path: '/divergence-curl', label: '散度与旋度', icon: '🌀' },
      { path: '/line-integral', label: '曲线积分', icon: '➰' },
      { path: '/multiple-integral', label: '重积分', icon: '🧊' },
      { path: '/max-likelihood', label: '最大似然估计', icon: '🎯' },
      { path: '/hypothesis-testing', label: '假设检验', icon: '⚖️' },
      { path: '/brownian-motion', label: '布朗运动', icon: '🌫️' },
      { path: '/poisson-process', label: '泊松过程', icon: '⏱️' },
      { path: '/quadratic-form', label: '二次型', icon: '🥣' },
      { path: '/least-squares', label: '最小二乘法', icon: '📉' },
      { path: '/kernel-image', label: '核与像', icon: '🎯' },
      { path: '/neural-network-forward', label: '神经网络前向传播', icon: '🕸️' },
      { path: '/euler-characteristic', label: '欧拉示性数', icon: '🎭' },
      { path: '/vibrating-string', label: '弦振动', icon: '🎸' },
      { path: '/kepler-orbit', label: '开普勒轨道', icon: '🪐' },
      { path: '/lotka-volterra', label: '捕食者猎物模型', icon: '🦊' },
      { path: '/limit-cycle', label: '极限环', icon: '🔁' },
      { path: '/phase-portrait', label: '相图分析', icon: '🌀' },
      { path: '/logistic-bifurcation', label: 'Logistic分岔图', icon: '🍴' },
      { path: '/generating-functions', label: '生成函数', icon: '📜' },
      { path: '/catalan-numbers', label: '卡特兰数', icon: '🌲' },
      { path: '/dynamic-programming', label: '动态规划', icon: '🧮' },
      { path: '/network-flow', label: '最大流最小割', icon: '🚰' },
      { path: '/stereographic-projection', label: '球极投影', icon: '🌐' },
      { path: '/ear-clipping', label: '耳切三角剖分', icon: '👂' },
      { path: '/rotating-calipers', label: '旋转卡壳', icon: '📐' },
      { path: '/kd-tree', label: 'KD树', icon: '🌳' },
      { path: '/box-counting-dimension', label: '盒维数', icon: '📦' },
      { path: '/burning-ship', label: '燃烧船分形', icon: '🚢' },
      { path: '/newton-fractal', label: '牛顿分形', icon: '🌈' },
      { path: '/gosper-curve', label: '戈斯珀曲线', icon: '🐍' },
      { path: '/peano-curve', label: '皮亚诺曲线', icon: '➰' },
      { path: '/barnsley-fern', label: '巴恩斯利蕨', icon: '🌿' },
      { path: '/hill-cipher', label: '希尔密码', icon: '🔡' },
      { path: '/diffie-hellman', label: '迪菲-赫尔曼密钥交换', icon: '🤝' },
      { path: '/rsa-cipher', label: 'RSA加密', icon: '🔒' },
      { path: '/frobenius-coin', label: 'Frobenius硬币问题', icon: '🪙' },
      { path: '/sum-of-squares', label: '平方和定理', icon: '🔲' },
      { path: '/wilson-theorem', label: '威尔逊定理', icon: '❗' },
      { path: '/primitive-root', label: '原根', icon: '🔄' },
      { path: '/stern-brocot', label: 'Stern-Brocot树', icon: '🌳' },
      { path: '/mobius-function', label: '莫比乌斯函数', icon: '➰' },
      { path: '/discrete-cosine-transform', label: '离散余弦变换', icon: '🖼️' },
      { path: '/b-spline', label: 'B样条曲线', icon: '✏️' },
      { path: '/windowing', label: '加窗函数', icon: '🪟' },
      { path: '/autocorrelation', label: '自相关', icon: '📶' },
      { path: '/gamma-function', label: '伽马函数', icon: 'Γ' },
      { path: '/legendre-polynomials', label: '勒让德多项式', icon: '📉' },
      { path: '/chebyshev-polynomials', label: '切比雪夫多项式', icon: '📈' },
      { path: '/gibbs-phenomenon', label: '吉布斯现象', icon: '〰️' },
      { path: '/rotation3d', label: '三维旋转矩阵', icon: '🎲' },
      { path: '/pagerank', label: 'PageRank', icon: '🔗' },
      { path: '/cholesky', label: 'Cholesky分解', icon: '🔻' },
      { path: '/qr-decomposition', label: 'QR分解', icon: '📐' },
      { path: '/lu-decomposition', label: 'LU分解', icon: '🔢' },
      { path: '/catenary', label: '悬链线', icon: '⛓️' },
      { path: '/rossler-attractor', label: 'Rössler吸引子', icon: '🌪️' },
      { path: '/henon-map', label: '埃农映射', icon: '🌀' },
      { path: '/particle-swarm', label: '粒子群优化', icon: '🐦' },
      { path: '/genetic-algorithm', label: '遗传算法', icon: '🧬' },
      { path: '/logistic-regression', label: '逻辑回归', icon: '📈' },
      { path: '/naive-bayes', label: '朴素贝叶斯', icon: '📧' },
      { path: '/decision-tree', label: '决策树', icon: '🌳' },
      { path: '/bell-numbers', label: '贝尔数', icon: '🔔' },
      { path: '/stirling-numbers', label: '斯特林数', icon: '🔢' },
      { path: '/helicoid-catenoid', label: '螺旋面与悬链面', icon: '🌀' },
      { path: '/pseudosphere', label: '伪球面', icon: '📡' },
      { path: '/dini-surface', label: '迪尼曲面', icon: '🐚' },
      { path: '/cross-cap', label: '交叉帽', icon: '🧢' },
      { path: '/ruled-surfaces', label: '直纹曲面', icon: '📏' },
      { path: '/tube-surface', label: '管状曲面', icon: '🪢' },
      { path: '/gaussian-curvature', label: '高斯曲率', icon: '🎨' },
      { path: '/trefoil-surface', label: '三叶结曲面', icon: '☘️' },
      { path: '/developable-surface', label: '可展曲面', icon: '📜' },
      { path: '/torus-knot-surface', label: '环面纽结管', icon: '🎗️' },
      { path: '/chua-attractor', label: '蔡氏吸引子', icon: '⚡' },
      { path: '/halvorsen-attractor', label: '哈尔沃森吸引子', icon: '🌪️' },
      { path: '/thomas-attractor', label: '托马斯吸引子', icon: '🔄' },
      { path: '/aizawa-attractor', label: '相泽吸引子', icon: '🧿' },
      { path: '/space-curve-frenet', label: '空间曲线标架', icon: '🎢' },
      { path: '/archimedean-solids', label: '阿基米德立体', icon: '⚽' },
      { path: '/stellated-polyhedra', label: '星形多面体', icon: '✨' },
      { path: '/space-filling-solids', label: '空间填充多面体', icon: '🧊' },
      { path: '/spherical-triangle', label: '球面三角形', icon: '🌐' },
      { path: '/spherical-tiling', label: '球面镶嵌', icon: '🎨' },
      { path: '/spherical-lune', label: '球面二角形', icon: '🌙' },
      { path: '/hyperbolic-triangle', label: '双曲三角形角亏', icon: '🔻' },
      { path: '/minkowski-steiner', label: '闵可夫斯基和', icon: '🫧' },
      { path: '/kissing-number', label: '接吻数问题', icon: '⚪' },
      { path: '/dehn-invariant', label: 'Dehn 不变量', icon: '✂️' },
      { path: '/confocal-quadrics', label: '共焦二次曲面', icon: '🔮' },
      { path: '/quaternion-rotation', label: '四元数与旋转', icon: '🎲' },
      { path: '/screw-motion', label: '螺旋运动', icon: '🔩' },
      { path: '/condition-number', label: '条件数与稳定性', icon: '📐' },
      { path: '/jordan-form', label: 'Jordan 标准型', icon: '🧩' },
      { path: '/pseudoinverse', label: '伪逆', icon: '➕' },
      { path: '/perron-frobenius', label: 'Perron-Frobenius', icon: '🔺' },
      { path: '/concentration', label: '集中不等式', icon: '📉' },
      { path: '/entropy-coding', label: '熵与信源编码', icon: '🗜️' },
      { path: '/kl-divergence', label: 'KL 散度', icon: '📊' },
      { path: '/mutual-information', label: '互信息与信道', icon: '📡' },
      { path: '/banach-fixed-point', label: 'Banach 不动点', icon: '🎯' },
    ],
  },
  {
    name: '专业级',
    icon: FlaskConical,
    items: [
      { path: '/chaos', label: '混沌理论', icon: '🦋' },
      { path: '/fractal', label: '分形几何', icon: '🌀' },
      { path: '/l-system', label: 'L-系统植物', icon: '🌿' },
      { path: '/game-theory', label: '博弈论', icon: '🎮' },
      { path: '/wave-equation', label: '波动方程', icon: '🌊' },
      { path: '/heat-equation', label: '热传导方程', icon: '🔥' },
      { path: '/random-walk', label: '随机游走', icon: '🚶' },
      { path: '/graph-theory', label: '图论基础', icon: '🕸️' },
      { path: '/voronoi', label: '沃罗诺伊图', icon: '🔷' },
      { path: '/mandelbrot-julia', label: '曼德博与朱利亚集', icon: '🌈' },
      { path: '/double-pendulum', label: '双摆混沌', icon: '🎢' },
      { path: '/lorenz-attractor', label: '洛伦兹吸引子', icon: '🦋' },
      { path: '/nbody-simulation', label: 'N体引力仿真', icon: '🪐' },
      { path: '/percolation', label: '渗流模型', icon: '💧' },
      { path: '/cellular-automata', label: '元胞自动机', icon: '⬛' },
      { path: '/knot-theory', label: '纽结理论', icon: '🪢' },
      { path: '/wavelet', label: '小波变换', icon: '🌊' },
      { path: '/differential-geometry', label: '微分几何', icon: '🌐' },
      { path: '/pde', label: '偏微分方程', icon: '∂' },
      { path: '/three-body', label: '三体引力轨道', icon: '🪐' },
      { path: '/apollonian-gasket', label: '阿波罗尼垫片', icon: '⚪' },
      { path: '/poincare-disk', label: '庞加莱圆盘', icon: '🌐' },
      { path: '/stokes-theorem', label: '斯托克斯定理', icon: '🔄' },
      { path: '/hidden-markov', label: '隐马尔可夫模型', icon: '🔮' },
      { path: '/gaussian-mixture', label: '高斯混合模型', icon: '⛰️' },
      { path: '/spectral-theorem', label: '谱分解', icon: '🌈' },
      { path: '/torus-klein', label: '环面与克莱因瓶', icon: '🍩' },
      { path: '/poincare-section', label: '庞加莱截面', icon: '✂️' },
      { path: '/hyperbolic-tiling', label: '双曲镶嵌', icon: '🔷' },
      { path: '/hopf-fibration', label: '霍普夫纤维化', icon: '🔗' },
      { path: '/elliptic-curve', label: '椭圆曲线', icon: '➰' },
      { path: '/fft', label: '快速傅里叶变换', icon: '⚡' },
      { path: '/bessel-functions', label: '贝塞尔函数', icon: '🥁' },
      { path: '/brachistochrone', label: '最速降线', icon: '🎿' },
      { path: '/backpropagation', label: '反向传播', icon: '🔙' },
      { path: '/enneper-surface', label: '恩内佩尔曲面', icon: '🍀' },
      { path: '/roman-surface', label: '罗马曲面', icon: '🏛️' },
      { path: '/boy-surface', label: '博伊曲面', icon: '🎭' },
      { path: '/whitney-umbrella', label: '惠特尼伞', icon: '☂️' },
      { path: '/spherical-harmonics', label: '球谐函数', icon: '⚛️' },
      { path: '/klein-bottle-figure8', label: '8字形克莱因瓶', icon: '🎱' },
      { path: '/mean-curvature-flow', label: '平均曲率流', icon: '💧' },
      { path: '/costa-surface', label: '科斯塔曲面', icon: '🕸️' },
      { path: '/sprott-attractor', label: '斯普罗特吸引子', icon: '🎯' },
      { path: '/lorenz-atmosphere', label: '洛伦兹84模型', icon: '🌍' },
      { path: '/so3-topology', label: 'SO(3) 的拓扑', icon: '🔄' },
      { path: '/lie-algebra-so3', label: '李代数 so(3)', icon: '♾️' },
    ],
  },
]

// ============ 侧边栏搜索：扁平化全部实验 + 拼音索引（模块级只构建一次） ============
interface SidebarSearchItem {
  path: string
  label: string
  category: string
  Icon: LucideIcon
  labelLower: string
  pathLower: string
  full: string // 全拼，如 "hanshu"
  abbr: string // 首字母，如 "hs"
}

const searchIndex: SidebarSearchItem[] = navCategories.flatMap((cat) =>
  cat.items.map((item) => {
    const { full, abbr } = buildPinyinIndex(item.label)
    return {
      path: item.path,
      label: item.label,
      category: cat.name,
      Icon: resolveIcon(item.path),
      labelLower: item.label.toLowerCase(),
      pathLower: item.path.toLowerCase(),
      full,
      abbr,
    }
  }),
)

const MAX_SUGGESTIONS = 8

/** 单个关键词对一条记录的命中质量：数值越小越靠前；-1 表示未命中 */
function matchRank(it: SidebarSearchItem, w: string): number {
  if (it.labelLower === w) return 0
  if (it.labelLower.startsWith(w)) return 1
  const at = it.labelLower.indexOf(w)
  if (at >= 0) return 2 + at * 0.01 // 标签包含关键词，出现位置越早越好
  if (it.abbr.startsWith(w)) return 4 // 拼音首字母开头，如 "hs" → 函数
  if (it.abbr.includes(w) || it.full.startsWith(w)) return 5
  if (it.full.includes(w)) return 6 // 全拼包含，如 "hanshu" → 函数
  if (it.pathLower.includes(w)) return 7 // 英文路径，如 "trig" → trigonometry
  return -1
}

/** 多关键词按空格切分，每个词都需命中(AND)；返回按相关度排序的建议列表 */
function searchSidebar(query: string): SidebarSearchItem[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return []
  const hits: { it: SidebarSearchItem; rank: number }[] = []
  for (const it of searchIndex) {
    let worst = 0
    let ok = true
    for (const w of words) {
      const r = matchRank(it, w)
      if (r < 0) {
        ok = false
        break
      }
      if (r > worst) worst = r
    }
    if (ok) hits.push({ it, rank: worst })
  }
  hits.sort((a, b) => a.rank - b.rank || a.it.label.localeCompare(b.it.label, 'zh'))
  return hits.slice(0, MAX_SUGGESTIONS).map((h) => h.it)
}

/** 侧边栏搜索框：输入即出下拉建议，支持模糊/拼音/英文路径匹配与键盘导航 */
function SidebarSearch({ onNavigate }: { onNavigate: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  // ref 同时包住输入框和下拉列表，点击输入框不会被误判为“外部点击”
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = useMemo(() => searchSidebar(query), [query])
  const hasQuery = query.trim().length > 0

  // 点击组件外部时关闭下拉
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // 键盘上下选择时，让高亮项滚动到可见区域
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const go = (item: SidebarSearchItem) => {
    navigate(item.path)
    setQuery('')
    setOpen(false)
    setActiveIndex(-1)
    onNavigate()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return // 中文输入法组词期间不响应
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      if (open && suggestions.length > 0) {
        e.preventDefault()
        go(suggestions[activeIndex >= 0 ? activeIndex : 0])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
      inputRef.current?.blur()
    }
  }

  // 高亮标签里命中的关键词片段
  const renderLabel = (label: string) => {
    const first = query.trim().toLowerCase().split(/\s+/)[0]
    if (!first) return label
    const idx = label.toLowerCase().indexOf(first)
    if (idx < 0) return label
    return (
      <>
        {label.slice(0, idx)}
        <mark className="ss-mark">{label.slice(idx, idx + first.length)}</mark>
        {label.slice(idx + first.length)}
      </>
    )
  }

  return (
    <div className="px-3 pt-3 pb-1">
      <div ref={containerRef} className="relative">
        <Search className="ss-search-icon absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="搜索实验，如：函数、三角…"
          className="sidebar-search-input w-full pl-9 pr-8 py-2 rounded-xl text-sm outline-none"
          role="combobox"
          aria-expanded={open && hasQuery}
          aria-controls="sidebar-search-listbox"
          aria-autocomplete="list"
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setActiveIndex(-1)
          }}
          onFocus={() => {
            if (hasQuery) setOpen(true)
          }}
          onKeyDown={handleKeyDown}
        />
        {hasQuery && (
          <button
            type="button"
            aria-label="清空搜索"
            className="ss-clear-btn absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md"
            onClick={() => {
              setQuery('')
              setActiveIndex(-1)
              inputRef.current?.focus()
            }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* 下拉建议框 */}
        {open && hasQuery && (
          <div
            ref={listRef}
            id="sidebar-search-listbox"
            role="listbox"
            className="sidebar-search-dropdown absolute left-0 right-0 top-full mt-1.5 rounded-xl z-50 max-h-80 overflow-y-auto"
          >
            {suggestions.length > 0 ? (
              suggestions.map((it, i) => (
                <button
                  key={it.path}
                  type="button"
                  role="option"
                  aria-selected={i === activeIndex}
                  className={`sidebar-search-item w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm ${
                    i === activeIndex ? 'active' : ''
                  }`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => go(it)}
                >
                  <it.Icon className="ss-item-icon w-4 h-4 flex-shrink-0" />
                  <span className="truncate flex-1">{renderLabel(it.label)}</span>
                  <span className="ss-cat text-[11px] flex-shrink-0 px-1.5 py-0.5 rounded-md">
                    {it.category}
                  </span>
                </button>
              ))
            ) : (
              <div className="sidebar-search-empty px-3 py-4 text-center text-xs">
                未找到「{query.trim()}」相关实验
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['入门级', '基础级'])

  const toggleCategory = (name: string) => {
    setExpandedCategories((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  const handleNavClick = () => {
    // 移动端点击导航项后关闭侧边栏
    if (window.innerWidth < 768) {
      onClose()
    }
  }

  return (
    <aside
      className={`
        fixed md:static inset-y-0 left-0 z-50
        w-72 md:w-64
        flex flex-col h-screen shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      style={{
        background: 'var(--sidebar-bg)',
        color: 'var(--sidebar-text)',
      }}
    >
      {/* 头部区域 */}
      <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
        <NavLink
          to="/"
          onClick={handleNavClick}
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--sidebar-text)' }}>
            交互式可视化平台
          </p>
        </NavLink>

        {/* 移动端关闭按钮 */}
        <button
          onClick={onClose}
          className="md:hidden p-2 rounded-lg transition-colors"
          style={{ color: 'var(--sidebar-text-muted)' }}
          aria-label="关闭菜单"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 搜索框：输入即出现模糊匹配建议 */}
      <SidebarSearch onNavigate={handleNavClick} />

      {/* 导航区域 */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-2">
          {navCategories.map((category) => (
            <div key={category.name} className="mb-1">
              <button
                onClick={() => toggleCategory(category.name)}
                // 展开与否只用旋转的 ▶ 表示, 屏幕阅读器读不到状态, 靠 aria-expanded 补
                aria-expanded={expandedCategories.includes(category.name)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200 group"
              >
                <span className="flex items-center gap-3">
                  <category.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-semibold">{category.name}</span>
                  <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded-full">
                    {category.items.length}
                  </span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    expandedCategories.includes(category.name) ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {/* 展开的子菜单 - 用超大 max-h 让分类自然撑开，滚动交给外层 nav */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedCategories.includes(category.name)
                    ? 'max-h-[2000px] opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <ul className="ml-3 mt-1 space-y-0.5 border-l-2 border-slate-700/50 pl-3">
                  {category.items.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2.5 md:py-2 rounded-lg text-sm transition-all duration-300 ${
                            isActive
                              ? 'nav-link-active'
                              : 'hover:translate-x-1'
                          }`
                        }
                      >
                        {(() => {
                          const IconComp = resolveIcon(item.path)
                          return <IconComp className="w-4 h-4 flex-shrink-0" />
                        })()}
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* 底部统计 + 主题色 */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="text-slate-500">实验总数</span>
          <span
            className="px-2.5 py-1 rounded-full text-white font-semibold text-xs"
            style={{ backgroundColor: 'var(--sidebar-accent)' }}
          >
            {navCategories.reduce((sum, c) => sum + c.items.length, 0)}
          </span>
        </div>
        <ThemePicker />
        <button
          onClick={() => window.dispatchEvent(new CustomEvent(CHECK_UPDATE_EVENT))}
          className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors duration-200 hover:opacity-80"
          style={{ borderColor: 'var(--sidebar-border)', color: 'var(--sidebar-text-muted)' }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          检测更新
        </button>
        <div
          className="mt-3 pt-3 border-t flex items-center justify-center gap-1"
          style={{ borderColor: 'var(--sidebar-border)' }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: 'var(--sidebar-text-muted)' }}
            aria-hidden="true"
          >
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.17c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.35.77 1.05.77 2.12v3.14c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
          </svg>
          {[
            { label: '项目主页', href: 'https://github.com/Znfooe/mathviz' },
            { label: '问题反馈', href: 'https://github.com/Znfooe/mathviz/issues' },
            { label: '关于作者', href: 'https://github.com/Znfooe' },
          ].map((link, i) => (
            <span key={link.href} className="flex items-center">
              {i > 0 && <span className="mx-1 opacity-40">·</span>}
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] no-underline hover:underline underline-offset-2 transition-opacity hover:opacity-100"
                style={{ color: 'var(--sidebar-text-muted)', opacity: 0.85 }}
              >
                {link.label}
              </a>
            </span>
          ))}
        </div>
      </div>
    </aside>
  )
}
