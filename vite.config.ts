
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Conditionally include the componentTagger plugin only in development mode
    // but import it dynamically to avoid ESM/CJS conflicts
    mode === 'development' && {
      name: 'dynamic-tagger',
      async configResolved() {
        // This creates a dynamic import which works with ESM modules
        try {
          const { componentTagger } = await import('lovable-tagger');
          return componentTagger();
        } catch (error) {
          console.warn('Could not load lovable-tagger:', error);
          return {};
        }
      }
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
