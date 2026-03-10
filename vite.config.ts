import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
     
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      base: '/Excel-Operations-App/',
      build: {
        outDir: 'dist',
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GeminiAP),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.AIzaSyBWkjoLWNsaQ5UTLYRlHAKswkZKt8t4aEk)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
