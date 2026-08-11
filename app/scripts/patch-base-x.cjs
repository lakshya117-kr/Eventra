/**
 * postinstall patch: Rewrites base-x to use require('buffer') instead of
 * require('safe-buffer'). This prevents the "Expected Buffer" error caused
 * by Buffer prototype mismatch between safe-buffer (buffer@5) and the
 * polyfilled buffer@6 used everywhere else in the Solana/Anchor stack.
 */
const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'node_modules', 'base-x', 'src', 'index.js');

try {
  let content = fs.readFileSync(targetFile, 'utf8');
  if (content.includes("require('safe-buffer')")) {
    content = content.replace(
      "require('safe-buffer').Buffer",
      "require('buffer').Buffer"
    );
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('✅ Patched base-x to use buffer instead of safe-buffer');
  } else {
    console.log('ℹ️  base-x already patched or uses a different import');
  }
} catch (err) {
  console.warn('⚠️  Could not patch base-x:', err.message);
}
