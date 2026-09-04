/**
 * Map geometry conversion helpers.
 *
 * The MCP server returns GeoJSON-like geometry (coordinates as [lng, lat]
 * per RFC 7946). These helpers convert between GeoJSON shapes and the
 * google.maps types the rendering components consume. No computation is
 * performed here — conversion only. (SPEC §1.3 P4: frontend does not compute.)
 */

import type {
  Bounds,
  LatLng,
  MultiPolygonGeometry,
  ParcelGeometry,
  PolygonGeometry,
  RoadSegment,
  Transaction,
} from '../types';

/** Default map center: Taiwan (Taipei fallback). */
export const TAIWAN_CENTER: LatLng = { lat: 23.6936, lng: 120.9816 };

/** Convert a [lng, lat] tuple to google.maps.LatLng-like object. */
export function toLatLng(coords: [number, number]): LatLng {
  return { lat: coords[1], lng: coords[0] };
}

/** Convert an array of coordinate tuples to LatLng array. */
export function toLatLngs(coords: number[][]): LatLng[] {
  return coords.map((c) => toLatLng([c[0], c[1]]));
}

/** Convert a GeoJSON Polygon to google.maps.LatLng[][] (rings). */
export function polygonToPaths(coordinates: number[][][]): LatLng[][] {
  return coordinates.map((ring) => toLatLngs(ring));
}

/** Convert a GeoJSON MultiPolygon to google.maps.LatLng[][][] (multiple polygons). */
export function multiPolygonToPaths(coordinates: number[][][][]): LatLng[][][] {
  return coordinates.map((polygon) => polygonToPaths(polygon));
}

/** Convert a GeoJSON LineString to google.maps.LatLng[]. */
export function lineStringToPath(coords: number[][]): LatLng[] {
  return toLatLngs(coords);
}

/**
 * Convert the parcel geometry returned by get_parcel_geometry into a single
 * polygon path suitable for a google.maps.Polygon. Handles both Polygon and
 * MultiPolygon by returning the first (outer) ring.
 */
export function parcelGeometryToPath(geometry: ParcelGeometry): LatLng[][] {
  const { geometry: g } = geometry;
  if (g.type === 'Polygon') {
    return polygonToPaths(g.coordinates);
  }
  if (g.type === 'MultiPolygon') {
    // Flatten all polygon rings into one array of rings.
    return g.coordinates.flatMap((polygon) => polygonToPaths(polygon));
  }
  return [];
}

/** Flatten any geometry envelope into google.maps.LatLngBounds-compatible Bounds. */
export function parcelGeometryToBounds(geometry: ParcelGeometry): Bounds {
  const coords = flattenCoordinates(geometry.geometry);
  if (coords.length === 0) {
    return { north: 0, south: 0, east: 0, west: 0 };
  }
  let north = -Infinity,
    south = Infinity,
    east = -Infinity,
    west = Infinity;
  for (const [lng, lat] of coords) {
    north = Math.max(north, lat);
    south = Math.min(south, lat);
    east = Math.max(east, lng);
    west = Math.min(west, lng);
  }
  return { north, south, east, west };
}

function flattenCoordinates(g: PolygonGeometry | MultiPolygonGeometry): [number, number][] {
  if (g.type === 'Polygon') {
    return g.coordinates.flat().map((c) => [c[0], c[1]]);
  }
  return g.coordinates.flat(2).map((c) => [c[0], c[1]]);
}

/** Convert a RoadSegment geometry into a google.maps.Polyline path. */
export function roadToPath(road: RoadSegment): LatLng[] {
  return lineStringToPath(road.geometry.coordinates);
}

/** Convert an array of RoadSegments to polyline paths. */
export function roadsToPaths(roads: RoadSegment[]): LatLng[][] {
  return roads.map((road) => roadToPath(road));
}

/** Extract a LatLng from a transaction that has latitude/longitude fields. */
export function transactionToMarker(transaction: Transaction): LatLng | null {
  if (transaction.latitude == null || transaction.longitude == null) {
    return null;
  }
  return { lat: transaction.latitude, lng: transaction.longitude };
}

/** Fit a google.maps.Map viewport to encompass the given bounds. */
export function boundsToGoogle(map: google.maps.Map, bounds: Bounds, padding?: number): void {
  const gBounds = new google.maps.LatLngBounds(
    { lat: bounds.south, lng: bounds.west },
    { lat: bounds.north, lng: bounds.east }
  );
  map.fitBounds(gBounds, padding);
}

/**
 * Build an NLSC (National Land Surveying and Cartography Center) overlay URL.
 * NLSC provides official cadastral map tiles that serve as the authoritative
 * base layer per SPEC §4.2/§4.8.
 */
export function buildNLSCTileUrl(zoom: number, x: number, y: number): string {
  // NLSC EMOD map service — official cadastral tiles.
  return `https://maps.nlsc.gov.tw/SMSCarto/MapTile/EMAP/${zoom}/${x}/${y}.png`;
}

/** Format a TWD monetary value with thousand separators. */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
  }).format(value);
}

/** Format price per ping (坪) for display. Accepts number or string. */
export function formatPricePerPing(value: number | string): string {
  const num = typeof value === 'number' ? value : Number(value);
  return `${Math.round(num).toLocaleString('zh-TW')} 元/坪`;
}
