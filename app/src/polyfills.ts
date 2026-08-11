import { Buffer } from 'buffer';

// Set Buffer globally IMMEDIATELY — this module must be the first import.
// vite-plugin-node-polyfills should do this, but Vite 8 + some versions
// have a race condition where top-level Buffer.from() in other modules
// evaluates before the plugin's global injection.
window.Buffer = Buffer;
(globalThis as any).Buffer = Buffer;
(global as any).Buffer = Buffer;
