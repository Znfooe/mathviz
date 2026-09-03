import type { LucideIcon } from 'lucide-react'
import {
  Plus, Divide, Calculator, Circle, Shapes, Hexagon,
  Hash, Triangle, RotateCcw, Sigma, Infinity, Activity,
  Play, Brain, Target, Scale, Compass, LineChart, BarChart3,
  TrendingUp, Boxes, Binary, TreePine,
  FunctionSquare, Waves, Grid3X3, Grid3X3 as Grid,
  Sparkles, Volume2, Archive, Info, Send, Map,
  Network, Users, Bot, Cpu, Cloud, Gem, Crown, Star,
  Flame, Droplets, Mountain, Heart, Sun, Moon, Zap,
  Layers, BookOpen, Feather, Package, Footprints, Anchor,
  Atom, CircuitBoard, Orbit,
  Magnet, Lock, Key,
  Filter, GitBranch,
  Clock,
  Search,
  ArrowRight, ArrowUp, CornerDownRight,
  Share2, Copy, FileText,
  Image, Video, Music, Camera,
  Database, Wifi,
  Wind, Umbrella, Snowflake,
  Leaf, Flower2, Bird, Bug, Fish, Rabbit,
  Apple, Banana, Cherry, Grape,
  Paintbrush,
  X, Check, Equal, Percent,
  Layers3, Blocks, Group, List,
  Table,
  PieChart,
  Workflow,
} from 'lucide-react'

// ============================================================
// 1. 精确 path → 图标映射（Sidebar 注册 + 首页显示用）
//    匹配到精确 path 时优先用这个
// ============================================================
export const pathIconMap: Record<string, LucideIcon> = {
  // 入门级
  '/basic-arithmetic': Plus,
  '/fractions': Divide,
  '/geometry-shapes': Shapes,
  '/set-theory': Circle,
  '/golden-ratio': Infinity,
  '/number-theory': Hash,
  '/pascal-triangle': Triangle,
  '/even-odd': Hash,
  '/roman-numerals': Calculator,
  '/symmetry': RotateCcw,
  '/tangram': Boxes,
  '/clock-angles': Compass,
  '/pigeonhole': Boxes,
  '/dice-probability': Target,
  '/fibonacci-nature': TreePine,
  '/prime-factorization': Hash,
  '/number-bases': Binary,
  '/digital-root': Hash,
  '/monty-hall': Target,
  '/caesar-cipher': Hash,
  '/triangular-numbers': Triangle,
  '/lucas-numbers': Infinity,
  '/happy-numbers': Hash,
  // 基础级
  '/linear-function': LineChart,
  '/quadratic-function': TrendingUp,
  '/pythagorean': Triangle,
  '/trigonometry': Activity,
  '/polar': Compass,
  '/probability': BarChart3,
  '/bezier': Compass,
  '/cycloid': Circle,
  '/monte-carlo': Target,
  '/inequalities': Scale,
  '/linear-system': LineChart,
  '/similar-triangles': Triangle,
  '/circle-geometry': Circle,
  '/stats-basics': BarChart3,
  '/absolute-value': TrendingUp,
  '/sequences': Hash,
  '/tower-of-hanoi': Boxes,
  '/magic-square': Boxes,
  '/sieve-eratosthenes': Hash,
  '/collatz': Infinity,
  '/perfect-numbers': Hash,
  '/tessellation': Shapes,
  '/pythagoras-tree': TreePine,
  '/euclidean-algorithm': Hash,
  '/function-transform': FunctionSquare,
  '/piecewise-function': FunctionSquare,
  '/inverse-function': FunctionSquare,
  '/binomial-theorem': Sigma,
  '/birthday-paradox': Target,
  '/sorting-algorithms': BarChart3,
  '/spirograph': Compass,
  '/sierpinski-triangle': Triangle,
  '/koch-snowflake': Circle,
  '/look-and-say': Hash,
  '/kaprekar': Hash,
  '/bisection-method': Target,
  '/projectile-motion': Activity,
  '/galton-board': BarChart3,
  // 中级
  '/conic-sections': Circle,
  '/calculus': Infinity,
  '/taylor': Sigma,
  '/complex': Circle,
  '/parametric': Compass,
  '/lissajous': Waves,
  '/ulam-spiral': Grid3X3,
  '/vector-field': Activity,
  '/numerical-integration': Sigma,
  '/interpolation': FunctionSquare,
  '/exponential-log': LineChart,
  '/matrix-transform': Boxes,
  '/dot-cross-product': Compass,
  '/parabola-optics': Activity,
  '/sine-superposition': Waves,
  '/combinatorial-proof': Target,
  '/modular-arithmetic': Hash,
  '/continued-fraction': Divide,
  '/epidemic-sir': Activity,
  '/game-of-life': Play,
  '/permutation-combination': Target,
  '/triangle-centers': Triangle,
  '/circle-packing': Circle,
  '/reuleaux': Circle,
  '/pick-theorem': Hash,
  '/convex-hull': Boxes,
  '/improper-integral': Infinity,
  '/solid-of-revolution': Circle,
  '/riemann-sum': Sigma,
  '/mean-value-theorem': FunctionSquare,
  '/integer-partition': Boxes,
  '/logarithm-spiral': Compass,
  '/rational-asymptotes': FunctionSquare,
  '/partial-fractions': Divide,
  '/composite-function': FunctionSquare,
  '/vieta-formulas': FunctionSquare,
  '/polynomial-roots': Target,
  '/aliasing': Activity,
  '/arc-length-curvature': Compass,
  '/three-body': Activity,
  '/wave-equation': Waves,
  // 高级
  '/linear-algebra': Boxes,
  '/matrix-decomposition': Boxes,
  '/ode': FunctionSquare,
  '/svd': Boxes,
  '/backpropagation': Brain,
  '/gershgorin': Circle,
  // 专业级
  '/chaos': Brain,
  '/fractal': Infinity,
  '/l-system': TreePine,
}

// ============================================================
// 2. 关键词智能匹配（path 没在精确表时用这个）
//    按优先级排序，第一个命中的关键词就返回对应图标
// ============================================================
interface KeywordRule {
  keywords: string[]
  icon: LucideIcon
}

const keywordRules: KeywordRule[] = [
  // ===== 代数 & 函数 =====
  { keywords: ['function', 'polynomial', 'quadratic', 'linear', 'transform', 'taylor', 'interpolation', 'piecewise', 'inverse', 'composite', 'vieta', 'multiplier', 'lagrange'], icon: FunctionSquare },
  { keywords: ['matrix', 'algebra', 'decomposition', 'svd', 'lu-', 'qr-', 'cholesky', 'eigen', 'gram-schmidt', 'kernel', 'image', 'projection', 'determinant', 'cramers', 'rotation3d', 'jacobian', 'hessian', 'quadratic-form', 'spectral', 'pseudoinverse', 'jordan'], icon: Boxes },
  { keywords: ['integral', 'derivative', 'calculus', 'curl', 'divergence', 'gradient', 'laplacian', 'line-integral', 'multiple-integral', 'partial', 'directional', 'stokes', 'green-theorem', 'improper-integral', 'riemann', 'mean-value'], icon: Sigma },
  { keywords: ['curve', 'bezier', 'parametric', 'cycloid', 'lissajous', 'spirograph', 'trajectory', 'projectile', 'arc-length', 'curvature', 'helix', 'viviani', 'conical-spiral', 'spherical-spiral', 'space-curve'], icon: Compass },
  { keywords: ['vector', 'field', 'dot', 'cross', 'vector-calculus', 'directional-derivative'], icon: Activity },
  { keywords: ['wave', 'fourier', 'signal', 'frequency', 'sine', 'superposition', 'ripple', 'vibrating', 'acoustic'], icon: Waves },

  // ===== 几何 =====
  { keywords: ['triangle', 'pascal', 'pythagorean', 'sierpinski', 'similar', 'euclidean', 'centers', 'inequalities', 'celestial', 'euler-line', 'nine-point', 'orthic', 'mittenpunkt', 'circumcircle', 'incircle'], icon: Triangle },
  { keywords: ['circle', 'conic', 'polar', 'packing', 'reuleaux', 'circle-geometry', 'apollonius', 'lune', 'inversive', 'spherical', 'sphere', 'solid-angle'], icon: Circle },
  { keywords: ['shape', 'geometry', 'polygon', 'tessellation', 'delaunay', 'voronoi', 'convex-hull', 'rotating-calipers', 'ear-clipping', 'clipping', 'point-in-polygon', 'marching-squares'], icon: Shapes },
  { keywords: ['surface', '3d', 'volume', 'solid-of-revolution', 'tube', 'catenary', 'brachistochrone', 'dini', 'enneper', 'roman', 'cross-cap', 'boy', 'pseudosphere', 'hyperbolic-paraboloid', 'seashell', 'monkey-saddle', 'whitney-umbrella', 'supertoroid', 'superquadric', 'ruled', 'costa', 'mean-curvature', 'developable', 'sphere', 'torus', 'klein', 'projective'], icon: Hexagon },
  { keywords: ['polyhedron', 'platonic', 'archimedean', 'stellated', 'prism', 'antiprism', 'spherical-triangle', 'spherical-tiling', 'geodesic', 'spherical-lune', 'tetrahedron', 'dual', 'kissing', 'dehn', 'descartes', 'truncation', 'polyhedron-slice', 'prismatoid'], icon: Hexagon },

  // ===== 数论 & 密码 =====
  { keywords: ['number', 'prime', 'integer', 'divisor', 'euclidean', 'sieve', 'collatz', 'modular', 'pigeonhole', 'digit', 'base', 'system', 'theory', 'pascal', 'binomial', 'kaprekar', 'happy', 'perfect', 'triangular', 'lucas', 'fibonacci', 'golden', 'continued', 'pell', 'fermat', 'wilson', 'euler-totient', 'mobius', 'farey', 'stern-brocot', 'primitive-root', 'gaussian-integers', 'quadratic-residue', 'chinese-remainder', 'fast-exponentiation', 'pythagorean-triples', 'frobenius'], icon: Hash },
  { keywords: ['cipher', 'crypto', 'rsa', 'caesar', 'vigenere', 'hill', 'diffie-hellman', 'elliptic', 'one-time', 'xor', 'cipher'], icon: Lock },
  { keywords: ['entropy', 'information', 'huffman', 'coding', 'kl-divergence', 'mutual-information', 'shannon'], icon: Database },

  // ===== 概率 & 统计 =====
  { keywords: ['probability', 'dice', 'monty', 'galton', 'brownian', 'poisson', 'random', 'stochastic', 'process', 'monte-carlo', 'clt', 'distribution', 'density', 'hypothesis', 'confidence', 'interval', 'likelihood', 'mixture', 'regression', 'logistic-regression', 'pca', 'bayes', 'naive-bayes', 'markov', 'hidden-markov', 'decision-tree', 'knn', 'gamblers', 'coupon', 'benfords', 'buffon'], icon: Target },
  { keywords: ['stats', 'statistics', 'normal', 'gaussian', 'histogram', 'box-plot', 'bar-chart', 'regression', 'correlation', 'hypothesis'], icon: BarChart3 },

  // ===== 分形 & 混沌 =====
  { keywords: ['fractal', 'mandelbrot', 'julia', 'dragon', 'hilbert', 'peano', 'gosper', 'levy', 'sierpinski', 'koch', 'barnsley', 'fern', 'newton-fractal', 'burning-ship', 'box-counting', 'dimension', 'percolation', 'cellular-automata', 'game-of-life', 'cellular'], icon: TreePine },
  { keywords: ['chaos', 'lorenz', 'attractor', 'pendulum', 'bifurcation', 'logistic', 'henon', 'rossler', 'tent', 'damped-oscillation', 'phase-portrait', 'limit-cycle', 'lotka-volterra', 'pendulum-phase', 'double-pendulum', 'nbody', 'kepler', 'chua', 'halvorsen', 'thomas', 'aizawa', 'sprott'], icon: Brain },

  // ===== 算法 & 图论 =====
  { keywords: ['graph', 'network', 'dijkstra', 'floyd', 'warshall', 'flow', 'mst', 'kruskal', 'prim', 'coloring', 'euler-hamilton', 'bfs', 'dfs', 'dynamic-programming', 'dp', 'a-star', 'divide-conquer', 'generating-functions', 'catalan', 'bell', 'stirling', 'derangements', 'inclusion-exclusion', 'latin-square', 'josephus', 'gray-code'], icon: GitBranch },
  { keywords: ['sorting', 'algorithm', 'search', 'permutation', 'combination', 'counting', 'combinatoric'], icon: BarChart3 },

  // ===== 机器学习 =====
  { keywords: ['neural', 'perceptron', 'backpropagation', 'neuron', 'network', 'deep', 'learning', 'gaussian-process', 'kalman', 'pagerank', 'markov-stationary'], icon: Brain },
  { keywords: ['cluster', 'kmeans', 'clustering', 'segmentation'], icon: Layers },
  { keywords: ['genetic', 'evolution', 'particle-swarm', 'simulated-annealing', 'optimization', 'annealing'], icon: Sparkles },

  // ===== 微分方程 =====
  { keywords: ['ode', 'pde', 'differential', 'equation', 'lagrange-multiplier', 'fixed-point', 'heat-equation', 'reaction-diffusion', 'poincare'], icon: FunctionSquare },
  { keywords: ['numerical', 'bisection', 'newton', 'secant', 'gradient-descent', 'condition-number', 'pagerank', 'power-iteration'], icon: Target },

  // ===== 复分析 & 拓扑 =====
  { keywords: ['complex', 'magnitude', 'phase', 'argument', 'cauchy', 'residue', 'contour', 'riemann-sphere', 'mobius', 'transform', 'laplace-transform', 'z-transform', 'fourier-transform', 'power-series', 'taylor-series', 'laurent', 'singularity', 'pole', 'zero', 'winding', 'argument-principle', 'rouche', 'open-mapping', 'maximum-modulus', 'cauchy-estimate', 'schwarz', 'blaschke', 'hardy-space', 'hilbert-transform', 'fourier-series', 'fft', 'autocorrelation', 'convolution', 'nyquist', 'windowing', 'wavelet', 'b-spline', 'catmull-rom', 'dct', 'discrete-cosine', 'signal-processing'], icon: Circle },
  { keywords: ['topology', 'homotopy', 'fundamental', 'covers', 'universal', 'monodromy', 'lifting', 'loop', 'winding', 'braid', 'knot', 'link', 'tangent', 'cotangent', 'differential-geometry', 'manifold', 'chart', 'atlas', 'riemannian', 'geodesic', 'curvature', 'gaussian', 'sectional', 'scalar', 'stress-energy', 'einstein', 'gravitational', 'field-equations', 'schwarzschild', 'kerr', 'gravitational-lensing', 'wormhole', 'black-hole', 'entropy-coding', 'concentration', 'banach-fixed-point', 'quaternion', 'so3', 'lie-algebra', 'lie-group', 'screw-motion', 'torus-knot', 'torus-klein', 'euler-characteristic', 'hopf-fibration', 'hyperbolic-tiling', 'inversive-geometry', 'poincare-disk', 'stereographic-projection', 'klein-bottle-figure8', 'mean-curvature-flow'], icon: Network },

  // ===== 数值方法 =====
  { keywords: ['numerical', 'method', 'approximation', 'error', 'stability', 'convergence', 'rate', 'consistency', 'order', 'eigenvalue', 'eigenvector', 'qr', 'iteration', 'power-iteration', 'condition', 'perron-frobenius'], icon: Calculator },
  { keywords: ['fft', 'fast-fourier', 'discrete-fourier', 'dft', 'convolution', 'autocorrelation'], icon: Zap },

  // ===== 微积分补充 =====
  { keywords: ['exponential', 'logarithm', 'log', 'euler-identity', 'euler-characteristic', 'euler-line', 'euler-totient', 'euler-identity'], icon: TrendingUp },
  { keywords: ['implicit', 'parametric', 'tangent', 'normal', 'level'], icon: Compass },

  // ===== 积分补充 =====
  { keywords: ['riemann-sum', 'trapesoidal', 'simpson', 'gaussian', 'midpoint', 'numerical-integration'], icon: Sigma },

  // ===== 杂项 =====
  { keywords: ['grid', 'spiral', 'ulam', 'matrix', 'lattice'], icon: Grid3X3 },
  { keywords: ['game', 'game-of-life', 'game-theory'], icon: Play },
  { keywords: ['map-projection', 'projection', 'cartography'], icon: Map },
  { keywords: ['calculator', 'compute', 'arithmetic'], icon: Calculator },
  { keywords: ['target', 'hit', 'bullet', 'dice'], icon: Target },
  { keywords: ['prime', 'factor', 'euclid'], icon: Hash },
  { keywords: ['set', 'venn', 'union', 'intersection', 'cardinality'], icon: Circle },
  { keywords: ['triangle', 'pascal-triangle', 'pythagorean'], icon: Triangle },
  { keywords: ['divide', 'fraction', 'divisor'], icon: Divide },
  { keywords: ['plus', 'addition', 'sum'], icon: Plus },
  { keywords: ['times', 'multiplication'], icon: X },
  { keywords: ['equal', 'inequal', 'equation'], icon: Equal },
  { keywords: ['root', 'sqrt', 'square-root'], icon: Check },
  { keywords: ['percent', 'rate'], icon: Percent },
  { keywords: ['hexagon', 'polygon', 'regular'], icon: Hexagon },
  { keywords: ['shape', 'geometry'], icon: Shapes },
  { keywords: ['circle', 'round', 'disk'], icon: Circle },
  { keywords: ['line', 'function', 'chart'], icon: LineChart },
  { keywords: ['chart', 'graph', 'visual'], icon: BarChart3 },
  { keywords: ['arrow', 'vector'], icon: ArrowRight },
  { keywords: ['wave', 'ripple', 'water'], icon: Waves },
  { keywords: ['atom', 'particle', 'quantum'], icon: Atom },
  { keywords: ['orbit', 'planet', 'solar', 'space'], icon: Orbit },
  { keywords: ['heat', 'thermal', 'temperature', 'thermodynamics'], icon: Flame },
  { keywords: ['fluid', 'liquid', 'water', 'flow'], icon: Droplets },
  { keywords: ['mountain', 'height', 'elevation', 'topology'], icon: Mountain },
  { keywords: ['heart', 'cardio', 'biology'], icon: Heart },
  { keywords: ['sun', 'light', 'optics', 'lens'], icon: Sun },
  { keywords: ['moon', 'night', 'dark'], icon: Moon },
  { keywords: ['random', 'walk', 'stochastic'], icon: Footprints },
  { keywords: ['anchor', 'fixed-point'], icon: Anchor },
  { keywords: ['pde', 'partial-differential'], icon: FunctionSquare },
  { keywords: ['ode', 'ordinary'], icon: FunctionSquare },
  { keywords: ['network', 'connection', 'link'], icon: Network },
  { keywords: ['star', 'point', 'dot'], icon: Star },
  { keywords: ['gem', 'sierpinski', 'julia'], icon: Gem },
  { keywords: ['crown', 'euclidean-algorithm'], icon: Crown },
  { keywords: ['layers', 'stack', 'level'], icon: Layers },
  { keywords: ['book', 'chapter', 'theory', 'read'], icon: BookOpen },
  { keywords: ['feather', 'koch', 'snake', 'fern'], icon: Feather },
  { keywords: ['package', 'box', 'cube'], icon: Package },
  { keywords: ['magnet', 'field'], icon: Magnet },
  { keywords: ['key', 'secret'], icon: Key },
  { keywords: ['database', 'data', 'record'], icon: Database },
  { keywords: ['filter', 'select'], icon: Filter },
  { keywords: ['order', 'ascend', 'descend'], icon: ArrowUp },
  { keywords: ['clock', 'time', 'chrono'], icon: Clock },
  { keywords: ['search', 'find'], icon: Search },
  { keywords: ['share', 'external'], icon: Share2 },
  { keywords: ['copy', 'clone'], icon: Copy },
  { keywords: ['file', 'document', 'text'], icon: FileText },
  { keywords: ['image', 'photo', 'picture'], icon: Image },
  { keywords: ['video', 'play'], icon: Video },
  { keywords: ['music', 'sound', 'audio'], icon: Music },
  { keywords: ['camera', 'capture'], icon: Camera },
  { keywords: ['circuit', 'electronics'], icon: CircuitBoard },
  { keywords: ['cpu', 'processor', 'compute'], icon: Cpu },
  { keywords: ['wifi', 'signal'], icon: Wifi },
  { keywords: ['cloud', 'weather'], icon: Cloud },
  { keywords: ['droplet', 'water'], icon: Droplets },
  { keywords: ['snowflake', 'crystal'], icon: Snowflake },
  { keywords: ['umbrella', 'rain'], icon: Umbrella },
  { keywords: ['wind', 'air'], icon: Wind },
  { keywords: ['leaf', 'plant', 'tree'], icon: Leaf },
  { keywords: ['flower', 'petal'], icon: Flower2 },
  { keywords: ['bird', 'avian'], icon: Bird },
  { keywords: ['bug', 'insect'], icon: Bug },
  { keywords: ['fish', 'aquatic'], icon: Fish },
  { keywords: ['rabbit', 'animal'], icon: Rabbit },
  { keywords: ['apple', 'fruit'], icon: Apple },
  { keywords: ['banana', 'fruit'], icon: Banana },
  { keywords: ['cherry', 'fruit'], icon: Cherry },
  { keywords: ['grape', 'fruit'], icon: Grape },
  { keywords: ['paint', 'palette', 'color'], icon: Paintbrush },
  { keywords: ['compass', 'direction'], icon: Compass },
  { keywords: ['brain', 'mind', 'intelligence'], icon: Brain },
  { keywords: ['volume', 'noise', 'amplitude'], icon: Volume2 },
  { keywords: ['bot', 'robot', 'agent'], icon: Bot },
  { keywords: ['group', 'users', 'people'], icon: Users },
  { keywords: ['info', 'details', 'help'], icon: Info },
  { keywords: ['send', 'transfer'], icon: Send },
  { keywords: ['sparkles', 'magic', 'special'], icon: Sparkles },
  { keywords: ['archive', 'storage'], icon: Archive },
  { keywords: ['package', 'delivery'], icon: Package },
  { keywords: ['arrow', 'move', 'pointer'], icon: ArrowRight },
  { keywords: ['check', 'confirm', 'success'], icon: Check },
  { keywords: ['x', 'close', 'cancel'], icon: X },
  { keywords: ['list', 'items'], icon: List },
  { keywords: ['grid', 'cells'], icon: Grid },
  { keywords: ['table', 'rows', 'columns'], icon: Table },
  { keywords: ['layers3', 'stacking'], icon: Layers3 },
  { keywords: ['blocks', 'puzzle'], icon: Blocks },
  { keywords: ['group', 'cluster'], icon: Group },
  { keywords: ['pie', 'pie-chart'], icon: PieChart },
  { keywords: ['share2', 'share-2'], icon: Share2 },
  { keywords: ['workflow'], icon: Workflow },
  { keywords: ['corner', 'corner-right'], icon: CornerDownRight },
]

// ============================================================
// 3. 智能解析入口（精确匹配 → 关键词匹配 → fallback）
// ============================================================
export function resolveIcon(path: string): LucideIcon {
  // 先精确匹配
  if (pathIconMap[path]) return pathIconMap[path]

  // 关键词智能匹配
  const lower = path.toLowerCase()
  for (const rule of keywordRules) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      return rule.icon
    }
  }

  // 终极 fallback
  return FunctionSquare
}

// ============================================================
// 4. 首页 topic 分类
// ============================================================
export const topicIconMap: Record<string, LucideIcon> = {
  geometry: Shapes,
  algebra: FunctionSquare,
  calculus: Infinity,
  probability: Target,
  'linear-algebra': Boxes,
  analysis: TrendingUp,
  discrete: Hash,
  applied: Target,
}
