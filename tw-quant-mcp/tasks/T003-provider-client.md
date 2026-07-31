---
github_issue: N/A
title: Resilient HTTP Client、Rate Limiter 與 Circuit Breaker
type: infrastructure
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T003 - Resilient HTTP Client 與 Rate Limit 防護

## 目標
實作 `pkg/provider` 之底層：`SourceContract` 介面（§2.2）、每主機 Rate Limiter（§4.4）、Jitter（置於請求**前**）、指數退避、熔斷、Session Cookie 維持與連線池（§12.3）。

## 驗收標準
- [x] `SourceContract` 介面（ID / Fetch / Validate / Normalize）並提供基類 `BaseClient`
- [x] 每主機獨立 `time/rate` Limiter，預設值對應 §4.4 表格（MIS 1/8s、TWSE-WEB 1/2s、TWSE-API 1/1s、TPEx 1/1s、MOPS 1/2s、TAIFEX-API 1/1s、TAIFEX-DL 1/5s），可用環境變數覆寫
- [x] Jitter（±20%）於請求**發送前**執行（v1.2 已知錯誤：sleep 於請求後，需避免復發）
- [x] 403/429 → 指數退避（1s→2s→4s→…上限 30s）；連續 5 次失敗 → 熔斷 60s
- [x] Cookie Session 維持（cookiejar）與自訂 User-Agent
- [x] 連線池：per-host Transport（Keep-Alive、MaxIdleConnsPerHost=8、gzip）
- [x] 單元測試（用 `httptest` mock server）：Rate Limit 間隔、退避次數、熔斷開合、Jitter 時序（驗證請求發出時間 ≥ 前次 + jitter）

## 實作記錄（2026-07-31）

### 產出（`pkg/provider`，4 實作檔 + 3 測試檔）
| 檔案 | 內容 |
|---|---|
| `source.go` | `SourceContract`（§2.2：ID / Fetch / Validate / Normalize）+ `RawRequest` / `RawResponse`（含 `BodyHash`=sha256(raw body)，§3.1 raw capture） |
| `ratelimit.go` | `HostLimiter`：`x/time/rate` 每主機獨立 + 請求**前** Jitter（MIS 12.5% ±1s/8s、其餘 20%，可 `WithJitterRatio` 覆寫）；§4.4 表格 `defaultRateInterval` 唯一真值；env 覆寫鍵 `RATE_LIMIT_<HOST_SLUG>_EVERY`（秒，可小數）；未登錄主機 fallback 1s |
| `breaker.go` | `CircuitBreaker`：連續 5 次失敗 → 開啟 60s → 自動恢復；`Allow`/`Record`，可注入時鐘 |
| `client.go` | `BaseClient`：熔斷 → Rate+Jitter → HTTP → 403/429 指數退避（1→2→4→8→16→30→30…上限 30s、預設 8 次）→ 熔斷記錄；每主機獨立 Transport（Keep-Alive 30s、MaxIdleConnsPerHost=8、HTTP/2、gzip 自動解壓）；cookiejar Session 維持；瀏覽器樣式 UA 可覆寫；`WithTimeout`（TAIFEX-DL 可 60s）等選項 |

### 設計決策與測試發現
1. **Jitter 時序**：`Wait()` = limiter 取得權杖（保證 ≥ interval）後、請求發出前追加 ±ratio 隨機等待；負值略過。最小間隔保證 = interval × (1 − jitterRatio)。
2. **gzip 陷阱**：手動設 `Accept-Encoding: gzip` 會使 Go Transport 停用自動解壓縮（測試抓到），改由 Transport 自動處理。
3. **測試時序陷阱**：rate.Limiter 首個請求持有初始權杖可立即發出，間隔測試須自第 2 個間隔起量測（初次實作誤判為限流失效）。
4. **測試隔離**：breaker/退避測試注入 `sleep`（記錄退避時序）與 `nowFn`（快轉 60s），全測試於 ~1.3s 內完成。
5. **golang.org/x/time 提升為直接依賴**（provider 正式引用）；`go get` 不會重新標記 require 區塊，以手動編輯 go.mod 移至 direct block（未執行 `go mod tidy`，避免移除 T001 預留之 ristretto/sqlite/x-sync）。
6. 未登錄主機（如測試用 "test.host"）間隔 fallback 1s。

### 驗證結果（全數通過）
- `go build ./...`、`go vet ./...`、`go test ./...`、`make lint` — OK
- `pkg/provider` 覆蓋率 90.2%；T001/T002 測試不受影響
- httptest 測試涵蓋：Get OK（BodyHash/FetchedAt/SourceURL）、UA 注入、gzip 自動解壓、Cookie 往返、Rate Limit 間隔（≥ 0.8×interval）、429/403 退避重試、退避序列 [1,2,4,8,16,30,30] 與 30s cap、502 → *HTTPStatusError、熔斷 5 次開啟 / 60s 恢復 / 成功重置計數、client timeout、§4.4 全主機預設值、env 覆寫（含非法值 fallback）、Jitter 數值範圍、SourceContract 冒煙

### 後續任務銜接
- T004：`pkg/cache` 引用 `golang.org/x/sync/singleflight`
- T006：MIS Worker 以 `BaseClient` + `HostLimiter`（8s±1s）為採樣引擎，`cookiejar` 承接 index.jsp Session 預熱
- T013：TAIFEX-DL 以 `WithTimeout(60s)` 承接大 CSV 下載

## 備註
- Rate Limit 參數是防 IP 封鎖之第一道防線，任何新來源加入必須更新 §4.4 表格後再實作
- TAIFEX-DL 為大 CSV 下載，額外要求單請求 timeout 較長（可 60s）
