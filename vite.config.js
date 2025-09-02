import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { generateRoutes } from './scripts/generate-prerender-routes.js';

// https://vite.dev/config/
export default defineConfig({
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
    entry: 'src/main.jsx',
    onFinished() {
      console.log('SSG finished.');
    },
    dirStyle: 'nested',
    include: ['/faq', '/privacy', '/terms', '/blog/why-i-built-tubeheadlines'],
    dynamicRoutes: async () => {
      return await generateRoutes();
    },
  },
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
