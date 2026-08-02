---
github_issue: N/A
title: 雙層快取 TTL 矩陣與環境變數參數化（v2.1 §5）
type: feature
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-01
updated: 2026-08-02
---

# T024 - 雙層快取 TTL 矩陣與環境變數參數化（v2.1 §5）

## 目標
將現有三層快取（T004 已實作 L1 Ristretto / L2 SQLite）依 v2.1 §5 調整：確認 RingBuffer 不進 L1/L2（維持獨立）；以 §5.2 TTL 矩陣取代/校正既有 TTL 政策；新增環境變數參數化（CACHE_L1_MAX_ENTRIES / CACHE_L1_MAX_MEMORY_MB / CACHE_L2_SQLITE_PATH / CACHE_HIT_RATE_TARGET 等）；實作 stale-if-error 回退（`freshness=STALE_FALLBACK`）。

## 驗收標準
- [x] 盤中 RingBuffer 完全不經過 L1/L2（既有驗證保留，新增測試確認無 cache 寫入）— TestRingBufferNotInCache（pkg/mcp/ringbuf_cache_test.go）：觸發報價/K線/VWAP/爆量四工具後 L2Count(MIS)=0 且 L1 miss
- [x] TTL 矩陣對齊 §5.2：個股日K/全市場收盤 ~18hr、三大法人至隔日、融資融券至隔日、月營收 30 天、財報 90 天、除權息 6h、注意/處置至隔日開盤、TAIFEX 歷史回溯 7 天、ESG 24h 等（以 policy 表為唯一真值）— pkg/cache/policy.go 矩陣（含 PostUntilNext8AM/PostNotCached 後設）；TestTTLMatrix 全類別驗證；taifex_query.go 改用 7d
- [x] 環境變數可調：CACHE_L1_MAX_ENTRIES（預設 10000）、CACHE_L1_MAX_MEMORY_MB（256）、CACHE_L2_SQLITE_PATH（./data/cache.db）、CACHE_HIT_RATE_TARGET（0.8）等，併入 pkg/config — TestEnvOverrides/TestEnvInvalid 覆寫與錯誤值驗證
- [x] stale-if-error：Adapter 請求失敗時回退「已過期但仍存在」之 L2 值，`_lineage.freshness=STALE_FALLBACK`，不直接回錯誤 — GetOrFetch 回退過期 L2 + ErrServedStale；fetchNormalize/fetchRaw 轉 stale 旗標；postLineage 標 STALE_FALLBACK；TestStaleFallback（cache 層 + 重啟後仍可回退）與 TestFetchNormalizeStaleFallback（mcp 端到端，SQL 直種過期列）
- [x] 新增測試：TTL 矩陣各類別、環境變數覆寫、stale-if-error 路徑（mock 上游失敗）

## 實作摘要（2026-08-02）
- policy.go：§5.2 TTL 矩陣（MIS 4s/L2✗、日K·法人·融資融券 60s 盤後至隔日 08:00、注意/處置 30s 且 AllowL2=false、月營收 30d、財報 90d、重大訊息 5min、行事曆 24h、TAIFEX 7d、外資/權證/估值 60s、ESG 24h、除權息 6h、股利 12h）；ForeverTTL 保留為 API 特殊值
- cache.go：WithStaleFallback/WithSQLitePath/WithL1Config/ErrServedStale/L2Count；l2Get 過期視為 miss（防負 TTL 回填 L1）；GetOrFetch 上游失敗時回退過期 L2
- l1.go：newL1 參數化（預設 10000 列 / 256MB）
- config.go：4 個 CACHE_* 環境變數 + Validate（含 expandPath/MkdirAll）
- app.go：NewApp 接線（WithL1Config/WithSQLitePath/WithDataDir）
- tools_bc.go/tools_de.go：~55 呼叫點新增 stale 傳播；postLineage 增 stale 參數
- 已知取捨：test 種 L2 過期列因 l2WriteMinTTL=10min 門檻改用 SQL 直寫

## 備註
- 前置：T021（freshness 需支援 STALE_FALLBACK）
- v1.3 §4.2 細粒度 TTL 表（盤中/盤後分列）與 v2.1 §5.2 矩陣並存：以 v2.1 矩陣為準，但保留 v1.3 較細的盤中分列（MIS 4s、日K 60s）於 policy 中不衝突
- RingBuffer 獨立性（v2.1 §5.1）是與 v1.3 三層快取的主要差異點，須有測試守門
