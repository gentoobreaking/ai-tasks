---
github_issue: N/A
title: 連續運行驗證與 v2.1 發布
type: release
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-01
updated: 2026-08-01
---

# T031 - 連續運行驗證與 v2.1 發布

## 目標
v2.1 收尾：開盤時段連續 4.5h 運行測試（記憶體無 Leak、無 IP Ban、延遲達標）、Materialized Index 排程驗證、單一執行檔發布、README 更新（v2.1 架構 / Tool 對照表 / grade 分級 / 環境變數表）。

## 驗收標準
- [ ] 交易日 09:00–13:30 連續運行：goroutine 穩定、heap 無持續增長（pprof）、無 403/429 封鎖紀錄（含 MIS token bucket + jitter 前置驗證）
- [ ] 延遲達標：盤中 K 線 P95 < 200ms；screen_high_dividend_yield 查詢走 materialized index（http_calls=0）
- [ ] 15:00 Materialized Index 排程於實際交易日觸發一次並成功寫入 L2；16:45 盤後預熱併存不衝突
- [ ] `go build` 單一執行檔（CGO-free），`tools/list` 全工具註冊正確（36 + 新增 v2.1 工具）
- [ ] README：v2.1 架構圖、25/36 Tool 對照與 grade、環境變數表（§5.3）、免責聲明（官方來源政策）
- [ ] 交付：v2.1 版本 tag + 發布說明（對照 v2.1 §0 版本異動摘要）；daybrain 相依工具契約確認未破壞

## 備註
- 前置：T030 全數通過
- 4.5h 測試需排定實際交易日；若當日官方來源異常，留存現場日誌供分析
- 發布前確認 daybrain 專案（tw-quant-daybrain v1.1）相依工具契約：Lineage 欄位異動（T021 移除 derived_from/cache_ttl/source_url）可能破壞相容性，需同步確認
