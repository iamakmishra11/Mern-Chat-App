import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Local dev server port (optional)
  },
  build: {
    outDir: 'dist', // Output directory for the build
    emptyOutDir: true, // Clean the output directory before building
  },
});
