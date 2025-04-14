
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

console.log('Starting Tesseract WASM asset verification...');
console.log('Current working directory:', process.cwd());

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
  { name: 'tesseract-core.wasm', path: 'tesseract-core.wasm', minSize: 1024 * 1024 }, // At least 1MB
  { name: 'tesseract-worker.js', path: 'tesseract-worker.js', minSize: 10 * 1024 }, // At least 10KB
  { name: 'eng.traineddata', path: 'eng.traineddata', minSize: 10 * 1024 * 1024 } // At least 10MB
];

// Function to download a file if it's missing
const downloadFile = (url, destination) => {
  console.log(`Attempting to download ${url} to ${destination}...`);
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Successfully downloaded ${url}`);
          resolve();
        });
      } else {
        fs.unlink(destination, () => {}); // Delete the file if download failed
        console.error(`Failed to download ${url}: ${response.statusCode} ${response.statusMessage}`);
        reject(new Error(`Failed to download file: ${response.statusCode} ${response.statusMessage}`));
      }
    }).on('error', (err) => {
      fs.unlink(destination, () => {}); // Delete the file if download failed
      console.error(`Error downloading ${url}:`, err.message);
      reject(err);
    });
  });
};

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
let allFilesValid = true;

// First, check if files exist and have the right sizes
requiredFiles.forEach(file => {
  const filePath = path.join(publicTessDataDir, file.path);
  
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file.name}: Found (${(stats.size / 1024).toFixed(2)} KB)`);
    
    // Check file size
    if (stats.size < file.minSize) {
      console.error(`❌ ${file.name}: File is too small! Expected at least ${(file.minSize / 1024).toFixed(2)} KB but got ${(stats.size / 1024).toFixed(2)} KB`);
      allFilesValid = false;
    }
  } else {
    console.error(`❌ ${file.name}: NOT FOUND at ${filePath}`);
    allFilesExist = false;
  }
});

// Verify file content (basic checks for expected file types)
if (allFilesExist) {
  console.log('\nVerifying file content signatures...');
  
  // Check worker JS file
  const workerPath = path.join(publicTessDataDir, 'tesseract-worker.js');
  if (fs.existsSync(workerPath)) {
    try {
      const workerContent = fs.readFileSync(workerPath, 'utf8');
      if (!workerContent.includes('function') || !workerContent.includes('onmessage')) {
        console.error('❌ tesseract-worker.js: File doesn\'t appear to be a valid worker script');
        allFilesValid = false;
      } else {
        console.log('✅ tesseract-worker.js: Content signature looks valid');
      }
    } catch (error) {
      console.error(`Error reading tesseract-worker.js:`, error.message);
    }
  }
  
  // Check WASM file (just check first few bytes for WASM signature)
  const wasmPath = path.join(publicTessDataDir, 'tesseract-core.wasm');
  if (fs.existsSync(wasmPath)) {
    try {
      const wasmBuffer = fs.readFileSync(wasmPath);
      // Check for WASM magic bytes: 0x00 0x61 0x73 0x6D (byte value for \\0ASM)
      if (wasmBuffer.length >= 4 && 
          wasmBuffer[0] === 0x00 && 
          wasmBuffer[1] === 0x61 && 
          wasmBuffer[2] === 0x73 && 
          wasmBuffer[3] === 0x6D) {
        console.log('✅ tesseract-core.wasm: Content signature looks valid (WASM header detected)');
      } else {
        console.error('❌ tesseract-core.wasm: File doesn\'t appear to be a valid WASM binary');
        allFilesValid = false;
      }
    } catch (error) {
      console.error(`Error reading tesseract-core.wasm:`, error.message);
    }
  }
  
  // Check traineddata file (just check it's a large binary file)
  const trainedDataPath = path.join(publicTessDataDir, 'eng.traineddata');
  if (fs.existsSync(trainedDataPath)) {
    try {
      const stats = fs.statSync(trainedDataPath);
      if (stats.size > 5 * 1024 * 1024) { // Trained data should be several MB
        console.log('✅ eng.traineddata: Size looks appropriate for a trained data file');
      } else {
        console.warn('⚠️ eng.traineddata: File size is smaller than expected. This might not be a complete trained data file.');
      }
    } catch (error) {
      console.error(`Error reading eng.traineddata:`, error.message);
    }
  }
}

// Load and check the configuration paths
try {
  console.log('\nVerifying paths from expected configuration:');
  Object.entries(expectedPaths).forEach(([key, configPath]) => {
    // Remove leading slash and construct the full path
    const relativePath = configPath.startsWith('/') ? configPath.substring(1) : configPath;
    const fullPath = path.resolve(__dirname, '../public', relativePath);
    
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      console.log(`✅ ${key}: File exists at expected path: ${configPath} (${(stats.size / 1024).toFixed(2)} KB)`);
    } else {
      console.error(`❌ ${key}: File NOT FOUND at expected path: ${configPath}`);
      console.log(`   Expected full path: ${fullPath}`);
    }
  });
} catch (error) {
  console.error('Error checking configuration paths:', error.message);
}

// Show helpful messages based on verification results
if (!allFilesExist || !allFilesValid) {
  console.log('\n⚠️ Some required files are missing or invalid!');
  console.log('\nTROUBLESHOOTING STEPS:');
  console.log('1. Make sure tesseract-wasm is installed: npm install tesseract-wasm');
  console.log('2. Run copy script: node scripts/copy-wasm-assets.js');
  console.log('3. Check paths in tesseractConfig.ts match the actual file locations');
  console.log('4. If files still missing, manually download and place in public/tessdata/');
  console.log('\nSuggested manual download sources:');
  console.log('- Worker and WASM: https://github.com/zliide/tesseract-wasm/tree/master/dist');
  console.log('- Training data: https://github.com/tesseract-ocr/tessdata/blob/main/eng.traineddata');
} else {
  console.log('\n✅ All required Tesseract WASM files are present and appear valid!');
  console.log('Your OCR system should be ready to use.');
}

// Provide next steps
console.log('\nNEXT STEPS:');
console.log('1. Verify browser compatibility (WASM support)');
console.log('2. Check for CORS issues if files are served from different origin');
console.log('3. Test with a known good image file to confirm OCR functionality');
console.log('4. Review browser console for detailed error messages during OCR operations');
console.log('5. For more languages, add additional traineddata files to /public/tessdata/');

// Export status for GitHub Actions
if (!allFilesExist || !allFilesValid) {
  process.exit(1); // Exit with error
} else {
  process.exit(0); // Exit successfully
}
