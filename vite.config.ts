import { reactRouter } from "@react-router/dev/vite";
import path from "path";
import { defineConfig } from "vite";

const __dirname = import.meta.dirname;

export default defineConfig({
  plugins: [reactRouter()],
  server: {
    // Vercel dev proxy and Docker inject PORT; default 3000 locally
    port: Number(process.env.PORT ?? 3000),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@contracts": path.resolve(__dirname, "./contracts"),
      "@db": path.resolve(__dirname, "./db"),
      db: path.resolve(__dirname, "./db"),
    },
  },
  envDir: path.resolve(__dirname),
});
