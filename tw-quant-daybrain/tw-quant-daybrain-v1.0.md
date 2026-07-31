
## `tw-quant-daybrain` 專案開發設計規格書

```markdown
# tw-quant-daybrain 開發設計規格書 (System Architecture & Design Specification)

## 1. 專案簡介 (Overview)
`tw-quant-daybrain` 是一個專為台股動能當沖 (Momentum Day Trading) 打造的 AI 決策與戰略大腦 (Agent)。本專案不直接進行低階的爬蟲與指標計算，而是作為 Client 端，透過 MCP (Model Context Protocol) 協定連接 `tw-quant-mcp` 伺服器，結合 LLM 的推理能力，實現「盤前選股、盤中即時監控、進出場決策與盤後檢討」的自動化流程。

## 2. 系統架構與職責分離 (Architecture & Separation of Concerns)

+-----------------------------------------------------------------------+
|                         tw-quant-daybrain                             |
|  (Strategy & Decision Engine / TypeScript or Python Agent)            |
|                                                                       |
|  ┌───────────────────┐    ┌───────────────────┐    ┌──────────────┐  |
|  │  1. 盤前選股引擎  │    │  2. 盤中決策模組  │    │ 3. 自動風控  │  |
|  │  (Watchlist)      │    │  (Signal Evaluator│    │   與停損機制 │  |
|  └─────────┬─────────┘    └─────────┬─────────┘    └───────┬──────┘  |
+────────────┼────────────────────────┼──────────────────────┼──────────+
             │                        │ (MCP JSON-RPC)       │
             ▼                        ▼                      ▼
+-----------------------------------------------------------------------+
|                         tw-quant-mcp                                  |
|  (Data & Compute Engine / Go Server)                                  |
|                                                                       |
|  [TWSE / TPEx / MOPS API]   [TAIFEX Parser]   [Intraday VWAP Engine] |
+-----------------------------------------------------------------------+

### 職責界線：
* **tw-quant-mcp (Go)：** 負責數據抓取、硬性數據計算（VWAP、MA、RSI）、當沖資格篩選與快取。
* **tw-quant-daybrain (AI Agent)：** 負責邏輯綜合研判、多空訊號給分、擬定交易劇本與自然語言交易日誌生成。

---

## 3. 核心運作生命週期 (Core Lifecycle Workflow)

### Phase 1: 盤前戰術規劃 (08:30 - 08:50)
1. **呼叫 `tw-quant-mcp` 的篩選工具：**
   * 抓取前一日投信/外資同步買超張數前 20 名。
   * 檢查 MOPS 是否有盤後重大消息發布。
   * 呼叫 `scan_daytrade_eligibility` 過濾掉禁止當沖與處置股票。
2. **生成今日觀察清單 (Watchlist)：**
   * 選出 3~5 檔當日強勢當沖觀察股，並自動為每檔個股訂定：
     * **做多觸發價 (Long Trigger)：** 突破昨日高點且站穩 VWAP。
     * **硬停損位 (Hard Stop Loss)：** -1.5% 或跌破今日 VWAP。

### Phase 2: 盤中動能觸發與訊號評估 (09:00 - 12:30)
1. **輪詢與觸發：**
   * 透過 MCP 監控觀察股的 `detect_volume_surge` 與 `get_intraday_vwap`。
2. **多空訊號打分 (Signal Scoring Model)：**
   當個股爆量時，DayBrain 進行綜合評分（滿分 100 分）：
   * **量能加分 (+30)：** 1 分鐘量為均量 3 倍以上。
   * **位階加分 (+30)：** 股價處於 VWAP 之上 且 剛突破盤前預設之強弱分界。
   * **大盤順風 (+20)：** 台指期當日維持紅盤且 PCR > 100%。
   * **風控過濾 (-100)：** 接近漲停板 (距漲停 < 1.5%) 無足夠利潤空間 ➔ 直接放棄。
3. **產出建議訊號 (Actionable Recommendation)：**
   * 若分數 > 80 分，觸發進場建議訊號，包含：`建議進場價`、`目標價 (R:R > 2:1)`、`停損價`。

### Phase 3: 盤後檢討與策略優化 (14:30 - 15:00)
1. **數據統計：** 抓取當天推薦標的的收盤表現與 K 線走勢。
2. **生成交易日誌：** 利用 LLM 生成當日當沖策略檢討報告，檢視訊號勝率與假突破原因（例如：大盤反轉導致動能衰退）。

---

## 4. 專案資料結構與介面設計 (Interface Specification)

### 觀察清單輸出格式 (`WatchlistTarget`)
```json
{
  "date": "2026-08-03",
  "watchlist": [
    {
      "symbol": "2308",
      "name": "台達電",
      "direction": "LONG",
      "trigger_price": 348.0,
      "stop_loss_price": 342.0,
      "take_profit_price": 360.0,
      "catalyst": "外資連續買超 3 日，營收創高且投信剛鎖碼",
      "risk_status": "CLEAR"
    }
  ]
}

```

---

## 5. 技術選型建議 (Tech Stack)

* **開發語言：** TypeScript (Node.js) 或 Python (依 Agent 框架習慣，推薦 TypeScript 配合 `@modelcontextprotocol/sdk`)。
* **LLM 模型：** Claude 3.5 Sonnet / GPT-4o (用於邏輯推理與多空訊號打分)。
* **MCP 連接器：** 使用標準 Stdio 或 SSE 協定連接 `tw-quant-mcp` 二進位檔。

---

## 6. 安全與風險警告 (Risk Guardrails)

1. **嚴禁自動下單授權 (Human-in-the-loop)：** 本 Brain 初期僅輸出「訊號與建議」，下單動作必須由人工確認或設定嚴格的券商 API 限額。
2. **硬性時間限制：** 13:00 後停止發送任何買進/做多當沖訊號，避免尾盤流動性枯竭無法平倉。
3. **強制強制平倉提醒：** 13:15 若系統偵測到持倉未平，發出最高等級強制平倉警告。

```

```
