/**
 * Google Maps JavaScript API loader.
 *
 * The API key is read from the Vite-exposed environment variable
 * VITE_GOOGLE_MAPS_API_KEY — it is NEVER hardcoded. The library is loaded
 * dynamically by injecting a <script> tag so the bundle does not ship a
 * static reference to google maps.
 *
 * SPEC §4.8: Google Maps serves as visualization / satellite context / street
 * view only — NOT as the official cadastral source. The authoritative geometry
 * comes from the MCP server (PostGIS-backed).
 */

import { createRetryableLoader } from './createRetryableLoader';

const GOOGLE_MAPS_API_URL = 'https://maps.googleapis.com/maps/api/js';

const LIBRARIES = 'marker,geometry,places';

// Vite exposes env vars prefixed with VITE_ at build time.
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/** Global type for the google namespace after the script loads. */
declare global {
  interface Window {
    google?: typeof google;
  }
}

export type GoogleMapsApi = typeof google;

// Singleton promise resolving to the loaded google namespace.
let loadPromise: Promise<typeof google> | null = null;

/**
 * Load the Google Maps JavaScript API with the required libraries.
 * Returns the global `google` namespace.
 *
 * Throws if no API key is configured — this must be set in `.env`.
 */
export function loadGoogleMaps(): Promise<typeof google> {
  if (loadPromise) {
    return loadPromise;
  }

  if (!apiKey) {
    return Promise.reject(
      new Error('Google Maps API key is missing. Set VITE_GOOGLE_MAPS_API_KEY in your environment.')
    );
  }

  if (typeof window !== 'undefined' && window.google?.maps) {
    loadPromise = Promise.resolve(window.google);
    return loadPromise;
  }

  loadPromise = createRetryableLoader({
    src: `${GOOGLE_MAPS_API_URL}?key=${apiKey}&libraries=${LIBRARIES}&language=zh-TW&region=TW`,
    ready: () => window.google?.maps != null,
    timeout: 15000,
    pollInterval: 100,
    maxAttempts: 50,
  });

  return loadPromise;
}
