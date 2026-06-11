#!/usr/bin/env node
/**
 * post-install helper — installs i18n dependencies that were added
 * to the project but not yet installed.
 *
 * Run: node scripts/install-i18n.js
 * Or add to package.json scripts: "postinstall": "node scripts/install-i18n.js"
 */
const { execSync } = require('child_process');

const packages = ['i18next', 'react-i18next'];
console.log('Installing i18n packages:', packages.join(', '));

try {
  execSync(`npm install ${packages.join(' ')} --legacy-peer-deps`, {
    stdio: 'inherit',
    cwd: __dirname + '/..',
  });
  console.log('✅ i18n packages installed successfully');
} catch (err) {
  console.error('❌ Failed to install i18n packages:', err.message);
  process.exit(1);
}
