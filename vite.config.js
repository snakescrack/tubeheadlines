import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

import fs from 'fs'

const htmlFallbackPlugin = () => ({
  name: 'html-fallback',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // If no file extension and the corresponding .html file exists in public/
      if (req.url && !req.url.includes('.') && req.url !== '/' && !req.url.startsWith('/api') && !req.url.startsWith('/.netlify')) {
        // Strip query params to check file existence
        const pathname = req.url.split('?')[0]
        const publicPath = path.resolve(process.cwd(), 'public', pathname.slice(1) + '.html')
        if (fs.existsSync(publicPath)) {
          console.log(`[Vite] Rewriting ${req.url} to ${pathname}.html`)
          req.url = pathname + '.html'
        }
      }
      next()
    })
  }
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), htmlFallbackPlugin()],
  server: {
    proxy: {
      '/.netlify/functions': {
        target: 'http://localhost:9999',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // ... existing output options
      }
    }
  }
})
