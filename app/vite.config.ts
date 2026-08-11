import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

// Resolve the SINGLE buffer@6 package that all code must share
const bufferPath = path.resolve(import.meta.dirname, 'node_modules/buffer')

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Exclude buffer — we handle it ourselves to avoid version conflicts
      exclude: ['buffer'],
      include: ['crypto', 'stream', 'util'],
      // Buffer: false is CRITICAL — the plugin's default buffer shim uses
      // buffer@5 (from node-stdlib-browser) which has a different prototype
      // than our buffer@6, causing Buffer.isBuffer() cross-version failures.
      globals: { Buffer: false, global: true, process: true },
    }),
  ],
  resolve: {
    alias: {
      // Force every import of 'buffer' or 'safe-buffer' to resolve to
      // the project's buffer@6.0.3, preventing prototype mismatches
      // that cause "Expected Buffer" errors in base-x / bs58 / Anchor.
      buffer: bufferPath,
      'safe-buffer': bufferPath,
    },
  },
  optimizeDeps: {
    include: ['buffer'],
  },
  define: {
    'process.env': {},
  },
})
