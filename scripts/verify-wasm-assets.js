const fs = require('fs');
 const path = require('path');
 const https = require('https');
 const http = require('http');
 
 console.log('Starting Tesseract WASM asset verification...');
 console.log('Current working directory:', process.cwd());
 
 // Define the directory for Tesseract assets
 const publicTessDataDir = path.resolve(process.cwd(), './public/tessdata');
 console.log('Checking WASM assets in:', publicTessDataDir);
 
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
 
 // Call the async function and handle errors
 verifyAssets().catch(error => {
   console.error("Error during asset verification:", error);
   process.exit(1); // Exit with an error code to signal failure
 });
 // Main function to verify assets
 async function main() {
   try {
     // Download missing files
     for (const file of requiredFiles) {
       const filePath = path.join(publicTessDataDir, file.path);
       if (!fs.existsSync(filePath)) {
         console.log(`Downloading missing file: ${file.name}`);
         await downloadFile(file.url, filePath);
       }
     }
 
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
 
     // Load and check the configuration paths
     console.log('\nVerifying paths from expected configuration:');
     Object.entries(expectedPaths).forEach(([key, configPath]) => {
       const relativePath = configPath.startsWith('/') ? configPath.substring(1) : configPath;
       const fullPath = path.resolve(process.cwd(), './public', relativePath);
 
       if (fs.existsSync(fullPath)) {
         const stats = fs.statSync(fullPath);
         console.log(`✅ ${key}: File exists at expected path: ${configPath} (${(stats.size / 1024).toFixed(2)} KB)`);
       } else {
         console.error(`❌ ${key}: File NOT FOUND at expected path: ${configPath}`);
       }
     });
 
     // Exit with appropriate code for CI/CD
     if (!allFilesExist || !allFilesValid) {
       console.log('\n⚠️ Some required files are missing or invalid!');
       process.exit(1); // Exit with error
     } else {
       console.log('\n✅ All required Tesseract WASM files are present and appear valid!');
       process.exit(0); // Exit successfully
     }
   } catch (error) {
     console.error('Error during asset verification:', error);
     process.exit(1); // Exit with error
   }
 }
 
 // Execute the main function
 main();
