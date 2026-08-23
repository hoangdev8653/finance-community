const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.next' && f !== 'coverage') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(path.join(dir, f));
    }
  });
}

const targetDir = path.join(__dirname, '..', 'apps', 'web');
let modifiedCount = 0;

walkDir(targetDir, (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts') && !filePath.endsWith('.css')) return;
  if (filePath.includes('node_modules')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Replace font-serif with font-heading
  content = content.replace(/\bfont-serif\b/g, 'font-heading');

  // 2. Replace tiny text-2xs with text-xs for legibility
  content = content.replace(/\btext-2xs\b/g, 'text-xs');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedCount++;
    console.log(`Updated typography in: ${path.relative(targetDir, filePath)}`);
  }
});

console.log(`\n✅ Successfully synchronized typography across ${modifiedCount} files in apps/web!`);
