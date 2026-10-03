import { vercelPreset } from "@vercel/react-router/vite";
import type { Config } from "@react-router/dev/config";

export default {
  // Server-side render every route (SEO: real HTML in page source).
  ssr: true,
  // The Vercel preset reorganizes the server build for Vercel Functions
  // bundle-splitting; only apply it when building on Vercel (VERCEL=1),
  // so local/Docker builds keep the standard build/server/index.js layout
  // that react-router-serve expects.
  presets: process.env.VERCEL ? [vercelPreset()] : [],
} satisfies Config;
