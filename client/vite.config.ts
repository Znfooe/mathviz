import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { compression } from 'vite-plugin-compression2'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), compression({ threshold: 1024 })],
  resolve: {
    alias: {
      'plotly.js/dist/plotly': fileURLToPath(new URL('./src/lib/plotly-custom.ts', import.meta.url)),
      'buffer/': 'buffer/',
      buffer: 'buffer',
    },
  },
  define: {
    global: 'globalThis',
  },
  // 性能优化：预构建核心依赖，避免首次启动时逐模块扫描
  optimizeDeps: {
    include: [
      'buffer',
      'react',
      'react-dom',
      'react-router-dom',
      'mathjs',
      'katex',
      'react-katex',
      'plotly.js-dist-min',
      'react-plotly.js',
      'fuse.js',
      'pinyin-pro',
    ],
    // plotly.js 很大，预构建更激进
    esbuildOptions: {
      target: 'es2022',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-plotly': ['react-plotly.js', 'plotly.js-dist-min'],
          'vendor-math': ['mathjs', 'katex', 'react-katex'],
          'vendor-utils': ['buffer', 'fuse.js', 'pinyin-pro'],
        },
      },
    },
    chunkSizeWarningLimit: 1500,
    target: 'es2022',
  },
  server: {
    // 开发服务器优化
    hmr: { overlay: false },
    // 更快的文件监听
    watch: {
      usePolling: false,
    },
  },
})
