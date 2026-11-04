import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Resolve the proxy target through Vite's own env loader instead of Node's
  // `process` global, so the config type-checks on CI hosts that don't ship
  // @types/node. loadEnv also reads real environment variables with the VITE_ prefix.
  const env = loadEnv(mode, '.', 'VITE_');
  const backend = env.VITE_PROXY_TARGET ?? 'http://127.0.0.1:4000';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: '127.0.0.1',
      proxy: {
        '/api': { target: backend, changeOrigin: true },
        '/health': { target: backend, changeOrigin: true },
      },
    },
    preview: {
      port: 4173,
      proxy: {
        '/api': { target: backend, changeOrigin: true },
        '/health': { target: backend, changeOrigin: true },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            query: ['@tanstack/react-query'],
            charts: ['recharts'],
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
    },
  };
});
