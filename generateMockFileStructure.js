#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Check we have an argument for the directory
if (process.argv.length < 3) {
  console.error('Usage: node generateMockStructure.js <folder>');
  process.exit(1);
}

const targetDir = process.argv[2];

// A helper to check if a file or directory is "hidden"
function isHidden(name) {
  return name.startsWith('.');
}

/**
 * Recursively retrieves all non-hidden files from a directory and its subdirectories.
 * @param {string} dir - The directory to scan
 * @param {string} baseDir - The root directory (used to build relative paths)
 * @returns {string[]} An array of relative file paths
 */
function getAllFiles(dir, baseDir) {
  let fileList = [];

  // Read all entries in the current directory
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    // Skip hidden files or directories (names starting with '.')
    if (isHidden(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Recursively read the subdirectory
      fileList = fileList.concat(getAllFiles(fullPath, baseDir));
    } else {
      // Build a relative path from baseDir
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      fileList.push(relativePath);
    }
  }

  return fileList;
}

// Get all files in the targetDir, ignoring hidden
const files = getAllFiles(path.resolve(targetDir), path.resolve(targetDir));

// Create the array of objects
const fileObjects = files
  .map(
    (file) =>
      `  { uri: 'file:///workspace/${file}', uniquePath: '${file}' }`
  )
  .join(',\n');

// Build the final TS content
const fileContent = `export const mockFileStructure = [
${fileObjects}
];
`;

// Write out the result
const outputFile = path.join(process.cwd(), 'mockFileStructure.ts');
fs.writeFileSync(outputFile, fileContent, 'utf8');

console.log(`Done! Created: ${outputFile}`);
