/**
 * React data hooks that orchestrate MCP tool calls.
 *
 * These hooks call the mcpApi service (which speaks the MCP protocol to the
 * Go server). They NEVER touch any database directly (P4 AI Isolation).
 * All geometry / valuation logic lives server-side in deterministic engines.
 *
 * Each hook returns { data, error, loading } for React consumption.
 */

import { useCallback, useState } from 'react';
import {
  checkRoadAccess,
  estimateLandValue,
  findComparableTransactions,
  findNearbyRoads,
  getParcel,
  getParcelGeometry,
  getParcelMapContext,
  searchTransactions,
  type ComparableResult,
  type EstimateLandValueResult,
  McpCallError,
  type NearbyRoad,
  type Parcel,
  type ParcelAnalysis,
  type ParcelGeometry,
  type ParcelId,
  type ParcelMapContext,
  type RoadAccess,
  type Transaction,
} from '../services/mcpApi';

// ---------------------------------------------------------------------------
// Parcel hooks
// ---------------------------------------------------------------------------

export interface ParcelState {
  parcel: Parcel | null;
  loading: boolean;
  error: string | null;
}

export function useParcel() {
  const [state, setState] = useState<ParcelState>({
    parcel: null,
    loading: false,
    error: null,
  });

  const fetchParcel = useCallback(
    async (params: { county: string; district: string; section: string; land_number: string }) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const result = await getParcel(params);
        setState({ parcel: result.data, loading: false, error: null });
        return result.data;
      } catch (e) {
        setState({ parcel: null, loading: false, error: toErrorMessage(e) });
        return null;
      }
    },
    []
  );

  return { ...state, fetchParcel };
}

export interface ParcelMapContextState {
  context: ParcelMapContext | null;
  loading: boolean;
  error: string | null;
}

export function useParcelMapContext() {
  const [state, setState] = useState<ParcelMapContextState>({
    context: null,
    loading: false,
    error: null,
  });

  const fetchContext = useCallback(async (params: ParcelId) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await getParcelMapContext(params);
      setState({ context: result.data, loading: false, error: null });
      return result.data;
    } catch (e) {
      setState({ context: null, loading: false, error: toErrorMessage(e) });
      return null;
    }
  }, []);

  return { ...state, fetchContext };
}

export interface ParcelGeometryState {
  geometry: ParcelGeometry | null;
  loading: boolean;
  error: string | null;
}

export function useParcelGeometry() {
  const [state, setState] = useState<ParcelGeometryState>({
    geometry: null,
    loading: false,
    error: null,
  });

  const fetchGeometry = useCallback(async (params: ParcelId) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await getParcelGeometry(params);
      setState({ geometry: result.data, loading: false, error: null });
      return result.data;
    } catch (e) {
      setState({ geometry: null, loading: false, error: toErrorMessage(e) });
      return null;
    }
  }, []);

  return { ...state, fetchGeometry };
}

// ---------------------------------------------------------------------------
// Transaction hooks
// ---------------------------------------------------------------------------

export interface TransactionSearchState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

export function useTransactions() {
  const [state, setState] = useState<{
    transactions: Transaction[];
    loading: boolean;
    error: string | null;
  }>({ transactions: [], loading: false, error: null });

  const fetchTransactions = useCallback(
    async (params: {
      county: string;
      district: string;
      section?: string;
      land_number?: string;
      date_from?: string;
      date_to?: string;
      limit?: number;
    }) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const result = await searchTransactions(params);
        setState({ transactions: result.data.transactions, loading: false, error: null });
        return result.data;
      } catch (e) {
        setState({ transactions: [], loading: false, error: toErrorMessage(e) });
        return null;
      }
    },
    []
  );

  return { ...state, fetchTransactions };
}

// ---------------------------------------------------------------------------
// Road / GIS hooks
// ---------------------------------------------------------------------------

export interface RoadAccessState {
  roadAccess: RoadAccess | null;
  loading: boolean;
  error: string | null;
}

export function useRoadAccess(): RoadAccessState & {
  fetchRoadAccess: (params: ParcelId) => Promise<RoadAccess | null>;
} {
  const [state, setState] = useState<RoadAccessState>({
    roadAccess: null,
    loading: false,
    error: null,
  });

  const fetchRoadAccess = useCallback(async (params: ParcelId) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await checkRoadAccess(params);
      setState({ roadAccess: result.data, loading: false, error: null });
      return result.data;
    } catch (e) {
      setState({ roadAccess: null, loading: false, error: toErrorMessage(e) });
      return null;
    }
  }, []);

  return { ...state, fetchRoadAccess };
}

export interface NearbyRoadsState {
  roads: NearbyRoad[];
  loading: boolean;
  error: string | null;
}

export function useNearbyRoads(): NearbyRoadsState & {
  fetchRoads: (params: {
    parcel_id: ParcelId;
    search_radius_m?: number;
  }) => Promise<NearbyRoad[] | null>;
} {
  const [state, setState] = useState<NearbyRoadsState>({
    roads: [],
    loading: false,
    error: null,
  });

  const fetchRoads = useCallback(
    async (params: { parcel_id: ParcelId; search_radius_m?: number }) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const result = await findNearbyRoads(params);
        setState({ roads: result.data, loading: false, error: null });
        return result.data;
      } catch (e) {
        setState({ roads: [], loading: false, error: toErrorMessage(e) });
        return null;
      }
    },
    []
  );

  return { ...state, fetchRoads };
}

// ---------------------------------------------------------------------------
// Comparable & Valuation hooks
// ---------------------------------------------------------------------------

export interface ComparablesState {
  result: ComparableResult | null;
  loading: boolean;
  error: string | null;
}

export function useComparables(): ComparablesState & {
  fetchComparables: (params: {
    target: ParcelId;
    filters?: Record<string, unknown>;
    limit?: number;
  }) => Promise<ComparableResult | null>;
} {
  const [state, setState] = useState<ComparablesState>({
    result: null,
    loading: false,
    error: null,
  });

  const fetchComparables = useCallback(
    async (params: { target: ParcelId; filters?: Record<string, unknown>; limit?: number }) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const result = await findComparableTransactions(params);
        setState({ result: result.data, loading: false, error: null });
        return result.data;
      } catch (e) {
        setState({ result: null, loading: false, error: toErrorMessage(e) });
        return null;
      }
    },
    []
  );

  return { ...state, fetchComparables };
}

export interface ValuationState {
  valuation: EstimateLandValueResult | null;
  loading: boolean;
  error: string | null;
}

export function useValuation(): ValuationState & {
  fetchValuation: (params: {
    parcel_id: ParcelId;
    snapshot_id?: string;
  }) => Promise<EstimateLandValueResult | null>;
} {
  const [state, setState] = useState<ValuationState>({
    valuation: null,
    loading: false,
    error: null,
  });

  const fetchValuation = useCallback(
    async (params: { parcel_id: ParcelId; snapshot_id?: string }) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const result = await estimateLandValue(params);
        setState({ valuation: result.data, loading: false, error: null });
        return result.data;
      } catch (e) {
        setState({ valuation: null, loading: false, error: toErrorMessage(e) });
        return null;
      }
    },
    []
  );

  return { ...state, fetchValuation };
}

// ---------------------------------------------------------------------------
// Aggregated analysis hook
// ---------------------------------------------------------------------------

/**
 * Run a full parcel analysis: geometry + road access + nearby roads +
 * recent transactions + comparables + valuations. Aggregates into a single
 * ParcelAnalysis object for the map UI to consume.
 *
 * This hook orchestrates the same pipeline as T018 Final Acceptance Test
 * (SPEC §Phase-18): parcel → geometry → road access → transactions →
 * comparables → statistics → valuation → provenance.
 */
export function useParcelAnalysis() {
  const [state, setState] = useState<{
    analysis: ParcelAnalysis | null;
    loading: boolean;
    error: string | null;
  }>({ analysis: null, loading: false, error: null });

  const fetchAnalysis = useCallback(async (params: ParcelId) => {
    setState({ analysis: null, loading: true, error: null });

    const result: ParcelAnalysis = {
      parcel: undefined as unknown as Parcel,
      transactions: [],
      map_context: { latitude: 0, longitude: 0 },
    };

    try {
      // 1. Parcel + map context (single combined call)
      const contextResult = await getParcelMapContext(params);
      result.parcel = contextResult.data.parcel;
      result.road_access = contextResult.data.road_access ?? undefined;
      result.map_context = contextResult.data.map_context;

      // 2. Geometry
      const geomResult = await getParcelGeometry(params);
      result.geometry = geomResult.data;

      // 3. Nearby roads
      const roadsResult = await findNearbyRoads({ parcel_id: params });
      if (roadsResult.data) {
        result.nearby_roads = roadsResult.data;
      }

      // 4. Recent transactions (5 years)
      const fiveYearsAgo = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      const txResult = await searchTransactions({
        county: params.county,
        district: params.district,
        section: params.section,
        land_number: params.land_number,
        date_from: fiveYearsAgo,
        limit: 50,
      });
      result.transactions = txResult.data.transactions;

      // 5. Comparable transactions
      const compResult = await findComparableTransactions({
        target: params,
        filters: {
          years: 5,
          area_similarity_pct: 30,
          same_zoning: true,
          same_land_use: true,
          road_access_required: false,
        },
        limit: 20,
      });
      result.comparables = compResult.data;

      // 6. Valuation
      const valResult = await estimateLandValue({ parcel_id: params });
      result.valuation = valResult.data;

      setState({ analysis: result, loading: false, error: null });
      return result;
    } catch (e) {
      const msg = toErrorMessage(e);
      setState({ analysis: result, loading: false, error: msg });
      return null;
    }
  }, []);

  return { ...state, fetchAnalysis };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toErrorMessage(e: unknown): string {
  if (e instanceof McpCallError) {
    return `${e.error.code}: ${e.error.message}`;
  }
  if (e instanceof Error) {
    return e.message;
  }
  return String(e);
}
