/// <reference types="google.maps" />
/// <reference types="vite/client" />

/**
 * Vite environment variable declarations.
 *
 * Vite exposes env vars prefixed with VITE_ to the client bundle.
 * @see https://vite.dev/guide/env-and-mode
 */
interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_MCP_PROXY_BASE: string;
  readonly VITE_MCP_PROXY_TARGET: string;
  readonly VITE_MAP_INITIAL_CENTER_LAT: string;
  readonly VITE_MAP_INITIAL_CENTER_LNG: string;
  readonly VITE_MAP_INITIAL_ZOOM: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Build-time global injected by vite.config.ts via `define`.
 * Used as the default MCP HTTP proxy base path.
 */
declare const __MCP_PROXY_BASE__: string;
