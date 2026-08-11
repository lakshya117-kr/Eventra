/**
 * postinstall patch: Fixes Solana/Phantom wallet cross-realm Uint8Array issues
 * and Buffer prototype mismatches in base-x and safe-buffer.
 */
const fs = require('fs');
const path = require('path');

// 1. Patch safe-buffer to use globalThis.Buffer
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
  console.log('✅ Patched safe-buffer');
} catch (err) {
  console.warn('⚠️  Could not patch safe-buffer:', err.message);
}

// 2. Patch base-x to handle cross-realm Uint8Arrays from Phantom Wallet
const baseXPath = path.join(__dirname, '..', 'node_modules', 'base-x', 'src', 'index.js');
try {
  let content = fs.readFileSync(baseXPath, 'utf8');
  
  // Fix Buffer prototype mismatch (just in case safe-buffer patch doesn't catch it)
  if (content.includes("require('safe-buffer')")) {
    content = content.replace("require('safe-buffer').Buffer", "require('buffer').Buffer");
  }

  // FIX THE "Expected Buffer" cross-realm bug!
  // Phantom wallet passes Uint8Arrays from its extension context.
  // 'source instanceof Uint8Array' evaluates to FALSE for cross-realm objects.
  // We need to duck-type it by checking for .byteLength or .buffer
  const targetStr = 'source instanceof Uint8Array';
  const replacementStr = '(source instanceof Uint8Array || (source && source.byteLength !== undefined))';
  
  if (content.includes(targetStr) && !content.includes(replacementStr)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync(baseXPath, content, 'utf8');
    console.log('✅ Patched base-x for Phantom cross-realm Uint8Arrays');
  } else {
    console.log('ℹ️  base-x already patched for Phantom');
  }
} catch (err) {
  console.warn('⚠️  Could not patch base-x:', err.message);
}
