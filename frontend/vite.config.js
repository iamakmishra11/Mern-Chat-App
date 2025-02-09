import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Development server port (local only)
  },
  build: {
    outDir: 'dist', // Output folder for production files
    emptyOutDir: true, // Clears old files before build
  },
});
