
const fs = require('fs');
const path = require('path');

console.log('Starting Tesseract WASM asset verification...');

// Define the directory for Tesseract assets
const publicTessDataDir = path.resolve(__dirname, '../public/tessdata');
console.log('Checking WASM assets in:', publicTessDataDir);

// Define expected configuration paths
const expectedPaths = {
  workerPath: '/tessdata/tesseract-worker.js',
  corePath: '/tessdata/tesseract-core.wasm',
  trainingDataPath: '/tessdata/eng.traineddata'
};

// List of required files to check
const requiredFiles = [
  { name: 'tesseract-core.wasm', path: 'tesseract-core.wasm' },
  { name: 'tesseract-worker.js', path: 'tesseract-worker.js' },
  { name: 'eng.traineddata', path: 'eng.traineddata' }
];

// Check if directory exists
if (!fs.existsSync(publicTessDataDir)) {
  console.error(`❌ Directory not found: ${publicTessDataDir}`);
  console.log('Creating directory...');
  try {
    fs.mkdirSync(publicTessDataDir, { recursive: true });
    console.log(`✅ Created directory: ${publicTessDataDir}`);
  } catch (error) {
    console.error(`Failed to create directory: ${error.message}`);
  }
}

// Check each required file
let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(publicTessDataDir, file.path);
  
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file.name}: Found (${stats.size} bytes)`);
  } else {
    console.error(`❌ ${file.name}: NOT FOUND at ${filePath}`);
    allFilesExist = false;
  }
});

// Load and check the configuration paths
try {
  console.log('\nVerifying paths from expected configuration:');
  Object.entries(expectedPaths).forEach(([key, configPath]) => {
    // Remove leading slash and construct the full path
    const relativePath = configPath.startsWith('/') ? configPath.substring(1) : configPath;
    const fullPath = path.resolve(__dirname, '../public', relativePath);
    
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      console.log(`✅ ${key}: File exists at expected path: ${configPath} (${stats.size} bytes)`);
    } else {
      console.error(`❌ ${key}: File NOT FOUND at expected path: ${configPath}`);
      console.log(`   Expected full path: ${fullPath}`);
    }
  });
} catch (error) {
  console.error('Error checking configuration paths:', error.message);
}

// Show helpful messages based on verification results
if (!allFilesExist) {
  console.log('\n⚠️ Some required files are missing!');
  console.log('\nTROUBLESHOOTING STEPS:');
  console.log('1. Make sure tesseract-wasm is installed: npm install tesseract-wasm');
  console.log('2. Run copy script: node scripts/copy-wasm-assets.js');
  console.log('3. Check paths in tesseractConfig.ts match the actual file locations');
  console.log('4. If files still missing, manually download and place in public/tessdata/');
} else {
  console.log('\n✅ All required Tesseract WASM files are present!');
  console.log('Your OCR system should be ready to use.');
}

// Provide next steps
console.log('\nNEXT STEPS:');
console.log('1. Test the OCR functionality in your application');
console.log('2. If issues occur, check browser console for specific error messages');
console.log('3. For more languages, add additional traineddata files to /public/tessdata/');
