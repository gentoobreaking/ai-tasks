/**
 * ComparableLayer — renders comparable transaction markers from the MCP
 * `find_comparable_transactions` result.
 *
 * The comparable list comes from the MCP comparable engine (spec §Phase 7).
 * This component only renders markers and info windows; scoring logic stays
 * server-side.
 */

import { useEffect, useRef } from 'react';
import type { Comparable, Transaction } from '../types';

export interface ComparableLayerProps {
  map: google.maps.Map | null;
  google: typeof google | null;
  comparables: Comparable[];
  transactions: Transaction[];
  visible: boolean;
  onComparableClick?: (comparable: Comparable, transaction: Transaction) => void;
}

export function ComparableLayer({
  map,
  google,
  comparables,
  transactions,
  visible,
  onComparableClick,
}: ComparableLayerProps) {
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  const clearMarkers = () => {
    markersRef.current.forEach((m) => (m.map = null));
    markersRef.current = [];
  };

  useEffect(() => {
    if (!map || !google || !visible) {
      clearMarkers();
      return;
    }

    // Build a lookup from transaction_id → transaction position
    const txMap = new Map<string, Transaction>();
    for (const tx of transactions) {
      if (tx.latitude != null && tx.longitude != null) {
        txMap.set(tx.transaction_id, tx);
      }
    }

    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

    for (const c of comparables) {
      const tx = txMap.get(c.transaction_id);
      if (!tx) continue;

      const position = { lat: tx.latitude!, lng: tx.longitude! };

      const el = document.createElement('div');
      el.className = 'map-marker comparable-marker';
      el.textContent = String(Math.round(c.total_score * 100));

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position,
        content: el,
        map,
        title: `Comparable: ${tx.county}${tx.district}${tx.section} ${tx.land_number}`,
      });

      const info = new google.maps.InfoWindow({
        content: buildComparableInfo(c, tx),
      });

      marker.addListener('click', () => {
        info.open(map, marker);
        onComparableClick?.(c, tx);
      });

      newMarkers.push(marker);
    }

    markersRef.current = newMarkers;

    return () => clearMarkers();
  }, [map, google, comparables, transactions, visible, onComparableClick]);

  useEffect(() => clearMarkers, []);

  return null;
}

function buildComparableInfo(c: Comparable, tx: Transaction): string {
  const scorePct = Math.round(c.total_score * 100);
  return `
    <div class="info-window comparable-info">
      <strong>Comparable (#${scorePct})</strong>
      <div>${tx.county}${tx.district}${tx.section} ${tx.land_number}</div>
      <div>距離: ${c.distance_m.toFixed(1)} m</div>
      <div>面積相似度: ${(c.area_similarity * 100).toFixed(1)}%</div>
      <div>得分: ${scorePct}%</div>
      <div>成交日: ${tx.transaction_date}</div>
    </div>
  `;
}
