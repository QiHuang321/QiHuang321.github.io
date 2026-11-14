import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('./', import.meta.url));
const assetRoot = path.resolve(root, '../assets');
function existingAssets() {
  return { name: 'existing-site-assets', configureServer(server) {
    server.middlewares.use((req, res, next) => {
      let url;
      try { url = decodeURIComponent((req.url || '').split('?')[0]); } catch { return next(); }
      if (!url.startsWith('/assets/')) return next();
      const file = path.resolve(assetRoot, url.slice(8));
      if (!file.startsWith(assetRoot + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return next();
      const types = { '.pdf': 'application/pdf', '.webp': 'image/webp', '.avif': 'image/avif', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2' };
      res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
      res.setHeader('Content-Length', fs.statSync(file).size);
      fs.createReadStream(file).pipe(res);
    });
  }};
}
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), existingAssets()],
  define: { 'import.meta.env.VITE_BUILD_DATE': JSON.stringify(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())) },
  base: '/',
  publicDir: false,
  server: { host: '127.0.0.1' },
  build: { assetsDir: 'assets/app', rollupOptions: isSsrBuild ? {} : { input: { main: path.resolve(root, 'index.html'), personal: path.resolve(root, 'personal/index.html') } } },
}));
