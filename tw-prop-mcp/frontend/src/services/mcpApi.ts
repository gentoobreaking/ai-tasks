/**
 * MCP API service.
 *
 * The frontend NEVER queries the database directly (SPEC §1.3 P4 AI Isolation).
 * It speaks ONLY through the MCP tool interface exposed by the Go MCP server.
 * This module adapts frontend calls to the MCP protocol (JSON-RPC 2.0 over
 * the Streamable HTTP transport).
 *
 * The HTTP bridge base path is __MCP_PROXY_BASE__ (injected at build time via
 * vite.config.ts `define`, defaults to '/mcp'). Each tool call POSTs to that
 * endpoint.
 *
 * Tool contracts mirror SPEC.md Chapter 3 and T017 acceptance criteria.
 */

import type {
  Comparable,
  ComparableResult,
  DataProvenance,
  EstimateLandValueParams,
  EstimateLandValueResult,
  EstimatePropertyValueResult,
  McpError,
  Parcel,
  ParcelAnalysis,
  ParcelGeometry,
  ParcelId,
  NearbyRoad,
  ParcelMapContext,
  ParcelSearchParams,
  PriceStatistics,
  RoadAccess,
  Transaction,
  TransactionSearchParams,
  TransactionSearchResult,
  ToolMetadata,
  ToolResult,
} from '../types';

// ---------------------------------------------------------------------------
// Environment / transport
// ---------------------------------------------------------------------------

const MCP_BASE = (typeof __MCP_PROXY_BASE__ !== 'undefined' ? __MCP_PROXY_BASE__ : '') || '/mcp';

let requestId = 0;

function nextId(): string {
  requestId += 1;
  return `req-${requestId}-${Date.now()}`;
}

/** JSON-RPC 2.0 envelope for a tool call. */
interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string;
  method: 'tools/call';
  params: {
    name: string;
    /** MCP protocol accepts any object as tool arguments. */
    arguments: Record<string, unknown>;
  };
}

/** JSON-RPC 2.0 response — either structured result or error. */
interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

/** Shape of the Go MCP SDK's CallToolResult. */
interface McpCallToolResult {
  structuredOutput?: unknown;
  content?: unknown[];
}

/**
 * Low-level MCP tool invocation over HTTP (Streamable HTTP transport).
 *
 * Returns the parsed tool output. On MCP-level error, throws with the error
 * payload. Application-level errors (e.g. PARCEL_NOT_FOUND) come back inside
 * the structured result envelope and are decoded by callers via
 * normalizeEnvelope.
 */
export async function callTool<T>(toolName: string, args: object): Promise<T> {
  const body: JsonRpcRequest = {
    jsonrpc: '2.0',
    id: nextId(),
    method: 'tools/call',
    params: { name: toolName, arguments: args as Record<string, unknown> },
  };

  const response = await fetch(`${MCP_BASE}/tools`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`MCP transport error: ${response.status} ${response.statusText}`);
  }

  const raw: unknown = await response.json();
  const json = raw as JsonRpcResponse;

  if (json.error) {
    throw new Error(`MCP error ${json.error.code}: ${json.error.message}`);
  }

  const result = json.result as McpCallToolResult | undefined;
  const payload = result?.structuredOutput ?? result?.content?.[0];

  return payload as T;
}

// ---------------------------------------------------------------------------
// Envelope normalization (SPEC §3.6)
// ---------------------------------------------------------------------------

/**
 * Unwrap the SPEC §3.6 envelope: pull `data` out and surface `error` on
 * failure. On application-level error, throws an McpCallError so callers'
 * catch blocks can distinguish MCP application errors from transport errors.
 */
export function normalizeEnvelope<T>(res: {
  data: T;
  metadata?: ToolMetadata;
  data_provenance?: DataProvenance;
  error?: McpError['error'];
}): ToolResult<T> {
  if (res.error) {
    throw new McpCallError(res.error);
  }
  return { data: res.data, metadata: res.metadata, data_provenance: res.data_provenance };
}

/** Thrown when the MCP tool returns an application-level error envelope. */
export class McpCallError extends Error {
  readonly isAppError = true as const;
  constructor(public readonly error: McpError['error']) {
    super(`${error.code}: ${error.message}`);
    this.name = 'McpCallError';
  }
}

// ---------------------------------------------------------------------------
// Parcel tools (SPEC §3.2 parcel, T017)
// ---------------------------------------------------------------------------

export async function getParcel(params: ParcelSearchParams): Promise<ToolResult<Parcel>> {
  const res = await callTool<{
    data: Parcel;
    metadata?: ToolMetadata;
    data_provenance?: DataProvenance;
    error?: McpError['error'];
  }>('get_parcel', params);

  return normalizeEnvelope(res);
}

/** Search parcels with area / zoning filters (SPEC §3.2 search_parcels). */
export async function searchParcels(params: ParcelSearchParams): Promise<ToolResult<Parcel[]>> {
  const res = await callTool<{
    data: Parcel[];
    metadata?: ToolMetadata;
    data_provenance?: DataProvenance;
    error?: McpError['error'];
  }>('search_parcels', params);

  return normalizeEnvelope(res);
}

// ---------------------------------------------------------------------------
// GIS tools (SPEC §3.2 GIS / §4.10, T017)
// ---------------------------------------------------------------------------

/**
 * Fetch parcel geometry + centroid + bbox + area.
 * Returns EPSG:4326 coordinates suitable for rendering.
 */
export async function getParcelGeometry(params: ParcelId): Promise<ToolResult<ParcelGeometry>> {
  const res = await callTool<{
    data: ParcelGeometry;
    metadata?: ToolMetadata;
    error?: McpError['error'];
  }>('get_parcel_geometry', params);

  return normalizeEnvelope(res);
}

/** Fetch centroid, nearby roads, road access, and map context for a parcel. */
export async function getParcelMapContext(params: ParcelId): Promise<ToolResult<ParcelMapContext>> {
  const res = await callTool<{
    data: ParcelMapContext;
    metadata?: ToolMetadata;
    error?: McpError['error'];
  }>('get_parcel_map_context', params);

  return normalizeEnvelope(res);
}

/** Check road adjacency for a parcel (SPEC §4.6). */
export async function checkRoadAccess(params: ParcelId): Promise<ToolResult<RoadAccess>> {
  const res = await callTool<{
    data: RoadAccess;
    metadata?: ToolMetadata;
    error?: McpError['error'];
  }>('check_road_access', params);

  return normalizeEnvelope(res);
}

/** Find nearby road segments for overlay rendering (SPEC §3.2 find_nearby_roads). */
export async function findNearbyRoads(params: {
  parcel_id: ParcelId;
  search_radius_m?: number;
}): Promise<ToolResult<NearbyRoad[]>> {
  const res = await callTool<{
    data: NearbyRoad[];
    metadata?: ToolMetadata;
    error?: McpError['error'];
  }>('find_nearby_roads', params);

  return normalizeEnvelope(res);
}

// ---------------------------------------------------------------------------
// Transaction tools (SPEC §3.2 Transaction, T017)
// ---------------------------------------------------------------------------

export async function searchTransactions(
  params: TransactionSearchParams
): Promise<ToolResult<TransactionSearchResult>> {
  const res = await callTool<{
    data: TransactionSearchResult;
    metadata?: ToolMetadata;
    error?: McpError['error'];
  }>('search_transactions', params);

  return normalizeEnvelope(res);
}

export async function getTransaction(params: {
  transaction_id: string;
}): Promise<ToolResult<Transaction>> {
  const res = await callTool<{
    data: Transaction;
    metadata?: ToolMetadata;
    error?: McpError['error'];
  }>('get_transaction', params);

  return normalizeEnvelope(res);
}

export async function getTransactionStatistics(params: {
  county: string;
  district: string;
  section?: string;
  land_number?: string;
  date_from?: string;
  date_to?: string;
  area_min_sqm?: number;
  area_max_sqm?: number;
}): Promise<ToolResult<PriceStatistics>> {
  const res = await callTool<{
    data: PriceStatistics;
    metadata?: ToolMetadata;
    error?: McpError['error'];
  }>('get_transaction_statistics', params);

  return normalizeEnvelope(res);
}

// ---------------------------------------------------------------------------
// Comparable tools (SPEC §3.2 Comparable, T017)
// ---------------------------------------------------------------------------

export interface FindComparableParams {
  target: ParcelId;
  filters?: {
    years?: number;
    area_similarity_pct?: number;
    same_zoning?: boolean;
    same_land_use?: boolean;
    road_access_required?: boolean;
  };
  limit?: number;
}

export async function findComparableTransactions(
  params: FindComparableParams
): Promise<ToolResult<ComparableResult>> {
  const res = await callTool<{
    data: ComparableResult;
    metadata?: ToolMetadata;
    error?: McpError['error'];
  }>('find_comparable_transactions', params);

  return normalizeEnvelope(res);
}

export async function scoreComparableTransactions(params: {
  target: ParcelId;
  transaction_ids: string[];
}): Promise<ToolResult<Comparable[]>> {
  const res = await callTool<{
    data: Comparable[];
    metadata?: ToolMetadata;
    error?: McpError['error'];
  }>('score_comparable_transactions', params);

  return normalizeEnvelope(res);
}

// ---------------------------------------------------------------------------
// Valuation tools (SPEC §3.2 Valuation, T017)
// ---------------------------------------------------------------------------

export async function estimateLandValue(
  params: EstimateLandValueParams
): Promise<ToolResult<EstimateLandValueResult>> {
  const res = await callTool<{
    data: EstimateLandValueResult;
    metadata?: ToolMetadata;
    data_provenance?: DataProvenance;
    error?: McpError['error'];
  }>('estimate_land_value', params);

  return normalizeEnvelope(res);
}

export async function estimatePropertyValue(params: {
  parcel_id: ParcelId;
  snapshot_id?: string;
}): Promise<ToolResult<EstimatePropertyValueResult>> {
  const res = await callTool<{
    data: EstimatePropertyValueResult;
    metadata?: ToolMetadata;
    data_provenance?: DataProvenance;
    error?: McpError['error'];
  }>('estimate_property_value', params);

  return normalizeEnvelope(res);
}

// ---------------------------------------------------------------------------
// Type re-exports for consumers
// ---------------------------------------------------------------------------

export type {
  Comparable,
  ComparableResult,
  EstimateLandValueParams,
  EstimateLandValueResult,
  EstimatePropertyValueResult,
  NearbyRoad,
  Parcel,
  ParcelAnalysis,
  ParcelGeometry,
  ParcelId,
  ParcelMapContext,
  ParcelSearchParams,
  PriceStatistics,
  RoadAccess,
  Transaction,
  ToolMetadata,
  ToolResult,
};
