---
github_issue: N/A
title: 三層快取引擎（L1 Ristretto / L2 SQLite / Single-flight）
type: infrastructure
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T004 - 快取引擎

## 目標
實作 `pkg/cache`：L1 記憶體快取（Ristretto）、L2 磁碟快取（SQLite WAL）、TTL 政策表（§4.2）、快取鍵設計（§4.3）與 Single-flight（§12.2）。

## 驗收標準
- [ ] L1：Ristretto 實作，set/get/delete；L2：SQLite（WAL mode、prepared statement、`(dataset, date)` 索引）
- [ ] 快取鍵：`sha256(source_id|dataset|data_date|symbol|params_hash)[0:16]`（§4.3）
- [ ] TTL 政策表 `policy.go` 為唯一真值，對應 §4.2：MIS Snapshot 4s、日線盤中 60s/盤後至隔日 08:00、財報 12h、TAIFEX 歷史永久等
- [ ] `GetOrFetch(ctx, key, ttl, fetchFn)` 泛型介面：miss 時經 Single-flight 合流，僅一次上游呼叫
- [ ] 快取命中於 `_lineage` 標記 `is_cached=true` + `cache_ttl`（由 model 層注入）
- [ ] L2 支援資料目錄可設定（`DATA_DIR`），進程重啟後歷史資料仍在
- [ ] 單元測試：命中/未命中、TTL 過期、併發同鍵僅一次上游呼叫（計數器驗證）、L2 持久化重啟可用

## 備註
- 盤中 K 線查詢路徑不可進入 L2（僅 L1 4s TTL），避免磁碟 I/O 拖慢延遲
- TAIFEX 歷史資料（§9）為 L2 永久 TTL 之主要消費者
