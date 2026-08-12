import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Très important pour GitHub Pages
  build: {
    outDir: 'dist',
  }
});