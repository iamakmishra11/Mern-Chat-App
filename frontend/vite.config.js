import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Optional: Custom development server port
  },
  build: {
    outDir: 'dist', // Where the production files will be generated
  },
});
