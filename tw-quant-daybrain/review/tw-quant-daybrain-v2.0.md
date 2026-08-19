# `tw-quant-daybrain` 專案開發設計規格書 (v2.0.0)

**Momentum Day-Trading Decision & Strategy Brain for TWSE**

---

## 0. 版本變更記錄

| 版本 | 變更重點 |
|---|---|
| v1.0 | 初版：盤前/盤中/盤後三階段流程、訊號打分模型雛形、基本風控時間限制 |
| v1.1 | ① 修正文件結構（移除整篇 code block 包裹、統一標題層級）；② 對齊 `tw-quant-mcp` **v1.3** 之工具契約（Envelope / `_lineage` / `_chart_meta`）；③ 新增「資料新鮮度守門（Data Freshness Gate）」；④ 訊號模型改為 Config-Driven 且可版本化，加入雙 tick 確認機制與市場濾網；⑤ 新增完整風控章節（倉位規模、持倉狀態機、每日虧損上限、假突破回收規則）；⑥ 新增 LLM 輸出驗證與防幻覺規範；⑦ 新增交易日誌結構化 Schema 與績效指標定義；⑧ 新增部署與營運章節；⑨ 新增 Roadmap |
| **v2.0** | ① 新增「盤前多空傾向鎖定（Bias Decision Tree）」：以 Bias Score（-100 ~ +100）於 08:55 鎖定 `LONG_ONLY` / `SHORT_ONLY` / `NEUTRAL_FLEXIBLE` / `NO_TRADE` 四態；② 新增兩套具體策略引擎：做多「VWAP 爆量突破（VWAP_SURGE_LONG）」與空方「假突破跌破 VWAP（BULL_TRAP_VWAP_SHORT）」，含各自的評分機制與多/空風控參數（停損停利、時間硬風控、JSON 訊號 Payload）；③ 新增「Tactical Briefing 產生器」：將盤前評估結構化為帶 Data Lineage 的狀態設定檔 JSON，盤中 Agent 強制載入並以 Action 白名單攔截反向訊號；④ 新增「Priority Ranking Engine（優先權排序與動態資金分配）」：解決多標的同時觸發時的資金爭奪，含 Tier 級資金上限、產業集中度限制與競爭搶單處理；⑤ 新增完整回測體系：1 分鐘 K 線事件驅動模擬器（含手續費/證交稅/滑點）、多格式 CSV DataLoader（時間格式收斂、成交量單位校正、缺棒處理）、Grid Search 參數網格搜尋（獲利高原判讀）、Walk-Forward Optimization 滾動驗證（WFE 指標）；⑥ 券商下單 Adapter 相關內容移出至獨立文件 `tw-quant-adapter-2.0.md` |

---

## 1. 專案簡介與願景 (Overview)

`tw-quant-daybrain` 是專為台股動能當沖（Momentum Day Trading）打造的 **AI 決策與戰略大腦（Agent）**。本專案不做低階資料抓取與指標計算，而是作為 Client 端，透過 MCP（Model Context Protocol）連接 `tw-quant-mcp` 伺服器，結合 LLM 推理，實現「盤前選股 → 盤中監控與訊號 → 風控管理 → 盤後檢討」之自動化循環。

**核心原則：**
1. **數據在 mcp，決策在 daybrain**：所有硬性數字（價格、量、指標）以 `tw-quant-mcp` 回傳為唯一真值；LLM 只做綜合研判與敘事。
2. **決策前先驗血統**：任何訊號判定前必須通過 §3 資料新鮮度守門。
3. **規則引擎優先，LLM 輔助**：進出場價格、停損停利、倉位規模由規則計算；LLM 負責劇本、敘事與日誌。
4. **Human-in-the-loop**：本系統僅輸出建議訊號，不自動下單（下單層級之券商介接見 `tw-quant-adapter-2.0.md`）。
5. **所有決策可回放**：每筆訊號與每次決策皆寫入結構化事件日誌，供盤後統計與回測驗證。
6. **極簡勝率過濾 + 無情風控執行**：當沖交易決策不需要複雜的神經網絡，核心在於「極簡的勝率過濾」與「無情的風控執行」。

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
│  │ Bias Decision  │ │ VWAP Surge /    │ └───────────┬─────────────┘  │
│  │ Tree           │ │ Bull Trap 引擎   │             │                │
│  └────────┬────────┘ └────────┬────────┘ ┌───────────▼─────────────┐  │
│  ┌────────┴───────────────────┴──────────┤  Priority Ranking       │  │
│  │ Freshness Gate / Cache / Circuit      │  Engine（資金調度）     │  │
│  │ Breaker                               └───────────┬─────────────┘  │
│  └────────┬───────────────────────────────────────────┘                │
└───────────┼───────────────────────────────┬────────────────────────────┘
            │  MCP JSON-RPC (Stdio / Streamable HTTP)
┌───────────▼───────────────────────────────▼────────────────────────────┐
│                        tw-quant-mcp (v1.3)                             │
│               (Data & Compute Engine / Go Server)                      │
│  [TWSE/TPEx/MOPS Adapters] [TAIFEX API+DL] [Intraday Kline Engine]     │
│  [Cache & Rate Limit] [Envelope: data + _lineage + _chart_meta]        │
└────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│  Offline 驗證迴路（回測 / 參數最佳化，§12-§13）                         │
│  CsvDataLoader → DayBrainBacktestSimulator → GridSearch → WFO          │
└───────────────────────────────────────────────────────────────────────┘
```

### 2.1 職責界線

| 層級 | 負責項目 | 不負責項目 |
|---|---|---|
| `tw-quant-mcp`（Go） | 資料抓取、快取、Rate Limit、VWAP/MA/RSI 計算、當沖資格掃描、即時 1 分 K 聚合 | 交易策略、訊號評分、下單 |
| `tw-quant-daybrain`（TS Agent） | 觀察清單生成、多空訊號給分、交易劇本、倉位與風控、交易日誌、回測與參數驗證 | 資料抓取、低階指標計算 |
| 券商 Adapter（另冊） | 下單/撤單/改價/查詢、憑證簽章、回報對帳（見 `tw-quant-adapter-2.0.md`） | 策略與風控決策 |

### 2.2 對 `tw-quant-mcp` v1.3 之工具契約（本專案使用之子集）

| daybrain 用途 | 使用的 MCP Tool | 關鍵輸出 |
|---|---|---|
| 觀察清單設定 | `set_active_watchlist` | 確認 1~15 檔 |
| 盤中監控 | `get_intraday_vwap` / `detect_volume_surge` / `get_intraday_quote` | VWAP、爆量、即時價 |
| 即時 K 線確認 | `get_intraday_kline` | 1m/5m Candle 序列（假突破判定） |
| 市場濾網 | `get_market_summary` / `get_futures_daily_ohlc` / `get_put_call_ratio` | 漲跌家數、台指期、PCR |
| 盤前選股 | `get_institutional_investors` / `get_major_announcements` / `get_abnormal_trading` / `get_stock_daily_kline` | 法人買賣超、重大訊息、量能異常 |
| 風險掃描 | `scan_daytrade_eligibility` | 當沖資格/處置/注意/停資停券 |
| 盤前試撮 | `get_pre_market_quote` | 08:40-08:55 試撮價與量能 |
| 夜盤與美股 | `get_taifex_night` / `get_us_market` | 台指夜盤、NVDA/TSM ADR |
| 行事曆 | `get_trading_calendar` / `get_symbol_list` | 交易日判定、代碼驗證 |

> 所有工具回傳皆為 Envelope（`data` / `_lineage` / `_chart_meta`）；**任何引用 `data` 前必須通過 §3 守門**。

---

## 3. 資料新鮮度守門（Data Freshness Gate）

> 防止「以過期或降級資料做出當沖決策」——當沖對資料延遲極度敏感。

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

### Phase 1：盤前戰術規劃（08:30 – 08:55）

1. **選股來源（多路徑、去重）：**
   - 前一日投信/外資同步買超前 20 名（`get_institutional_investors`）。
   - 前一日量能異常放大個股（`get_abnormal_trading`）。
   - 盤後重大訊息個股（`get_major_announcements`）。
2. **過濾：** `scan_daytrade_eligibility` 剔除禁止當沖、處置、注意股；剔除停資停券標的。
3. **多空傾向鎖定（08:30 – 08:55）：** 對候選標的執行 §5「盤前多空決策樹」，於 **08:55** 正式鎖定今日戰術（`LONG_ONLY` / `SHORT_ONLY` / `NEUTRAL_FLEXIBLE` / `NO_TRADE`）。
4. **產出 Tactical Briefing（08:55）：** 依 §9 產生器輸出結構化 `briefing.json`（含 Data Lineage、方向鎖定、風控參數），作為盤中 Agent 的**狀態設定檔**。
5. **生成今日觀察清單（3–5 檔）：** 每檔訂定並寫入 `WatchlistTarget`（見 §14.1）：
   - **做多觸發價**：昨日高點且需站穩 VWAP。
   - **硬停損位**：-1.5% 或跌破今日 VWAP（先觸發者）。
6. 呼叫 `set_active_watchlist`（≤15 檔）啟動 mcp 端 8s 採樣。

### Phase 2：盤中動能觸發與訊號評估（09:00 – 12:30，tick 週期 10s）

1. **開盤緩衝：09:00 – 09:05 不進場**（開盤競價噪音），此期間僅收集資料。
2. **輪詢與觸發：** 每 tick 對觀察清單呼叫 `get_intraday_vwap` 與 `detect_volume_surge`；所有資料先過 §3 守門。
3. **雙 tick 確認：** 爆量或突破訊號需連續兩次 tick 確認（避免單一 Snapshot 假訊號），確認後才進入 §8 評分。
4. **Bias 白名單攔截：** 觸發訊號時先檢查當日 Briefing 的 `trading_plan.allowed_actions`；例如 `LONG_ONLY` 日即使空方評分 90 分也會在 `blocked_actions` 第一關被攔截。
5. **多標的資金調度：** 同一 tick 內多檔同時觸發時，交由 §10 `PriorityRankingEngine` 依 Rank Score 排隊並分配資金。
6. **假突破回收：** 確認訊號後 3 分鐘內價格回落至 VWAP 下方 → 取消該訊號並記為 `failed_breakout` 事件。
7. **評分與建議：** 依 §8 模型（配合 §6/§7 策略引擎）產出 `SignalAdvice`（見 §14.2）。
8. **進場後：** 移交 Risk Manager（§11）管理持倉狀態機。

### Phase 3：尾盤收斂（12:30 – 13:30）

| 時間 | 規則 |
|---|---|
| 11:30 | 停止發送新空單訊號（空方視角，§7.4；多方則 12:30 起停發） |
| 12:30 | 警示：不再建立新倉位（配置可調） |
| 13:00 | 硬性停止發送任何新買進/做多訊號；空單 13:00 強制回補 |
| 13:10 | 多方強制平倉警告（`FORCE_FLAT_ALL`）；13:10 後 Adapter 層硬性阻擋開倉 |
| 13:15 | 偵測到未平倉部位 → 輸出最高等級「強制平倉提醒」 |
| 13:20 | 強烈要求全數平倉（當沖不留倉） |

### Phase 4：盤後檢討與策略優化（14:30 – 15:00）

1. **數據統計：** 以 `get_stock_daily_kline` / `get_intraday_kline` 回推當日推薦標的之實際表現，比對建議價與實際成交價之滑價。
2. **結構化日誌：** 寫入 `JournalEntry`（見 §14.4），計算績效指標（見 §15）。
3. **LLM 檢討報告：** 以結構化統計為輸入，生成當日策略檢討（勝率、假突破原因、大盤情境歸因），**統計數字一律由規則引擎提供，LLM 不得自行估算**。
4. **定期回測與參數驗證：** 依 §12/§13 將累積之事件日誌與歷史 1 分 K 進行回測、Grid Search 與 WFO，輸出下一版參數建議。

---

## 5. 盤前多空傾向鎖定（Bias Decision Tree）

> 當沖策略最忌諱「盤中臨時起意做多做空」。在 09:00 開盤前，必須依據客觀數據完成 **「多空傾向鎖定 (Bias Lock)」**，防止盤中因隨機震盪頻繁多空對砍（Whipsaw），確保當天只專注於單一方向的高勝率進場點。

### 5.1 決策樹架構

分為 4 個階段判斷：**風控關卡 ➔ 籌碼/趨勢基調 ➔ 消息與夜盤共振 ➔ 盤前試撮驗證**。

```
                              [ 08:30 啟動盤前評估 ]
                                         │
                                         ▼
                             【Node 1: 風控硬性關卡】
                             · 當沖/借券資格開通？
                             · 是否為處置/注意股？
                                  │            │
                           (否)   │            │ (是)
            ┌─────────────────────┘            └─────────────────────┐
            ▼                                                        ▼
    [ ❌ 今日禁止當沖 ]                                        【Node 2: 籌碼與日線趨勢】
                                                               · 法人買賣超 (前 3 日)
                                                               · 股價與 5MA / 20MA 位階
                                                                     │
                                             ┌───────────────────────┴───────────────────────┐
                                             ▼                                               ▼
                                     【多方基調 (Bullish)】                          【空方基調 (Bearish)】
                                             │                                               │
                                             ▼                                               ▼
                                  【Node 3: 外部共振】                            【Node 4: 外部共振】
                                  · 美股 ADR / 輝達走勢                         · 美股 ADR / 輝達走勢
                                  · 台指夜盤表現                                  · 台指夜盤表現
                                             │                                               │
                      ┌──────────────────────┴──────────────────────┐        ┌───────────────┴───────────────┐
                      ▼                                             ▼        ▼                               ▼
               (強勢共振 / 平淡)                                 (嚴重背離) (強勢共振 / 平淡)                 (嚴重背離)
                      │                                             │        │                               │
                      ▼                                             ▼        ▼                               ▼
          【Node 5: 08:40 試撮驗證】                           【觀望 / 雙向中立】  【Node 5: 08:40 試撮驗證】    【觀望 / 雙向中立】
          · 試撮價格 vs 昨收                                       │        · 試撮價格 vs 昨收              │
          · 試撮量能狀態                                           │        · 試撮量能狀態                  │
             │          │                                          │           │          │                 │
      (符合預期)        │ (異常低開)                               │    (符合預期)        │ (異常跳空高開)       │
         │              │                                          │       │              │                 │
         ▼              └───────────────────┐                      │       ▼              └─────────┐       │
  【🟢 鎖定 LONG】                          ▼                      │  【🔴 鎖定 SHORT】             ▼       ▼
(僅尋找 VWAP 爆量突破)               【⚪ NEUTRAL 中立】 ◄──────────┴─ (僅尋找 VWAP 爆量跌破)     【⚪ NEUTRAL 中立】
                                   (盤中雙向或觀望)                                           (盤中雙向或觀望)
```

### 5.2 各節點極簡權重與打分機制（Bias Score，範圍 -100 ~ +100）

| 評估維度 | 數據來源 (via MCP) | 判定條件 | 權重得分 |
|---|---|---|---|
| **1. 日線趨勢** | `get_kline_data` | 股價位在 5MA 且 20MA 上方<br>股價位在 5MA 且 20MA 下方 | **+20**<br>**-20** |
| **2. 法人籌碼** | `get_institutional_investors` | 外資+投信近 3 日**累計買超**<br>外資+投信近 3 日**累計賣超** | **+25**<br>**-25** |
| **3. 夜盤與美股** | `get_taifex_night` / `get_us_market` | 台指夜盤漲 >0.5% 且 NVDA/TSM ADR 上漲<br>台指夜盤跌 >0.5% 且 NVDA/TSM ADR 下跌 | **+25**<br>**-25** |
| **4. 盤前試撮** | `get_pre_market_quote` (08:40-08:55) | 試撮價開高且無異常暴退<br>試撮價開低且無異常爆買 | **+30**<br>**-30** |

### 5.3 最終策略鎖定規則 (State Locking Rules)

根據總得分（$S_{total}$），於 **08:55** 正式鎖定今日戰術：

1. **$S_{total} \ge +50$ ➔ 鎖定 `LONG_ONLY`（僅做多當沖）**
   - 盤中啟動「VWAP 爆量突破」（§6）追蹤；**完全屏蔽所有空方訊號**，避免逆勢放空被強勢股軋空。
2. **$S_{total} \le -50$ ➔ 鎖定 `SHORT_ONLY`（僅做空當沖）**
   - 盤中啟動「假突破 / 跌破 VWAP」（§7）追蹤；**完全屏蔽所有多方訊號**。若 `can_short_first == false`，改判 `NO_TRADE`。
3. **$-50 < S_{total} < +50$ ➔ 鎖定 `NEUTRAL_FLEXIBLE`（中立雙向 / 高門檻模式）**
   - 多空皆可操作，但進場門檻提升：`signal_score` 由 75 分提高至 85 分才允許提示。
4. **觸發硬風控旗標 ➔ 鎖定 `NO_TRADE`（今日不交易）**
   - 試撮出現跌停/漲停鎖死、當日列為處置股、或不可當沖。

### 5.4 TypeScript 決策樹實作（`evaluateDayTradeBias`）

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

export type DayTradeBias = "LONG_ONLY" | "SHORT_ONLY" | "NEUTRAL_FLEXIBLE" | "NO_TRADE";

export async function evaluateDayTradeBias(mcpClient: Client, symbol: string): Promise<{ bias: DayTradeBias; score: number; rationale: string }> {
  // 1. 風控檢查
  const eligibility = await mcpClient.callTool({
    name: "scan_daytrade_eligibility",
    arguments: { symbol }
  });

  const { can_daytrade, can_short_first, is_disposition } = eligibility.content[0].json;

  if (!can_daytrade || is_disposition) {
    return { bias: "NO_TRADE", score: 0, rationale: "該標的今日處置中或不可當沖" };
  }

  let biasScore = 0;
  const logs: string[] = [];

  // 2. 獲取日線籌碼與指標
  const techData = await mcpClient.callTool({ name: "get_technical_indicators", arguments: { symbol, timeframe: "1D" } });
  const chipData = await mcpClient.callTool({ name: "get_institutional_flow", arguments: { symbol, days: 3 } });

  if (techData.price > techData.ma5 && techData.price > techData.ma20) {
    biasScore += 20;
    logs.push("日線多頭排列 (+20)");
  } else if (techData.price < techData.ma5 && techData.price < techData.ma20) {
    biasScore -= 20;
    logs.push("日線空頭排列 (-20)");
  }

  if (chipData.net_buy_sum > 0) {
    biasScore += 25;
    logs.push("三大法人近 3 日累計買超 (+25)");
  } else {
    biasScore -= 25;
    logs.push("三大法人近 3 日累計賣超 (-25)");
  }

  // 3. 夜盤與 ADR 共振
  const macroData = await mcpClient.callTool({ name: "get_overnight_market_status", arguments: {} });
  if (macroData.taifex_night_change_pct > 0.5 && macroData.tsm_adr_change_pct > 0) {
    biasScore += 25;
    logs.push("夜盤與美股ADR順風強勢 (+25)");
  } else if (macroData.taifex_night_change_pct < -0.5 && macroData.tsm_adr_change_pct < 0) {
    biasScore -= 25;
    logs.push("夜盤與美股ADR逆風弱勢 (-25)");
  }

  // 4. 08:45 試撮驗證
  const preMarket = await mcpClient.callTool({ name: "get_pre_market_quote", arguments: { symbol } });
  if (preMarket.estimated_change_pct > 1.0) {
    biasScore += 30;
    logs.push("盤前試撮強勢開高 (+30)");
  } else if (preMarket.estimated_change_pct < -1.0) {
    biasScore -= 30;
    logs.push("盤前試撮弱勢開低 (-30)");
  }

  // 5. 輸出決策結果
  let finalBias: DayTradeBias = "NEUTRAL_FLEXIBLE";
  if (biasScore >= 50) finalBias = "LONG_ONLY";
  else if (biasScore <= -50) {
    if (!can_short_first) {
      return { bias: "NO_TRADE", score: biasScore, rationale: "空方訊號成立但該股今日無法先賣後買" };
    }
    finalBias = "SHORT_ONLY";
  }

  return { bias: finalBias, score: biasScore, rationale: logs.join(" | ") };
}
```

---

## 6. 做多當沖策略：VWAP 爆量突破（`VWAP_SURGE_LONG`）

> 適用情境：權值大、成交量大、個股波動與大盤連動度高的標的（如台達電 2308）。最怕遇到「早盤開高爆量誘多後急殺」或「流動性枯竭的盤整陷阱」。

### 6.1 盤前戰術準備（Phase 1: Pre-Market Filtering，08:30 - 09:00）

- **風控門檻檢查（Hard Rule Filter）：** 呼叫 `scan_daytrade_eligibility(symbol)`，通過條件：
  - `can_daytrade == true`（可當沖）
  - `is_disposition == false`（非處置股，確保交易連貫）
  - 今日無重大法說會或暫停交易消息。
- **當日關鍵價位設定（Anchor Levels）：** 昨收 $P_{close}$、昨日最高/最低 $P_{high}/P_{low}$；前日投信與外資買超狀態：前一日法人大買→偏多思考，法人大賣→偏空思考。

### 6.2 進場條件（買進 Long Trigger）

時間在 **09:05 ~ 11:30**（避開前 5 分鐘開盤隨機噪音與 11:30 後量能衰退），需同時滿足以下 4 個條件：

1. **VWAP 站穩：** 當前價格 $P_{current} > \text{VWAP}$ 且偏離度不大於 +1.5%（避免追極高）。
2. **爆量確認：** `detect_volume_surge` 回傳 `is_surge == true`（1 分鐘成交量突破過去 20 分鐘均量的 2.5 倍以上）。
3. **盤中高點突破：** 股價突破開盤前 15 分鐘的「盤中最高價」$P_{day\_high}$。
4. **大盤順風：** 大盤台指期（WTX）當前 1 分鐘 K 線為紅棒（避免逆勢做多）。

### 6.3 多空訊號打分機制（Signal Scoring Engine）

```python
def evaluate_long_signal(data):
    score = 0
    if data.price > data.vwap: score += 25
    if data.volume_surge_ratio >= 2.5: score += 25
    if data.price >= data.day_high: score += 25
    if data.taifex_trend == "BULLISH": score += 25

    # 風控扣分項
    if data.distance_to_limit_up < 0.015:  # 距離漲停不到 1.5%
        score -= 50                        # 利潤空間不足，大幅扣分

    return score >= 75                      # 超過 75 分發送「建議進場」訊號
```

### 6.4 停損與停利風控機制（Exit & Risk Guardrails）

```
                             [進場價: 1,640 元]
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
   【硬停損 (Stop Loss)】                               【分批停利 (Take Profit)】
   · 觸及 1,615 元 (-1.5%)                               · 達到 +2.0% (1,673元) 賣出 50%
   · 跌破 VWAP 均價線持續 1 分鐘                           · 剩餘 50% 啟動移動停利 (Trailing Stop)
```

- **停損邏輯（任一條件即刻觸發全數平倉）：**
  - 固定趴數硬停損：帳面虧損達 **-1.5%**。
  - VWAP 跌破停損：股價跌破當日成交均價線 (VWAP) 超過 1 分鐘且未能收回。
- **停利邏輯（移動鎖利）：**
  - 第一目標價 (TP1)：漲幅達 **+2.0%** 時平倉 **50%** 鎖定獲利。
  - 移動停利 (Trailing Stop)：剩餘 50% 倉位停損點上移至「進場成本價」，追蹤「自最高點回檔 1.0%」自動清倉。
- **時間硬風控：**
  - **12:30 停止發訊**：12:30 後不再發送任何全新進場訊號。
  - **13:10 強制平倉警告**：若 13:10 仍有未平倉部位，發出最高等級 `FORCE_FLAT_ALL` 指令，市價平倉，**絕對不留倉過夜**。

### 6.5 JSON 訊號輸出範例（Signal Payload）

```json
{
  "timestamp": "2026-07-31T09:35:10+08:00",
  "symbol": "2308",
  "name": "台達電",
  "action": "BUY_TO_OPEN",
  "strategy": "VWAP_SURGE_LONG",
  "signal_score": 85,
  "execution_plan": {
    "entry_price": 1640.0,
    "suggested_size": "1~2 張",
    "stop_loss_price": 1615.0,
    "target_price_1": 1673.0,
    "max_holding_time_minutes": 60
  },
  "rationale": "09:35 爆量突破盤前高點 1,635 元，價格站穩 VWAP (1,628 元)，大盤台指期急拉順風，具備動能續漲潛力。"
}
```

---

## 7. 空方當沖策略：假突破跌破 VWAP（`BULL_TRAP_VWAP_SHORT`）

> 空方當沖的核心不是「猜頂」，而是「確認多頭力竭與支撐破位」。先賣後買的風險在於**強勢股軋空**與**漲停鎖死無法平倉**，因此空方風控必須比多頭更為嚴苛。

### 7.1 盤前與盤中空方資格掃描（Eligibility Scanning）

呼叫 `scan_daytrade_eligibility(symbol)`，**必須全數通過**：

- `can_short_first == true`（該股票開放先賣後買當沖）
- `margin_short_available == true`（券源或資券狀況允許）
- `is_disposition == false`（處置股禁止當沖空單）

### 7.2 進場觸發條件（Short Trigger）

時間在 **09:15 ~ 11:30**（等待開盤前 15 分鐘多空廝殺完畢，確立頭部型態），需同時滿足以下 4 個條件：

1. **頂部爆量拉回（假突破）：** 開盤後曾創出當日高點 $P_{day\_high}$，隨後急殺且 1~3 分鐘內伴隨高成交量（`detect_volume_surge` 回傳 `BEARISH_BREAKDOWN`）。
2. **跌破 VWAP 均價線：** 當前價格 $P_{current} < \text{VWAP}$，且連續 2 根 1 分鐘 K 線收在 VWAP 下方（確認多頭買盤退場）。
3. **破前低或關鍵支撐：** 跌破開盤前 15 分鐘的盤中最低點 $P_{day\_low\_15m}$。
4. **大盤/台指期逆風：** 台指期 (WTX) 當前 1 分鐘 K 線為黑棒，且走勢開高走低。

### 7.3 空方訊號評分機制（Short Signal Scoring Engine）

```python
def evaluate_short_signal(data):
    score = 0
    if data.price < data.vwap: score += 25
    if data.volume_surge_type == "BEARISH_BREAKDOWN": score += 25
    if data.price < data.day_low_15m: score += 25
    if data.taifex_trend == "BEARISH": score += 25

    # 🚨 空方致命風控扣分（防止被軋空）
    if data.price_change_pct >= 6.5:  # 今日已大漲 > 6.5%，接近漲停
        score -= 100                  # 嚴禁空在接近漲停處，避免鎖死無法平倉

    return score >= 75                # 超過 75 分發送「建議做空」訊號
```

### 7.4 空方停損與停利風控機制（Short Risk Guardrails）

```
                               【空方進場價: 1,640 元】
                                          │
         ┌────────────────────────────────┴────────────────────────────────┐
         ▼                                                                 ▼
   【硬停損 (Stop Loss)】                                     【分批回補停利 (Take Profit)】
   · 觸及 1,665 元 (+1.5%)                                     · 達到 -2.0% (1,607元) 回補 50%
   · 突破當日 VWAP 均價線                                      · 剩餘 50% 啟動移動停利 (Trailing Stop)
   · 觸及當日高點 P_high (假突破失敗)
```

- **停損邏輯（任一條件即刻 `SELL_TO_COVER` 買進平倉）：**
  - 固定趴數硬停損：帳面虧損達 **+1.5%**。
  - 站回 VWAP 停損：股價重新站回 VWAP 上方超過 1 分鐘。
  - 突破當日高點：股價突破今日最高價 $P_{day\_high}$，代表假突破轉為強勢真突破，立即認錯平倉。
- **停利邏輯：**
  - 第一目標價 (TP1)：跌幅達放空價 **-2.0%** 時回補 **50%** 鎖定獲利。
  - 移動停利：剩餘 50% 倉位停損點下移至「放空成本價」，追蹤「自當日最低點反彈 0.8%」自動全數回補。
- **空方時間嚴格風控：**
  - **11:30 後禁止開新空單**：避免午後盤勢沉悶或尾盤作多拉抬。
  - **13:00 最高等級回補警報**：13:00 若仍有空單在手，**強制觸發回補指令**。台股 13:25 進入撮合，提前回補可確保 100% 能在集中市場買回。

### 7.5 JSON 空方決策輸出範例（Signal Payload）

```json
{
  "timestamp": "2026-07-31T09:42:15+08:00",
  "symbol": "2308",
  "name": "台達電",
  "action": "SELL_TO_OPEN",
  "strategy": "BULL_TRAP_VWAP_SHORT",
  "signal_score": 85,
  "execution_plan": {
    "short_entry_price": 1640.0,
    "suggested_size": "1~2 張",
    "stop_loss_price": 1665.0,
    "target_price_1": 1607.0,
    "max_holding_time_minutes": 45
  },
  "risk_warning": "當前股價距漲停板尚有 >5% 空間，資券狀況無虞，開放先賣後買。",
  "rationale": "09:40 衝高 1,675 元後爆量急退，連續 2 分鐘收在 VWAP (1,648 元) 下方，大盤台指期破前低，空方動能強勁。"
}
```

### 7.6 多空策略總結對比

| 評估項目 | 做多當沖 (Long Strategy) | 先賣後買空方當沖 (Short Strategy) |
| --- | --- | --- |
| **進場觸發點** | 突破 VWAP + 突破盤前高點 + 爆量 | 跌破 VWAP + 假突破高點拉回 + 爆量 |
| **致命風險** | 買在當日最高點（跌停風險低） | **軋空 + 漲停鎖死無法回補** |
| **硬停損觸發** | -1.5% 或跌破 VWAP | **+1.5% 或站回 VWAP / 突破當日高點** |
| **強制平倉時間** | 13:10 提醒平倉 | **13:00 強制回補（留出充足時間撮合）** |

---

## 8. 訊號模型（Signal Scoring Model）

### 8.1 設計原則

- **Config-Driven**：權重與門檻定義於 `config/scoring.yaml`，可版本化（`scoring_version` 寫入每筆訊號）。
- **Veto 優先**：風控條件觸發直接否決（-100），不與其他分數加總。
- **完整評分僅在雙 tick 確認後執行**。
- **策略引擎掛載**：§6 `VWAP_SURGE_LONG` 與 §7 `BULL_TRAP_VWAP_SHORT` 是此模型在單一標的上的具體實作（4×25 分制 + 風控扣分）；此處為跨標的之通用評分框架。

### 8.2 評分表（預設值）

| 項目 | 條件 | 分數 |
|---|---|---|
| 量能 | `volume_ratio ≥ 3.0`（mcp `detect_volume_surge`） | +30 |
| 位階 | 價 > VWAP 且突破盤前觸發價 | +30 |
| 大盤順風 | 台指期當日紅盤 且 PCR > 100% | +20 |
| 買盤結構（進階） | 連續 tick 上價（up-tick）比例 ≥ 70%（以 1 分 K 判讀） | +20 |
| 風控 Veto | 距漲停 < 1.5%（利潤空間不足） | -100（否決） |
| 風控 Veto | 處置/注意/當沖限制/停資停券 | -100（否決） |

### 8.3 門檻與行為

| 分數 | 等級 | 行為 |
|---|---|---|
| ≥ 80 | `STRONG_BUY` | 產出進場建議（含觸發價、目標價 R:R ≥ 2:1、停損價） |
| 60 – 79 | `WATCH` | 僅記錄，不建議進場 |
| < 60 | `IGNORE` | 忽略 |

- 訊號產生後 5 分鐘內未觸發進場價 → 過期重評（re-score），避免尾盤追價。
- `NEUTRAL_FLEXIBLE` 日進場門檻提高至 85 分（§5.3）。

---

## 9. Tactical Briefing（盤前戰術報告產生器）

> 將盤前決策結構化為 Tactical Briefing JSON，是 Agent 從「純分析」邁向「自動化執行」的最關鍵橋樑。它同時是盤中 09:00 運算的 **狀態設定檔 (State Configuration)**，具備 **Data Lineage（資料溯源）**，並精確鎖定當天的當沖方向與風控參數。

### 9.1 JSON Schema 規範與產出範例

盤前 08:55 完成評估後自動生成（例如 `briefings/2026-07-31_2308.json`）：

```json
{
  "_lineage": {
    "generated_at": "2026-07-31T08:55:00+08:00",
    "agent_version": "tw-quant-daybrain/v2.0.0",
    "mcp_server_version": "tw-quant-mcp/v0.8.4",
    "data_sources": [
      { "source": "TWSE_MIS", "fetch_time": "2026-07-31T08:54:30Z" },
      { "source": "TAIFEX_NIGHT", "fetch_time": "2026-07-31T05:00:00Z" }
    ]
  },
  "target": {
    "symbol": "2308",
    "name": "台達電",
    "market": "TWSE",
    "yesterday_close": 1530.0
  },
  "bias_assessment": {
    "bias": "LONG_ONLY",
    "score": 75,
    "confidence": "HIGH",
    "scoring_breakdown": [
      { "factor": "TECHNICAL_ALIGNMENT", "score": 20, "detail": "價格站穩 5MA/20MA 上方" },
      { "factor": "INSTITUTIONAL_FLOW", "score": 25, "detail": "三大法人近 3 日累計買超 +4,200 張" },
      { "factor": "OVERNIGHT_MARKET", "score": 0, "detail": "台指夜盤微幅整理 (+0.1%)" },
      { "factor": "PRE_MARKET_MATCH", "score": 30, "detail": "08:50 試撮開高 +1.6%，委買量充沛" }
    ]
  },
  "trading_plan": {
    "allowed_actions": ["BUY_TO_OPEN"],
    "blocked_actions": ["SELL_TO_OPEN"],
    "active_window": {
      "start_time": "09:05",
      "no_new_entry_after": "11:30",
      "force_flat_by": "13:10"
    },
    "key_levels": {
      "anchor_vwap_estimate": 1545.0,
      "breakout_pivot_price": 1555.0,
      "support_invalidation_price": 1510.0,
      "volume_surge_threshold": 2.5
    }
  },
  "risk_guardrails": {
    "max_position_size_shares": 2000,
    "hard_stop_loss_pct": 1.5,
    "take_profit_target_1_pct": 2.0,
    "trailing_stop_activation_pct": 2.0,
    "trailing_stop_callback_pct": 1.0,
    "max_drawdown_limit_ntd": 30000,
    "safety_flags": {
      "is_disposition": false,
      "can_daytrade": true,
      "can_short_first": true,
      "earnings_announcement_today": false
    }
  }
}
```

### 9.2 TypeScript 戰術報告生成模組（`src/briefing/generator.ts`）

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import * as fs from "fs/promises";
import * as path from "path";

export interface TacticalBriefing {
  _lineage: {
    generated_at: string;
    agent_version: string;
    mcp_server_version: string;
    data_sources: Array<{ source: string; fetch_time: string }>;
  };
  target: {
    symbol: string;
    name: string;
    market: string;
    yesterday_close: number;
  };
  bias_assessment: {
    bias: "LONG_ONLY" | "SHORT_ONLY" | "NEUTRAL_FLEXIBLE" | "NO_TRADE";
    score: number;
    confidence: "HIGH" | "MEDIUM" | "LOW";
    scoring_breakdown: Array<{ factor: string; score: number; detail: string }>;
  };
  trading_plan: {
    allowed_actions: string[];
    blocked_actions: string[];
    active_window: {
      start_time: string;
      no_new_entry_after: string;
      force_flat_by: string;
    };
    key_levels: {
      anchor_vwap_estimate: number;
      breakout_pivot_price: number;
      support_invalidation_price: number;
    };
  };
  risk_guardrails: {
    max_position_size_shares: number;
    hard_stop_loss_pct: number;
    take_profit_target_1_pct: number;
    trailing_stop_activation_pct: number;
    trailing_stop_callback_pct: number;
    max_drawdown_limit_ntd: number;
    safety_flags: {
      is_disposition: boolean;
      can_daytrade: boolean;
      can_short_first: boolean;
      earnings_announcement_today: boolean;
    };
  };
}

export class TacticalBriefingGenerator {
  constructor(private mcpClient: Client) {}

  public async generate(symbol: string): Promise<TacticalBriefing> {
    const now = new Date().toISOString();

    // 1. 透過 MCP 獲取基礎與風控資料
    const eligibilityRes = await this.mcpClient.callTool({
      name: "scan_daytrade_eligibility",
      arguments: { symbol }
    });
    const eligibility = JSON.parse(eligibilityRes.content[0].text);

    const quoteRes = await this.mcpClient.callTool({
      name: "get_stock_quote",
      arguments: { symbol }
    });
    const quote = JSON.parse(quoteRes.content[0].text);

    // 2. 進行盤前決策打分（此處演示邏輯整合；正式版應呼叫 §5 evaluateDayTradeBias）
    const breakdown = [
      { factor: "TECHNICAL_ALIGNMENT", score: 20, detail: "價格站穩 5MA/20MA 上方" },
      { factor: "INSTITUTIONAL_FLOW", score: 25, detail: "三大法人連買" },
      { factor: "PRE_MARKET_MATCH", score: 30, detail: "試撮拉高" }
    ];
    const totalScore = breakdown.reduce((sum, item) => sum + item.score, 0);

    let bias: TacticalBriefing["bias_assessment"]["bias"] = "NEUTRAL_FLEXIBLE";
    let allowedActions = ["BUY_TO_OPEN", "SELL_TO_OPEN"];
    let blockedActions: string[] = [];

    if (!eligibility.can_daytrade || eligibility.is_disposition) {
      bias = "NO_TRADE";
      allowedActions = [];
      blockedActions = ["BUY_TO_OPEN", "SELL_TO_OPEN"];
    } else if (totalScore >= 50) {
      bias = "LONG_ONLY";
      allowedActions = ["BUY_TO_OPEN"];
      blockedActions = ["SELL_TO_OPEN"];
    } else if (totalScore <= -50) {
      bias = "SHORT_ONLY";
      allowedActions = ["SELL_TO_OPEN"];
      blockedActions = ["BUY_TO_OPEN"];
    }

    // 3. 組裝 Briefing 結構
    const briefing: TacticalBriefing = {
      _lineage: {
        generated_at: now,
        agent_version: "tw-quant-daybrain/v2.0.0",
        mcp_server_version: "tw-quant-mcp/v0.8.4",
        data_sources: [
          { source: "TWSE_MIS", fetch_time: now },
          { source: "MOPS", fetch_time: now }
        ]
      },
      target: {
        symbol: quote.symbol,
        name: quote.name || "台達電",
        market: "TWSE",
        yesterday_close: quote.previous_close
      },
      bias_assessment: {
        bias,
        score: totalScore,
        confidence: Math.abs(totalScore) >= 70 ? "HIGH" : "MEDIUM",
        scoring_breakdown: breakdown
      },
      trading_plan: {
        allowed_actions: allowedActions,
        blocked_actions: blockedActions,
        active_window: {
          start_time: "09:05",
          no_new_entry_after: "11:30",
          force_flat_by: bias === "SHORT_ONLY" ? "13:00" : "13:10"
        },
        key_levels: {
          anchor_vwap_estimate: quote.previous_close * 1.005,
          breakout_pivot_price: quote.previous_close * 1.015,
          support_invalidation_price: quote.previous_close * 0.985
        }
      },
      risk_guardrails: {
        max_position_size_shares: 2000,
        hard_stop_loss_pct: 1.5,
        take_profit_target_1_pct: 2.0,
        trailing_stop_activation_pct: 2.0,
        trailing_stop_callback_pct: 1.0,
        max_drawdown_limit_ntd: 30000,
        safety_flags: {
          is_disposition: eligibility.is_disposition,
          can_daytrade: eligibility.can_daytrade,
          can_short_first: eligibility.can_short_first,
          earnings_announcement_today: false
        }
      }
    };

    // 4. 持久化存檔供盤中 Agent 載出
    const outputDir = path.join(process.cwd(), "briefings");
    await fs.mkdir(outputDir, { recursive: true });
    const filePath = path.join(outputDir, `${now.split("T")[0]}_${symbol}.json`);
    await fs.writeFile(filePath, JSON.stringify(briefing, null, 2), "utf-8");

    return briefing;
  }
}
```

### 9.3 盤中 Agent 載入與執行的防呆機制

1. **強制載入當日 Briefing：** 開盤第一件事讀取當天的 `briefing.json`。若找不到當日檔案，Agent **拒絕啟動交易**。
2. **Action 白名單開關：** 當觸發進場條件時，先檢查 `trading_plan.allowed_actions`。例如今天若是 `LONG_ONLY`，即使模型運算發出空方 90 分訊號，也會在第一關被 `blocked_actions` 直接攔截掉。
3. **動態風險載入：** `hard_stop_loss_pct` (1.5%) 與 `force_flat_by` (13:10 / 13:00) 直接帶入下單與監控 Thread，不允許硬編碼寫死在盤中程式碼裡。

---

## 10. Priority Ranking Engine（優先權排序與動態資金分配）

> 當盤前同時掃描 5 檔個股並各自產出 Briefing 時，盤中最大風險在於：多檔標的同時爆量觸發訊號，導致資金被次等標的占滿，或總部位風險過度集中。本引擎扮演 **「當沖資源調度員」**，確保最高品質的訊號獲得最優資金分配。

### 10.1 優先權排序邏輯（Priority Ranking Matrix）

採 **「盤前靜態得分 (Pre-Market Weight)」+「盤中動能響應 (Intraday Momentum)」** 的雙層動態加權：

```
                          [ 盤中訊號發出 Signal Triggered ]
                                         │
                                         ▼
                            【第一層：盤前戰術評級】
                            · 依據 Tactical Briefing 總分 (Bias Score)
                            · 信心度 (Confidence: HIGH / MEDIUM)
                                         │ (通過評級)
                                         ▼
                            【第二層：盤中即時動能】
                            · 量能爆發倍數 (Surge Multiplier)
                            · 突破位置與 VWAP 距離 (VWAP Deviation)
                                         │ (計算綜合優先權得分 R)
                                         ▼
                            【第三層：資金池風控配額】
                            · 檢查當前剩餘資金池 (Available Margin)
                            · 檢查族群/產業集中度限制 (Sector Limit)
                                         │ (風控放行)
                                         ▼
                           【發送下單指令 BUY / SELL】
```

**綜合優先權得分（$R$）：**

$$R = (W_{bias} \times S_{pre}) + (W_{surge} \times M_{surge}) - (W_{dist} \times D_{vwap})$$

- $S_{pre}$：盤前 Briefing 得分（0 ~ 100）。
- $M_{surge}$：盤中 1 分鐘爆量倍數（例如 3.5 倍）。
- $D_{vwap}$：當前價格偏離 VWAP 的幅度（偏離過高扣分，防止追高）。
- $W$：權重係數（預設 $W_{bias}=0.4$, $W_{surge}=0.5$, $W_{dist}=0.1$，可經 §13 回測調參）。

### 10.2 動態資金配置機制（Tiered Risk Budgeting）

假設當沖總準備金池 **NT$ 300 萬**、最高槓桿曝光 2 倍（最大總持倉 NT$ 600 萬）：

| 盤前評級 (Tier) | 盤前 Bias 得分 | 信心度 | 單一標的最高金額上限 | 最大允許同時持倉張數 |
| --- | --- | --- | --- | --- |
| **Tier 1 (極高)** | $S_{pre} \ge 80$ | HIGH | **NT$ 200 萬** (33%) | 依股價換算（如台達電可做 1~2 張） |
| **Tier 2 (中高)** | $60 \le S_{pre} < 80$ | MEDIUM | **NT$ 120 萬** (20%) | 限高價股 1 張或中價股 2~3 張 |
| **Tier 3 (一般)** | $50 \le S_{pre} < 60$ | LOW / MEDIUM | **NT$ 60 萬** (10%) | 僅用於小試身手 |
| **Tier 4 (拒絕)** | $S_{pre} < 50$ | - | **NT$ 0 (不分配)** | 禁止交易 |

**產業/族群集中度限制：** 同族群（如電子代工/AI：廣達、緯創、鴻海）同時在手持倉金額不可超過總曝光的 **40%**，防止單一產業黑天鵝導致集體停損。

### 10.3 TypeScript Priority Ranking Engine（`src/execution/priority_engine.ts`）

```typescript
import { TacticalBriefing } from "../briefing/generator.js";

export interface SignalCandidate {
  symbol: string;
  action: "BUY_TO_OPEN" | "SELL_TO_OPEN";
  price: number;
  volumeSurgeRatio: number; // 盤中爆量倍數
  vwapDeviationPct: number; // 偏離 VWAP %
  timestamp: string;
}

export interface ExecutionDecision {
  shouldExecute: boolean;
  symbol: string;
  rankScore: number;
  allocatedCapitalNtd: number;
  reason: string;
}

export class PriorityRankingEngine {
  private totalMarginPoolNtd: number;
  private maxPortfolioExposureNtd: number;
  private currentActivePositions: Map<string, { capital: number; sector: string }> = new Map();

  constructor(totalMarginPoolNtd: number = 3000000, maxLeverage: number = 2.0) {
    this.totalMarginPoolNtd = totalMarginPoolNtd;
    this.maxPortfolioExposureNtd = totalMarginPoolNtd * maxLeverage;
  }

  public evaluateSignal(
    candidate: SignalCandidate,
    briefing: TacticalBriefing,
    symbolSector: string = "ELECTRONICS"
  ): ExecutionDecision {
    // 1. 硬性白名單過濾
    if (!briefing.trading_plan.allowed_actions.includes(candidate.action)) {
      return { shouldExecute: false, symbol: candidate.symbol, rankScore: 0, allocatedCapitalNtd: 0, reason: `Action ${candidate.action} 被 Briefing 阻擋 (Bias: ${briefing.bias_assessment.bias})` };
    }

    // 2. 檢查總持倉曝光上限
    const currentTotalExposure = Array.from(this.currentActivePositions.values()).reduce((sum, pos) => sum + pos.capital, 0);
    if (currentTotalExposure >= this.maxPortfolioExposureNtd) {
      return { shouldExecute: false, symbol: candidate.symbol, rankScore: 0, allocatedCapitalNtd: 0, reason: "已達全系統當沖最大總曝光上限 (Max Portfolio Exposure Reached)" };
    }

    // 3. 計算綜合優先權得分 (Rank Score)
    const preMarketScore = briefing.bias_assessment.score;
    const surgeScore = Math.min(candidate.volumeSurgeRatio * 20, 100); // 爆量 5 倍封頂得 100 分
    const vwapPenalty = candidate.vwapDeviationPct * 15; // 偏離過高扣分

    const rankScore = (0.4 * preMarketScore) + (0.5 * surgeScore) - (0.1 * vwapPenalty);

    // 4. 根據 Tier 決定資金上限
    let tierMaxCapital = 0;
    if (preMarketScore >= 80) tierMaxCapital = this.totalMarginPoolNtd * 0.33; // Tier 1: 33%
    else if (preMarketScore >= 60) tierMaxCapital = this.totalMarginPoolNtd * 0.20; // Tier 2: 20%
    else if (preMarketScore >= 50) tierMaxCapital = this.totalMarginPoolNtd * 0.10; // Tier 3: 10%

    // 5. 產業集中度檢查 (Sector Limit: 不可超過總曝光 40%)
    const sectorExposure = Array.from(this.currentActivePositions.values())
      .filter(p => p.sector === symbolSector)
      .reduce((sum, p) => sum + p.capital, 0);

    const maxAllowedSectorCapital = this.maxPortfolioExposureNtd * 0.40;
    const remainingSectorBudget = maxAllowedSectorCapital - sectorExposure;

    if (remainingSectorBudget <= 0) {
      return { shouldExecute: false, symbol: candidate.symbol, rankScore, allocatedCapitalNtd: 0, reason: `同族群 (${symbolSector}) 額度已滿` };
    }

    // 計算最終可分配資金
    const availableSystemBudget = this.maxPortfolioExposureNtd - currentTotalExposure;
    const finalAllocatedCapital = Math.min(tierMaxCapital, remainingSectorBudget, availableSystemBudget);

    if (finalAllocatedCapital < candidate.price * 1000) {
      return { shouldExecute: false, symbol: candidate.symbol, rankScore, allocatedCapitalNtd: 0, reason: "剩餘配額不足以買進 1 張股票" };
    }

    return {
      shouldExecute: true,
      symbol: candidate.symbol,
      rankScore: Number(rankScore.toFixed(2)),
      allocatedCapitalNtd: Math.floor(finalAllocatedCapital),
      reason: `優先權評分通過 (${rankScore.toFixed(1)}分)，核准資金 NT$ ${Math.floor(finalAllocatedCapital).toLocaleString()}`
    };
  }

  public registerPosition(symbol: string, capital: number, sector: string) {
    this.currentActivePositions.set(symbol, { capital, sector });
  }

  public releasePosition(symbol: string) {
    this.currentActivePositions.delete(symbol);
  }
}
```

### 10.4 競爭搶單情境處理（Simultaneous Signal Handling）

若在 09:15:02 **同一個 8 秒輪詢內**，台達電 (2308) 與廣達 (2382) 同時觸發爆量進場訊號：

1. **併發排隊 (Sorting Queue)：** 兩個訊號傳入 Queue。
2. **分數比大小：**
   - **台達電 (2308)：** 盤前 85 分 + 爆量 3 倍 → $R = (0.4 \times 85) + (0.5 \times 60) = 64$
   - **廣達 (2382)：** 盤前 60 分 + 爆量 5 倍 → $R = (0.4 \times 60) + (0.5 \times 100) = 74$
3. **優先派單：** 系統優選廣達 (2382) 優先執行下單；若剩餘資金足以支援台達電，再依序派發。

此機制可消除 Multi-stock 監控時的「資金爭奪混亂」，實現法人級別的微秒資源調度。

---

## 11. 風控系統 (Risk Management)

### 11.1 倉位規模（Position Sizing）

```
單筆風險 = 帳戶權益 × RISK_PER_TRADE（預設 0.5%，上限 1%）
倉位股數 = 單筆風險 ÷ (進場價 − 停損價)
```

- 同時最多 `MAX_POSITIONS` 檔持倉（預設 2）。
- 單一標的曝險不超過權益 10%。
- 多標的時另受 §10 Tier 上限與族群 40% 集中度限制。

### 11.2 持倉狀態機（Position State Machine）

```text
IDLE → SCANNING → ARMED(觸發價設好) → TRIGGERED(價≥觸發價且評分≥80)
→ ENTERED(回報成交) → MANAGED(移動停損/依規則出場) → CLOSED(平倉)
→ LOGGED(寫入 JournalEntry)
```

- 每次狀態轉移皆寫入事件日誌（`position_state_change`）。
- `TRIGGERED → ENTERED` 需人工確認或紙上交單回報（Human-in-the-loop）。

### 11.3 出場規則（優先序）

1. **硬停損**：虧損達 -1.5% 或跌破今日 VWAP（先觸發者）；空單為 +1.5% 或站回 VWAP / 突破當日高點（§7.4）。
2. **目標價**：R:R ≥ 2:1 達成即出場（可部分獲利了結 50%，剩餘移動停利）。
3. **時間停損**：多方 13:10 強平警告 / 空方 13:00 強制回補；13:20 全數平倉。
4. **假突破回收**：§4 Phase 2 之回收規則觸發時出場。

### 11.4 每日風控上限

| 規則 | 預設值 | 觸發行為 |
|---|---|---|
| 每日最大虧損 | 權益 -3% | 停止當日所有新訊號（`DAILY_LOCKOUT`），僅執行既有持倉出場 |
| 連續虧損 | 連 3 筆停損 | 降低次日倉位規模 50%（下一交易日生效） |
| 單日最大交易次數 | 10 | 超出後僅保留出場管理 |

### 11.5 時間限制（Config）

| 時間 | 規則 |
|---|---|
| 09:00 – 09:05 | 不進場（開盤緩衝） |
| 11:30 | 空方停止開新空單 |
| 12:30 | 警示：不再建立新倉位 |
| 13:00 | 硬性停止發送新買進/做多訊號；空單強制回補 |
| 13:10 | 多方 `FORCE_FLAT_ALL` 警告（Adapter 層同時硬性阻擋開倉） |
| 13:15 | 未平倉 → 最高等級強制平倉提醒 |
| 13:20 | 強制全數平倉 |

---

## 12. 回測系統（Backtest Engine）

> 一套合格的當沖回測模擬器，絕不能只算「最終賺多少錢」，而是要能精準還原盤中毫秒級的「狀態變遷」與「資源爭奪」。必須驗證：(1) 策略白名單約束力（Briefing 是否攔截反向假訊號）；(2) 優先權與資金配額（Rank Score 排隊、總槓桿與族群上限未被打破）。

### 12.1 整體架構（Event-Driven Market Replay）

```
                    [ 歷史 1 分鐘 K 線數據庫 (CSV / DB) ]
                                    │
                                    ▼
                    【 Step 1: 08:55 盤前重放 (Pre-market Replay) 】
                    · 載入各標的前 3 日數據與 08:45 試撮
                    · 觸發 TacticalBriefingGenerator，為各標的產出當日 briefing.json
                                    │
                                    ▼
                    【 Step 2: 09:00 - 13:25 盤中時間軸驅動 Loop 】
                    ┌─────────────────────────────────────────┐
                    │ 每個時間點 t (例如 09:15:00)             │
                    │ 1. 廣播 t 時刻 1 分 K 給所有標的         │
                    │ 2. 各標的算 VWAP, Volume Surge, 價格突破│
                    │ 3. 觸發訊號時，發送 Candidate 至 Engine  │
                    └─────────────────────────────────────────┘
                                    │
                                    ▼
                    【 Step 3: Priority Engine 競態排隊與撮合 】
                    · 依據 Rank Score 排序
                    · 風控與資金配額檢查 (Tier & Sector Limit)
                    · 模擬滑點 (Slippage) 與手續費/證交稅扣除
                                    │
                                    ▼
                    【 Step 4: 持倉追蹤與強制平倉 】
                    · 觸及停損 / 停利 / 強平時間
                    · 平倉後釋放資金池 (Release Margin)
                                    │
                                    ▼
                     [ 產出回測分析報告 (Backtest Report) ]
```

### 12.2 資料契約（Data Contracts）

```typescript
export interface MinuteBar {
  symbol: string;
  datetime: string; // ISO String, e.g. "2026-07-31T09:15:00+08:00"
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number; // 當分鐘成交張數
}

export interface TradeRecord {
  tradeId: string;
  symbol: string;
  action: "BUY_TO_OPEN" | "SELL_TO_OPEN";
  entryTime: string;
  entryPrice: number;
  exitTime: string;
  exitPrice: number;
  shares: number;
  pnlNtd: number; // 扣除稅費後的淨利潤
  exitReason: "STOP_LOSS" | "TAKE_PROFIT" | "TRAILING_STOP" | "FORCE_FLAT";
  rankScoreAtEntry: number;
}
```

### 12.3 歷史 1 分 K DataLoader（`src/backtest/data_loader.ts`）

> 數據加載模組是回測系統的命脈，絕不能隨便用簡單的 `split(',')`。台股歷史 1 分 K 常見挑戰：時間格式不一（民國紀年 `115/07/31` vs 標準 ISO）、成交量單位混淆（張 vs 股）、K 線時間缺漏、記憶體過度消耗。

**設計規格與數據清洗邏輯：**

1. **時間格式自動收斂 (ISO Standard Normalization)：** 自動識別 `YYYY-MM-DD HH:mm:ss`、`YYYY/MM/DD HH:mm` 或民國曆 `115/07/31 09:00`，統一轉為標準 ISO 8601（帶 `+08:00`）。
2. **成交量單位校正 (Volume Unit Scaling)：** 支援 `volume_unit`（`SHARES` 股 / `LOTS` 張），統一以「張」為單位。
3. **數據排重與排序 (Deduplication & Sorting)：** 過濾重複時間戳，強制時間軸順向排序。
4. **開盤前/收盤後濾除 (Market Hours Filtering)：** 預設僅保留 `09:00:00` ~ `13:30:00`，避免盤前試撮或盤後定價數據干擾回測。

支援常見 CSV 格式（Shioaji / FinMind / 富邦 / 凱基匯出檔）：

```csv
datetime,open,high,low,close,volume
2026-07-31 09:00:00,1630.0,1640.0,1625.0,1635.0,450
2026-07-31 09:01:00,1635.0,1645.0,1635.0,1640.0,320
2026-07-31 09:02:00,1640.0,1640.0,1620.0,1625.0,510
```

```typescript
import * as fs from "fs";
import * as readline from "readline";
import * as path from "path";
import { MinuteBar } from "./simulator.js";

export interface DataLoaderOptions {
  /** 成交量單位，預設 LOTS (張) */
  volumeUnit?: "LOTS" | "SHARES";
  /** 時間欄位名稱，預設 'datetime' 或 'time' */
  timeColumn?: string;
  /** 是否只保留台股一般交易時間 09:00 ~ 13:30 */
  filterRegularMarketHours?: boolean;
}

export class CsvDataLoader {
  private options: Required<DataLoaderOptions>;

  constructor(options?: DataLoaderOptions) {
    this.options = {
      volumeUnit: options?.volumeUnit ?? "LOTS",
      timeColumn: options?.timeColumn ?? "datetime",
      filterRegularMarketHours: options?.filterRegularMarketHours ?? true,
    };
  }

  public async loadCsvFile(filePath: string, symbol: string): Promise<MinuteBar[]> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`[DataLoader] 找不到 CSV 檔案: ${filePath}`);
    }

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const bars: MinuteBar[] = [];
    let headerMap: Map<string, number> | null = null;
    let lineNumber = 0;

    for await (const line of rl) {
      lineNumber++;
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      const row = trimmedLine.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""));

      if (!headerMap) {
        headerMap = new Map();
        row.forEach((colName, index) => { headerMap!.set(colName.toLowerCase(), index); });
        continue;
      }

      try {
        const datetimeIdx = this.findColumnIndex(headerMap, [this.options.timeColumn, "datetime", "time", "date"]);
        const openIdx = this.findColumnIndex(headerMap, ["open", "開盤價"]);
        const highIdx = this.findColumnIndex(headerMap, ["high", "最高價"]);
        const lowIdx = this.findColumnIndex(headerMap, ["low", "最低價"]);
        const closeIdx = this.findColumnIndex(headerMap, ["close", "收盤價"]);
        const volumeIdx = this.findColumnIndex(headerMap, ["volume", "vol", "成交量", "qty"]);

        const rawDatetime = row[datetimeIdx];
        const open = parseFloat(row[openIdx]);
        const high = parseFloat(row[highIdx]);
        const low = parseFloat(row[lowIdx]);
        const close = parseFloat(row[closeIdx]);
        let rawVolume = parseFloat(row[volumeIdx]);

        if (!rawDatetime || isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close) || isNaN(rawVolume)) {
          continue;
        }

        // 成交量單位轉換 (若為「股」則除以 1000 轉為「張」)
        const volume = this.options.volumeUnit === "SHARES" ? rawVolume / 1000 : rawVolume;

        const isoDatetime = this.parseAndNormalizeTimestamp(rawDatetime);
        if (!isoDatetime) continue;

        // 交易時間過濾 (09:00:00 ~ 13:30:00)
        if (this.options.filterRegularMarketHours) {
          const timeOnly = isoDatetime.split("T")[1].substring(0, 8);
          if (timeOnly < "09:00:00" || timeOnly > "13:30:00") continue;
        }

        bars.push({ symbol, datetime: isoDatetime, open, high, low, close, volume });
      } catch (err) {
        console.warn(`[DataLoader] 警告: 第 ${lineNumber} 列解析失敗 (${err})，已跳過。`);
      }
    }

    return this.deduplicateAndSort(bars);
  }

  public async loadDirectory(dirPath: string): Promise<Map<string, MinuteBar[]>> {
    const resultMap = new Map<string, MinuteBar[]>();
    const files = await fs.promises.readdir(dirPath);

    for (const file of files) {
      if (!file.endsWith(".csv")) continue;
      // 自動從檔名提取 Symbol (檔名範例: "2308_20260731.csv")
      const match = file.match(/^(\d{4,6})/);
      if (!match) continue;

      const symbol = match[1];
      const filePath = path.join(dirPath, file);
      const bars = await this.loadCsvFile(filePath, symbol);

      if (resultMap.has(symbol)) {
        const existing = resultMap.get(symbol)!;
        resultMap.set(symbol, this.deduplicateAndSort([...existing, ...bars]));
      } else {
        resultMap.set(symbol, bars);
      }
    }
    return resultMap;
  }

  private findColumnIndex(headerMap: Map<string, number>, candidates: string[]): number {
    for (const cand of candidates) {
      const idx = headerMap.get(cand.toLowerCase());
      if (idx !== undefined) return idx;
    }
    throw new Error(`找不到匹配欄位: [${candidates.join(", ")}]`);
  }

  private parseAndNormalizeTimestamp(rawStr: string): string | null {
    let cleanStr = rawStr.trim();

    // 處理民國曆 (例如 115/07/31 -> 2026/07/31)
    const minguoMatch = cleanStr.match(/^(\d{3})[\/-](\d{2})[\/-](\d{2})\s+(.*)$/);
    if (minguoMatch) {
      const year = parseInt(minguoMatch[1], 10) + 1911;
      cleanStr = `${year}-${minguoMatch[2]}-${minguoMatch[3]} ${minguoMatch[4]}`;
    }

    cleanStr = cleanStr.replace(/\//g, "-");
    const dateObj = new Date(cleanStr.includes("T") ? cleanStr : cleanStr.replace(" ", "T") + "+08:00");
    if (isNaN(dateObj.getTime())) return null;

    const pad = (n: number) => String(n).padStart(2, "0");
    return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}T${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}+08:00`;
  }

  private deduplicateAndSort(bars: MinuteBar[]): MinuteBar[] {
    const seen = new Set<string>();
    const uniqueBars: MinuteBar[] = [];
    for (const bar of bars) {
      if (!seen.has(bar.datetime)) {
        seen.add(bar.datetime);
        uniqueBars.push(bar);
      }
    }
    return uniqueBars.sort((a, b) => (a.datetime > b.datetime ? 1 : -1));
  }
}
```

### 12.4 事件驅動模擬器（`src/backtest/simulator.ts`）

```typescript
import { TacticalBriefing } from "../briefing/generator.js";
import { PriorityRankingEngine, SignalCandidate } from "../execution/priority_engine.js";

export interface MinuteBar {
  symbol: string;
  datetime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ActivePosition {
  symbol: string;
  action: "BUY_TO_OPEN" | "SELL_TO_OPEN";
  entryPrice: number;
  entryTime: string;
  shares: number;
  allocatedCapital: number;
  stopLossPrice: number;
  targetPrice1: number;
  highestPriceSinceEntry: number;
  lowestPriceSinceEntry: number;
  rankScore: number;
}

export class DayBrainBacktestSimulator {
  private rankingEngine: PriorityRankingEngine;
  private briefings: Map<string, TacticalBriefing> = new Map();
  private activePositions: Map<string, ActivePosition> = new Map();
  private completedTrades: any[] = [];

  // 成本設定 (台灣股市)
  private commissionRate = 0.001425 * 0.28; // 券商手續費 2.8 折
  private daytradeTaxRate = 0.0015;          // 當沖證交稅 減半 1.5‰

  constructor(totalMarginPoolNtd: number = 3000000) {
    this.rankingEngine = new PriorityRankingEngine(totalMarginPoolNtd, 2.0);
  }

  public loadBriefings(briefingList: TacticalBriefing[]) {
    briefingList.forEach(b => this.briefings.set(b.target.symbol, b));
  }

  public runSimulation(marketData: Map<string, MinuteBar[]>) {
    const timestamps = this.extractAndSortTimestamps(marketData);

    const runningStats = new Map<string, { vwapVolumeSum: number; vwapValueSum: number; dayHigh: number; dayLow: number; volumes: number[] }>();
    for (const symbol of marketData.keys()) {
      runningStats.set(symbol, { vwapVolumeSum: 0, vwapValueSum: 0, dayHigh: 0, dayLow: Infinity, volumes: [] });
    }

    for (const timeStr of timestamps) {
      const timeOnly = timeStr.split("T")[1].substring(0, 5);
      const candidatesThisMinute: SignalCandidate[] = [];

      // A. 先檢查並更新現有持倉 (停損/停利/強平)
      for (const [symbol, pos] of Array.from(this.activePositions.entries())) {
        const bars = marketData.get(symbol);
        const currentBar = bars?.find(b => b.datetime === timeStr);
        if (currentBar) this.checkExitConditions(pos, currentBar, timeOnly);
      }

      // B. 處理各標的的新 K 線並評估訊號
      for (const [symbol, bars] of marketData.entries()) {
        const currentBar = bars.find(b => b.datetime === timeStr);
        if (!currentBar) continue;

        const stats = runningStats.get(symbol)!;
        stats.vwapVolumeSum += currentBar.volume;
        stats.vwapValueSum += currentBar.close * currentBar.volume;
        stats.dayHigh = Math.max(stats.dayHigh, currentBar.high);
        stats.dayLow = Math.min(stats.dayLow, currentBar.low);
        stats.volumes.push(currentBar.volume);

        const currentVwap = stats.vwapValueSum / (stats.vwapVolumeSum || 1);
        const briefing = this.briefings.get(symbol);

        if (!briefing || this.activePositions.has(symbol)) continue;

        // 時間窗口檢查 (09:05 ~ 11:30)
        if (timeOnly < briefing.trading_plan.active_window.start_time || timeOnly > briefing.trading_plan.active_window.no_new_entry_after) {
          continue;
        }

        // 計算 1 分鐘爆量倍數 (近 20 分鐘均量)
        const recentVolumes = stats.volumes.slice(-21, -1);
        const avgVolume = recentVolumes.length > 0 ? recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length : currentBar.volume;
        const surgeRatio = currentBar.volume / (avgVolume || 1);

        // 觸發多方條件：突破 VWAP + 爆量 >= threshold + 逼近當日高點
        const surgeThreshold = briefing.trading_plan.key_levels.volume_surge_threshold ?? 2.5;
        if (currentBar.close > currentVwap && surgeRatio >= surgeThreshold && currentBar.close >= stats.dayHigh * 0.998) {
          candidatesThisMinute.push({
            symbol,
            action: "BUY_TO_OPEN",
            price: currentBar.close,
            volumeSurgeRatio: Number(surgeRatio.toFixed(2)),
            vwapDeviationPct: Number((((currentBar.close - currentVwap) / currentVwap) * 100).toFixed(2)),
            timestamp: timeStr
          });
        }
      }

      // C. 競態處理：本分鐘所有候選訊號交給 Priority Engine 排序與核准
      for (const candidate of candidatesThisMinute) {
        const briefing = this.briefings.get(candidate.symbol)!;
        const decision = this.rankingEngine.evaluateSignal(candidate, briefing);

        if (decision.shouldExecute) {
          const executionPrice = candidate.price * 1.0005; // 模擬滑點 (1 檔跳動)
          const shares = Math.floor(decision.allocatedCapitalNtd / executionPrice / 1000) * 1000;

          if (shares >= 1000) {
            const newPos: ActivePosition = {
              symbol: candidate.symbol,
              action: candidate.action,
              entryPrice: executionPrice,
              entryTime: candidate.timestamp,
              shares,
              allocatedCapital: shares * executionPrice,
              stopLossPrice: executionPrice * (1 - briefing.risk_guardrails.hard_stop_loss_pct / 100),
              targetPrice1: executionPrice * (1 + briefing.risk_guardrails.take_profit_target_1_pct / 100),
              highestPriceSinceEntry: executionPrice,
              lowestPriceSinceEntry: executionPrice,
              rankScore: decision.rankScore
            };

            this.activePositions.set(candidate.symbol, newPos);
            this.rankingEngine.registerPosition(candidate.symbol, newPos.allocatedCapital, "ELECTRONICS");
          }
        }
      }
    }

    return this.generateReport();
  }

  private checkExitConditions(pos: ActivePosition, bar: MinuteBar, timeOnly: string) {
    let shouldExit = false;
    let exitReason: any = "";
    let exitPrice = bar.close;

    pos.highestPriceSinceEntry = Math.max(pos.highestPriceSinceEntry, bar.high);

    if (bar.low <= pos.stopLossPrice) {
      shouldExit = true;
      exitReason = "STOP_LOSS";
      exitPrice = pos.stopLossPrice;
    } else if (bar.high >= pos.targetPrice1) {
      shouldExit = true;
      exitReason = "TAKE_PROFIT";
      exitPrice = pos.targetPrice1;
    } else if (timeOnly >= "13:10") {
      shouldExit = true;
      exitReason = "FORCE_FLAT";
      exitPrice = bar.close;
    }

    if (shouldExit) {
      const grossIncome = (exitPrice - pos.entryPrice) * pos.shares;
      const buyCommission = pos.entryPrice * pos.shares * this.commissionRate;
      const sellCommission = exitPrice * pos.shares * this.commissionRate;
      const tax = exitPrice * pos.shares * this.daytradeTaxRate;
      const netPnl = grossIncome - buyCommission - sellCommission - tax;

      this.completedTrades.push({
        symbol: pos.symbol,
        action: pos.action,
        entryTime: pos.entryTime,
        entryPrice: pos.entryPrice,
        exitTime: bar.datetime,
        exitPrice,
        shares: pos.shares,
        pnlNtd: Math.round(netPnl),
        exitReason,
        rankScoreAtEntry: pos.rankScore
      });

      this.activePositions.delete(pos.symbol);
      this.rankingEngine.releasePosition(pos.symbol);
    }
  }

  private extractAndSortTimestamps(marketData: Map<string, MinuteBar[]>): string[] {
    const timeSet = new Set<string>();
    for (const bars of marketData.values()) bars.forEach(b => timeSet.add(b.datetime));
    return Array.from(timeSet).sort();
  }

  private generateReport() {
    const totalTrades = this.completedTrades.length;
    const winTrades = this.completedTrades.filter(t => t.pnlNtd > 0);
    const totalPnl = this.completedTrades.reduce((sum, t) => sum + t.pnlNtd, 0);

    return {
      summary: {
        totalTrades,
        winRatePct: totalTrades > 0 ? Number(((winTrades.length / totalTrades) * 100).toFixed(1)) : 0,
        netTotalPnlNtd: totalPnl,
        profitFactor: this.calculateProfitFactor()
      },
      trades: this.completedTrades
    };
  }

  private calculateProfitFactor(): number {
    const grossProfit = this.completedTrades.filter(t => t.pnlNtd > 0).reduce((sum, t) => sum + t.pnlNtd, 0);
    const grossLoss = Math.abs(this.completedTrades.filter(t => t.pnlNtd < 0).reduce((sum, t) => sum + t.pnlNtd, 0));
    return grossLoss === 0 ? grossProfit : Number((grossProfit / grossLoss).toFixed(2));
  }
}
```

### 12.5 回測報告產出範例

```json
{
  "summary": {
    "test_period": "2026-07-01 to 2026-07-31",
    "total_simulated_days": 22,
    "total_trades": 18,
    "win_rate_pct": 66.7,
    "net_total_pnl_ntd": 84500,
    "profit_factor": 2.15,
    "max_drawdown_ntd": -18000
  },
  "engine_effectiveness": {
    "blocked_by_briefing_bias": 14,
    "blocked_by_sector_limit": 3,
    "blocked_by_margin_cap": 2,
    "priority_ranking_conflicts_resolved": 5
  },
  "sample_trade": {
    "symbol": "2308",
    "action": "BUY_TO_OPEN",
    "entryTime": "2026-07-31T09:35:00+08:00",
    "entryPrice": 1640.8,
    "exitTime": "2026-07-31T10:12:00+08:00",
    "exitPrice": 1673.0,
    "shares": 1000,
    "pnlNtd": 28412,
    "exitReason": "TAKE_PROFIT",
    "rankScoreAtEntry": 74.0
  }
}
```

### 12.6 回測模組三大實戰效益

1. **零成本驗證極限情境：** 模擬開盤暴跌 500 點時多檔同時爆量，Priority Engine 是否死鎖或過度下單。
2. **手續費與滑點真實還原：** 1 檔 Tick 滑點 + 2.8 折手續費 + 減半證交稅，確保 PnL 不是「紙上富貴」。
3. **優化 Briefing 打分權重：** 透過回測調整 $W_{bias}$ 與 $W_{surge}$ 最佳權重，讓盤前分析與盤中動能達最佳平衡。

---

## 13. 參數最佳化（Parameter Optimization）

### 13.1 Grid Search 參數網格搜尋

> 最危險的陷阱是「過度最佳化 (Curve Fitting)」。目標是找到「獲利高原 (Profit Plateau)」——參數區間內不管怎麼微調都能穩定獲利，而非「孤島型最佳解」。

**前置準備：** 將 `TacticalBriefing.trading_plan.key_levels` 加入 `volume_surge_threshold` 參數（§9.1 已含），Simulator 觸發條件改為讀取該值（§12.4 已實作）。

**搜尋腳本（`src/backtest/grid_search.ts`）核心邏輯：**

```typescript
import * as path from "path";
import { CsvDataLoader } from "./data_loader.js";
import { DayBrainBacktestSimulator } from "./simulator.js";
import { TacticalBriefing } from "../briefing/generator.js";

interface GridSearchResult {
  stopLossPct: number;
  surgeMultiplier: number;
  totalTrades: number;
  winRatePct: number;
  netTotalPnlNtd: number;
  profitFactor: number;
}

async function runGridSearch() {
  console.log("🚀 啟動 DayBrain 參數網格搜尋 (Grid Search)...");

  // 1. 定義參數空間
  const stopLossOptions = [1.0, 1.2, 1.5, 1.8, 2.0, 2.2, 2.5]; // 硬停損 %
  const surgeOptions = [2.0, 2.5, 3.0, 3.5, 4.0, 5.0];        // 爆量倍數

  // 2. 載入歷史數據 (只載入一次)
  const dataLoader = new CsvDataLoader({ volumeUnit: "LOTS" });
  const dataDir = path.join(process.cwd(), "data", "historical_1m");
  const marketDataMap = await dataLoader.loadDirectory(dataDir);

  const results: GridSearchResult[] = [];
  let completed = 0;
  const totalIterations = stopLossOptions.length * surgeOptions.length;

  // 3. 雙層迴圈遍歷參數網格
  for (const sl of stopLossOptions) {
    for (const surge of surgeOptions) {
      // 每次迭代實例化全新 Simulator 以清空歷史狀態
      const simulator = new DayBrainBacktestSimulator(3000000);

      const testBriefings: TacticalBriefing[] = Array.from(marketDataMap.keys()).map(symbol => ({
        _lineage: { generated_at: new Date().toISOString(), agent_version: "v2.0", mcp_server_version: "v0.8", data_sources: [] },
        target: { symbol, name: "測試標的", market: "TWSE", yesterday_close: 100 },
        bias_assessment: { bias: "LONG_ONLY", score: 85, confidence: "HIGH", scoring_breakdown: [] },
        trading_plan: {
          allowed_actions: ["BUY_TO_OPEN"],
          blocked_actions: ["SELL_TO_OPEN"],
          active_window: { start_time: "09:05", no_new_entry_after: "11:30", force_flat_by: "13:10" },
          key_levels: {
            anchor_vwap_estimate: 100,
            breakout_pivot_price: 100,
            support_invalidation_price: 100,
            volume_surge_threshold: surge // 注入測試的爆量倍數
          }
        },
        risk_guardrails: {
          max_position_size_shares: 2000,
          hard_stop_loss_pct: sl, // 注入測試的停損趴數
          take_profit_target_1_pct: 2.0,
          trailing_stop_activation_pct: 2.0,
          trailing_stop_callback_pct: 1.0,
          max_drawdown_limit_ntd: 30000,
          safety_flags: { is_disposition: false, can_daytrade: true, can_short_first: true, earnings_announcement_today: false }
        }
      }));

      simulator.loadBriefings(testBriefings);
      const report = simulator.runSimulation(marketDataMap);

      results.push({
        stopLossPct: sl,
        surgeMultiplier: surge,
        totalTrades: report.summary.totalTrades,
        winRatePct: report.summary.winRatePct,
        netTotalPnlNtd: report.summary.netTotalPnlNtd,
        profitFactor: report.summary.profitFactor
      });

      completed++;
      process.stdout.write(`\r進度: ${completed}/${totalIterations} 組合已完成...`);
    }
  }

  // 4. 分析與排序 (濾除交易次數 < 5 的無效組合，依淨利潤降冪)
  const validResults = results.filter(r => r.totalTrades >= 5);
  validResults.sort((a, b) => b.netTotalPnlNtd - a.netTotalPnlNtd);

  console.log("\n\n📊 網格搜尋完成！最佳參數組合 Top 5 (依淨利潤排序):");
  console.table(validResults.slice(0, 5).map((r, index) => ({
    "排名": `#${index + 1}`,
    "停損 % (SL)": `${r.stopLossPct.toFixed(1)}%`,
    "爆量倍數 (Surge)": `${r.surgeMultiplier.toFixed(1)}x`,
    "總利潤 (NTD)": r.netTotalPnlNtd.toLocaleString(),
    "勝率 (%)": `${r.winRatePct}%`,
    "獲利因子 (PF)": r.profitFactor,
    "交易次數": r.totalTrades
  })));
}

runGridSearch().catch(console.error);
```

### 13.2 如何解讀搜尋結果（The "Profit Plateau" Rule）

| 排名 | 停損 % (SL) | 爆量倍數 (Surge) | 總利潤 (NTD) | 勝率 (%) | 獲利因子 (PF) | 交易次數 |
| --- | --- | --- | --- | --- | --- | --- |
| #1 | 1.8% | 2.5x | 142,500 | 62.5% | 2.10 | 48 |
| #2 | 1.5% | 2.5x | 138,000 | 61.2% | 2.05 | 52 |
| #3 | 2.0% | 2.5x | 135,200 | 64.0% | 1.95 | 45 |
| #4 | 1.2% | 4.0x | 95,000 | 50.0% | 1.80 | 12 |
| #5 | 1.8% | 3.0x | 92,000 | 58.5% | 1.85 | 38 |

**選參數的實戰思維：**

1. **不要盲目選 #1：** `#1/#2/#3` 的爆量倍數皆為 `2.5x`、停損落在 `1.5% ~ 2.0%`，代表 `[Surge: 2.5, SL: 1.5~2.0]` 是穩固的**獲利高原**，此區間內隨便選實戰都不會死。
2. **警惕孤島數據：** `#4` 停損極窄 (1.2%)、爆量要求極高 (4.0x)，交易次數銳減至 12 次，屬過度擬合，未來容易失效。
3. **選擇中心點：** 實戰最棒參數為 **SL: 1.8%, Surge: 2.5x**（獲利高原中心，容錯率最高）。

### 13.3 Walk-Forward Optimization（前向前移最佳化）

> Grid Search 找到的是當下最佳參數；WFO 用來驗證這些參數「會不會在下個月直接失效」。

**滾動原理（假設 2025/01 ~ 2025/12 共 12 個月資料）：**

```
 Timeline ─────────────────────────────────────────────────────────────►

 [ 1月 - 3月 (In-Sample) ] ──(Grid Search)──► 參數 P1 ──► [ 4月 (Out-of-Sample) ] 測試 P1
                             [ 2月 - 4月 (IS) ] ──(Grid Search)──► P2 ──► [ 5月 (OOS) ] 測試 P2
                                                         [ 3月 - 5月 (IS) ] ──► [ 6月 (OOS) ] ...
```

1. **樣本內窗口 (IS)：** 拿 3 個月資料做 Grid Search，找 Profit Factor 最高且穩定的參數組合 $P_1$。
2. **樣本外窗口 (OOS)：** **凍結 $P_1$**，執行第 4 個月（完全沒看過）的回測，紀錄真實績效。
3. **窗口向前滾動：** 向後推 1 個月（2~4 月做 IS 得 $P_2$），拿 $P_2$ 測第 5 個月 (OOS)。
4. **拼接 OOS 績效：** 串接所有 OOS 月份損益成權益曲線（Equity Curve）——**這條曲線才是策略未來實戰最真實的預期**。

**核心模組（`src/backtest/wfo_optimizer.ts`）：**

```typescript
import { CsvDataLoader } from "./data_loader.js";
import { DayBrainBacktestSimulator, MinuteBar } from "./simulator.js";
import { TacticalBriefing } from "../briefing/generator.js";

export interface WfoWindowResult {
  windowId: number;
  inSampleRange: { start: string; end: string };
  outOfSampleRange: { start: string; end: string };
  bestInSampleParams: { stopLossPct: number; surgeMultiplier: number; isProfitFactor: number };
  oosPnlNtd: number;
  oosWinRatePct: number;
  oosTradesCount: number;
}

export class WalkForwardOptimizer {
  private inSampleMonths: number;
  private outOfSampleMonths: number;
  private stopLossOptions = [1.0, 1.5, 1.8, 2.0, 2.5];
  private surgeOptions = [2.0, 2.5, 3.0, 3.5, 4.0];

  constructor(inSampleMonths: number = 3, outOfSampleMonths: number = 1) {
    this.inSampleMonths = inSampleMonths;
    this.outOfSampleMonths = outOfSampleMonths;
  }

  public async runWfo(marketDataMap: Map<string, MinuteBar[]>): Promise<{
    windowResults: WfoWindowResult[];
    totalOosPnlNtd: number;
    wfoEfficiencyRatio: number;
  }> {
    const availableMonths = this.extractSortedMonths(marketDataMap);
    const windowResults: WfoWindowResult[] = [];

    let currentStartIdx = 0;
    let windowId = 1;

    while (currentStartIdx + this.inSampleMonths + this.outOfSampleMonths <= availableMonths.length) {
      const isMonths = availableMonths.slice(currentStartIdx, currentStartIdx + this.inSampleMonths);
      const oosMonths = availableMonths.slice(
        currentStartIdx + this.inSampleMonths,
        currentStartIdx + this.inSampleMonths + this.outOfSampleMonths
      );

      // 切分資料集
      const isData = this.filterDataByMonths(marketDataMap, isMonths);
      const oosData = this.filterDataByMonths(marketDataMap, oosMonths);

      // A. 在 In-Sample 上執行 Grid Search 尋找最佳參數
      const bestIsParam = this.findBestParamsOnGrid(isData);

      // B. 拿最佳參數，在 Out-of-Sample (未來數據) 上無偏檢驗
      const oosReport = this.runSingleBacktest(oosData, bestIsParam.stopLossPct, bestIsParam.surgeMultiplier);

      windowResults.push({
        windowId,
        inSampleRange: { start: isMonths[0], end: isMonths[isMonths.length - 1] },
        outOfSampleRange: { start: oosMonths[0], end: oosMonths[oosMonths.length - 1] },
        bestInSampleParams: bestIsParam,
        oosPnlNtd: oosReport.netTotalPnlNtd,
        oosWinRatePct: oosReport.winRatePct,
        oosTradesCount: oosReport.totalTrades
      });

      currentStartIdx += this.outOfSampleMonths; // 窗口向前推進 1 個月
      windowId++;
    }

    const totalOosPnlNtd = windowResults.reduce((sum, w) => sum + w.oosPnlNtd, 0);

    return {
      windowResults,
      totalOosPnlNtd,
      wfoEfficiencyRatio: this.calculateWfoEfficiency(windowResults)
    };
  }

  private findBestParamsOnGrid(dataMap: Map<string, MinuteBar[]>) {
    let bestParam = { stopLossPct: 1.5, surgeMultiplier: 2.5, isProfitFactor: 0 };

    for (const sl of this.stopLossOptions) {
      for (const surge of this.surgeOptions) {
        const report = this.runSingleBacktest(dataMap, sl, surge);
        // 交易次數 >= 3 筆且 Profit Factor 最高
        if (report.totalTrades >= 3 && report.profitFactor > bestParam.isProfitFactor) {
          bestParam = { stopLossPct: sl, surgeMultiplier: surge, isProfitFactor: report.profitFactor };
        }
      }
    }
    return bestParam;
  }

  private runSingleBacktest(dataMap: Map<string, MinuteBar[]>, sl: number, surge: number) {
    const simulator = new DayBrainBacktestSimulator(3000000);
    const mockBriefings: TacticalBriefing[] = Array.from(dataMap.keys()).map(symbol => ({
      _lineage: { generated_at: new Date().toISOString(), agent_version: "v2.0", mcp_server_version: "v0.8", data_sources: [] },
      target: { symbol, name: "測試", market: "TWSE", yesterday_close: 100 },
      bias_assessment: { bias: "LONG_ONLY", score: 85, confidence: "HIGH", scoring_breakdown: [] },
      trading_plan: {
        allowed_actions: ["BUY_TO_OPEN"],
        blocked_actions: ["SELL_TO_OPEN"],
        active_window: { start_time: "09:05", no_new_entry_after: "11:30", force_flat_by: "13:10" },
        key_levels: { anchor_vwap_estimate: 100, breakout_pivot_price: 100, support_invalidation_price: 100, volume_surge_threshold: surge }
      },
      risk_guardrails: {
        max_position_size_shares: 2000,
        hard_stop_loss_pct: sl,
        take_profit_target_1_pct: 2.0,
        trailing_stop_activation_pct: 2.0,
        trailing_stop_callback_pct: 1.0,
        max_drawdown_limit_ntd: 30000,
        safety_flags: { is_disposition: false, can_daytrade: true, can_short_first: true, earnings_announcement_today: false }
      }
    }));

    simulator.loadBriefings(mockBriefings);
    return simulator.runSimulation(dataMap).summary;
  }

  private extractSortedMonths(marketDataMap: Map<string, MinuteBar[]>): string[] {
    const monthSet = new Set<string>();
    for (const bars of marketDataMap.values()) bars.forEach(b => monthSet.add(b.datetime.substring(0, 7)));
    return Array.from(monthSet).sort();
  }

  private filterDataByMonths(marketDataMap: Map<string, MinuteBar[]>, months: string[]): Map<string, MinuteBar[]> {
    const filteredMap = new Map<string, MinuteBar[]>();
    const monthSet = new Set(months);
    for (const [symbol, bars] of marketDataMap.entries()) {
      const filteredBars = bars.filter(b => monthSet.has(b.datetime.substring(0, 7)));
      if (filteredBars.length > 0) filteredMap.set(symbol, filteredBars);
    }
    return filteredMap;
  }

  private calculateWfoEfficiency(results: WfoWindowResult[]): number {
    const positiveWindows = results.filter(r => r.oosPnlNtd > 0).length;
    return Number(((positiveWindows / (results.length || 1)) * 100).toFixed(1));
  }
}
```

### 13.4 解讀 WFO 關鍵評估指標（Walk-Forward Efficiency）

**樣本外獲利比率（WFE）：**

$$\text{WFE} = \frac{\text{樣本外 (OOS) 累積總淨利}}{\text{樣本內 (IS) 最佳化預期總淨利}}$$

- **WFE > 60%：** 策略過關！盤前最佳參數在未來市場仍保有 60% 以上獲利能力，適應力極佳。
- **WFE < 30%：** **極度過度擬合 (Overfitted)**！過往最佳參數在樣本外幾乎失效，**絕不能上線實戰**。

**參數漂移穩定度（Parameter Stability）：** 觀察每個 Window 選出的 `bestIsParam` 變化：

- **健康狀態：** Window 1 → 1.8%, Window 2 → 1.8%, Window 3 → 1.5%（參數穩定）。
- **危險狀態：** Window 1 → 1.0%, Window 2 → 2.5%, Window 3 → 1.2%（策略對市場極度敏感，缺乏穩健性）。

---

## 14. 資料結構與介面設計 (Interface Specification)

### 14.1 觀察清單 (`WatchlistTarget`)

```json
{
  "date": "2026-08-03",
  "scoring_version": "2.0.0",
  "watchlist": [
    {
      "symbol": "2308",
      "name": "台達電",
      "direction": "LONG",
      "bias": "LONG_ONLY",
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

### 14.2 進場建議 (`SignalAdvice`)

```json
{
  "signal_id": "20260803-2308-094512",
  "ts": "2026-08-03T09:45:12+08:00",
  "symbol": "2308",
  "grade": "STRONG_BUY",
  "score": 85,
  "score_breakdown": { "volume": 30, "level": 30, "market": 20, "tick_structure": 5 },
  "strategy": "VWAP_SURGE_LONG",
  "recommended_entry": 348.5,
  "target_price": 360.0,
  "stop_loss_price": 342.0,
  "rr_ratio": 2.5,
  "position_size_shares": 2000,
  "data_quality": { "freshness": "REALTIME_INTRADAY", "fetched_lag_sec": 3, "is_cached": false },
  "expiry_ts": "2026-08-03T09:50:12+08:00"
}
```

### 14.3 持倉 (`Position`)

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

### 14.4 交易日誌 (`JournalEntry`，結構化，供 LLM 報告之唯一統計來源)

```json
{
  "date": "2026-08-03",
  "scoring_version": "2.0.0",
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

## 15. 績效指標定義（Evaluation Metrics）

| 指標 | 定義 | 用途 |
|---|---|---|
| 勝率（Hit Rate） | 獲利筆數 ÷ 總交易筆數 | 訊號品質 |
| 盈虧比（Profit Factor） | 總獲利 ÷ 總虧損（含手續費稅金） | 期望值驗證 |
| 期望值（Expectancy） | 平均每筆盈虧 | 策略可否存活 |
| 最大回撤（Max DD） | 日損益累積之最低點 | 風控上限驗證 |
| 訊號轉換率 | 觸發筆數 ÷ 訊號筆數 | 訊號可執行性 |
| 假突破率 | `failed_breakout` 事件 ÷ 確認訊號數 | 模型校正（可能原因：大盤反轉、量能不足） |
| 引擎攔截統計（回測） | `blocked_by_briefing_bias` / `blocked_by_sector_limit` / `blocked_by_margin_cap` / `priority_ranking_conflicts_resolved` | 風控與調度有效性（§12.5） |
| WFE（回測） | OOS 總淨利 ÷ IS 預期淨利 | 參數過擬合程度（§13.4） |

- 指標以週為週期滾動統計；連續 2 週 Profit Factor < 1.1 或 Hit Rate < 35% → 暫停策略並檢討參數。

---

## 16. LLM 使用規範（防幻覺）

1. **硬數字不經 LLM**：觸發價、停損價、倉位、分數一律由規則引擎產出；LLM 不得增減。
2. **輸出 Schema 驗證**：LLM 產生之任何結構化輸出（如 `llm_report`、劇本）通過 JSON Schema + 範圍檢查（數字必須為 null 或於合理區間內）。
3. **symbol 白名單**：LLM 提及之個股必須存在於當日觀察清單或 `get_symbol_list` 回傳，否則整段捨棄。
4. **統計引用限制**：LLM 檢討報告中的數字必須引用 `JournalEntry.summary`，禁止自行推算（如自行估計勝率）。
5. **不承諾報酬**：輸出模板中固定附上「僅供研究參考，不構成投資建議」。

---

## 17. 技術選型（Tech Stack）

| 項目 | 選擇 | 說明 |
|---|---|---|
| 開發語言 | TypeScript (Node.js ≥ 20) | 與 `@modelcontextprotocol/sdk` 原生整合 |
| LLM | Claude 4.x Sonnet（推理與打分） | 可由設定切換；評分模型本身不依賴 LLM |
| MCP 連線 | Stdio（本機，連接 `tw-quant-mcp` binary） | 亦可切 Streamable HTTP |
| 排程 | 自帶 Scheduler（cron 語法設定檔） | 見 §18.2 |
| 設定 | `config/*.yaml` + 環境變數覆寫 | 時區固定 `Asia/Taipei` |
| 日誌 | 結構化 JSON（事件型） | 支援回放（replay）工具 |
| 回測資料 | CSV（Shioaji / FinMind 等匯出）| `CsvDataLoader` 正規化（§12.3） |

### 17.1 環境變數（預設值）

```text
TIME_ZONE=Asia/Taipei
MCP_SERVER_BIN=/usr/local/bin/tw-quant-mcp
MCP_TRANSPORT=stdio
DATA_STALENESS_MAX_SEC=30
SCORE_THRESHOLD=80
NEUTRAL_SCORE_THRESHOLD=85      # NEUTRAL_FLEXIBLE 日之提高門檻 (§5.3)
BIAS_LOCK_SCORE=50               # 鎖定 LONG_ONLY/SHORT_ONLY 之門檻
RISK_PER_TRADE=0.005
MAX_POSITIONS=2
MAX_DAILY_LOSS_PCT=3.0
TOTAL_MARGIN_POOL_NTD=3000000
MAX_LEVERAGE=2.0
SECTOR_LIMIT_PCT=0.40
VOLUME_SURGE_THRESHOLD=2.5
NO_ENTRY_AFTER=13:00
FORCE_CLOSE_AT=13:20
LOG_DIR=./logs
DATA_DIR=./data/historical_1m
```

---

## 18. 部署與營運（Deployment & Operations）

### 18.1 部署形態

- 本機單一進程：`tw-quant-daybrain`（Agent）+ 子程序 `tw-quant-mcp`（MCP Server）。
- 交易日自動執行；非交易日自動休眠（交易日曆判斷）。
- 回測/最佳化工具（§12/§13）為獨立 CLI，非交易日執行。

### 18.2 排程（交易日）

| 時間 | 事件 |
|---|---|
| 08:15 | Phase 0 就緒檢查與預熱 |
| 08:30 | Phase 1 盤前選股 + Bias 決策樹 |
| 08:55 | Tactical Briefing 產出與鎖定 |
| 09:00 – 12:30 | Phase 2 盤中監控（tick 10s） |
| 11:30 / 12:30 / 13:00 / 13:10 / 13:15 / 13:20 | Phase 3 尾盤收斂觸發點 |
| 14:30 | Phase 4 盤後統計與日誌 |

### 18.3 失敗處理

| 失敗類型 | 行為 |
|---|---|
| MCP 連線中斷 | 重連（指數退避 1s→30s）；重連期間 `LOCKOUT`，不出訊號 |
| 單一 Tool 呼叫失敗 | 重試 2 次後跳過該資料源，標記缺口 |
| 資料守門失敗 | 依 §3.2 降級 |
| LLM 不可用 | 規則引擎仍可出訊號（附註 `llm_offline`），日誌由模板生成 |

---

## 19. Roadmap

| Phase | 內容 | 產出 |
|---|---|---|
| Phase 1（W1–2） | Agent 骨架、MCP 連線、Freshness Gate、事件日誌、交易日曆 | 可穩定運行之基礎架構 |
| Phase 2（W3–4） | 盤前選股流程、Bias 決策樹、Tactical Briefing、訊號模型 v1、Priority Engine、Risk Manager 與狀態機、紙上交單 | 完整盤中循環 |
| Phase 3（W5–6） | JournalEntry 統計、績效指標、LLM 檢討報告、回放工具 | 回饋迴路閉合 |
| Phase 4（W7–8） | **回測體系**：CsvDataLoader + 事件驅動模擬器；**參數實驗**：Grid Search + WFO 滾動驗證（scoring v2.0→v2.1）；壓測（10s tick × 全交易日）、文件補完 | v2.0 正式版 |
| Phase 5（W9+） | 券商 Adapter 介接（參見 `tw-quant-adapter-2.0.md`）、模擬盤驗證、正式上線前參數凍結 | Production 試運行 |

---

## 附錄 A：與 `tw-quant-mcp` v1.3 之介面對齊檢查表

- [ ] 所有 MCP 回傳使用 Envelope（`data` / `_lineage` / `_chart_meta`）解析。
- [ ] 盤中工具僅於 `09:00 – 13:30` 呼叫；非交易時段改走盤後工具。
- [ ] `set_active_watchlist` 一次不得超過 15 檔（mcp 端硬限制）。
- [ ] `_lineage.source` 僅允許官方來源（TWSE / TPEx / MOPS / TAIFEX / MIS），出現未知來源視同守門失敗。
- [ ] daybrain 不直接存取任何官方 HTTP API，所有資料路徑皆經 mcp。

## 附錄 B：開發地圖（模組總覽）

```
 [1. Bias Decision Tree] ──► [2. Tactical Briefing JSON] ──► [3. Priority Engine 搶單]
        ▲                                                          │
        │                                                          ▼
 [6. WFO 滾動驗證] ◄── [5. Grid Search] ◄── [4. 1分K 事件驅動模擬器 & DataLoader]
                                                                      │
                                                                      ▼
                                                      [ 策略引擎：VWAP_SURGE_LONG / BULL_TRAP_VWAP_SHORT ]
                                                      [ 風控：Risk Manager + 時間硬風控 + Daily Lockout ]
```

> 相關文件：券商下單 Adapter 與券商評估 → `tw-quant-adapter-2.0.md`
