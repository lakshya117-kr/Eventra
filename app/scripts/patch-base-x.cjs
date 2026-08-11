/**
 * postinstall patch: Rewrites safe-buffer to use globalThis.Buffer,
 * eliminating the "Expected Buffer" error caused by Buffer prototype
 * mismatches between different buffer package copies.
 *
 * The root cause: vite-plugin-node-polyfills injects its own buffer@5
 * as globalThis.Buffer, but safe-buffer imports a SEPARATE copy of buffer.
 * base-x uses safe-buffer's Buffer for isBuffer() checks, which fails
 * when given a Buffer instance from the polyfill's buffer.
 *
 * Fix: Replace safe-buffer's entire implementation with a simple module
 * that returns globalThis.Buffer, ensuring all code uses the same Buffer.
 */
const fs = require('fs');
const path = require('path');

// Patch safe-buffer to use globalThis.Buffer
const safeBufferPath = path.join(__dirname, '..', 'node_modules', 'safe-buffer', 'index.js');
try {
  const shim = `
// Patched by postinstall to use globalThis.Buffer
// This ensures all code shares the same Buffer prototype
var Buffer = globalThis.Buffer || require('buffer').Buffer;
module.exports = { Buffer: Buffer };
module.exports.Buffer = Buffer;
`;
  fs.writeFileSync(safeBufferPath, shim, 'utf8');
  console.log('✅ Patched safe-buffer to use globalThis.Buffer');
} catch (err) {
  console.warn('⚠️  Could not patch safe-buffer:', err.message);
}

// Also patch base-x to use require('buffer') instead of require('safe-buffer')
const baseXPath = path.join(__dirname, '..', 'node_modules', 'base-x', 'src', 'index.js');
try {
  let content = fs.readFileSync(baseXPath, 'utf8');
  if (content.includes("require('safe-buffer')")) {
    content = content.replace(
      "require('safe-buffer').Buffer",
      "require('buffer').Buffer"
    );
    fs.writeFileSync(baseXPath, content, 'utf8');
    console.log('✅ Patched base-x to use buffer instead of safe-buffer');
  } else {
    console.log('ℹ️  base-x already patched');
  }
} catch (err) {
  console.warn('⚠️  Could not patch base-x:', err.message);
}
