import fs from 'fs';
import path from 'path';
const https = require('https');

console.log('Starting Tesseract WASM assets copy process...');
console.log('Current working directory:', process.cwd());

const sourceDir = path.resolve(__dirname, '../node_modules/tesseract-wasm/dist');
const destDir = path.resolve(__dirname, '../public/tessdata');
const backupSourceUrls = {
  'tesseract-core.wasm': 'https://raw.githubusercontent.com/zliide/tesseract-wasm/master/dist/tesseract-core.wasm',
  'tesseract-worker.js': 'https://raw.githubusercontent.com/zliide/tesseract-wasm/master/dist/tesseract-worker.js',
  'eng.traineddata': 'https://github.com/tesseract-ocr/tessdata/raw/main/eng.traineddata'
};

console.log(`Source directory: ${sourceDir}`);
console.log(`Destination directory: ${destDir}`);

// Create a fallback version of the core WASM file
const createFallbackWasm = () => {
  const sourcePath = path.join(destDir, 'tesseract-core.wasm');
  const destPath = path.join(destDir, 'tesseract-core-fallback.wasm');
  
  if (fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, destPath);
      const stats = fs.statSync(destPath);
      console.log(`✅ Created fallback WASM file at ${destPath} (${stats.size} bytes)`);
    } catch (error) {
      console.error(`❌ Error creating fallback WASM file: ${error.message}`);
    }
  } else {
    console.error('❌ Cannot create fallback WASM: Source file not found');
  }
};

// Function to download a file
const downloadFile = (url, destination) => {
  console.log(`Downloading from ${url}...`);
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ Successfully downloaded to ${destination}`);
          resolve(true);
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        file.close();
        fs.unlinkSync(destination);
        console.log(`Following redirect to ${response.headers.location}`);
        downloadFile(response.headers.location, destination)
          .then(resolve)
          .catch(reject);
      } else {
        file.close();
        fs.unlinkSync(destination);
        console.error(`❌ Download failed: ${response.statusCode} ${response.statusMessage}`);
        reject(new Error(`Failed to download file: ${response.statusCode} ${response.statusMessage}`));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlinkSync(destination);
      console.error(`❌ Download error: ${err.message}`);
      reject(err);
    });
  });
};

// Check if source directory exists
if (!fs.existsSync(sourceDir)) {
  console.error(`❌ Source directory not found: ${sourceDir}`);
  console.log('Will attempt to download files from GitHub instead.');
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

// Copy or download each file
const copyPromises = filesToCopy.map(async (file) => {
  const sourcePath = path.join(sourceDir, file);
  const destPath = path.join(destDir, file);
  
  // First try to copy from node_modules
  if (fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, destPath);
      const stats = fs.statSync(destPath);
      console.log(`✅ Copied ${file} to ${destPath} (${stats.size} bytes)`);
      return true;
    } catch (error) {
      console.error(`❌ Error copying ${file}: ${error.message}`);
    }
  }
  
  // If copy failed or source doesn't exist, try downloading
  if (backupSourceUrls[file]) {
    try {
      console.log(`Attempting to download ${file} from GitHub...`);
      await downloadFile(backupSourceUrls[file], destPath);
      return true;
    } catch (error) {
      console.error(`❌ Failed to download ${file}: ${error.message}`);
      return false;
    }
  } else {
    console.error(`❌ No backup URL for ${file}`);
    return false;
  }
});

// Copy training data for English
const trainingDataSourcePath = path.resolve(__dirname, '../node_modules/tesseract-wasm/tessdata/eng.traineddata');
const trainingDataDestPath = path.join(destDir, 'eng.traineddata');

const copyTrainingData = async () => {
  if (fs.existsSync(trainingDataSourcePath)) {
    try {
      fs.copyFileSync(trainingDataSourcePath, trainingDataDestPath);
      const stats = fs.statSync(trainingDataDestPath);
      console.log(`✅ Copied eng.traineddata to ${trainingDataDestPath} (${stats.size} bytes)`);
      return true;
    } catch (error) {
      console.error(`❌ Error copying training data: ${error.message}`);
    }
  } else {
    console.log(`❌ Training data not found at: ${trainingDataSourcePath}`);
  }
  
  // Try downloading from GitHub
  try {
    console.log('Attempting to download training data from GitHub...');
    await downloadFile(backupSourceUrls['eng.traineddata'], trainingDataDestPath);
    return true;
  } catch (error) {
    console.error(`❌ Failed to download training data: ${error.message}`);
    return false;
  }
};

// Run all copy operations and create fallback WASM
Promise.all([...copyPromises, copyTrainingData()])
  .then(results => {
    // Create fallback version of core WASM
    createFallbackWasm();
    
    // Verify the copied files
    console.log('\nVerifying copied files:');
    const allFiles = [...filesToCopy, 'eng.traineddata', 'tesseract-core-fallback.wasm'];
    
    let allSuccessful = true;
    allFiles.forEach(file => {
      const filePath = path.join(destDir, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`✅ ${file} exists at ${filePath} (${(stats.size / 1024).toFixed(2)} KB)`);
        
        // Check file size to make sure it's not empty or truncated
        if (stats.size < 1024) { // Less than 1KB is suspicious
          console.warn(`⚠️ Warning: ${file} is suspiciously small (${stats.size} bytes)`);
        }
      } else {
        console.error(`❌ ${file} is missing at ${filePath}`);
        allSuccessful = false;
      }
    });
    
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
        allSuccessful = false;
      }
    });
    
    if (allSuccessful) {
      console.log('\n✅ All files successfully copied and verified!');
    } else {
      console.error('\n❌ Some files are missing or invalid. OCR functionality may not work correctly.');
      console.log('Try running this script with administrator privileges or manually downloading the files.');
    }
    
    console.log('\nFinished Tesseract WASM assets copy process!');
  })
  .catch(error => {
    console.error('Error during copy process:', error);
  });
