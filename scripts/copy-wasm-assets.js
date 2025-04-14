
const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, '../node_modules/tesseract-wasm/dist');
const destDir = path.resolve(__dirname, '../public/tessdata');

// Ensure destination directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Files to copy
const filesToCopy = [
  'tesseract-core.wasm', 
  'tesseract-worker.js'
];

filesToCopy.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const destPath = path.join(destDir, file);
  
  try {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${file} to ${destPath}`);
  } catch (error) {
    console.error(`Error copying ${file}: ${error.message}`);
  }
});

// Copy training data for English
const trainingDataSourcePath = path.resolve(__dirname, '../node_modules/tesseract-wasm/tessdata/eng.traineddata');
const trainingDataDestPath = path.join(destDir, 'eng.traineddata');

try {
  fs.copyFileSync(trainingDataSourcePath, trainingDataDestPath);
  console.log(`Copied eng.traineddata to ${trainingDataDestPath}`);
} catch (error) {
  console.error(`Error copying training data: ${error.message}`);
}
