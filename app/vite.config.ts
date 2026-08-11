import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // EXCLUDE buffer — we handle it ourselves.
      // The polyfills plugin creates a SEPARATE internal copy of buffer
      // from node-stdlib-browser which causes prototype mismatches with
      // any npm-installed buffer package (including safe-buffer → base-x).
      exclude: ['buffer'],
      include: ['crypto', 'stream', 'util'],
      globals: { Buffer: false, global: true, process: true },
    }),
  ],
  resolve: {
    alias: {
      // Force BOTH buffer and safe-buffer to resolve to the single
      // buffer@6 npm package. This is the ONLY buffer in the bundle.
      'safe-buffer': 'buffer',
    },
  },
  define: {
    'process.env': {},
  },
})
