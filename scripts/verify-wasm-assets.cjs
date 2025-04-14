const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

console.log('📦 Starting Tesseract WASM asset verification...');
console.log('📁 Current working directory:', process.cwd());

// Define the directory for Tesseract assets
const publicTessDataDir = path.resolve(process.cwd(), './public/tessdata');
console.log('📂 Checking WASM assets in:', publicTessDataDir);

// Define expected configuration paths
const expectedPaths = {
  workerPath: '/tessdata/tesseract-worker.js',
  corePath: '/tessdata/tesseract-core.wasm',
  trainingDataPath: '/tessdata/eng.traineddata'
};

// List of required files to check
const requiredFiles = [
  {
    name: 'tesseract-core.wasm',
    path: 'tesseract-core.wasm',
    minSize: 1024 * 1024, // 1MB
    url: 'https://github.com/zliide/tesseract-wasm/raw/master/dist/tesseract-core.wasm',
  },
  {
    name: 'tesseract-worker.js',
    path: 'tesseract-worker.js',
    minSize: 10 * 1024, // 10KB
    url: 'https://github.com/zliide/tesseract-wasm/raw/master/dist/tesseract-worker.js',
  },
  {
    name: 'eng.traineddata',
    path: 'eng.traineddata',
    minSize: 10 * 1024 * 1024, // 10MB
    url: 'https://github.com/tesseract-ocr/tessdata/raw/main/eng.traineddata',
  },
];

// Function to download files
async function downloadFile(url, dest) {
  const protocol = url.startsWith('https') ? https : http;
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

// Main function to verify assets
async function main() {
  try {
    // Ensure the directory exists
    if (!fs.existsSync(publicTessDataDir)) {
      console.log('🛠️ Creating tessdata directory...');
      fs.mkdirSync(publicTessDataDir, { recursive: true });
    }

    // Download missing files
    for (const file of requiredFiles) {
      const filePath = path.join(publicTessDataDir, file.path);
      if (!fs.existsSync(filePath)) {
        console.log(`⬇️ Downloading missing file: ${file.name}`);
        await downloadFile(file.url, filePath);
      }
    }

    let allFilesExist = true;
    let allFilesValid = true;

    // Verify required files
    for (const file of requiredFiles) {
      const filePath = path.join(publicTessDataDir, file.path);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`✅ ${file.name}: Found (${(stats.size / 1024).toFixed(2)} KB)`);

        if (stats.size < file.minSize) {
          console.error(`❌ ${file.name}: File too small! (${(stats.size / 1024).toFixed(2)} KB)`);
          allFilesValid = false;
        }
      } else {
        console.error(`❌ ${file.name}: MISSING at ${filePath}`);
        allFilesExist = false;
      }
    }

    // Verify expected paths
    console.log('\n🔍 Verifying configuration paths...');
    Object.entries(expectedPaths).forEach(([key, configPath]) => {
      const relativePath = configPath.startsWith('/') ? configPath.slice(1) : configPath;
      const fullPath = path.join('./public', relativePath);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        console.log(`✅ ${key}: Found (${(stats.size / 1024).toFixed(2)} KB)`);
      } else {
        console.error(`❌ ${key}: NOT FOUND at ${configPath}`);
      }
    });

    // CI exit codes
    if (!allFilesExist || !allFilesValid) {
      console.log('\n⚠️ One or more files are missing or invalid!');
      process.exit(1);
    } else {
      console.log('\n🎉 All Tesseract WASM files are present and valid!');
      process.exit(0);
    }

  } catch (err) {
    console.error('❌ Error during verification:', err);
    process.exit(1);
  }
}

// Run the main function
main();
