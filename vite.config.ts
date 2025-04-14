
import { defineConfig, Plugin } from "vite";
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
      async configResolved(config) {
        // This creates a dynamic import which works with ESM modules
        try {
          const { componentTagger } = await import('lovable-tagger');
          const plugin = componentTagger();
          // Apply the plugin configuration but don't return anything (void)
          if (plugin.configResolved) {
            await plugin.configResolved(config);
          }
        } catch (error) {
          console.warn('Could not load lovable-tagger:', error);
        }
        // Return void to match the expected return type
      }
    } as Plugin,
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
