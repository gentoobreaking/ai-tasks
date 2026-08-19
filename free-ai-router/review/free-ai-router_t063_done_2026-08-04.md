# T063 完成記錄 — 2026-08-04 23:36

## 實作內容

T063 的 adapter 層早在專案中就 100% 完成（pollinations.go 的 6 個函數 + pollinations_test.go 的 6 個測試），本階段修復了三個殘留問題：

### 1. Ping engine dedup
`internal/ping/engine.go:pingPollinationsText()` 原本手寫 inline model mapping（`idx := strings.Index(m.ID, "/")`），改為呼叫 `providers.BuildPollinationsTextURL("hi", m.ID)` — 消除 ~15 行重複程式碼 + 移除未使用的 `net/url` import。

### 2. 時間測量 bug fix（涵蓋 T076）
兩處 `time.Since(time.Now())` 改為 `time.Since(start)` — 原先所有 Pollinations 模型的 ping latency 結果為 ~0ms，修復後正確顯示。

### 3. 整合測試
新增 `pollinations_integration_test.go` — 4 個測試：
- `TestPollinationsAdapterComposability` — 完整 pipeline（OpenAI→text→URL→response→JSON）
- `TestPollinationsAdapterAllModels` — PollinationsModelMap 全部 18 個 model mapping 有效
- `TestBuildPollinationsTextURLSpecialChars` — URL encoding edge cases
- `TestConvertOpenAIToPollinationsEdgeCases` — 空 messages / system-only / invalid JSON

## 驗證結果
| 項目 | 結果 |
|------|------|
| go build ./... | ✅ |
| go vet ./... | ✅ 零警告 |
| go test -count=1 ./... | ✅ 8 suites |
| Pollinations 測試 | ✅ 14/14 PASS |

## 注意
Router proxy path 中的 /text fallback hook 仍待 **T066** 實作 — 這是真正的「無 API key 模型可用」功能。
