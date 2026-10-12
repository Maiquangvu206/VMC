import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

function copyToPublicPlugin() {
  return {
    name: 'copy-to-public-plugin',
    closeBundle() {
      try {
        const distAssets = path.resolve('dist', 'assets');
        const publicAssets = path.resolve('public', 'assets');
        const distIndex = path.resolve('dist', 'index.html');
        const publicIndex = path.resolve('public', 'index.html');

        if (fs.existsSync(distAssets)) {
          if (!fs.existsSync(publicAssets)) {
            fs.mkdirSync(publicAssets, { recursive: true });
          } else {
            fs.rmSync(publicAssets, { recursive: true, force: true });
            fs.mkdirSync(publicAssets, { recursive: true });
          }
          fs.cpSync(distAssets, publicAssets, { recursive: true });
        }

        if (fs.existsSync(distIndex)) {
          fs.copyFileSync(distIndex, publicIndex);
        }
      } catch (err) {
        console.warn('Sync to public failed:', err.message);
      }
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    copyToPublicPlugin()
  ],
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});