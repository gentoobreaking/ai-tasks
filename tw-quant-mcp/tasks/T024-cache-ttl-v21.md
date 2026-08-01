---
github_issue: N/A
title: 雙層快取 TTL 矩陣與環境變數參數化（v2.1 §5）
type: feature
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-01
updated: 2026-08-01
---

# T024 - 雙層快取 TTL 矩陣與環境變數參數化（v2.1 §5）

## 目標
將現有三層快取（T004 已實作 L1 Ristretto / L2 SQLite）依 v2.1 §5 調整：確認 RingBuffer 不進 L1/L2（維持獨立）；以 §5.2 TTL 矩陣取代/校正既有 TTL 政策；新增環境變數參數化（CACHE_L1_MAX_ENTRIES / CACHE_L1_MAX_MEMORY_MB / CACHE_L2_SQLITE_PATH / CACHE_HIT_RATE_TARGET 等）；實作 stale-if-error 回退（`freshness=STALE_FALLBACK`）。

## 驗收標準
- [ ] 盤中 RingBuffer 完全不經過 L1/L2（既有驗證保留，新增測試確認無 cache 寫入）
- [ ] TTL 矩陣對齊 §5.2：個股日K/全市場收盤 ~18hr、三大法人至隔日、融資融券至隔日、月營收 30 天、財報 90 天、除權息 6h、注意/處置至隔日開盤、TAIFEX 歷史回溯 7 天、ESG 24h 等（以 policy 表為唯一真值）
- [ ] 環境變數可調：CACHE_L1_MAX_ENTRIES（預設 10000）、CACHE_L1_MAX_MEMORY_MB（256）、CACHE_L2_SQLITE_PATH（./data/cache.db）、CACHE_HIT_RATE_TARGET（0.8）等，併入 pkg/config
- [ ] stale-if-error：Adapter 請求失敗時回退「已過期但仍存在」之 L2 值，`_lineage.freshness=STALE_FALLBACK`，不直接回錯誤
- [ ] 新增測試：TTL 矩陣各類別、環境變數覆寫、stale-if-error 路徑（mock 上游失敗）

## 備註
- 前置：T021（freshness 需支援 STALE_FALLBACK）
- v1.3 §4.2 細粒度 TTL 表（盤中/盤後分列）與 v2.1 §5.2 矩陣並存：以 v2.1 矩陣為準，但保留 v1.3 較細的盤中分列（MIS 4s、日K 60s）於 policy 中不衝突
- RingBuffer 獨立性（v2.1 §5.1）是與 v1.3 三層快取的主要差異點，須有測試守門
