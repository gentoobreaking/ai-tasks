/**
 * ValuationPanel — displays the land valuation result from the MCP
 * `estimate_land_value` tool.
 *
 * SPEC §5: valuations are computed by the deterministic valuation engine
 * server-side. This panel only formats and displays the bear/base/bull range.
 */

import { formatPrice, formatPricePerPing } from '../services/mapService';
import type { DataProvenance, EstimateLandValueResult, PriceStatistics } from '../types';
import './ValuationPanel.css';

export interface ValuationPanelProps {
  valuation: EstimateLandValueResult | null;
  loading: boolean;
  error: string | null;
  onClose?: () => void;
}

export function ValuationPanel({ valuation, loading, error, onClose }: ValuationPanelProps) {
  if (loading) {
    return (
      <aside className="valuation-panel">
        <header className="valuation-panel__header">
          <h3>估值分析</h3>
          <button className="valuation-panel__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="valuation-panel__body">
          <p className="valuation-panel__loading">載入中…</p>
        </div>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="valuation-panel">
        <header className="valuation-panel__header">
          <h3>估值分析</h3>
          <button className="valuation-panel__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="valuation-panel__body">
          <p className="valuation-panel__error">{error}</p>
        </div>
      </aside>
    );
  }

  if (!valuation) {
    return (
      <aside className="valuation-panel">
        <header className="valuation-panel__header">
          <h3>估值分析</h3>
          <button className="valuation-panel__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="valuation-panel__body">
          <p className="valuation-panel__empty">請選擇一個地號以查看估值結果。</p>
        </div>
      </aside>
    );
  }

  const isInsufficient = valuation.status === 'INSUFFICIENT_DATA';

  return (
    <aside className="valuation-panel">
      <header className="valuation-panel__header">
        <h3>土地估值</h3>
        <button className="valuation-panel__close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </header>

      <div className="valuation-panel__body">
        {isInsufficient ? (
          <div className="valuation-panel__insufficient">
            <p>資料不足，無法估值</p>
            {valuation.reason?.map((r, i) => (
              <p key={i}>• {r}</p>
            ))}
          </div>
        ) : (
          <>
            <div className="valuation-panel__range">
              <ValuationValue label="Bear (低估)" value={valuation.bear_value} />
              <ValuationValue label="Base (中位)" value={valuation.base_value} emphasized />
              <ValuationValue label="Bull (高估)" value={valuation.bull_value} />
            </div>

            <div className="valuation-panel__confidence">
              <span className={`badge badge--${valuation.confidence.toLowerCase()}`}>
                Confidence: {valuation.confidence}
              </span>
              <span className="valuation-panel__comparables-count">
                可比交易: {valuation.comparable_count} 筆
              </span>
            </div>

            {valuation.statistics && <StatisticsTable stats={valuation.statistics} />}
          </>
        )}

        {valuation.data_provenance && <ProvenanceFooter provenance={valuation.data_provenance} />}
        {valuation.algorithm_version && (
          <div className="valuation-panel__meta">Algorithm: {valuation.algorithm_version}</div>
        )}
      </div>
    </aside>
  );
}

interface ValuationValueProps {
  label: string;
  value?: number;
  emphasized?: boolean;
}

function ValuationValue({ label, value, emphasized }: ValuationValueProps) {
  const cls = `valuation-panel__value ${emphasized ? 'valuation-panel__value--base' : ''}`;
  return (
    <div className={cls}>
      <span className="valuation-panel__label">{label}</span>
      <span className="valuation-panel__amount">{value != null ? formatPrice(value) : '—'}</span>
    </div>
  );
}

function StatisticsTable({ stats }: { stats: PriceStatistics }) {
  const rows: Array<[string, number | undefined]> = [
    ['Count', stats.count],
    ['Min', stats.min],
    ['P10', stats.p10],
    ['P25', stats.p25],
    ['Median', stats.median],
    ['Mean', stats.mean],
    ['P75', stats.p75],
    ['P90', stats.p90],
    ['Max', stats.max],
  ];

  return (
    <table className="stats-table">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <td>{label}</td>
            <td>{value != null ? formatPricePerPing(value) : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ProvenanceFooter({ provenance }: { provenance: DataProvenance }) {
  const sourceRecord = provenance.source_record_hash;
  const snapshot = provenance.snapshot_id;
  return (
    <div className="valuation-panel__provenance">
      <small>
        Source: {provenance.source ?? '—'}
        {snapshot && <span> · Snapshot: {snapshot}</span>}
      </small>
      {sourceRecord && (
        <small className="valuation-panel__hash">Hash: {sourceRecord.slice(0, 12)}…</small>
      )}
    </div>
  );
}
