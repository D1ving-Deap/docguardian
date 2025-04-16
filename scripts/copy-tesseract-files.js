
const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('Starting Tesseract file copy process...');

// Define source URLs for backup downloads
const fileUrls = {
  'tesseract-worker.js': 'https://raw.githubusercontent.com/robertknight/tesseract-wasm/gh-pages/tesseract-worker.js',
  'tesseract-core.wasm': 'https://raw.githubusercontent.com/robertknight/tesseract-wasm/gh-pages/tesseract-core.wasm',
  'eng.traineddata': 'https://raw.githubusercontent.com/robertknight/tesseract-wasm/gh-pages/eng.traineddata'
};

// Create destination directory
const destDir = path.resolve(__dirname, '../public/tessdata');
if (!fs.existsSync(destDir)) {
  console.log(`Creating directory: ${destDir}`);
  fs.mkdirSync(destDir, { recursive: true });
}

// Download a file
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} to ${dest}`);
    
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Successfully downloaded ${url}`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlinkSync(dest);
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

// Check if a WASM file is valid
function isValidWasmFile(filePath) {
  try {
    // Check file exists
    if (!fs.existsSync(filePath)) {
      return false;
    }
    
    // Read the first 4 bytes and check for WebAssembly magic bytes
    const buffer = fs.readFileSync(filePath, { encoding: null, flag: 'r' });
    // WebAssembly magic bytes: 0x00, 0x61, 0x73, 0x6D
    return buffer.length >= 4 && 
           buffer[0] === 0x00 && 
           buffer[1] === 0x61 && 
           buffer[2] === 0x73 && 
           buffer[3] === 0x6D;
  } catch (error) {
    console.error(`Error checking WASM file ${filePath}:`, error);
    return false;
  }
}

// Perform downloads
async function downloadFiles() {
  for (const [filename, url] of Object.entries(fileUrls)) {
    const destPath = path.join(destDir, filename);
    
    try {
      await downloadFile(url, destPath);
      const stats = fs.statSync(destPath);
      console.log(`File ${filename} size: ${(stats.size / 1024).toFixed(2)} KB`);
      
      // Verify WASM file if applicable
      if (filename.endsWith('.wasm')) {
        const isValid = isValidWasmFile(destPath);
        if (!isValid) {
          console.error(`❌ ${filename} is not a valid WebAssembly file!`);
          console.log(`Deleting invalid file and trying alternative source...`);
          fs.unlinkSync(destPath);
          
          // Try an alternative source
          const altUrl = 'https://github.com/zliide/tesseract-wasm/raw/master/dist/tesseract-core.wasm';
          console.log(`Downloading from alternative source: ${altUrl}`);
          await downloadFile(altUrl, destPath);
          
          const isValidNow = isValidWasmFile(destPath);
          if (!isValidNow) {
            console.error(`❌ Still not a valid WebAssembly file from alternative source!`);
          } else {
            console.log(`✅ Successfully downloaded valid WebAssembly file from alternative source!`);
          }
        }
      }
    } catch (error) {
      console.error(`Error downloading ${filename}:`, error.message);
    }
  }
  
  console.log('Download process complete');
  
  // Verify files
  let allFilesExist = true;
  for (const filename of Object.keys(fileUrls)) {
    const filePath = path.join(destDir, filename);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`✅ ${filename}: Found (${(stats.size / 1024).toFixed(2)} KB)`);
    } else {
      console.error(`❌ ${filename}: MISSING`);
      allFilesExist = false;
    }
  }
  
  if (allFilesExist) {
    console.log('\n✅ All Tesseract files are ready to use!');
  } else {
    console.error('\n❌ Some files are missing. OCR functionality may not work correctly.');
  }
}

// Run the download process
downloadFiles().catch(error => {
  console.error('Download process failed:', error);
  process.exit(1);
});
