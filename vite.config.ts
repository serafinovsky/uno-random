import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  base: process.env.NODE_ENV === "production" ? "/uno-random/" : "/",
  build: {
    target: "esnext",
    outDir: "dist",
    // SEO and performance optimizations
    rollupOptions: {
      output: {
        // Better chunk splitting for caching
        manualChunks: {
          vendor: ["solid-js"],
        },
        // Optimize chunk names for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split("/").pop()
            : "chunk";
          return `assets/[name]-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split(".") || ["asset"];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash].[ext]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash].[ext]`;
          }
          return `assets/[name]-[hash].[ext]`;
        },
      },
    },
    // Enable source maps for better debugging
    sourcemap: false,
    // Optimize for production
    minify: "esbuild",
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ["solid-js", "solid-js/web"],
  },
  // Server configuration
  server: {
    port: 5173,
    host: true,
    allowedHosts: ["localhost", "192.168.1.100", "e3bc9d02abe2.ngrok-free.app"],
  },
  // Preview configuration for testing production build
  preview: {
    port: 4173,
    host: true,
  },
});
