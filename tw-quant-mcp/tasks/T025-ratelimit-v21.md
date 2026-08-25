---
github_issue: N/A
title: Per-Source Token Bucket 限流與可調參數（v2.1 §5.3）
type: refactor
priority: medium
status: done
assignee: pi with opencode/x-preview-f-free
created: 2026-08-01
updated: 2026-08-02
depends_on: []
---

# T025 - Per-Source Token Bucket 限流與可調參數（v2.1 §5.3）

## 目標
將既有 `pkg/provider/ratelimit.go`（每主機固定間隔 + jitter）升級為 v2.1 §5.3 之 per-source token bucket 設計（每個來源獨立 limiter、burst>1 可調），**但限流數值完全採用 v1.3 §4.4 保守值**（已與使用者確認 2026-08-01，避免 Ban IP 風險），並將關鍵參數暴露為環境變數（RATE_LIMIT_ENABLED / RATE_LIMIT_BULK_CONCURRENCY / MIS_JITTER_MIN_MS / MIS_JITTER_MAX_MS）。修正 v2.1 §8.2 範例之 jitter 位置錯誤（sleep 置於請求前）。

> **限流數值決策（已與使用者確認 2026-08-01）：完全採 v1.3 §4.4 保守值**。v2.1 §5.3 僅取其「per-source token bucket」架構與環境變數可調設計，數值表以 v1.3 為準（見下方表格）。

## 驗收標準
- [x] 七個來源各自獨立 `rate.Limiter`（token bucket，數值採 v1.3 §4.4 保守值）：
  - TWSE_OPENAPI：1 req / 1s ✓
  - TWSE_WEB_API：1 req / 2s ✓
  - TWSE_MIS：1 req / 8s（±1s jitter，burst 1）✓
  - TPEX_OPENAPI：1 req / 1s ✓
  - MOPS：1 req / 2s ✓
  - TAIFEX_OPENAPI：1 req / 1s ✓
  - TAIFEX_DOWNLOAD：1 req / 5s ✓
  - 數值可經環境變數覆寫（RATE_LIMIT_*）✓（既有 `RATE_LIMIT_<HOST>_EVERY`，新增測試）
- [x] 既有 jitter（±20% / MIS ±1s）保留並疊加於 token bucket；MIS jitter 區間可調（MIS_JITTER_MIN_MS=7000 / MIS_JITTER_MAX_MS=9000）✓（MIS 於 §4.4 預設節奏下以 [7s,9s] 絕對區間為採樣節奏，token bucket 不另疊加——見下方「決策紀錄」）
- [x] RATE_LIMIT_ENABLED（預設 true）、RATE_LIMIT_BULK_CONCURRENCY（預設 8）併入 pkg/config ✓
- [x] **Jitter 一律置於請求發出之前**（修正 v2.1 範例 sleep-after 之錯誤；與 v1.3 §4.4 一致），新增測試驗證請求時序 ✓（TestJitterBeforeRequest：jitter → request 順序）
- [x] 既有熔斷/指數退避（v1.3 §4.4：403/429 → 1s→2s→4s 上限 30s、連續 5 失敗暫停 60s）保留並與 token bucket 共存 ✓（client.go Do 管線不變）
- [x] 契約/單元測試：每來源限流參數、burst 行為、jitter 前置、環境變數覆寫 ✓

## 實作摘要（2026-08-02）
- ratelimit.go：per-source token bucket 化——七個來源常數（TWSE_OPENAPI/TWSE_WEB_API/TWSE_MIS/TPEX_OPENAPI/MOPS/TAIFEX_OPENAPI/TAIFEX_DOWNLOAD）+ host→source 1:1 對映；數值表改以來源為鍵（v1.3 §4.4 保守值，burst 恆 1）；RATE_LIMIT_ENABLED=false 時以 rate.Inf 停用（含略過 jitter）
- 一般來源：token bucket + interval×ratio 之 ±20% jitter（MIS 節奏被覆寫時同此路徑，±12.5%）
- MIS jitter：MIS_JITTER_MIN_MS/MAX_MS（預設 7000/9000），以 WithRateInterval 覆寫節奏時退回比例 jitter，既有測試零改動
- jitter 位置：維持 Wait() 內、請求發出前（v1.2/v1.3 修正，v2.1 §8.2 範例之 sleep-after 不採）
- config.go：RATE_LIMIT_ENABLED（default true）/ RATE_LIMIT_BULK_CONCURRENCY（default 8，§10.2 篩選類併發備用）+ Validate（bulk ≥ 1）+ 環境變數表格 doc；provider 直接讀同一 RATE_LIMIT_ENABLED 變數（雙源同鍵，註解標明）
- 測試：TestPerSourceRateLimits（7 來源參數+burst=1）、TestMISJitterWindowRange/EnvOverride/IntervalOverridden、TestMISWaitUsesWindowAsCadence、TestRateLimitDisabled/IntervalEnvOverride、TestJitterBeforeRequest（16 輪取樣驗證 jitter→request 順序）、config 預設/覆寫/非法值

## 決策紀錄（2026-08-02，使用者確認「改」）
**MIS jitter 取捨之最終決策（初版為「疊加」）**：初版將 [7,9]s 絕對 jitter「疊加」於 8s token bucket（有效節奏 ≈ 15–17s/次，≈4 次/分），後依使用者決策改為 **jitter 區間即 MIS 採樣節奏**（[7,9]s/次，≈7.5 次/分，QPS≈0.12）。理由：
- §8.1 以「每 8 秒 ±1 秒」為採樣契約，RingBuffer 2025 = 4.5h×7.5次/分，疊加版會砍半盤中 K 線解析度（隱性功能退化）
- v1.3 §4.4 已確認數值即「1 req / 8s ±1s」（[7,9]s 總間隔）；疊加版實質偏離確認值
- §5.3 的「另有 jitter 疊加」採「token bucket 作結構性防暴走守門、不另疊加等候」之較寬鬆解讀，仍保留 per-source burst=1 設計

實作：MIS 於 §4.4 預設節奏下，Wait() 直接以 MIS_JITTER 區間為等待（略過 `limiter.Wait` 之額外等候）；節奏被 `WithRateInterval`/環境變數覆寫時維持 token bucket + 比例 jitter 路徑。

## 備註
- 前置：無（ratelimit.go 既有）
- 已確認：數值完全採 v1.3 §4.4（TWSE_WEB 1/2s、TAIFEX_DL 1/5s、MOPS 1/2s、其餘 1/1s），v2.1 §5.3 較寬鬆之 burst 設計不採用；架構（獨立 limiter + 環境變數）保留
- 重點：jitter 前置是 v1.3 明列之修正，v2.1 範例代碼反而寫錯（sleep-after），實作以「請求前」為準
- 既有 v1.3 熔斷/指數退避（403/429 → 1s→2s→4s 上限 30s、連續 5 失敗暫停 60s）保留

## 執行紀錄（2026-08-25 稽核）
- 驗收條目全數已有勾選；本次稽核以全域門檻複核：`go vet ./...` 通過、`go test ./...` 16 套件全綠（含契約測試/Envelope 一致性/快取一致性/壓力腳本存在性）。
- 本任務產出之模組為現行 155 註冊工具之作用中路徑（非死代碼），接線由 `cmd/mcp-server` 入口經 `App` 組裝達成；真實程序煙霧測試見 snapshots/raw/。
