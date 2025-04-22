
const fs = require('fs');
const path = require('path');

// Paths
const sourceDir = path.resolve(__dirname, '../node_modules/tesseract-wasm/dist');
const destDir = path.resolve(__dirname, '../public/tessdata');

console.log('Starting manual WASM asset copy...');
console.log(`Source: ${sourceDir}`);
console.log(`Destination: ${destDir}`);

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log(`Created directory: ${destDir}`);
}

// Files to copy
const files = [
  'tesseract-core.wasm',
  'tesseract-worker.js'
];

// Copy each file
files.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const destPath = path.join(destDir, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${file} successfully!`);
    
    // Check file size to ensure it's valid
    const stats = fs.statSync(destPath);
    console.log(`File size: ${stats.size} bytes`);
  } else {
    console.error(`Source file not found: ${sourcePath}`);
  }
});

// Copy training data file
const trainingDataSource = path.resolve(__dirname, '../node_modules/tesseract-wasm/tessdata/eng.traineddata');
const trainingDataDest = path.join(destDir, 'eng.traineddata');

if (fs.existsSync(trainingDataSource)) {
  fs.copyFileSync(trainingDataSource, trainingDataDest);
  console.log('Copied training data file successfully!');
} else {
  console.error(`Training data file not found: ${trainingDataSource}`);
}

console.log('Manual WASM asset copy complete!');
