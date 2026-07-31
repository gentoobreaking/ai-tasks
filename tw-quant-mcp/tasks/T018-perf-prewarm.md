---
github_issue: N/A
title: 效能最佳化與預熱排程
type: optimization
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T018 - 效能最佳化與預熱排程

## 目標
落實 §12 效能原則之系統性檢視與預熱排程（§12.9）：08:00 行事曆/代碼表、16:45 盤後資料、開盤前 MIS Session。

## 驗收標準
- [ ] 盤中 K 線查詢零 HTTP 之 instrumentation 驗證（每查詢記錄 `http_calls` 計數，須為 0）
- [ ] Single-flight 覆蓋所有可快取 Handler（§12.2）；gzip 與連線池參數生效（§12.3）
- [ ] 批次化確認：MIS 15 檔/請求、法人/全市場用彙總介面（§12.4）；無逐股迴圈呼叫上游之程式碼路徑
- [ ] JSON 最小化：`omitempty` 全面、`chart=false` 省略 meta、無中間 map 序列化（§12.7）
- [ ] 預熱排程：08:00（行事曆+代碼表入 L2）、16:45（當日盤後）、開盤前（MIS Session 重取）；非交易日不執行（T005 行事曆）；預熱失敗不阻塞服務啟動
- [ ] L2 最佳化：WAL、prepared statement、`(dataset,date)` 索引（§12.8）
- [ ] 基準測試：`go test -bench` 記錄盤中 K 線組裝 P50/P95 延遲（目標 < 10ms）

## 備註
- 預熱需遵守各主機 Rate Limit（T003），預熱佇列間距 ≥ 對應 limiter 間隔
- 預熱排程為長駐 goroutine，啟動/停止需隨 Server lifecycle 管理（ctx cancel）
