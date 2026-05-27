/**
 * Renames Mac build artifacts from electron-builder's arch suffixes
 * to human-readable names:
 *   CueDeck-X.Y.Z-arm64-mac.zip  →  CueDeck-X.Y.Z-Silicon-mac.zip
 *   CueDeck-X.Y.Z-mac.zip        →  CueDeck-X.Y.Z-Intel-mac.zip
 */
const { renameSync, existsSync } = require('fs')
const { version } = require('../package.json')

const mv = (from, to) => {
  if (existsSync(from)) {
    renameSync(from, to)
    console.log(`  ${from.split('/').pop()} → ${to.split('/').pop()}`)
  }
}

console.log('Renaming Mac artifacts…')
mv(`release/CueDeck-${version}-arm64-mac.zip`,          `release/CueDeck-${version}-Silicon-mac.zip`)
mv(`release/CueDeck-${version}-arm64-mac.zip.blockmap`, `release/CueDeck-${version}-Silicon-mac.zip.blockmap`)
mv(`release/CueDeck-${version}-mac.zip`,                `release/CueDeck-${version}-Intel-mac.zip`)
mv(`release/CueDeck-${version}-mac.zip.blockmap`,       `release/CueDeck-${version}-Intel-mac.zip.blockmap`)
