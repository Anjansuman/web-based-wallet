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
                background: resolve(__dirname, "src/utils/background.ts"),
                "content-script": resolve(__dirname, "src/utils/content-script.ts"),
                "injected": resolve(__dirname, "src/utils/injected.ts"),
            },
            output: {
                entryFileNames: `[name].js`, // remove hash
            }
        },
        outDir: "dist",
        emptyOutDir: true
    }
})
