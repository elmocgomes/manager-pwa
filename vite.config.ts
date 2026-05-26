import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Base path is configurable so the same build works on both hosts:
//   - Cloudflare Pages / custom domain (root):   BASE_PATH unset → '/'
//   - GitHub Pages (project subpath):            BASE_PATH=/manager-pwa/
// The PWA scope + start_url must match the base, so derive them from it.
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Manager Dashboard',
        short_name: 'Manager',
        theme_color: '#0d1117',
        background_color: '#0d1117',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'] },
    }),
  ],
});
