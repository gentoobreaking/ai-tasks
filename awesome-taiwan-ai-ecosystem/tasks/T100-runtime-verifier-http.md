---
github_issue: N/A
title: Runtime Verifier 補 SSE / streamable_http 傳輸握手（P1-1 阻塞項）
type: feature
priority: high
status: pending
assignee: pi with opencode
created: 2026-09-07
depends_on: [T097]
updated: 2026-09-07
---

# T100 - Runtime Verifier 補 SSE / streamable_http 傳輸握手

## 目標

實作 `internal/engines/runtime_verifier.go` 的 `verifySSE` 與 `verifyStreamableHTTP`，讓 MCP server 能透過 HTTP-based transport 被驗證。

目前這兩個函式（`runtime_verifier.go:512-538`）只塞 evidence 後直接回 `RuntimeVerificationStatusError`，造成所有 HTTP-based MCP server 永遠停在 `MCP_STATIC_VERIFIED`，無法升級為 `MCP_RUNTIME_VERIFIED`。

阻塞：
- spec §26 外部 MCP endpoint verification（須實際做 initialize handshake）
- spec §64 DoD #14「Runtime MCP handshake is supported」
- 任何有遠端 endpoint 的 MCP server 都會被誤判

## 現況根因

`runtime_verifier.go:512-538` 兩處都長這樣：

```go
func (rv *RuntimeVerifier) verifySSE(ctx context.Context, entity *models.Entity, ep *models.EndpointWithType, result *RuntimeVerificationResult) *RuntimeVerificationResult {
    result.Evidence = append(result.Evidence, models.Evidence{
        Type:         "transport_not_implemented",
        Source:       "runtime_verifier",
        Location:     "sse_transport",
        Rule:         "sse_not_implemented",
        MatchedText:  "SSE transport verification not yet implemented",
        Confidence:   1.0,
        Timestamp:    models.RFC3339Time(time.Now().UTC()),
    })
    result.Status = RuntimeVerificationStatusError
    return result
}
```

`verifyStdio` 已完整（spawn process → pipe JSON-RPC → 收 initialize + tools/list）。SSE/streamable 改打 HTTP，需要新邏輯。

## MCP Transport 背景

| Transport | Endpoint 行為 | 握手流程 |
|---|---|---|
| `stdio` | spawn subprocess，stdin/stdout 交換 JSON-RPC line-delimited | 已實作 |
| `streamable-http` | POST JSON-RPC 到 endpoint URL，回 JSON | 待實作 |
| `sse` | GET 開啟 SSE 串流，POST JSON-RPC 到同 URL 或專用 message endpoint | 待實作 |

兩個 HTTP transport 共用同一個 JSON-RPC payload，差在 response 解析：
- **streamable-http**：server 回單一 JSON body（Content-Type: `application/json`）
- **SSE**：server 回 SSE stream（Content-Type: `text/event-stream`），要從 stream 裡撈 `data:` 開頭的 JSON-RPC response

## 修法

### A. 抽出共用 helper：`sendHTTPRequest`

參考 `sendStdioRequest`（`runtime_verifier.go:394`）的介面，但走 HTTP。新增：

```go
// sendHTTPRequest POSTs a JSON-RPC payload to the given URL and returns
// the parsed response. For SSE endpoints the function reads the event
// stream and waits for the matching id. For streamable-http endpoints
// it reads the JSON body directly.
func (rv *RuntimeVerifier) sendHTTPRequest(
    ctx context.Context,
    url string,
    id int,
    method string,
    params interface{},
    transport MCPTransport,
    timeout time.Duration,
) (interface{}, error) {
    startTime := time.Now()

    req := jsonRPCRequest{
        JSONRPC: "2.0",
        ID:      id,
        Method:  method,
        Params:  params,
    }
    body, err := json.Marshal(req)
    if err != nil {
        return nil, fmt.Errorf("marshal request: %v", err)
    }

    httpClient := &http.Client{Timeout: timeout}
    httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
    if err != nil {
        return nil, fmt.Errorf("new request: %v", err)
    }
    httpReq.Header.Set("Content-Type", "application/json")
    httpReq.Header.Set("Accept", "application/json, text/event-stream")

    resp, err := httpClient.Do(httpReq)
    if err != nil {
        return nil, fmt.Errorf("http do: %v", err)
    }
    defer resp.Body.Close()

    latency := int(time.Since(startTime).Milliseconds())

    if resp.StatusCode != http.StatusOK {
        return &InitializeResult{
            Success:   false,
            Error:     fmt.Sprintf("HTTP %d", resp.StatusCode),
            LatencyMs: latency,
        }, nil
    }

    var rawResp []byte
    if transport == TransportSSE {
        rawResp, err = readSSEResponse(resp.Body, id)
    } else {
        rawResp, err = io.ReadAll(resp.Body)
    }
    if err != nil {
        return &InitializeResult{
            Success:   false,
            Error:     err.Error(),
            LatencyMs: latency,
        }, nil
    }

    var jsonResp jsonRPCResponse
    if err := json.Unmarshal(rawResp, &jsonResp); err != nil {
        return &InitializeResult{
            Success:   false,
            Error:     fmt.Sprintf("unmarshal response: %v", err),
            LatencyMs: latency,
        }, nil
    }

    if jsonResp.Error != nil {
        return &InitializeResult{
            Success:   false,
            Error:     fmt.Sprintf("MCP error: %s", jsonResp.Error.Message),
            LatencyMs: latency,
        }, nil
    }

    return &jsonResp, nil
}

// readSSEResponse reads an SSE event stream and returns the JSON-RPC
// response body for the given request id.
func readSSEResponse(body io.Reader, id int) ([]byte, error) {
    scanner := bufio.NewScanner(body)
    for scanner.Scan() {
        line := scanner.Text()
        if !strings.HasPrefix(line, "data:") {
            continue
        }
        payload := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
        if payload == "" || payload == "[DONE]" {
            continue
        }
        var probe jsonRPCResponse
        if err := json.Unmarshal([]byte(payload), &probe); err != nil {
            continue
        }
        if probe.ID == id {
            return []byte(payload), nil
        }
    }
    if err := scanner.Err(); err != nil {
        return nil, fmt.Errorf("sse scanner: %w", err)
    }
    return nil, fmt.Errorf("sse: no response with id %d", id)
}
```

### B. 改寫 `verifySSE` / `verifyStreamableHTTP`

兩個函式幾乎一樣，唯一差別是 transport enum 與 SSE 解析。為了 DRY，加 `verifyHTTP` 共用：

```go
// verifyHTTP runs the MCP initialize + tools/list handshake over HTTP.
func (rv *RuntimeVerifier) verifyHTTP(ctx context.Context, ep *models.EndpointWithType, result *RuntimeVerificationResult, transport MCPTransport) *RuntimeVerificationResult {
    url := ep.URL
    if url == "" {
        result.Status = RuntimeVerificationStatusFailed
        result.Evidence = append(result.Evidence, models.Evidence{
            Type: "missing_endpoint", Source: "runtime_verifier",
            Location: "http_transport", Rule: "missing_url",
            MatchedText: "No endpoint URL for HTTP transport",
            Confidence: 1.0, Timestamp: models.RFC3339Time(time.Now().UTC()),
        })
        return result
    }

    // Stage 1: initialize
    initRaw, err := rv.sendHTTPRequest(ctx, url, 1, "initialize", initializeParams{
        ProtocolVersion: "2024-11-05",
        Capabilities:    map[string]bool{},
        ClientInfo:      clientInfo{Name: "taiwan-mcp-crawler", Version: "1.0.0"},
    }, transport, rv.InitializeTimeout)
    if err != nil {
        result.Status = RuntimeVerificationStatusError
        result.Evidence = append(result.Evidence, models.Evidence{
            Type: "initialize_error", Source: "runtime_verifier",
            Location: "http_initialize", Rule: "request_failed",
            MatchedText: err.Error(),
            Confidence: 1.0, Timestamp: models.RFC3339Time(time.Now().UTC()),
        })
        return result
    }
    jsonResp, ok := initRaw.(*jsonRPCResponse)
    if !ok {
        ir := initRaw.(*InitializeResult)
        result.InitializeResult = ir
        result.Status = RuntimeVerificationStatusFailed
        return result
    }
    var initParsed initializeResult
    if err := json.Unmarshal(jsonResp.Result, &initParsed); err != nil {
        result.Status = RuntimeVerificationStatusFailed
        result.Evidence = append(result.Evidence, models.Evidence{
            Type: "initialize_error", Source: "runtime_verifier",
            Location: "http_initialize", Rule: "unmarshal_failed",
            MatchedText: err.Error(),
            Confidence: 1.0, Timestamp: models.RFC3339Time(time.Now().UTC()),
        })
        return result
    }
    result.InitializeResult = &InitializeResult{
        Success:       true,
        LatencyMs:     0, // 由呼叫端計算
        ServerInfo:    initParsed.ServerInfo.Name + "@" + initParsed.ServerInfo.Version,
        ProtocolVer:   initParsed.ProtocolVersion,
    }

    // Stage 2: tools/list
    toolsRaw, err := rv.sendHTTPRequest(ctx, url, 2, "tools/list", nil, transport, rv.ToolsListTimeout)
    if err != nil {
        result.Status = RuntimeVerificationStatusError
        result.Evidence = append(result.Evidence, models.Evidence{
            Type: "tools_list_error", Source: "runtime_verifier",
            Location: "http_tools_list", Rule: "request_failed",
            MatchedText: err.Error(),
            Confidence: 1.0, Timestamp: models.RFC3339Time(time.Now().UTC()),
        })
        return result
    }
    toolsResp, ok := toolsRaw.(*jsonRPCResponse)
    if !ok {
        tlr := toolsRaw.(*ToolsListResult)
        result.ToolsListResult = tlr
        if !tlr.Success {
            result.Status = RuntimeVerificationStatusFailed
        }
        return result
    }
    var toolsParsed toolsListResult
    if err := json.Unmarshal(toolsResp.Result, &toolsParsed); err != nil {
        result.Status = RuntimeVerificationStatusFailed
        result.Evidence = append(result.Evidence, models.Evidence{
            Type: "tools_list_error", Source: "runtime_verifier",
            Location: "http_tools_list", Rule: "unmarshal_failed",
            MatchedText: err.Error(),
            Confidence: 1.0, Timestamp: models.RFC3339Time(time.Now().UTC()),
        })
        return result
    }
    result.ToolsListResult = &ToolsListResult{
        Success:      true,
        ToolCount:    len(toolsParsed.Tools),
        ToolsSummary: rv.summarizeTools(toolsParsed.Tools),
    }

    result.Status = RuntimeVerificationStatusPassed
    return result
}

func (rv *RuntimeVerifier) verifySSE(ctx context.Context, entity *models.Entity, ep *models.EndpointWithType, result *RuntimeVerificationResult) *RuntimeVerificationResult {
    return rv.verifyHTTP(ctx, ep, result, TransportSSE)
}

func (rv *RuntimeVerifier) verifyStreamableHTTP(ctx context.Context, entity *models.Entity, ep *models.EndpointWithType, result *RuntimeVerificationResult) *RuntimeVerificationResult {
    return rv.verifyHTTP(ctx, ep, result, TransportStreamableHTTP)
}
```

### C. 新增 imports

在檔頭補：

```go
import (
    ...
    "bytes"
    "net/http"
)
```

（`bufio`、`io`、`strings`、`time`、`encoding/json`、`context` 已有）

## 驗收標準

- [ ] `runtime_verifier.go` 加入 `sendHTTPRequest`、`readSSEResponse`、`verifyHTTP` 三個函式
- [ ] `verifySSE` / `verifyStreamableHTTP` 改為委派給 `verifyHTTP`
- [ ] 新增 imports：`bytes`、`net/http`
- [ ] `go build ./...` 通過
- [ ] `go test ./internal/engines/... -v -count=1` 通過（含既有 `runtime_verifier_test.go` 14 個測試）
- [ ] 新增測試（見下）至少 6 個 case 通過
- [ ] 對 `https://api.mcp-servers.dev/servers` 這類假 endpoint 跑 verifier，回 `RuntimeVerificationStatusFailed` 或 `Error`（不是 `Error` 帶 `transport_not_implemented`）
- [ ] 對真正在跑的 streamable_http MCP server（譬如 Anthropic 公開 demo）能拿到 `RuntimeVerificationStatusPassed`

### 新增 unit tests

`internal/engines/runtime_verifier_http_test.go`（新檔）：

| 測試 case | 預期 |
|---|---|
| streamable_http + HTTP 200 + 合法 initialize 回應 | `Status: Passed` |
| streamable_http + HTTP 200 + 合法 initialize + 合法 tools/list | `Status: Passed`，`ToolCount > 0` |
| streamable_http + HTTP 500 | `Status: Failed`，evidence 含 `HTTP 500` |
| streamable_http + HTTP 200 + 非法 JSON | `Status: Failed`，evidence 含 `unmarshal` |
| SSE + HTTP 200 + 合法 event-stream 包含 `data: {...id:1...}` | `Status: Passed` |
| SSE + HTTP 200 + event-stream 不含對應 id | `Status: Failed`，evidence 含 `no response with id` |
| empty URL | `Status: Failed`，evidence 含 `missing_url` |
| ctx cancelled 中途 | `Status: Error`，evidence 含 `context canceled` |

可用 `httptest.NewServer` mock 各種情境。

## 執行紀錄

_(待執行後填寫)_

## 備註

- 依賴 T097（差距分析）—本任務是 T097 P1-1 阻塞項
- 對應 spec §26「External MCP Endpoint Verification」、spec §64 DoD #14
- 風險：實作正確性依賴對 MCP spec 2024-11-05 SSE/streamable_http transport 的理解。若 server 端用非標準實作，可能誤判。**降級策略**：失敗時不假裝成功，直接 `Failed` + evidence，與既有 stdio 風格一致
- 跨 transport 共用 `verifyHTTP` 簡化後續維護（譬如未來若新增 transport 只要傳 enum）
- 既有 `runtime_verifier_test.go:394, 429` 兩個 `Status != RuntimeVerificationStatusError` 的 assertion 在 T100 後要重看（原本預期 SSE/streamable 都回 Error，現在可能變 Passed）
- 完成 T098 + T099 + T100 = spec §60 list + §64 DoD #14 達成
- 相關任務：T097（差距分析）、T098（persist）、T099（export EntityStore）
