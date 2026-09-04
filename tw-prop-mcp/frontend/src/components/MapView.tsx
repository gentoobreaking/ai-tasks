/**
 * MapView — the central Google Maps container.
 *
 * Renders:
 *   - Parcel polygon (MCP get_parcel_geometry / get_parcel_map_context)
 *   - Transaction markers (MCP search_transactions)
 *   - Road overlays (MCP find_nearby_roads / check_road_access)
 *   - Satellite / Street View layers (Google Maps)
 *   - Comparable transactions overlay (MCP find_comparable_transactions)
 *   - Valuation result panel
 *
 * The Google Maps instance is loaded dynamically with the API key from
 * VITE_GOOGLE_MAPS_API_KEY (never hardcoded). All spatial data is fetched
 * from the MCP server — the frontend only renders.
 *
 * SPEC §4.8 / §4.9: Google Maps = visualization, satellite context, street view.
 *                   NLSC = authoritative base GIS layer.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { buildNLSCTileUrl, TAIWAN_CENTER } from '../services/mapService';
import { useMap } from '../hooks/useMap';
import { useParcelAnalysis } from '../hooks/useMCP';
import { ParcelLayer } from './ParcelLayer';
import { RoadLayer } from './RoadLayer';
import { TransactionMarkers } from './TransactionMarkers';
import { ComparableLayer } from './ComparableLayer';
import { ValuationPanel } from './ValuationPanel';
import type { LayerVisibility } from '../types';
import './MapView.css';

export interface MapViewProps {
  /** Initial parcel to display. */
  initialParcel?: {
    county: string;
    district: string;
    section: string;
    land_number: string;
  };
}

export const DEFAULT_LAYERS: LayerVisibility = {
  parcel: true,
  transactions: true,
  roads: true,
  comparables: true,
  satellite: false,
  streetView: false,
  nslc: false,
};

export function MapView({ initialParcel }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [layers, setLayers] = useState<LayerVisibility>(DEFAULT_LAYERS);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  const {
    map,
    google,
    streetView,
    loading: mapLoading,
    error: mapError,
  } = useMap(mapRef, {
    center: initialParcel ? undefined : { lat: TAIWAN_CENTER.lat, lng: TAIWAN_CENTER.lng },
    zoom: 15,
  });

  const {
    analysis,
    loading: analysisLoading,
    error: analysisError,
    fetchAnalysis,
  } = useParcelAnalysis();
  useEffect(() => {
    if (initialParcel) {
      fetchAnalysis(initialParcel).catch((e) => {
        console.error('Analysis fetch failed:', e);
      });
    }
  }, [initialParcel, fetchAnalysis]);

  // Toggle satellite imagery (hybrid vs roadmap)
  const toggleSatellite = useCallback(() => {
    if (!map || !google) return;
    const next = !layers.satellite;
    setLayers((l) => ({ ...l, satellite: next }));
    map.setOptions({
      mapTypeId: next ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.ROADMAP,
    });
  }, [map, google, layers.satellite]);

  // Toggle Street View
  const toggleStreetView = useCallback(() => {
    if (!map || !streetView) return;
    const next = !layers.streetView;
    setLayers((l) => ({ ...l, streetView: next }));
    streetView.setVisible(next);
  }, [map, streetView, layers.streetView]);

  // Toggle NLSC GIS layer
  const toggleNLSC = useCallback(() => {
    if (!map || !google) return;
    const next = !layers.nslc;
    setLayers((l) => ({ ...l, nslc: next }));

    const overlayTypes = map.overlayMapTypes;

    // Tag and remove existing NLSC overlay
    const nslcIdKey = '__nslcOverlayIndex';
    const mapAny = map as unknown as Record<string, number | undefined>;
    const existingId = mapAny[nslcIdKey];

    if (existingId !== undefined) {
      overlayTypes.removeAt(existingId);
      delete mapAny[nslcIdKey];
    }

    if (next) {
      const tileLayer = new google.maps.ImageMapType({
        getTileUrl: (coord, zoom) => buildNLSCTileUrl(zoom, coord.x, coord.y),
        tileSize: new google.maps.Size(256, 256),
        maxZoom: 20,
        minZoom: 10,
        name: 'NLSC Cadastral',
        opacity: 0.6,
      });
      const newId = overlayTypes.push(tileLayer);
      mapAny[nslcIdKey] = newId;
    }
  }, [map, google, layers.nslc]);

  // Layer toggle handler
  const toggleLayer = useCallback((key: keyof LayerVisibility) => {
    setLayers((l) => ({ ...l, [key]: !l[key] }));
  }, []);

  const error = mapError ?? analysisError;
  const loading = mapLoading ?? analysisLoading;

  // Check for API key at runtime
  useEffect(() => {
    if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      setApiKeyError(
        'Google Maps API key is missing. Set VITE_GOOGLE_MAPS_API_KEY in .env or environment.'
      );
    }
  }, []);

  return (
    <div className="map-view">
      {/* Map container */}
      <div ref={mapRef} className="map-view__container" />

      {/* Loading overlay */}
      {loading && (
        <div className="map-view__overlay">
          <div className="map-view__loading">正在載入地圖資料…</div>
        </div>
      )}

      {/* Google Maps API key error */}
      {apiKeyError && (
        <div className="map-view__overlay error">
          <div className="map-view__error">
            <h3>Google Maps 設定錯誤</h3>
            <p>{apiKeyError}</p>
            <p>請在 .env 檔案中設定 VITE_GOOGLE_MAPS_API_KEY。</p>
          </div>
        </div>
      )}

      {/* General error state */}
      {error && !apiKeyError && (
        <div className="map-view__overlay error">
          <div className="map-view__error">
            <h3>載入失敗</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Layer controls */}
      {map && !error && (
        <div className="map-view__controls">
          <div className="map-view__layer-toggle" role="group" aria-label="Map layers">
            <button
              className={toggleCls(layers.parcel)}
              onClick={() => toggleLayer('parcel')}
              type="button">
              地籍圖
            </button>
            <button
              className={toggleCls(layers.transactions)}
              onClick={() => toggleLayer('transactions')}
              type="button">
              成交點
            </button>
            <button
              className={toggleCls(layers.roads)}
              onClick={() => toggleLayer('roads')}
              type="button">
              道路
            </button>
            <button
              className={toggleCls(layers.comparables)}
              onClick={() => toggleLayer('comparables')}
              type="button">
              可比交易
            </button>
            <button className={toggleCls(layers.nslc)} onClick={toggleNLSC} type="button">
              NLSC 圖資
            </button>
          </div>

          <div className="map-view__view-toggle" role="group" aria-label="Map views">
            <button className={toggleCls(layers.satellite)} onClick={toggleSatellite} type="button">
              衛星圖
            </button>
            <button
              className={toggleCls(layers.streetView)}
              onClick={toggleStreetView}
              type="button">
              Street View
            </button>
          </div>
        </div>
      )}

      {/* Overlay layers — rendered only when map + google are ready */}
      {map && google && analysis && (
        <>
          <ParcelLayer
            map={map}
            google={google}
            geometry={analysis.geometry ?? null}
            visible={layers.parcel}
          />
          <RoadLayer
            map={map}
            google={google}
            roads={analysis.nearby_roads ?? null}
            visible={layers.roads}
          />
          <TransactionMarkers
            map={map}
            google={google}
            transactions={analysis.transactions}
            visible={layers.transactions}
          />
          <ComparableLayer
            map={map}
            google={google}
            comparables={analysis.comparables?.comparables ?? []}
            transactions={analysis.transactions}
            visible={layers.comparables}
          />
        </>
      )}

      {/* Valuation panel */}
      <ValuationPanel
        valuation={analysis?.valuation ?? null}
        loading={analysisLoading}
        error={analysisError ?? null}
      />
    </div>
  );
}

/** Build a CSS class string for an active/inactive toggle button. */
function toggleCls(active: boolean): string {
  return `map-view__btn ${active ? 'map-view__btn--active' : ''}`;
}
