---
github_issue: N/A
title: Per-Source Token Bucket 限流與可調參數（v2.1 §5.3）
type: refactor
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-01
updated: 2026-08-01
---

# T025 - Per-Source Token Bucket 限流與可調參數（v2.1 §5.3）

## 目標
將既有 `pkg/provider/ratelimit.go`（每主機固定間隔 + jitter）升級為 v2.1 §5.3 之 per-source token bucket 設計（每個來源獨立 limiter、burst>1 可調），**但限流數值完全採用 v1.3 §4.4 保守值**（已與使用者確認 2026-08-01，避免 Ban IP 風險），並將關鍵參數暴露為環境變數（RATE_LIMIT_ENABLED / RATE_LIMIT_BULK_CONCURRENCY / MIS_JITTER_MIN_MS / MIS_JITTER_MAX_MS）。修正 v2.1 §8.2 範例之 jitter 位置錯誤（sleep 置於請求前）。

> **限流數值決策（已與使用者確認 2026-08-01）：完全採 v1.3 §4.4 保守值**。v2.1 §5.3 僅取其「per-source token bucket」架構與環境變數可調設計，數值表以 v1.3 為準（見下方表格）。

## 驗收標準
- [ ] 七個來源各自獨立 `rate.Limiter`（token bucket，數值採 v1.3 §4.4 保守值）：
  - TWSE_OPENAPI：1 req / 1s
  - TWSE_WEB_API：1 req / 2s
  - TWSE_MIS：1 req / 8s（±1s jitter，burst 1）
  - TPEX_OPENAPI：1 req / 1s
  - MOPS：1 req / 2s
  - TAIFEX_OPENAPI：1 req / 1s
  - TAIFEX_DOWNLOAD：1 req / 5s（下載大 CSV，最保守）
  - 數值可經環境變數覆寫（RATE_LIMIT_*）
- [ ] 既有 jitter（±20% / MIS ±1s）保留並疊加於 token bucket；MIS jitter 區間可調（MIS_JITTER_MIN_MS=7000 / MIS_JITTER_MAX_MS=9000）
- [ ] RATE_LIMIT_ENABLED（預設 true）、RATE_LIMIT_BULK_CONCURRENCY（預設 8）併入 pkg/config
- [ ] **Jitter 一律置於請求發出之前**（修正 v2.1 範例 sleep-after 之錯誤；與 v1.3 §4.4 一致），新增測試驗證請求時序
- [ ] 既有熔斷/指數退避（v1.3 §4.4：403/429 → 1s→2s→4s 上限 30s、連續 5 失敗暫停 60s）保留並與 token bucket 共存
- [ ] 契約/單元測試：每來源限流參數、burst 行為、jitter 前置、環境變數覆寫

## 備註
- 前置：無（ratelimit.go 既有）
- 已確認：數值完全採 v1.3 §4.4（TWSE_WEB 1/2s、TAIFEX_DL 1/5s、MOPS 1/2s、其餘 1/1s），v2.1 §5.3 較寬鬆之 burst 設計不採用；架構（獨立 limiter + 環境變數）保留
- 重點：jitter 前置是 v1.3 明列之修正，v2.1 範例代碼反而寫錯（sleep-after），實作以「請求前」為準
- 既有 v1.3 熔斷/指數退避（403/429 → 1s→2s→4s 上限 30s、連續 5 失敗暫停 60s）保留
