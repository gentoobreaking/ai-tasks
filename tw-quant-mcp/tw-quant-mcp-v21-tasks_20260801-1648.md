# tw-quant-mcp v2.1 增量任務建置

日期：2026-08-01
執行者：QClaw（依使用者指示建立）

## Objective
使用者已依 v1.3 規格書執行至尾聲（T001–T018 done、T019/T020 pending），現要求改依 v2.1 規格書新增任務檔，將 v2.1 相對 v1.3 的增量設計落地為可執行任務。任務檔依 `~/Projects/ai-skills/clw-ideas2tasks/templates/task-template.md` 範本建立，放置於 `~/tasks/tw-quant-mcp/tasks/`。

## 現況盤點（程式碼 ~/Projects/tw-quant-mcp）
- 36 個 MCP 工具已實作（A–G 七組，v1.3 §10 全數）
- pkg/model Lineage 為 v1.3 版（canonical/helper/fallback + derived_from/cache_ttl/source_url）
- 無 pkg/domain、無 pkg/model/normalize、無 pkg/ratelimit（ratelimit 在 provider 內）
- chart 為 v1.3 版 7 型別；composite 在 pkg/engine/composite/
- 快取為三層（L1 Ristretto/L2 SQLite），RingBuffer 獨立

## 產出：11 個 v2.1 增量任務（T021–T031）

| Task | 主題 | v2.1 章節 | 相依 |
|---|---|---|---|
| T021 | Lineage/SourceRole/DataGrade 通用化 | §4 | 無（影響面最大） |
| T022 | 六大正規化 Schema + Normalize 層 | §6 | T021 |
| T023 | 七來源 Source Role 分級落地 | §3 | T021, T022 |
| T024 | 雙層快取 TTL 矩陣 + 環境變數 + stale-if-error | §5 | T021 |
| T025 | Per-Source Token Bucket + 可調參數 + jitter 前置修正 | §5.3 | 無 |
| T026 | pkg/domain 領域分層與模組邊界 | §7 | T022 |
| T027 | Materialized Screener Index + 批次效能 | §10 | T024, T025, T026 |
| T028 | 通用 ChartMeta 五型別（新增 table） | §11 | 無 |
| T029 | 25 Tool 目錄對齊 + 新增工具 + grade 標註 | §9 | T021, T022, T023 |
| T030 | v2.1 契約測試 + 全量回歸 | §6/§14 | T021–T029 |
| T031 | 連續運行驗證 + v2.1 發布 | §13 | T030 |

README.md 已新增「v2.1 增量任務」區塊，11 項皆為 pending。

## 關鍵決策點（需使用者確認）
1. **命名衝突**：v2.1 工具名與既有 v1.3 工具名不同（get_financial_health_report vs get_financial_health_check、screen_high_dividend_yield vs screen_high_yield、get_material_announcements vs get_major_announcements）——T029 建議以既有名為主、v2.1 名作 alias，待確認。
2. **jitter 位置矛盾**：v1.3 明令 jitter 置於請求前；v2.1 §8.2 範例仍 sleep-after。T025 以「請求前」為準。
3. **限流數值差異**：v2.1 §5.3（TWSE_WEB 1/3s、TAIFEX_DL 1/2s）vs v1.3 §4.4（1/2s、1/5s）——T025 採 v2.1 為主，實測有 Ban 風險再調回。
4. **daybrain 相容性**：T021 移除 derived_from/cache_ttl/source_url 可能破壞 tw-quant-daybrain v1.1 相依契約，T031 發布前須確認。

## Conclusions
- 11 個任務檔已建立（T021–T031），格式依 task-template.md（front-matter 含 github_issue/title/type/priority/status/assignee/created/updated + 目標/驗收標準/備註）。
- 全部 status: pending、assignee: OpenCode with DeepSeek V4 Flash。
- 建議執行順序：T021 → T022/T023 → T024/T025 → T026 → T027 → T028/T029 → T030 → T031。
