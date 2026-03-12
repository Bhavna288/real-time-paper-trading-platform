import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BACKEND = 'http://localhost:3001';

// Suppress noisy ws proxy errors (EPIPE/ECONNRESET when client or backend closes the socket)
function suppressWsProxyErrors() {
  return {
    name: 'suppress-ws-proxy-errors',
    configureServer(server) {
      const origErr = server.config.logger.error;
      server.config.logger.error = (msg, ...args) => {
        if (typeof msg === 'string' && (msg.includes('ws proxy') && (msg.includes('EPIPE') || msg.includes('ECONNRESET')))) return;
        origErr(msg, ...args);
      };
    },
  };
}

export default defineConfig({
  plugins: [react(), suppressWsProxyErrors()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: BACKEND,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            if (!['ECONNREFUSED', 'ECONNRESET', 'EPIPE'].includes(err?.code)) console.error('[proxy]', err.message);
          });
        },
      },
      '/socket.io': {
        target: BACKEND,
        ws: true,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            if (!['ECONNREFUSED', 'ECONNRESET', 'EPIPE'].includes(err?.code)) console.error('[proxy ws]', err.message);
          });
        },
      },
    },
  },
});
