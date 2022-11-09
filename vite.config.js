import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import ElementPlus from 'unplugin-element-plus/vite'
import { resolve } from 'path';


export default defineConfig({
    base: '',
    build: {
        sourcemap: true,
    },
    plugins: [
        vue(),
        ElementPlus(),
    ],
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src"),
        }
    }
});