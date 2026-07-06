import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    include: ['src/**/*.test.{js,jsx}'],
  },
  resolve: {
    alias: {
      '#components': path.resolve(__dirname, './src/components'),
      '#hooks': path.resolve(__dirname, './src/hooks'),
      '#api': path.resolve(__dirname, './src/api'),
      '#pages': path.resolve(__dirname, './src/pages'),
      '#utils': path.resolve(__dirname, './src/utils'),
      '#context': path.resolve(__dirname, './src/context'),
      '#assets': path.resolve(__dirname, './src/assets')
    }
  }
});
