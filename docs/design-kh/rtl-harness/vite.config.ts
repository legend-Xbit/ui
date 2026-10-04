import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwind from "@tailwindcss/vite"
import path from "node:path"
const v = process.env.VARIANT ?? "migrated"
export default defineConfig({
  // One dependency cache per variant: three servers sharing one cache dir fight over
  // re-optimisation and reload each other's pages.
  cacheDir: path.resolve(__dirname, `node_modules/.vite-${v}`),
  plugins: [react(), tailwind()],
  resolve: { alias: {
    "@/registry/new-york-v4": path.resolve(__dirname, "variants", v),
    cn: path.resolve(__dirname, "src/cn.ts"),
  } },
  server: { port: Number(process.env.PORT ?? 5173), host: "127.0.0.1" },
})
