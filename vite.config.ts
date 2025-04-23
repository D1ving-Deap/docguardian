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
      allow: ['..', '../node_modules']
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
    // Enhanced WASM file copying plugin
    {
      name: 'wasm-file-handler',
      apply: 'build',
      async buildStart() {
        // Copy files to both /assets/ and /tessdata/ for maximum compatibility
        const publicDir = path.resolve(__dirname, 'public');
        const tessDataDir = path.join(publicDir, 'tessdata');
        const assetsDir = path.join(publicDir, 'assets');
        
        [tessDataDir, assetsDir].forEach(dir => {
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
        });

        const sourceDir = path.resolve(__dirname, 'node_modules/tesseract-wasm/dist');
        if (fs.existsSync(sourceDir)) {
          ['tesseract-core.wasm', 'tesseract-worker.js'].forEach(file => {
            const sourcePath = path.join(sourceDir, file);
            if (fs.existsSync(sourcePath)) {
              // Copy to both /assets/ and /tessdata/
              fs.copyFileSync(sourcePath, path.join(assetsDir, file));
              fs.copyFileSync(sourcePath, path.join(tessDataDir, file));
              console.log(`Copied ${file} to both /assets/ and /tessdata/`);
            }
          });

          // Also copy training data
          const trainingDataSource = path.resolve(__dirname, 'node_modules/tesseract-wasm/tessdata/eng.traineddata');
          if (fs.existsSync(trainingDataSource)) {
            fs.copyFileSync(trainingDataSource, path.join(tessDataDir, 'eng.traineddata'));
            fs.copyFileSync(trainingDataSource, path.join(assetsDir, 'eng.traineddata'));
            console.log('Copied training data to both locations');
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
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.wasm')) {
            // Ensure WASM files go to both /assets/ and /tessdata/
            return 'assets/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  
  // Explicitly include WASM and training data files
  assetsInclude: ['**/*.wasm', '**/*.traineddata'],
  
  optimizeDeps: {
    exclude: ['tesseract-wasm'], // Exclude from optimization to prevent WASM issues
  },
}));
