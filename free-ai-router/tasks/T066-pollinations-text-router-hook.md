---
github_issue:
title: Wire Pollinations /text fallback into router proxy path
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-05
---

# T066 - Wire Pollinations /text fallback into router proxy path

## 目標
將已實作的 Pollinations `/text` adapter（`internal/providers/pollinations.go`）接入 router 代理路徑 `internal/router/routing.go:forward()`，讓 Pollinations 模型在無 API key 時自動 fallback 到無需認證的 `/text/{prompt}` 端點。

## 背景
T063 的 adapter 層已完成：
- `ConvertOpenAIToPollinations()` — OpenAI request body → text prompt
- `WrapPollinationsResponse()` — 純文字回應 → OpenAI-compatible JSON
- `BuildPollinationsTextURL()` — 建構 `/text/{prompt}?model=...` URL
- `PingPollinationsText()` — ping `/text` 端點驗證可用性
- `internal/ping/engine.go` 中 `pingPollinationsText()` 已 hook 進 ping 路徑 ✅

但 `router.forward()` 尚未使用這些 adapter。目前 Pollinations 模型在 ping 時會顯示 "up"（透過 /text 端點），但實際路由請求仍走 `/v1/chat/completions`（需要 API key，會 401）。

## 驗收標準
- [x] 在 `router.forward()` 中判斷：若 `m.Provider == "pollinations"` 且 `m.APIKey == ""`，走 Pollinations /text 路徑
- [x] 使用 `providers.ConvertOpenAIToPollinations()` 將 OpenAI 請求轉換為 text prompt
- [x] 使用 `providers.BuildPollinationsTextURL()` 建構目標 URL
- [x] 發送 GET 請求到 `/text/{prompt}?model=...`
- [x] 使用 `providers.WrapPollinationsResponse()` 將純文字回應包裝為 OpenAI-compatible JSON
- [x] 處理 streaming：/text 端點不支援 streaming — 若請求為 streaming，回應一個 chunk 後結束
- [x] 維持現有的 failover 邏輯（/text 端點 5xx 時仍觸發 failover）
- [x] `go build ./...` 通過
- [x] `go vet ./...` 零警告
- [x] `go test ./...` 全部通過
- [x] 手動測試：無 NVIDIA API key 的情況下 `freemodel start` → 請求 `pollinations/openai` 模型成功回應

## 技術細節

### Router 修改點：`internal/router/routing.go`

`forward()` 需要在建立 upstream 請求之前加入分支：

```go
// Pollinations /text fallback when no API key
if m.Provider == "pollinations" && m.APIKey == "" {
    return r.forwardPollinationsText(w, req, m, body, start)
}
```

新增 `forwardPollinationsText()` 方法：
1. `ConvertOpenAIToPollinations(body, m.ID)` 取得 prompt
2. `BuildPollinationsTextURL(prompt, m.ID)` 建構 URL
3. `http.Get(url)` 發送請求
4. 讀取回應 body（純文字）
5. `WrapPollinationsResponse(text)` 包裝為 OpenAI JSON
6. 設定 `Content-Type: application/json` header
7. `w.Write(wrappedJSON)`
8. 回傳 `(true, 200, wrappedJSON, ttfb, nil)`

### Streaming 處理
Pollinations /text 端點不支援 SSE streaming。當 `isStreamRequest(body)` 為 true：
- 仍發送 /text 請求（同步等待完整回應）
- 將回應包裝為單一 SSE chunk 格式：
  ```
  data: {"choices":[{"delta":{"role":"assistant","content":"..."},"finish_reason":"stop"}]}

  data: [DONE]

  ```
- 或更簡單：直接忽略 streaming 要求，回傳完整回應（多數 client 可接受）

## 備註
- 這是 T063 的完成部分，adapter 層 100% 已就緒，只需要 router hook
- Pollinations 是唯一真正零 API key 的免費模型來源 — 這是關鍵差異化功能
- /text 端點有限制：無 system prompt、無 tool calling、無 streaming — 但對基本 chat 足夠
- 可考慮在 router logging 中標記 "via pollinations/text" 以便區分路徑
