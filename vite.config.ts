import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "public/owner",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "owner.html"),
    },
  },
  base: "/owner/",
});
