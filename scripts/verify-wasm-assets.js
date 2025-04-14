
const fs = require('fs');
const path = require('path');

const publicTessDataDir = path.resolve(__dirname, '../public/tessdata');

console.log('Checking WASM assets in:', publicTessDataDir);

const requiredFiles = [
  'tesseract-core.wasm',
  'tesseract-worker.js',
  'eng.traineddata'
];

requiredFiles.forEach(file => {
  const filePath = path.join(publicTessDataDir, file);
  
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file}: Found (${stats.size} bytes)`);
  } else {
    console.error(`❌ ${file}: NOT FOUND`);
  }
});
