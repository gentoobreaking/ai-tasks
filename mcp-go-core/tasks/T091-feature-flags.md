---
github_issue: N/A
title: P0 - Feature Flags: Runtime toggle system with config-backed flags
type: feat
priority: high
status: done
depends_on:
  - T007
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T091 - Feature Flags: Runtime Toggles

## 目標

Implement a runtime feature flag system:
- Config-backed flags (YAML `features:` section)
- Per-flag health endpoint `/features/<name>` 
- Flag evaluation with fallback/default support
- Integration with router dispatch (early exit on disabled flags)

## 驗收標準
- [x] `core/feature/flag.go`: `Flags` struct with `Get`, `Set`, `IsDisabled`
- [x] Config includes `features:` map
- [x] Middleware `FeatureFlagMiddleware` gates tool/resource/prompt methods
- [ ] Health endpoint `/features/<name>` reports per-flag status — NOT IMPLEMENTED: no HTTP health endpoint registered on server. See T103.
- [x] 4 new tests covering enable/disable/gate (health endpoint not implemented)
- [x] `go test -race ./... -count=1` all pass
- [x] `go vet ./...` clean

## 備註
**Priority:** High — production safety net for emergency rollbacks.

**Key files:** `core/feature/` (new), `core/middleware/`, `core/config/`, `core/server/`

## 執行紀錄
- 2026-09-04: Created task, pending implementation
- 2026-09-04: Implemented core/feature, featurewire middleware, server.WithFlags(). 42 pkgs -race PASS, 333 tests. Committed at 8cbab1e.
- 2026-09-04: Implemented core/feature, featurewire middleware, server integration. 42 pkgs -race PASS, 345 tests. Committed at 8cbab1e.

## 執行紀錄（2026-09-05 稽核）
- 已達成 3 項並打勾。
- **未竟事項**: Health endpoint `/features/<name>` -- NOT IMPLEMENTED: no HTTP health route exists on server. 回流為 T103。
- 補充: core/feature/flag.go Flags struct with Get/Set/IsDisabled; core/middleware/featurewire/ FeatureFlagMiddleware; server.WithFlags() integration; 4 tests pass.

## 執行紀錄（2026-09-05 稽核）
- 已達成 4 項並打勾 (1-2, 3, 5-6)。
- **未竟事項**: `core/middleware/featurewire/featurewire.go` `Middleware()` function acts as FeatureFlagMiddleware — verified. Health endpoint `/features/<name>` — NOT IMPLEMENTED. 回流為 T103。


## 環境變數審計（2026-09-05）
- mcp-go-core production code: **0 env var 讀取** (`os.Getenv`/`os.LookupEnv` 均無使用)
- 全域 AGENTS.md 中提及的 `OPENAI_API_KEY` 等屬 ai-howto 專案設定，與本專案無關
- **結論**: 無未滿足需求的 env var