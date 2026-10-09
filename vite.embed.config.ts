/**
 * Library-style embed build → dist-embed/embed.js + embed.css (stable names).
 * Bundles React; Business Ultra loads via <script type="module">.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: '/cost/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist-embed',
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(rootDir, 'src/embed.tsx'),
      name: 'CostMyBusiness',
      formats: ['es'],
      fileName: () => 'embed.js',
    },
    rollupOptions: {
      output: {
        assetFileNames: 'embed[extname]',
        inlineDynamicImports: true,
      },
    },
  },
})
