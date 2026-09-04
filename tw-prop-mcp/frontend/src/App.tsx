/**
 * App — root component.
 *
 * Provides a parcel-search form to drive MapView with an MCP analysis.
 * The frontend is purely a visualization layer (SPEC §Phase-15 / T022): all
 * computation — geometry, valuation, comparable scoring — is performed by
 * the deterministic MCP server. The frontend only renders.
 */

import { useState } from 'react';
import { MapView } from './components/MapView';
import './App.css';

export interface ParcelSelectorProps {
  onSubmit: (parcel: {
    county: string;
    district: string;
    section: string;
    land_number: string;
  }) => void;
}

export function App() {
  const [selectedParcel, setSelectedParcel] = useState<{
    county: string;
    district: string;
    section: string;
    land_number: string;
  } | null>(null);

  return (
    <div className="app">
      <header className="app__header">
        <h1>台灣實價登錄地圖</h1>
        <p>Powered by MCP — deterministic valuation, visualized</p>
      </header>

      <div className="app__body">
        <nav className="app__sidebar">
          <ParcelSearchForm onSubmit={setSelectedParcel} />
          <div className="app__hint">
            <small>
              輸入地號（縣市、鄉鎮、段、地號）以顯示 polygon、成交點、道路、
              可比交易及估值結果。地圖資料來自 MCP server，不直接查詢資料庫。
            </small>
          </div>
        </nav>

        <main className="app__main">
          <MapView initialParcel={selectedParcel ?? undefined} />
        </main>
      </div>
    </div>
  );
}

export function ParcelSearchForm({ onSubmit }: ParcelSelectorProps) {
  const [county, setCounty] = useState('澎湖縣');
  const [district, setDistrict] = useState('西嶼鄉');
  const [section, setSection] = useState('');
  const [landNumber, setLandNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!section || !landNumber) return;
    onSubmit({ county, district, section, land_number: landNumber });
  };

  return (
    <form className="parcel-form" onSubmit={handleSubmit}>
      <h2>查詢地號</h2>

      <div className="parcel-form__field">
        <label>縣市</label>
        <input
          type="text"
          value={county}
          onChange={(e) => setCounty(e.target.value)}
          placeholder="澎湖縣"
          required
        />
      </div>

      <div className="parcel-form__field">
        <label>鄉鎮</label>
        <input
          type="text"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          placeholder="西嶼鄉"
          required
        />
      </div>

      <div className="parcel-form__field">
        <label>段</label>
        <input
          type="text"
          value={section}
          onChange={(e) => setSection(e.target.value)}
          placeholder="竹篙灣段"
          required
        />
      </div>

      <div className="parcel-form__field">
        <label>地號</label>
        <input
          type="text"
          value={landNumber}
          onChange={(e) => setLandNumber(e.target.value)}
          placeholder="3615"
          required
        />
      </div>

      <button type="submit" className="parcel-form__submit">
        查詢
      </button>
    </form>
  );
}
