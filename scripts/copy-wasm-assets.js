
const fs = require('fs');
const path = require('path');

console.log('Starting Tesseract WASM assets copy process...');

const sourceDir = path.resolve(__dirname, '../node_modules/tesseract-wasm/dist');
const destDir = path.resolve(__dirname, '../public/tessdata');

console.log(`Source directory: ${sourceDir}`);
console.log(`Destination directory: ${destDir}`);

// Check if source directory exists
if (!fs.existsSync(sourceDir)) {
  console.error(`❌ Source directory not found: ${sourceDir}`);
  console.error('Make sure tesseract-wasm is installed: npm install tesseract-wasm');
  process.exit(1);
}

// Ensure destination directory exists
if (!fs.existsSync(destDir)) {
  console.log(`Creating destination directory: ${destDir}`);
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
  
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Source file not found: ${sourcePath}`);
    return;
  }
  
  try {
    fs.copyFileSync(sourcePath, destPath);
    const stats = fs.statSync(destPath);
    console.log(`✅ Copied ${file} to ${destPath} (${stats.size} bytes)`);
  } catch (error) {
    console.error(`❌ Error copying ${file}: ${error.message}`);
  }
});

// Copy training data for English
const trainingDataSourcePath = path.resolve(__dirname, '../node_modules/tesseract-wasm/tessdata/eng.traineddata');
const trainingDataDestPath = path.join(destDir, 'eng.traineddata');

if (!fs.existsSync(trainingDataSourcePath)) {
  console.error(`❌ Training data not found: ${trainingDataSourcePath}`);
  console.error('Make sure tesseract-wasm is installed with training data');
} else {
  try {
    fs.copyFileSync(trainingDataSourcePath, trainingDataDestPath);
    const stats = fs.statSync(trainingDataDestPath);
    console.log(`✅ Copied eng.traineddata to ${trainingDataDestPath} (${stats.size} bytes)`);
  } catch (error) {
    console.error(`❌ Error copying training data: ${error.message}`);
  }
}

// Verify tesseractConfig.ts paths
console.log('\nVerifying paths in tesseractConfig.ts...');
const configPaths = {
  workerPath: '/tessdata/tesseract-worker.js',
  corePath: '/tessdata/tesseract-core.wasm',
  trainingDataPath: '/tessdata/eng.traineddata'
};

Object.entries(configPaths).forEach(([key, configPath]) => {
  // Remove leading slash and construct the full path
  const relativePath = configPath.startsWith('/') ? configPath.substring(1) : configPath;
  const fullPath = path.resolve(__dirname, '../public', relativePath);
  
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${key}: Verified file exists at: ${configPath}`);
  } else {
    console.error(`❌ ${key}: File NOT FOUND at: ${configPath}`);
    console.log(`   Expected full path: ${fullPath}`);
  }
});

console.log('\nFinished Tesseract WASM assets copy process!');
