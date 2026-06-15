import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'plugin-inspect-react-code'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/fft-psx-vera-frontend/' : '/',
  plugins: [inspectAttr(), react()],
  server: {
    host: '0.0.0.0',
    port: Number(process.env.VITE_DEV_PORT || 5173),
    // Tailnet users commonly open http://<tailscale-hostname>:5173.
    // Allow those host headers instead of forcing the raw 100.x IP.
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:9091',
        changeOrigin: true,
      },
      // Backend-served images (character/job/custom avatars) live under /assets.
      // Without this, dev requests for /assets/... hit Vite (no such route) → 404
      // → blank avatars. Vite's own dev server doesn't use /assets, so this is safe.
      '/assets': {
        target: process.env.VITE_API_TARGET || 'http://localhost:9091',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
