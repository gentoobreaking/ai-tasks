import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// Vite config: expose MCP proxy base and Google Maps env to the frontend.
// Env keys are read from VITE_* so Vite replaces them at build time.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Expose the MCP HTTP proxy base path at build time so the API service
      // defaults to the deployment location rather than hardcoding.
      __MCP_PROXY_BASE__: JSON.stringify(env.VITE_MCP_PROXY_BASE ?? '/mcp'),
    },
    server: {
      // When proxying local dev to a backend MCP-HTTP bridge, Vite forwards
      // /mcp requests. Configure VITE_MCP_PROXY_TARGET to override.
      proxy: env.VITE_MCP_PROXY_TARGET
        ? {
            '^/mcp': {
              target: env.VITE_MCP_PROXY_TARGET,
              changeOrigin: true,
              secure: false,
              rewrite: (value) => value.replace(/^\/mcp/, ''),
            },
          }
        : undefined,
    },
    build: {
      // Keep sourcemaps for production debugging of map rendering.
      sourcemap: true,
    },
  };
});
