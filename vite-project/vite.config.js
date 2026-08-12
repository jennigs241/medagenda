import { defineConfig } from 'vite';

export default defineConfig({
  // Utiliser des chemins relatifs pour éviter les erreurs 404
  base: './',
  build: {
    outDir: 'dist',
  }
});