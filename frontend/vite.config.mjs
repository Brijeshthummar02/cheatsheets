import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import staticRoutes from './vite-plugin-static-routes.mjs'

// GitHub Pages project sites live under /<repo-name>/. The deploy workflow sets
// VITE_BASE_PATH; locally (and on a custom domain) it defaults to "/".
const base = `/${(process.env.VITE_BASE_PATH || '/').replace(/^\/+|\/+$/g, '')}/`.replace('//', '/')

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), staticRoutes()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'build',
    // Vendor chunks cache independently of app code, so a deploy that only touches app code
    // doesn't invalidate React / Radix for returning visitors.
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react-vendor', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
            { name: 'ui-vendor', test: /node_modules[\\/]@radix-ui[\\/]/ },
            { name: 'utils', test: /node_modules[\\/](clsx|tailwind-merge|class-variance-authority)[\\/]/ },
          ],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'prismjs'],
  },
})
