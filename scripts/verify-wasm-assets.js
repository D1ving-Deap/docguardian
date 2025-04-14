
const fs = require('fs');
const path = require('path');

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
  // We can't directly require the TypeScript file, so we'll just check if the files exist at the expected locations
  console.log('\nVerifying paths from expected configuration:');
  Object.entries(expectedPaths).forEach(([key, configPath]) => {
    // Remove leading slash and construct the full path
    const relativePath = configPath.startsWith('/') ? configPath.substring(1) : configPath;
    const fullPath = path.resolve(__dirname, '../public', relativePath);
    
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${key}: File exists at expected path: ${configPath}`);
    } else {
      console.error(`❌ ${key}: File NOT FOUND at expected path: ${configPath}`);
    }
  });
} catch (error) {
  console.error('Error checking configuration paths:', error.message);
}

// Check if paths in the copy script match with verify script
try {
  const copyScriptPath = path.resolve(__dirname, './copy-wasm-assets.js');
  
  if (fs.existsSync(copyScriptPath)) {
    console.log('\nFound copy-wasm-assets.js script. Checking content...');
    
    const copyScriptContent = fs.readFileSync(copyScriptPath, 'utf8');
    if (copyScriptContent.includes('tesseract-core.wasm') && 
        copyScriptContent.includes('tesseract-worker.js') && 
        copyScriptContent.includes('eng.traineddata')) {
      console.log('✅ copy-wasm-assets.js script includes all required files');
    } else {
      console.error('❌ copy-wasm-assets.js script is missing references to some required files');
    }
  } else {
    console.log('⚠️ copy-wasm-assets.js script not found. This script is recommended for copying Tesseract assets.');
  }
} catch (error) {
  console.error('Error checking copy script:', error.message);
}

if (!allFilesExist) {
  console.log('\n⚠️ Some required files are missing. You should run the copy-wasm-assets.js script:');
  console.log('node scripts/copy-wasm-assets.js');
}

console.log('\nSUGGESTIONS:');
console.log('1. Make sure tesseract-wasm is installed: npm install tesseract-wasm');
console.log('2. Run copy script: node scripts/copy-wasm-assets.js');
console.log('3. Check paths in tesseractConfig.ts match the actual file locations');
