import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
var backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: backendUrl,
                changeOrigin: true,
            },
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
    },
});
