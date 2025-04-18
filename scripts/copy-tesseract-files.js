
const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('Starting Tesseract file copy process...');

// Define source URLs for backup downloads with multiple fallbacks
const fileUrls = {
  'tesseract-worker.js': [
    'https://raw.githubusercontent.com/robertknight/tesseract-wasm/gh-pages/tesseract-worker.js',
    'https://github.com/zliide/tesseract-wasm/raw/master/dist/tesseract-worker.js',
    'https://unpkg.com/tesseract-wasm@0.10.0/dist/tesseract-worker.js'
  ],
  'tesseract-core.wasm': [
    'https://raw.githubusercontent.com/robertknight/tesseract-wasm/gh-pages/tesseract-core.wasm',
    'https://github.com/zliide/tesseract-wasm/raw/master/dist/tesseract-core.wasm',
    'https://unpkg.com/tesseract-wasm@0.10.0/dist/tesseract-core.wasm'
  ],
  'eng.traineddata': [
    'https://raw.githubusercontent.com/robertknight/tesseract-wasm/gh-pages/eng.traineddata',
    'https://github.com/tesseract-ocr/tessdata/raw/main/eng.traineddata',
    'https://unpkg.com/tesseract-wasm@0.10.0/tessdata/eng.traineddata'
  ]
};

// Create destination directory
const destDir = path.resolve(__dirname, '../public/tessdata');
if (!fs.existsSync(destDir)) {
  console.log(`Creating directory: ${destDir}`);
  fs.mkdirSync(destDir, { recursive: true });
}

// Create alternative destination for fallback
const rootDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(rootDir)) {
  console.log(`Creating directory: ${rootDir}`);
  fs.mkdirSync(rootDir, { recursive: true });
}

// Download a file with retries for multiple URLs
async function downloadFileWithRetry(urlArray, dest) {
  for (let i = 0; i < urlArray.length; i++) {
    const url = urlArray[i];
    console.log(`Attempt ${i+1} - Downloading ${url} to ${dest}`);
    
    try {
      await downloadFile(url, dest);
      
      // For WASM files, verify they're valid
      if (dest.endsWith('.wasm')) {
        console.log(`Verifying downloaded WASM file: ${dest}`);
        const isValid = isValidWasmFile(dest);
        if (!isValid) {
          console.error(`❌ Invalid WASM file downloaded from ${url}`);
          if (i === urlArray.length - 1) {
            throw new Error(`All download attempts produced invalid WASM files for ${dest}`);
          }
          console.log(`Trying next source...`);
          continue; // Skip to next URL since this one didn't work
        }
        console.log(`✅ Valid WASM file downloaded from ${url}`);
      }
      
      return true; // Download successful
    } catch (error) {
      console.error(`Error downloading from ${url}:`, error.message);
      if (i === urlArray.length - 1) {
        throw new Error(`All download attempts failed for ${dest}`);
      }
      console.log(`Trying next source...`);
    }
  }
  return false;
}

// Download a file
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    
    const request = https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        const redirectUrl = response.headers.location;
        console.log(`Following redirect to ${redirectUrl}`);
        file.close();
        fs.unlinkSync(dest);
        downloadFile(redirectUrl, dest).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
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
    });
    
    request.on('error', (err) => {
      if (fs.existsSync(dest)) {
        fs.unlinkSync(dest);
      }
      reject(err);
    });
    
    // Set a timeout of 30 seconds
    request.setTimeout(30000, () => {
      request.destroy();
      fs.unlinkSync(dest);
      reject(new Error(`Request timeout for ${url}`));
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
    const buffer = fs.readFileSync(filePath);
    
    // WebAssembly magic bytes: 0x00, 0x61, 0x73, 0x6D
    if (buffer.length < 4) {
      console.error(`❌ File too small: ${filePath} (${buffer.length} bytes)`);
      return false;
    }
    
    console.log(`Checking WASM file ${filePath} - First 4 bytes:`, 
      buffer[0].toString(16).padStart(2, '0'),
      buffer[1].toString(16).padStart(2, '0'),
      buffer[2].toString(16).padStart(2, '0'),
      buffer[3].toString(16).padStart(2, '0')
    );
    
    const isValid = buffer[0] === 0x00 && 
                    buffer[1] === 0x61 && 
                    buffer[2] === 0x73 && 
                    buffer[3] === 0x6D;
    
    if (!isValid) {
      console.error(`❌ Invalid WASM header in ${filePath}`);
      // Print the beginning of the file if it's a text file
      if (buffer[0] === 0x0A || buffer[0] === 0x3C || buffer[0] === 0x7B) {
        const content = buffer.slice(0, 100).toString('utf8');
        console.error('File begins with:', content);
      }
    }
    
    return isValid;
  } catch (error) {
    console.error(`Error checking WASM file ${filePath}:`, error);
    return false;
  }
}

// Copy files to the root public directory as fallback
async function copyToRootPublic() {
  try {
    console.log('Copying files to root public directory for fallback...');
    
    for (const [filename, _] of Object.entries(fileUrls)) {
      const sourcePath = path.join(destDir, filename);
      const destPath = path.join(rootDir, filename);
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Copied ${filename} to public root as fallback`);
      } else {
        console.error(`❌ Source file not found for fallback copy: ${sourcePath}`);
      }
    }
  } catch (error) {
    console.error('Error copying to root public:', error);
  }
}

// Download directly from node_modules as last resort
async function copyFromNodeModules() {
  console.log('Attempting to copy files from node_modules as last resort...');
  
  try {
    // Check if tesseract-wasm package is installed
    const nodeModulesPath = path.resolve(__dirname, '../node_modules/tesseract-wasm/dist');
    const trainingDataPath = path.resolve(__dirname, '../node_modules/tesseract-wasm/tessdata');
    
    if (fs.existsSync(nodeModulesPath)) {
      console.log('tesseract-wasm found in node_modules, copying files...');
      
      // Copy worker.js
      const workerSrc = path.join(nodeModulesPath, 'tesseract-worker.js');
      const workerDest = path.join(destDir, 'tesseract-worker.js');
      
      if (fs.existsSync(workerSrc)) {
        fs.copyFileSync(workerSrc, workerDest);
        console.log(`✅ Copied worker.js from node_modules`);
        
        // Also copy to root
        fs.copyFileSync(workerSrc, path.join(rootDir, 'tesseract-worker.js'));
      }
      
      // Copy wasm file
      const wasmSrc = path.join(nodeModulesPath, 'tesseract-core.wasm');
      const wasmDest = path.join(destDir, 'tesseract-core.wasm');
      
      if (fs.existsSync(wasmSrc)) {
        fs.copyFileSync(wasmSrc, wasmDest);
        console.log(`✅ Copied tesseract-core.wasm from node_modules`);
        
        // Also copy to root
        fs.copyFileSync(wasmSrc, path.join(rootDir, 'tesseract-core.wasm'));
        
        // Verify WASM file
        const isValid = isValidWasmFile(wasmDest);
        if (isValid) {
          console.log(`✅ WASM file from node_modules is valid`);
        } else {
          console.error(`❌ WASM file from node_modules is invalid!`);
        }
      }
      
      // Copy training data
      if (fs.existsSync(trainingDataPath)) {
        const trainSrc = path.join(trainingDataPath, 'eng.traineddata');
        const trainDest = path.join(destDir, 'eng.traineddata');
        
        if (fs.existsSync(trainSrc)) {
          fs.copyFileSync(trainSrc, trainDest);
          console.log(`✅ Copied eng.traineddata from node_modules`);
          
          // Also copy to root
          fs.copyFileSync(trainSrc, path.join(rootDir, 'eng.traineddata'));
        }
      }
    } else {
      console.log('tesseract-wasm not found in node_modules');
    }
  } catch (error) {
    console.error('Error copying from node_modules:', error);
  }
}

// Perform downloads
async function downloadFiles() {
  for (const [filename, urls] of Object.entries(fileUrls)) {
    const destPath = path.join(destDir, filename);
    
    try {
      await downloadFileWithRetry(urls, destPath);
      const stats = fs.statSync(destPath);
      console.log(`File ${filename} size: ${(stats.size / 1024).toFixed(2)} KB`);
      
      // Verify WASM file if applicable
      if (filename.endsWith('.wasm')) {
        const isValid = isValidWasmFile(destPath);
        if (!isValid) {
          console.error(`❌ ${filename} is not a valid WebAssembly file!`);
          console.log(`Deleting invalid file and trying direct download from unpkg...`);
          fs.unlinkSync(destPath);
          
          // Try a direct download from unpkg
          const directUrl = `https://unpkg.com/tesseract-wasm@0.10.0/dist/tesseract-core.wasm`;
          console.log(`Downloading from direct source: ${directUrl}`);
          await downloadFile(directUrl, destPath);
          
          const isValidNow = isValidWasmFile(destPath);
          if (!isValidNow) {
            console.error(`❌ Still not a valid WebAssembly file from direct unpkg!`);
          } else {
            console.log(`✅ Successfully downloaded valid WebAssembly file from unpkg!`);
          }
        }
      }
    } catch (error) {
      console.error(`Error downloading ${filename}:`, error.message);
    }
  }
  
  await copyToRootPublic();
  
  // As a last resort, try to copy files directly from node_modules
  let needNodeModules = false;
  
  for (const filename of Object.keys(fileUrls)) {
    const filePath = path.join(destDir, filename);
    if (!fs.existsSync(filePath)) {
      needNodeModules = true;
      break;
    }
    
    // Also check if WASM file is valid
    if (filename.endsWith('.wasm') && !isValidWasmFile(filePath)) {
      needNodeModules = true;
      break;
    }
  }
  
  if (needNodeModules) {
    await copyFromNodeModules();
  }
  
  console.log('Download process complete');
  
  // Verify files
  let allFilesExist = true;
  let wasmIsValid = true;
  
  for (const filename of Object.keys(fileUrls)) {
    const filePath = path.join(destDir, filename);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`✅ ${filename}: Found (${(stats.size / 1024).toFixed(2)} KB)`);
      
      // Verify WASM file
      if (filename.endsWith('.wasm')) {
        wasmIsValid = isValidWasmFile(filePath);
        if (!wasmIsValid) {
          console.error(`❌ ${filename}: INVALID FORMAT`);
        }
      }
    } else {
      console.error(`❌ ${filename}: MISSING`);
      allFilesExist = false;
    }
  }
  
  if (allFilesExist && wasmIsValid) {
    console.log('\n✅ All Tesseract files are ready to use!');
  } else {
    console.error('\n❌ Some files are missing or invalid. OCR functionality may not work correctly.');
  }
}

// Run the download process
downloadFiles().catch(error => {
  console.error('Download process failed:', error);
  process.exit(1);
});
