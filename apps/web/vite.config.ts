import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss()
    ],
    build: {
        rollupOptions: {
            input: {
                popup: resolve(__dirname, "index.html"),
                background: resolve(__dirname, "src/utils/background.ts")
            },
            output: {
                entryFileNames: chunk => {
                    if(chunk.name === "background") return "background.js";
                    return "[name].js";
                }
            }
        },
        outDir: "dist",
        emptyOutDir: true
    }
})
