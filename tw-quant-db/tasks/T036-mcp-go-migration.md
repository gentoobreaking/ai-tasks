---
id: T036
project: tw-quant-db
title: Migrate all 4 MCP sources to mcp-go client
assignee: "pi"
priority: high
type: 
status: 
depends_on: 
github_issue: 
created: 2026-08-31
updated: 2026-08-31
---

# T036: Migrate all 4 MCP sources to mcp-go client

## Spec Reference
- Spec §13: Use `github.com/mark3labs/mcp-go` as the single MCP client library
- Spec §5.3: retry with backoff 60s/120s/180s on rate_limit/timeout/errors
- Spec §10: no stdout writes during normal operation; sqlite fallback via `TW_QUANT_DB_PATH`

## Status
Done

## Acceptance
- [x] All 4 sources (LocalMCP, TWSEMCP, FinMindMCP, YFinanceMCP) compile with mcp-go client
- [x] HTTP transport for LocalMCPSource + TWSEMCPSource (`NewStreamableHttpClient`)
- [x] Stdio transport for FinMindMCPSource + YFinanceMCPSource (`NewStdioMCPClient` → `uvx`)
- [x] Docker build passes with Python + uvx + tool-installed stage
- [x] docker-compose.yml backfill service has correct env vars + command
- [x] Dry-run output goes to stderr (not stdout), satisfying spec §10
- [x] `go vet && go build && go test -count=1 ./...` pass

## Implementation Notes
- **HTTP transport**: `client.NewStreamableHttpClient(addr, transport.WithHTTPBasicClient(httpClient))`
- **Stdio transport**: `client.NewStdioMCPClient("uvx", env, "finmind-mcp"/"yfinance-mcp")`
- Lazy client init via `MCPClientWrapper.getClient(ctx)` — only connects to source when needed
- `FinMindMCPSource` requires `FINMIND_API_KEY` env var (passed as `FINMIND_TOKEN` to subprocess)
- Tool name verified: `get_daily_prices` (matches spec)
