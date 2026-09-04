/**
 * Map instance management hook.
 *
 * Manages the lifecycle of a google.maps.Map instance plus the Google Maps
 * script load state. Overlay rendering is handled by the layer components
 * (ParcelLayer, TransactionMarkers, RoadLayer, ComparableLayer), which consume
 * the typed `map` + `google` refs returned here.
 *
 * Google Maps is visualization only — authoritative geometry comes from the
 * MCP server (PostGIS-backed). See SPEC §4.8.
 */

import { useCallback, useEffect, useState } from 'react';
import { loadGoogleMaps, type GoogleMapsApi } from '../services/googleMapsLoader';

export interface MapState {
  map: google.maps.Map | null;
  google: GoogleMapsApi | null;
  streetView: google.maps.StreetViewPanorama | null;
  loading: boolean;
  error: string | null;
}

export interface UseMapOptions {
  center?: { lat: number; lng: number };
  zoom?: number;
}

/** Default center for Taiwan. */
const DEFAULT_CENTER: { lat: number; lng: number } = { lat: 23.6936, lng: 120.9816 };

/**
 * Initializes the Google Maps instance on a Map ref. Returns the map, the
 * google namespace, and the street-view panorama once loaded.
 */
export function useMap(
  mapRef: React.RefObject<HTMLDivElement | null>,
  options: UseMapOptions = {}
): MapState & { initializeMap: () => Promise<void> } {
  const center = options.center ?? DEFAULT_CENTER;
  const zoom = options.zoom ?? 15;

  const [state, setState] = useState<MapState>({
    map: null,
    google: null,
    streetView: null,
    loading: false,
    error: null,
  });

  const initializeMap = useCallback(async () => {
    if (!mapRef.current) return;

    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const g = await loadGoogleMaps();

      const map = new g.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeId: g.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Street View panorama attached to the map; toggled via MapView controls.
      const streetView = new g.maps.StreetViewPanorama(document.createElement('div'), {
        visible: false,
        pov: { heading: 0, pitch: 0 },
      });
      map.setStreetView(streetView);

      setState({ map, google: g, streetView, loading: false, error: null });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setState({ map: null, google: null, streetView: null, loading: false, error: msg });
    }
  }, [mapRef, center, zoom]);

  useEffect(() => {
    void initializeMap();
  }, [initializeMap]);

  return { ...state, initializeMap };
}
