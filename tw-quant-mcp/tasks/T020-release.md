---
github_issue: N/A
title: 連續運行驗證與 v1.3 發布
type: release
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T020 - 連續運行驗證與發布

## 目標
§13 Phase 4 收尾：開盤時段連續 4.5h 運行測試（記憶體無 Leak、無 IP Ban、延遲達標）、單一執行檔發布、README 與附錄 A 對齊檢查。

## 驗收標準
- [ ] 交易日 09:00–13:30 連續運行測試：goroutine 數穩定、heap 無持續增長（pprof 對比）、事件日誌無 403/429 被封鎖紀錄
- [ ] 延遲達標：盤中 K 線查詢 P95 < 200ms（§13）
- [ ] `go build` 產出單一可執行檔（CGO-free），啟動後 `tools/list` 全工具註冊正確（36 工具，§10 總數）
- [ ] 端到端驗證腳本：以 mcp client 依序呼叫 A→G 每組代表性工具，輸出 Envelope 結構正確
- [ ] README：安裝、設定、工具清單、免責聲明（附錄 A 官方免費來源政策）
- [ ] 附錄 A 對齊檢查表全數完成（來源僅官方、lineage 齊全、rate limit 生效）
- [ ] 交付：v1.3 版本 tag + 發布說明（對照 §0 版本變更記錄）

## 備註
- 4.5h 測試需排定實際交易日執行；若當日 MIS 或官方來源異常，需留存現場日誌供分析
- 發布前需確認 daybrain 專案（tw-quant-daybrain v1.1）所依賴之工具契約未變更
