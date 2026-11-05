import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/api": {
        target: "https://gutendex.com",
        changeOrigin: true,
        proxyTimeout: 20000,
        timeout: 25000,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
