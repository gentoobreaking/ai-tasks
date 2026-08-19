# tw-quant-mcp 規格書 v1.3 vs v2.1 差異比較

日期：2026-08-01
來源文件：
- /Users/david/tasks/tw-quant-mcp/tw-quant-mcp-spec-v1.3.md
- /Users/david/tasks/tw-quant-mcp/tw-quant-mcp-spec-v2_1.md

## Objective
比較兩份 tw-quant-mcp 專案開發規格書的差異，判斷版本關係與內容落差，供後續決定以哪份為準。

## 版本關係（關鍵發現）
- **兩者並非線性前後代**：v1.3 是 v1.2 → v1.3 的演進；v2.1 是 v2.0 → v2.1 的演進，其版本異動摘要全部相對 v2.0 描述（v2.0 僅 4 個 Tool）。
- v1.3 已有 36 個 Tool 目錄；v2.1 只有 25 個。v2.1 反而較少，但每個 Tool 標註成熟度 grade。
- v2.1 未引用 v1.3；兩條演進線平行，需使用者確認以哪份為基準。

## 核心差異表

| 維度 | v1.3 | v2.1 |
|---|---|---|
| 定位 | 自成一體規格（章節 0–13 + 附錄 A） | 優化版規格（§0 異動摘要、§14 需求對照表、參考資料） |
| 來源分級 | Source Registry，角色 canonical / helper / fallback | 七來源分級：CANONICAL / SEMI_OFFICIAL_REALTIME（MIS）/ FALLBACK |
| Lineage | source / source_role / derived_from / fetched_at / data_date / freshness / sampling_sec / is_cached / cache_ttl / latency_ms / source_url；單一物件 | 新增 source_role 型別、grade（AVAILABLE/PREVIEW/NOT_YET_AVAILABLE）、cache_age_sec；**移除** derived_from / cache_ttl / source_url；支援 `[]Lineage` 多來源陣列；freshness 改為 REALTIME_INTRADAY/POST_MARKET/MONTHLY/QUARTERLY + STALE_FALLBACK |
| 快取 | 三層（L1 Ristretto / L2 SQLite / L3 不實作）；細粒度 TTL 政策表（盤中/盤後分列）；cache_key sha256 設計 | 雙層（Ristretto + SQLite）；RingBuffer 完全獨立於 L1/L2；TTL 矩陣較粗；stale-if-error 回退；環境變數可調參數表 |
| Rate Limit | 每主機固定間隔表（如 www.twse 1/2s、TAIFEX-DL 1/5s）+ jitter ±20% + 指數退避 + 熔斷（連續 5 次失敗暫停 60s） | per-source token bucket（rate.Limiter，如 TAIFEX_DOWNLOAD 1/2s、MOPS 1/1s）；無明確退避/熔斷細節 |
| Schema | §5 命名規則 + Symbol Registry + 單一共通 Candle 模型 | §6 六大資料域正規化 Schema（TrendComposite / InstitutionalFlow / DividendRecord / FinancialHealthReport / RiskFlags / DerivativesSnapshot）+ StockIdentity + 獨立 normalize 層（pkg/model/normalize/） |
| 架構 | 六層：Provider / Cache / Engine / Model / Chart / MCP；pkg/engine 含 watchlist/ringbuffer/aggregator/vwap/surge/composite | 新增 Domain Analysis Layer（pkg/domain/ 九個子模組）+ Normalization Layer + pkg/ratelimit/；明確 modelcontextprotocol/go-sdk |
| Tool 目錄 | 36 個（A–G 七組），未標 grade；含 get_intraday_quote、get_margin_trading、get_monthly_revenue、get_symbol_list、get_trading_calendar 等 | 25 個對應十大情境，每 Tool 標 grade（14 AVAILABLE / 9 PREVIEW / 2 NOT_YET_AVAILABLE）；多個工具名稱不同（get_stock_trend_composite、get_risk_flags、get_financial_health_report 等） |
| 效能 | §12 八原則：single-flight、連線池、批次化、增量計算、盤中 K 線零 HTTP、預熱排程 | §10 聚焦篩選類：批次端點優先、Bounded Worker Pool（errgroup.SetLimit）、Materialized Screener Index（每日 15:00 預計算入 SQLite） |
| 圖表 | _chart_meta（recommended_type/x_axis/y_axis/series/annotations/note）+ 7 種對應 | 通用 ChartMeta（RecommendedType/XAxisKey/YAxisKeys/Series）+ 5 種型別（candlestick/line/bar/heatmap/table） |
| Roadmap | 4 個 Phase（W1–8） | 6 個 Phase（W1–12），依 grade 分階段交付 |
| 其他 | 附錄 A：法遵約束 + disclaimer 欄位；Watchlist 狀態機（IDLE→WARMUP→SAMPLING→FLUSH→IDLE + DEGRADED） | 新增 §12 核心實作範例（main.go）、§14 需求對照表、附註（MCP 與非 AI 呼叫端相容性）；無法遵附錄、無狀態機 |

## 矛盾點（需注意）
- **Jitter 位置相反**：v1.3 明確指出「Jitter 一律置於請求發出之前，v1.2 的 sleep-after 為已知錯誤，已修正」；但 v2.1 §8.2 MISWorker 範例代碼中 `time.Sleep(jitter)` 位於 `client.Do()` 之後（即 sleep-after）。v2.1 範例保留了 v1.3 明令禁止的寫法，實作時須以 v1.3 為準或修正 v2.1 範例。
- Tool 覆蓋範圍不互為子集：v1.3 有的（融資融券、公司資料、代碼表、交易日曆、財報三表、月營收、ESG、股利歷史、市場摘要）在 v2.1 缺失；v2.1 有的（趨勢綜合、外資產業流、ESG 風險、風險旗標、衍生品歷史）在 v1.3 缺失。

## Conclusions
1. 兩份文件為平行演進線，非前後版本；v2.1 的設計層次（domain 分層、grade 分級、materialized index）比 v1.3 更完整，但 Tool 覆蓋較窄、細節（TTL 表、熔斷、狀態機、法遵附錄）較粗。
2. 若需合併：建議以 v2.1 的架構骨架（domain/grade/normalize）為基底，補回 v1.3 的細粒度 TTL 表、熔斷/退避細節、狀態機、法遵附錄，並以 v1.3 的 36 個 Tool 清單擴充 v2.1 的 25 個。
3. 實作前須解決 jitter 位置矛盾。

## 追問：v2.1 為何移除 derived_from / cache_ttl / source_url（2026-08-01 補充）

文件未明說刪除理由（v2.1 異動摘要只寫新增三個欄位），以下為依文件邏輯推斷：

1. **derived_from**：v1.3 有 helper 角色（VWAP/指標等派生計算）需追蹤父資料集；v2.1 角色體系改為 CANONICAL/SEMI_OFFICIAL_REALTIME/FALLBACK，無 helper 角色，派生計算改歸 domain 層業務邏輯；多來源聚合改以 `[]Lineage` 陣列逐一列出（§4 設計規則 2），父資料集追蹤被陣列取代。
2. **cache_ttl**：TTL 是伺服器端政策（§5.2 矩陣＋環境變數可調），非資料屬性；對呼叫端有意義的是資料已存活多久（新欄位 `cache_age_sec`，age 是事實）而非伺服器打算讓它活多久（TTL 是設定）。回傳寫死的 TTL 還可能與現行政策不一致而誤導。
3. **source_url**：v1.3 附錄 A 已預告「source_url 僅 debug/log 模式輸出，正式 Response 省略（減少 token 成本）」；v2.1 落實為 schema 直接不含。URL 屬內部除錯細節，`source` + `source_role` 已足以標明來源；對 AI Agent 呼叫端是純 token 成本無信任增益。

共同方向：將 Lineage 從「伺服器內部工程資訊」收斂為「呼叫端做信任判斷所需的資料」——保留 source_role/grade/cache_age_sec（多權威/多成熟/多舊），移除內部追蹤/政策設定/除錯資訊。呼應 twmarketdata.com「schema 與欄位穩定性優先」精神（公開欄位越少越穩定）。
