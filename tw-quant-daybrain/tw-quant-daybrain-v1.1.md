# `tw-quant-daybrain` 專案開發設計規格書 (v1.1.0)

**Momentum Day-Trading Decision & Strategy Brain for TWSE**

---

## 0. 版本變更記錄

| 版本 | 變更重點 |
|---|---|
| v1.0 | 初版：盤前/盤中/盤後三階段流程、訊號打分模型雛形、基本風控時間限制 |
| **v1.1** | ① 修正文件結構（移除整篇 code block 包裹、統一標題層級）；② 對齊 `tw-quant-mcp` **v1.3** 之工具契約（Envelope / `_lineage` / `_chart_meta`）；③ 新增「資料新鮮度守門（Data Freshness Gate）」，以 `_lineage` 判定資料是否可用，防止以過期資料下決策；④ 訊號模型改為 Config-Driven 且可版本化，加入雙 tick 確認機制與市場濾網；⑤ 新增完整風控章節（倉位規模、持倉狀態機、每日虧損上限、假突破回收規則）；⑥ 新增 LLM 輸出驗證與防幻覺規範；⑦ 新增交易日誌結構化 Schema 與績效指標定義；⑧ 新增部署與營運章節（排程、連線、Logging）；⑨ 新增 Roadmap。 |

---

## 1. 專案簡介與願景 (Overview)

`tw-quant-daybrain` 是專為台股動能當沖（Momentum Day Trading）打造的 **AI 決策與戰略大腦（Agent）**。本專案不做低階資料抓取與指標計算，而是作為 Client 端，透過 MCP（Model Context Protocol）連接 `tw-quant-mcp` 伺服器，結合 LLM 推理，實現「盤前選股 → 盤中監控與訊號 → 風控管理 → 盤後檢討」之自動化循環。

**核心原則：**
1. **數據在 mcp，決策在 daybrain**：所有硬性數字（價格、量、指標）以 `tw-quant-mcp` 回傳為唯一真值；LLM 只做綜合研判與敘事。
2. **決策前先驗血統**：任何訊號判定前必須通過 §3 資料新鮮度守門。
3. **規則引擎優先，LLM 輔助**：進出場價格、停損停利、倉位規模由規則計算；LLM 負責劇本、敘事與日誌。
4. **Human-in-the-loop**：本系統僅輸出建議訊號，不自動下單。
5. **所有決策可回放**：每筆訊號與每次決策皆寫入結構化事件日誌，供盤後統計與回測驗證。

---

## 2. 系統架構與職責分離 (Architecture & Separation of Concerns)

```text
┌───────────────────────────────────────────────────────────────────────┐
│                      tw-quant-daybrain (本專案)                        │
│             (Strategy & Decision Engine / TypeScript Agent)            │
│                                                                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐  │
│  │ Phase 0-1      │ │ Phase 2         │ │  Risk Manager           │  │
│  │ 盤前選股引擎    │ │ 盤中訊號評估     │ │  部位狀態機 / 倉位 / 停損 │  │
│  │ (Watchlist)    │ │ (Signal Eval)   │ │  (Position State Machine)│  │
│  └────────┬────────┘ └────────┬────────┘ └───────────┬─────────────┘  │
│  ┌────────┴───────────────────┴──────────────────────┴─────────────┐  │
│  │ Freshness Gate（_lineage 檢查） / Cache / Circuit Breaker        │  │
│  └────────┬──────────────────────────────────────────────────────────┘  │
└───────────┼───────────────────────────────┬────────────────────────────┘
            │  MCP JSON-RPC (Stdio / Streamable HTTP)
┌───────────▼───────────────────────────────▼────────────────────────────┐
│                        tw-quant-mcp (v1.3)                             │
│               (Data & Compute Engine / Go Server)                      │
│  [TWSE/TPEx/MOPS Adapters] [TAIFEX API+DL] [Intraday Kline Engine]     │
│  [Cache & Rate Limit] [Envelope: data + _lineage + _chart_meta]        │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1 職責界線

| 層級 | 負責項目 | 不負責項目 |
|---|---|---|
| `tw-quant-mcp`（Go） | 資料抓取、快取、Rate Limit、VWAP/MA/RSI 計算、當沖資格掃描、即時 1 分 K 聚合 | 交易策略、訊號評分、下單 |
| `tw-quant-daybrain`（TS Agent） | 觀察清單生成、多空訊號給分、交易劇本、倉位與風控、交易日誌 | 資料抓取、低階指標計算 |

### 2.2 對 `tw-quant-mcp` v1.3 之工具契約（本專案使用之子集）

| daybrain 用途 | 使用的 MCP Tool | 關鍵輸出 |
|---|---|---|
| 觀察清單設定 | `set_active_watchlist` | 確認 1~15 檔 |
| 盤中監控 | `get_intraday_vwap` / `detect_volume_surge` / `get_intraday_quote` | VWAP、爆量、即時價 |
| 即時 K 線確認 | `get_intraday_kline` | 1m/5m Candle 序列（假突破判定） |
| 市場濾網 | `get_market_summary` / `get_futures_daily_ohlc` / `get_put_call_ratio` | 漲跌家數、台指期、PCR |
| 盤前選股 | `get_institutional_investors` / `get_major_announcements` / `get_abnormal_trading` / `get_stock_daily_kline` | 法人買賣超、重大訊息、量能異常 |
| 風險掃描 | `scan_daytrade_eligibility` | 當沖資格/處置/注意/停資停券 |
| 行事曆 | `get_trading_calendar` / `get_symbol_list` | 交易日判定、代碼驗證 |

> 所有工具回傳皆為 Envelope（`data` / `_lineage` / `_chart_meta`）；**任何引用 `data` 前必須通過 §3 守門**。

---

## 3. 資料新鮮度守門（Data Freshness Gate）

> 防止「以過期或降級資料做出當沖決策」——當沖對資料延遲極度敏感，此為 v1.1 最重要的強化。

### 3.1 判定規則

針對每次 MCP 呼叫回傳之 `_lineage`，依下表驗證：

| 場景 | 檢查項目 | 通過條件 |
|---|---|---|
| 盤中訊號（常態） | `freshness` | `REALTIME_INTRADAY` |
| 盤中訊號（時效） | `fetched_at` | 距今 ≤ `DATA_STALENESS_MAX_SEC`（預設 30s） |
| 盤中訊號（快取容許） | `is_cached` | 容許，但 `sampling_sec ≤ 10` 且 `cache_ttl ≤ 4s` |
| 盤前規劃 | `freshness` | `POST_MARKET_TODAY`（前一日資料必須為已收盤且完整） |
| 歷史回溯 | `freshness` | `HISTORICAL` 且 `data_date` 覆蓋查詢範圍 |

### 3.2 逾時降級（Degradation Policy）

| 狀態 | 觸發條件 | 行為 |
|---|---|---|
| `NORMAL` | 守門全數通過 | 正常產生訊號 |
| `STALE` | 單一標的資料逾時 | 該標的暫停發訊，標記 `risk_status=STALE` |
| `DEGRADED` | 市場層資料（台指期/PCR/漲跌家數）逾時 | 停發新訊號，僅維持既有持倉風控 |
| `LOCKOUT` | 連續 3 次守門失敗 或 MCP 連線中斷 | 全系統停發訊號；已持倉者依「強制平倉提醒」處理 |

- 守門判定結果必須寫入事件日誌（`freshness_gate_pass|fail`）。

---

## 4. 核心運作生命週期 (Core Lifecycle Workflow)

> 所有 Phase 由交易日曆觸發；非交易日不執行（`get_trading_calendar` 驗證）。

### Phase 0：資料就緒檢查（08:15 – 08:30）

1. 驗證 MCP 連線（`tools/list` handshake）。
2. 預熱：呼叫 `get_trading_calendar`、`get_symbol_list`、前一日盤後資料，確認 `freshness == POST_MARKET_TODAY`。
3. 失敗時依 §3.2 降級並於盤前報告中註明缺口。

### Phase 1：盤前戰術規劃（08:30 – 08:50）

1. **選股來源（多路徑、去重）：**
   - 前一日投信/外資同步買超前 20 名（`get_institutional_investors`）。
   - 前一日量能異常放大個股（`get_abnormal_trading`）。
   - 盤後重大訊息個股（`get_major_announcements`）。
2. **過濾：** `scan_daytrade_eligibility` 剔除禁止當沖、處置、注意股；剔除停資停券標的。
3. **生成今日觀察清單（3–5 檔）：** 每檔訂定並寫入 `WatchlistTarget`（見 §7.1）：
   - **做多觸發價**：昨日高點且需站穩 VWAP。
   - **硬停損位**：-1.5% 或跌破今日 VWAP（先觸發者）。
4. 呼叫 `set_active_watchlist`（≤15 檔）啟動 mcp 端 8s 採樣。

### Phase 2：盤中動能觸發與訊號評估（09:00 – 12:30，tick 週期 10s）

1. **開盤緩衝：09:00 – 09:05 不進場**（開盤競價噪音），此期間僅收集資料。
2. **輪詢與觸發：** 每 tick 對觀察清單呼叫 `get_intraday_vwap` 與 `detect_volume_surge`；所有資料先過 §3 守門。
3. **雙 tick 確認：** 爆量或突破訊號需連續兩次 tick 確認（避免單一 Snapshot 假訊號），確認後才進入 §5 評分。
4. **假突破回收：** 確認訊號後 3 分鐘內價格回落至 VWAP 下方 → 取消該訊號並記為 `failed_breakout` 事件。
5. **評分與建議：** 依 §5 模型產出 `SignalAdvice`（見 §7.2）。
6. **進場後：** 移交 Risk Manager（§6.2）管理持倉狀態機。

### Phase 3：尾盤收斂（12:30 – 13:30）

1. **12:30**：警示——不再建立新倉位（配置可調，預設最後進場 13:00）。
2. **13:00**：硬性停止發送任何新買進/做多訊號。
3. **13:15**：偵測到未平倉部位 → 輸出最高等級「強制平倉提醒」。
4. **13:20**：強烈要求全數平倉（當沖不留倉）。

### Phase 4：盤後檢討與策略優化（14:30 – 15:00）

1. **數據統計：** 以 `get_stock_daily_kline` / `get_intraday_kline` 回推當日推薦標的之實際表現，比對建議價與實際成交價之滑價。
2. **結構化日誌：** 寫入 `JournalEntry`（見 §7.4），計算績效指標（見 §8）。
3. **LLM 檢討報告：** 以結構化統計為輸入，生成當日策略檢討（勝率、假突破原因、大盤情境歸因），**統計數字一律由規則引擎提供，LLM 不得自行估算**。

---

## 5. 訊號模型（Signal Scoring Model）

### 5.1 設計原則

- **Config-Driven**：權重與門檻定義於 `config/scoring.yaml`，可版本化（`scoring_version` 寫入每筆訊號）。
- **Veto 優先**：風控條件觸發直接否決（-100），不與其他分數加總。
- **完整評分僅在雙 tick 確認後執行**。

### 5.2 評分表（預設值）

| 項目 | 條件 | 分數 |
|---|---|---|
| 量能 | `volume_ratio ≥ 3.0`（mcp `detect_volume_surge`） | +30 |
| 位階 | 價 > VWAP 且突破盤前觸發價 | +30 |
| 大盤順風 | 台指期當日紅盤 且 PCR > 100% | +20 |
| 買盤結構（進階） | 連續 tick 上價（up-tick）比例 ≥ 70%（以 1 分 K 判讀） | +20 |
| 風控 Veto | 距漲停 < 1.5%（利潤空間不足） | -100（否決） |
| 風控 Veto | 處置/注意/當沖限制/停資停券 | -100（否決） |

### 5.3 門檻與行為

| 分數 | 等級 | 行為 |
|---|---|---|
| ≥ 80 | `STRONG_BUY` | 產出進場建議（含觸發價、目標價 R:R ≥ 2:1、停損價） |
| 60 – 79 | `WATCH` | 僅記錄，不建議進場 |
| < 60 | `IGNORE` | 忽略 |

- 訊號產生後 5 分鐘內未觸發進場價 → 過期重評（re-score），避免尾盤追價。

---

## 6. 風控系統 (Risk Management)

### 6.1 倉位規模（Position Sizing）

```
單筆風險 = 帳戶權益 × RISK_PER_TRADE（預設 0.5%，上限 1%）
倉位股數 = 單筆風險 ÷ (進場價 − 停損價)
```

- 同時最多 `MAX_POSITIONS` 檔持倉（預設 2）。
- 單一標的曝險不超過權益 10%。

### 6.2 持倉狀態機（Position State Machine）

```text
IDLE → SCANNING → ARMED(觸發價設好) → TRIGGERED(價≥觸發價且評分≥80)
→ ENTERED(回報成交) → MANAGED(移動停損/依規則出場) → CLOSED(平倉)
→ LOGGED(寫入 JournalEntry)
```

- 每次狀態轉移皆寫入事件日誌（`position_state_change`）。
- `TRIGGERED → ENTERED` 需人工確認或紙上交單回報（Human-in-the-loop）。

### 6.3 出場規則（優先序）

1. **硬停損**：虧損達 -1.5% 或跌破今日 VWAP（先觸發者）。
2. **目標價**：R:R ≥ 2:1 達成即出場（可部分獲利了結）。
3. **時間停損**：13:20 強制全數平倉。
4. **假突破回收**：§4 Phase 2 之回收規則觸發時出場。

### 6.4 每日風控上限

| 規則 | 預設值 | 觸發行為 |
|---|---|---|
| 每日最大虧損 | 權益 -3% | 停止當日所有新訊號（`DAILY_LOCKOUT`），僅執行既有持倉出場 |
| 連續虧損 | 連 3 筆停損 | 降低次日倉位規模 50%（下一交易日生效） |
| 單日最大交易次數 | 10 | 超出後僅保留出場管理 |

### 6.5 時間限制（Config）

| 時間 | 規則 |
|---|---|
| 09:00 – 09:05 | 不進場（開盤緩衝） |
| 12:30 | 警示：不再建立新倉位 |
| 13:00 | 硬性停止發送新買進/做多訊號 |
| 13:15 | 未平倉 → 最高等級強制平倉提醒 |
| 13:20 | 強制全數平倉 |

---

## 7. 資料結構與介面設計 (Interface Specification)

### 7.1 觀察清單 (`WatchlistTarget`)

```json
{
  "date": "2026-08-03",
  "scoring_version": "1.1.0",
  "watchlist": [
    {
      "symbol": "2308",
      "name": "台達電",
      "direction": "LONG",
      "trigger_price": 348.0,
      "stop_loss_price": 342.0,
      "take_profit_price": 360.0,
      "risk_per_trade_pct": 0.5,
      "position_size_shares": 2000,
      "catalyst": "外資連續買超 3 日，營收創高且投信鎖碼",
      "risk_status": "CLEAR"
    }
  ]
}
```

### 7.2 進場建議 (`SignalAdvice`)

```json
{
  "signal_id": "20260803-2308-094512",
  "ts": "2026-08-03T09:45:12+08:00",
  "symbol": "2308",
  "grade": "STRONG_BUY",
  "score": 85,
  "score_breakdown": { "volume": 30, "level": 30, "market": 20, "tick_structure": 5 },
  "recommended_entry": 348.5,
  "target_price": 360.0,
  "stop_loss_price": 342.0,
  "rr_ratio": 2.5,
  "position_size_shares": 2000,
  "data_quality": { "freshness": "REALTIME_INTRADAY", "fetched_lag_sec": 3, "is_cached": false },
  "expiry_ts": "2026-08-03T09:50:12+08:00"
}
```

### 7.3 持倉 (`Position`)

```json
{
  "position_id": "P-20260803-01",
  "signal_id": "20260803-2308-094512",
  "symbol": "2308",
  "state": "ENTERED",
  "entry_price": 348.5,
  "entry_ts": "2026-08-03T09:46:00+08:00",
  "stop_loss_price": 342.0,
  "target_price": 360.0,
  "shares": 2000,
  "trailing_stop_ts": "2026-08-03T13:20:00+08:00"
}
```

### 7.4 交易日誌 (`JournalEntry`，結構化，供 LLM 報告之唯一統計來源)

```json
{
  "date": "2026-08-03",
  "scoring_version": "1.1.0",
  "summary": {
    "signals_issued": 4,
    "signals_triggered": 3,
    "trades_executed": 2,
    "wins": 1,
    "losses": 1,
    "gross_pnl": 12450,
    "net_pnl": 11050,
    "hit_rate": 0.5,
    "avg_win": 23600,
    "avg_loss": -12550,
    "profit_factor": 1.88,
    "max_drawdown_pct": -1.2,
    "slippage_avg_pct": -0.08
  },
  "events": [
    { "ts": "2026-08-03T09:45:12+08:00", "type": "signal_issued", "signal_id": "20260803-2308-094512" },
    { "ts": "2026-08-03T09:46:00+08:00", "type": "position_opened", "position_id": "P-20260803-01" },
    { "ts": "2026-08-03T10:02:11+08:00", "type": "position_closed", "position_id": "P-20260803-01", "reason": "take_profit" },
    { "ts": "2026-08-03T10:20:45+08:00", "type": "freshness_gate_fail", "symbol": "2308", "cause": "stale_data" }
  ],
  "llm_report": "（由 LLM 以 summary + events 生成之文字檢討，不含數字推估）"
}
```

---

## 8. 績效指標定義（Evaluation Metrics）

| 指標 | 定義 | 用途 |
|---|---|---|
| 勝率（Hit Rate） | 獲利筆數 ÷ 總交易筆數 | 訊號品質 |
| 盈虧比（Profit Factor） | 總獲利 ÷ 總虧損（含手續費稅金） | 期望值驗證 |
| 期望值（Expectancy） | 平均每筆盈虧 | 策略可否存活 |
| 最大回撤（Max DD） | 日損益累積之最低點 | 風控上限驗證 |
| 訊號轉換率 | 觸發筆數 ÷ 訊號筆數 | 訊號可執行性 |
| 假突破率 | `failed_breakout` 事件 ÷ 確認訊號數 | 模型校正（可能原因：大盤反轉、量能不足） |

- 指標以週為週期滾動統計；連續 2 週 Profit Factor < 1.1 或 Hit Rate < 35% → 暫停策略並檢討參數。

---

## 9. LLM 使用規範（防幻覺）

1. **硬數字不經 LLM**：觸發價、停損價、倉位、分數一律由規則引擎產出；LLM 不得增減。
2. **輸出 Schema 驗證**：LLM 產生之任何結構化輸出（如 `llm_report`、劇本）通過 JSON Schema + 範圍檢查（數字必須為 null 或於合理區間內）。
3. **symbol 白名單**：LLM 提及之個股必須存在於當日觀察清單或 `get_symbol_list` 回傳，否則整段捨棄。
4. **統計引用限制**：LLM 檢討報告中的數字必須引用 `JournalEntry.summary`，禁止自行推算（如自行估計勝率）。
5. **不承諾報酬**：輸出模板中固定附上「僅供研究參考，不構成投資建議」。

---

## 10. 技術選型（Tech Stack）

| 項目 | 選擇 | 說明 |
|---|---|---|
| 開發語言 | TypeScript (Node.js ≥ 20) | 與 `@modelcontextprotocol/sdk` 原生整合 |
| LLM | Claude 4.x Sonnet（推理與打分）| 可由設定切換；評分模型本身不依賴 LLM |
| MCP 連線 | Stdio（本機，連接 `tw-quant-mcp` binary）| 亦可切 Streamable HTTP |
| 排程 | 自帶 Scheduler（cron 語法設定檔）| 見 §11.2 |
| 設定 | `config/*.yaml` + 環境變數覆寫 | 時區固定 `Asia/Taipei` |
| 日誌 | 結構化 JSON（事件型）| 支援回放（replay）工具 |

### 10.1 環境變數（預設值）

```text
TIME_ZONE=Asia/Taipei
MCP_SERVER_BIN=/usr/local/bin/tw-quant-mcp
MCP_TRANSPORT=stdio
DATA_STALENESS_MAX_SEC=30
SCORE_THRESHOLD=80
RISK_PER_TRADE=0.005
MAX_POSITIONS=2
MAX_DAILY_LOSS_PCT=3.0
NO_ENTRY_AFTER=13:00
FORCE_CLOSE_AT=13:20
LOG_DIR=./logs
```

---

## 11. 部署與營運（Deployment & Operations）

### 11.1 部署形態

- 本機單一進程：`tw-quant-daybrain`（Agent）+ 子程序 `tw-quant-mcp`（MCP Server）。
- 交易日自動執行；非交易日自動休眠（交易日曆判斷）。

### 11.2 排程（交易日）

| 時間 | 事件 |
|---|---|
| 08:15 | Phase 0 就緒檢查與預熱 |
| 08:30 | Phase 1 盤前選股 |
| 09:00 – 12:30 | Phase 2 盤中監控（tick 10s）|
| 12:30 / 13:00 / 13:15 / 13:20 | Phase 3 尾盤收斂觸發點 |
| 14:30 | Phase 4 盤後統計與日誌 |

### 11.3 失敗處理

| 失敗類型 | 行為 |
|---|---|
| MCP 連線中斷 | 重連（指數退避 1s→30s）；重連期間 `LOCKOUT`，不出訊號 |
| 單一 Tool 呼叫失敗 | 重試 2 次後跳過該資料源，標記缺口 |
| 資料守門失敗 | 依 §3.2 降級 |
| LLM 不可用 | 規則引擎仍可出訊號（附註 `llm_offline`），日誌由模板生成 |

---

## 12. Roadmap

| Phase | 內容 | 產出 |
|---|---|---|
| Phase 1（W1–2） | Agent 骨架、MCP 連線、Freshness Gate、事件日誌、交易日曆 | 可穩定運行之基礎架構 |
| Phase 2（W3–4） | 盤前選股流程、訊號模型 v1、Risk Manager 與狀態機、紙上交單 | 完整盤中循環 |
| Phase 3（W5–6） | JournalEntry 統計、績效指標、LLM 檢討報告、回放工具 | 回饋迴路閉合 |
| Phase 4（W7–8） | 參數最佳化實驗（scoring v1.1→v1.2）、壓測（10s tick × 全交易日）、文件補完 | v1.1 正式版 |

---

## 附錄 A：與 `tw-quant-mcp` v1.3 之介面對齊檢查表

- [ ] 所有 MCP 回傳使用 Envelope（`data` / `_lineage` / `_chart_meta`）解析。
- [ ] 盤中工具僅於 `09:00 – 13:30` 呼叫；非交易時段改走盤後工具。
- [ ] `set_active_watchlist` 一次不得超過 15 檔（mcp 端硬限制）。
- [ ] `_lineage.source` 僅允許官方來源（TWSE / TPEx / MOPS / TAIFEX / MIS），出現未知來源視同守門失敗。
- [ ] daybrain 不直接存取任何官方 HTTP API，所有資料路徑皆經 mcp。
