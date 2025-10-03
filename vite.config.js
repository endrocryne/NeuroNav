import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // We don't need to specify the manifest here because the plugin
      // will automatically pick up the `manifest.json` from the `public` directory.
    }),
  ],
  server: {
    proxy: {
      '/huggingface': {
        target: 'https://huggingface.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/huggingface/, ''),
      },
    },
  },
});
