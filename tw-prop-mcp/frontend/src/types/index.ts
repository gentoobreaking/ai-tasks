/**
 * Core domain types for the Taiwan Real-Estate MCP frontend.
 *
 * These types mirror the MCP tool contracts defined in SPEC.md (Chapters 3 & 4)
 * and the T017 MCP server acceptance criteria. The frontend consumes ONLY these
 * structures — it never performs its own spatial/valuation computation.
 *
 * Coordinate convention: API returns EPSG:4326 (lat/lng) for map rendering.
 */

// ---------------------------------------------------------------------------
// Shared structures
// ---------------------------------------------------------------------------

/** Canonical parcel identifier (county+district+section+land_number). */
export interface ParcelId {
  county: string;
  district: string;
  section: string;
  land_number: string;
}

/** Provenance metadata injected into every tool response (SPEC §3.6). */
export interface DataProvenance {
  source: string;
  source_version?: string;
  snapshot_id?: string;
  source_record_hash?: string;
  import_batch_id?: string;
}

/** Tool-level metadata envelope (SPEC §3.6). */
export interface ToolMetadata {
  algorithm_version?: string;
  snapshot_id?: string;
  generated_at?: string;
  query_hash?: string;
}

/** Unified error envelope (SPEC §3.9). */
export interface McpError {
  error: {
    code:
      | 'INVALID_ARGUMENT'
      | 'PARCEL_NOT_FOUND'
      | 'TRANSACTION_NOT_FOUND'
      | 'DATA_NOT_AVAILABLE'
      | 'GIS_NOT_AVAILABLE'
      | 'SNAPSHOT_NOT_FOUND'
      | 'VALUATION_NOT_AVAILABLE'
      | 'SOURCE_UNAVAILABLE'
      | 'INTERNAL_ERROR';
    message: string;
    retryable: boolean;
  };
}

/**
 * Generic MCP tool call result. `data` is present on success, `error` on
 * failure. `metadata` / `data_provenance` appear alongside core tool output
 * (SPEC §3.6).
 */
export interface ToolResult<TData> {
  data: TData;
  metadata?: ToolMetadata;
  data_provenance?: DataProvenance;
  error?: McpError['error'];
}

// ---------------------------------------------------------------------------
// Coordinate system types
// ---------------------------------------------------------------------------

/** A geographic coordinate in EPSG:4326 (lat, lng). */
export interface LatLng {
  lat: number;
  lng: number;
}

/** A point geometry in EPSG:4326. */
export interface PointGeometry {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat] per GeoJSON
}

/** A polygon in GeoJSON-like structure (EPSG:4326 when returned to frontend). */
export interface PolygonGeometry {
  type: 'Polygon';
  coordinates: number[][][]; // [[lng, lat], ...]
}

/** A multipolygon in GeoJSON-like structure. */
export interface MultiPolygonGeometry {
  type: 'MultiPolygon';
  coordinates: number[][][][];
}

/** Geometry output from get_parcel_geometry (SPEC §3.4 / T017 GIS tools). */
export interface ParcelGeometry {
  geometry: PolygonGeometry | MultiPolygonGeometry;
  centroid: { lat: number; lng: number };
  bbox: { west: number; south: number; east: number; north: number };
  area_sqm: number;
}

/** Bounding box for map fitting. */
export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// ---------------------------------------------------------------------------
// Parcel
// ---------------------------------------------------------------------------

/** A parcel record (SPEC §3.2 parcel tools / T017 get_parcel). */
export interface Parcel {
  county: string;
  district: string;
  section: string;
  land_number: string;
  area_sqm?: number;
  area_ping?: number;
  urban_zoning?: string;
  land_use?: string;
  owner?: string;
  last_updated?: string;
}

/** Result of get_parcel / get_parcel_map_context (SPEC §4.10). */
export interface MapContext {
  latitude: number;
  longitude: number;
  zoom?: number;
  bounds?: Bounds;
}

export interface ParcelMapContext {
  parcel: Parcel;
  geometry?: {
    centroid: { lat: number; lng: number };
    area_sqm: number;
  };
  road_access?: RoadAccess;
  map_context: MapContext;
}

/** Search parameters for get_parcel / search_parcels (SPEC §3.2). */
export interface ParcelSearchParams {
  county: string;
  district: string;
  section?: string;
  land_number?: string;
  area_min_sqm?: number;
  area_max_sqm?: number;
  urban_zoning?: string;
  limit?: number;
  offset?: number;
}
// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

/**
 * Statistics block for a set of transactions (price_per_ping in TWD/坪).
 * SPEC §3.3 / §5.11 — 1 坪 = 3.305785 ㎡.
 */
export interface PriceStatistics {
  count: number;
  min?: number;
  p10?: number;
  p25?: number;
  median?: number;
  mean?: number;
  p75?: number;
  p90?: number;
  max?: number;
}

/** A single real-estate transaction (SPEC §2 Data Model). */
export interface Transaction {
  transaction_id: string;
  county: string;
  district: string;
  section: string;
  land_number: string;
  building_id?: string;
  transaction_date: string; // ISO date
  total_price: number; // TWD
  land_area_ping?: number;
  building_area_ping?: number;
  price_per_ping?: number;
  architecture_style?: string;
  building_year?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  // Provenance linkage (SPEC §2.9)
  source?: string;
  snapshot_id?: string;
}

export interface TransactionSearchParams {
  county: string;
  district: string;
  section?: string;
  land_number?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface TransactionSearchResult {
  transactions: Transaction[];
  statistics?: PriceStatistics;
}

// ---------------------------------------------------------------------------
// Roads / GIS
// ---------------------------------------------------------------------------

/** Road access status (SPEC §4.6). */
export type RoadAccessType = 'ROAD_ADJACENT' | 'ROAD_NEARBY' | 'NO_ROAD_DETECTED' | 'UNKNOWN';

/** Source of road width measurement (SPEC §4.7). */
export type WidthSource = 'OFFICIAL' | 'GIS_DERIVED' | 'UNKNOWN';

/** Road segment for overlay rendering. */
export interface RoadSegment {
  road_id: string;
  name: string;
  geometry: LineStringGeometry;
  width_m?: number;
  width_source?: WidthSource;
}

export interface LineStringGeometry {
  type: 'LineString';
  coordinates: number[][]; // [lng, lat][]
}

export interface RoadAccess {
  status: RoadAccessType;
  distance_m: number;
  road_width_m?: number;
  width_source?: WidthSource;
  nearest_point?: { lat: number; lng: number };
}

export interface NearbyRoad {
  road_id: string;
  name: string;
  distance_m: number;
  width_m?: number;
  width_source?: WidthSource;
  geometry?: LineStringGeometry;
}

// ---------------------------------------------------------------------------
// Comparable transactions
// ---------------------------------------------------------------------------

export interface ComparableFilters {
  years?: number;
  area_similarity_pct?: number;
  same_zoning?: boolean;
  same_land_use?: boolean;
  road_access_required?: boolean;
  limit?: number;
}

export interface Comparable {
  transaction_id: string;
  distance_m: number;
  area_similarity: number;
  zoning_match: boolean;
  land_use_match: boolean;
  road_access_match: boolean;
  time_score: number;
  total_score: number;
}

export interface ComparableResult {
  target: ParcelId;
  comparables: Comparable[];
  algorithm_version?: string;
}

// ---------------------------------------------------------------------------
// Valuation
// ---------------------------------------------------------------------------

/** Valuation confidence band (SPEC §5.14). */
export type ValuationConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT';

/** Bear/base/bull valuation range (SPEC §5.13). */
export interface ValuationRange {
  bear_value: number;
  base_value: number;
  bull_value: number;
  confidence: ValuationConfidence;
}

export interface EstimateLandValueParams {
  parcel_id: ParcelId;
  snapshot_id?: string;
}

export interface EstimateLandValueResult {
  target_parcel: ParcelId;
  bear_value?: number;
  base_value?: number;
  bull_value?: number;
  confidence: ValuationConfidence;
  comparable_count: number;
  statistics?: PriceStatistics;
  status?: 'INSUFFICIENT_DATA';
  reason?: string[];
  valuation_id?: string;
  weights?: Record<string, number>;
  configuration_version?: string;
  algorithm_version?: string;
  data_provenance?: DataProvenance;
}

export interface EstimatePropertyValueResult {
  valuation_id: string;
  target_parcel: ParcelId;
  land_value?: ValuationRange;
  building_value?: ValuationRange;
  total_value?: ValuationRange;
  confidence: ValuationConfidence;
  comparable_ids: string[];
  statistics?: PriceStatistics;
  weights: Record<string, number>;
  outlier_method?: string;
  configuration_version?: string;
  algorithm_version?: string;
  status?: 'INSUFFICIENT_DATA';
  reason?: string[];
}

// ---------------------------------------------------------------------------
// UI state aggregates
// ---------------------------------------------------------------------------

/** A marker rendered on the map. */
export interface MapMarker {
  id: string;
  position: LatLng;
  title: string;
  type: 'transaction' | 'comparable' | 'parcel-centroid' | 'road';
  price?: number;
  transaction?: Transaction;
  score?: number;
}

/** Layer visibility toggles for the map UI. */
export interface LayerVisibility {
  parcel: boolean;
  transactions: boolean;
  roads: boolean;
  comparables: boolean;
  satellite: boolean;
  streetView: boolean;
  nslc: boolean; // NLSC official GIS layer overlay
}

/** Combined result of a full parcel analysis query. */
export interface ParcelAnalysis {
  parcel: Parcel;
  geometry?: ParcelGeometry;
  road_access?: RoadAccess;
  nearby_roads?: NearbyRoad[];
  transactions: Transaction[];
  comparables?: ComparableResult;
  valuation?: EstimateLandValueResult;
  map_context: MapContext;
}
