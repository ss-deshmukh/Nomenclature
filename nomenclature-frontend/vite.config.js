import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['@polkadot/api', '@polkadot/api-contract']
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
})