
// vite.config.ts
import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
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
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    assetsInlineLimit: 0, // Prevent WASM inlining
  },
  assetsInclude: ['**/*.wasm', '**/*.traineddata'], // Explicitly include WASM and training data files
  optimizeDeps: {
    exclude: ['tesseract-wasm'],
  },
}));
