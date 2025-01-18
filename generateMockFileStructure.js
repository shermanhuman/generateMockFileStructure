#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
  console.error('Usage: node generateMockStructure.js <folder>');
  process.exit(1);
}

const targetDir = process.argv[2];

function updateProgress(current, total, message) {
  const percentage = Math.round((current / total) * 100);
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`${message}: ${percentage}% [${current}/${total}]`);
}

function shouldExclude(name) {
  // Exclude hidden files/folders
  if (name.startsWith('.')) return true;
  
  // Common directories to exclude
  const excludedDirs = [
    'node_modules',
    'dist',
    'build',
    'out',
    'coverage',
    '.git',
    '.vs',
    '.idea'
  ];
  
  // Check if it's in our exclude list
  if (excludedDirs.includes(name)) return true;
  
  return false;
}

function getAllFiles(dir, baseDir) {
  let fileList = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (shouldExclude(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fileList = fileList.concat(getAllFiles(fullPath, baseDir));
    } else {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      fileList.push(relativePath);
    }
  }

  return fileList;
}

function findShortestUniquePaths(allPaths) {
  const pathMap = new Map();
  const total = allPaths.length;
  
  allPaths.forEach((fullPath, index) => {
    let parts = fullPath.split('/');
    let filename = parts.pop();
    let uniquePath = filename;
    let pathIndex = parts.length - 1;
    
    const sameNameFiles = allPaths.filter(p => p.endsWith('/' + filename));
    
    while (sameNameFiles.length > 1 && pathIndex >= 0) {
      uniquePath = `${parts[pathIndex]}/${uniquePath}`;
      const remainingConflicts = sameNameFiles.filter(p => p.endsWith(uniquePath));
      if (remainingConflicts.length === 1) break;
      pathIndex--;
    }
    
    pathMap.set(fullPath, uniquePath);
    updateProgress(index + 1, total, 'Processing unique paths');
  });
  
  process.stdout.write('\n');
  return pathMap;
}

console.log('Scanning files...');
const files = getAllFiles(path.resolve(targetDir), path.resolve(targetDir));
console.log(`Found ${files.length} files`);

console.log('Calculating unique paths...');
const uniquePaths = findShortestUniquePaths(files);

console.log('Generating output...');
const fileObjects = files
  .map(
    (file) =>
      `  { uri: 'file:///workspace/${file}', uniquePath: '${uniquePaths.get(file)}' }`
  )
  .join(',\n');

const fileContent = `export const mockFileStructure = [
${fileObjects}
];
`;

const outputFile = path.join(process.cwd(), 'mockFileStructure.ts');
fs.writeFileSync(outputFile, fileContent, 'utf8');

console.log(`Done! Created: ${outputFile}`);