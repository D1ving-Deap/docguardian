
// vite.config.ts
import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from 'fs';

export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    fs: {
      // Allow serving files from node_modules to handle WASM files
      allow: ['..']
    }
  },
  base: '/', // Force root-relative path resolution
  plugins: [
    react(),
    // Dynamically load development plugins
    mode === 'development' && {
      name: 'dynamic-tagger',
      async configResolved(config) {
        try {
          const { componentTagger } = await import('lovable-tagger');
          const plugin = componentTagger();
          if (typeof plugin.configResolved === 'function') {
            await plugin.configResolved(config);
          } else if (plugin.configResolved?.handler) {
            await plugin.configResolved.handler(config);
          }
        } catch (e) {
          console.warn('Failed to load tagger plugin:', e);
        }
      }
    } as Plugin,
    // Custom plugin to copy WASM files during build
    {
      name: 'copy-wasm-files',
      buildStart() {
        // We'll run the actual copying when the build starts
        console.log('Ensuring WASM files are available...');
        const publicDir = path.resolve(__dirname, 'public/tessdata');
        
        // Make sure the directory exists
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
          console.log('Created tessdata directory in public');
        }
        
        // Copy files from node_modules if needed
        const sourceDir = path.resolve(__dirname, 'node_modules/tesseract-wasm/dist');
        if (fs.existsSync(sourceDir)) {
          try {
            ['tesseract-core.wasm', 'tesseract-worker.js'].forEach(file => {
              const sourcePath = path.join(sourceDir, file);
              const destPath = path.join(publicDir, file);
              
              if (fs.existsSync(sourcePath) && !fs.existsSync(destPath)) {
                fs.copyFileSync(sourcePath, destPath);
                console.log(`Copied ${file} to public/tessdata/`);
              }
            });
            
            // Also copy training data if needed
            const trainingDataSource = path.resolve(__dirname, 'node_modules/tesseract-wasm/tessdata/eng.traineddata');
            const trainingDataDest = path.join(publicDir, 'eng.traineddata');
            
            if (fs.existsSync(trainingDataSource) && !fs.existsSync(trainingDataDest)) {
              fs.copyFileSync(trainingDataSource, trainingDataDest);
              console.log(`Copied eng.traineddata to public/tessdata/`);
            }
          } catch (error) {
            console.error('Error copying WASM files:', error);
          }
        }
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    assetsInlineLimit: 0, // Prevent WASM inlining
    rollupOptions: {
      output: {
        // Ensure WASM files are properly named and handled
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.wasm')) {
            return 'assets/wasm/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  assetsInclude: ['**/*.wasm', '**/*.traineddata'], // Explicitly include WASM and training data files
  optimizeDeps: {
    exclude: ['tesseract-wasm'],
  },
}));
