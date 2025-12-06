import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: {
          port: 3000,
          clientPort: 3000,
        }
      },
      publicDir: 'assets',
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        },
        assetsInlineLimit: 0,
        rollupOptions: {
          output: {
            manualChunks: {
              react: ['react', 'react-dom'],
              reactflow: ['reactflow', '@reactflow/core', '@reactflow/controls', '@reactflow/background'],
              genai: ['@google/genai'],
              lucide: ['lucide-react']
            }
          }
        },
        chunkSizeWarningLimit: 1000
      }
    };
  });
