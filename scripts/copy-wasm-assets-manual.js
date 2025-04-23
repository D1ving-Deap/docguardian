
const fs = require('fs');
const path = require('path');

// Paths
const sourceDir = path.resolve(__dirname, '../node_modules/tesseract-wasm/dist');
const destDir = path.resolve(__dirname, '../public/tessdata');
const rootDir = path.resolve(__dirname, '../public');

console.log('Starting manual WASM asset copy...');
console.log(`Source: ${sourceDir}`);
console.log(`Destination: ${destDir}`);
console.log(`Root public: ${rootDir}`);

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
  const rootDestPath = path.join(rootDir, file);
  
  if (fs.existsSync(sourcePath)) {
    // Copy to tessdata directory
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${file} to tessdata successfully!`);
    
    // Check file size to ensure it's valid
    const stats = fs.statSync(destPath);
    console.log(`File size in tessdata: ${stats.size} bytes`);
    
    // Also copy to root directory for redundancy
    fs.copyFileSync(sourcePath, rootDestPath);
    console.log(`Copied ${file} to public root directory successfully!`);
    
    // Check file size in root directory
    const rootStats = fs.statSync(rootDestPath);
    console.log(`File size in root: ${rootStats.size} bytes`);
  } else {
    console.error(`Source file not found: ${sourcePath}`);
  }
});

// Copy training data file
const trainingDataSource = path.resolve(__dirname, '../node_modules/tesseract-wasm/tessdata/eng.traineddata');
const trainingDataDest = path.join(destDir, 'eng.traineddata');
const trainingDataRootDest = path.join(rootDir, 'eng.traineddata');

if (fs.existsSync(trainingDataSource)) {
  // Copy to tessdata directory
  fs.copyFileSync(trainingDataSource, trainingDataDest);
  console.log('Copied training data file to tessdata successfully!');
  
  // Also copy to root public directory
  fs.copyFileSync(trainingDataSource, trainingDataRootDest);
  console.log('Copied training data file to root public directory successfully!');
  
  // Verify files
  if (fs.existsSync(trainingDataDest) && fs.existsSync(trainingDataRootDest)) {
    console.log('Training data files verified in both locations.');
  } else {
    console.error('Training data files verification failed.');
  }
} else {
  console.error(`Training data file not found: ${trainingDataSource}`);
}

// Final verification
console.log('\nVerifying all files...');
let allSuccess = true;

[...files, 'eng.traineddata'].forEach(file => {
  const tessDataPath = path.join(destDir, file);
  const rootPath = path.join(rootDir, file);
  
  if (!fs.existsSync(tessDataPath)) {
    console.error(`ERROR: File missing in tessdata: ${file}`);
    allSuccess = false;
  }
  
  if (!fs.existsSync(rootPath)) {
    console.error(`ERROR: File missing in public root: ${file}`);
    allSuccess = false;
  }
});

if (allSuccess) {
  console.log('\n✅ All files successfully copied and verified!');
  console.log('WASM assets should now work correctly in your application.');
} else {
  console.error('\n❌ Some files are missing. Please check the errors above.');
}

console.log('\nManual WASM asset copy complete!');
