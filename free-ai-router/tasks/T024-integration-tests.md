---
github_issue:
title: Integration Tests
type: pending
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-03
---

# T024 - Integration Tests

## 目標
Implement all integration test files per spec §13.2. Tests use `httptest` mocks and temp directories to verify TUI rendering, proxy failover behavior, provider discovery, and target agent config writing.

## 驗收標準
- [ ] `tui_render_test.go`: Mock terminal captures ANSI output, verifies table layout and column formatting (§6.4)
- [ ] `router_proxy_test.go`: `httptest` mock upstream returns 200/429/500; verify failover cycles to next-best model within 200ms (§7.4)
- [ ] `discovery_test.go`: Mock `/v1/models` endpoint; verify discovered models merge with static catalog, static entries take precedence (§3.3)
- [ ] `target_handoff_test.go`: Write config to temp dir; verify OpenCode JSON, OpenClaw JSON, Hermes YAML, Pi JSON output formats match spec §11 exactly
- [ ] All integration tests pass via `go test ./internal/... -run Integration`

## 備註
- Integration tests may require longer timeouts due to network mocking (§5.2)
- Use temp directories for file-based operations to avoid polluting user config
