import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

/**
 * Intercepts require('safe-buffer') and returns a virtual module that
 * grabs Buffer from the global scope (where vite-plugin-node-polyfills
 * already injected it). This ensures base-x/bs58/Anchor all use the
 * exact same Buffer prototype as globalThis.Buffer.
 */
function patchSafeBuffer(): Plugin {
  const SHIM_ID = '\0safe-buffer-shim'
  return {
    name: 'patch-safe-buffer',
    enforce: 'pre',
    resolveId(source) {
      if (source === 'safe-buffer') return SHIM_ID
      return null
    },
    load(id) {
      if (id === SHIM_ID) {
        // Use globalThis.Buffer directly — the nodePolyfills plugin
        // injects it before any module code runs.
        return `
          var Buffer = globalThis.Buffer;
          module.exports = { Buffer: Buffer };
          module.exports.Buffer = Buffer;
        `
      }
      return null
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    patchSafeBuffer(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'util'],
      globals: { Buffer: true, global: true, process: true },
    }),
  ],
  define: {
    'process.env': {},
  },
})
