const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');
const { URL } = require('url');

function downloadFile(url, outputPath, originalHost = null) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url, originalHost || undefined); // Handle relative redirect
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    const request = protocol.get(parsedUrl.toString(), (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        const redirectUrl = res.headers.location;
        const fullRedirectUrl = new URL(redirectUrl, parsedUrl.origin).toString();
        return downloadFile(fullRedirectUrl, outputPath, parsedUrl.origin).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        return reject(`Failed to download ${url}: ${res.statusCode}`);
      }

      const file = fs.createWriteStream(outputPath);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          console.log(`✔ Downloaded: ${outputPath}`);
          resolve();
        });
      });
    });

    request.on('error', (err) => {
      reject(`Error downloading ${url}: ${err.message}`);
    });
  });
}

const filesToDownload = [
  {
    url: 'https://unpkg.com/tesseract-wasm@latest/dist/tesseract-core.wasm',
    path: 'public/tesseract/tesseract-core.wasm',
  },
  {
    url: 'https://unpkg.com/tesseract-wasm@latest/dist/tesseract-core-fallback.wasm',
    path: 'public/tesseract/tesseract-core-fallback.wasm',
  },
  {
    url: 'https://unpkg.com/tesseract-wasm@latest/dist/tesseract-worker.js',
    path: 'public/tesseract/tesseract-worker.js',
  },
  {
    url: 'https://github.com/tesseract-ocr/tessdata_fast/raw/main/eng.traineddata',
    path: 'public/tessdata/eng.traineddata',
  }
];

(async () => {
  for (const file of filesToDownload) {
    try {
      await downloadFile(file.url, file.path);
    } catch (err) {
      console.error(`✘ Error downloading ${file.url}:`, err);
    }
  }
})();