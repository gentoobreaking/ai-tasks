---
github_issue:
title: Target Picker Integration (OpenCode, OpenClaw, Hermes, Pi)
type: pending
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-04
---

# T017 - Target Picker Integration

## 目標
Implement `internal/targets/{opencode,openclaw,hermes,pi,common}.go` per spec §11 and §6.14. Each target writer generates the correct config file format for its agent, with backup-before-write and fallback behavior.

## 驗收標準
- [x] `internal/targets/opencode.go`: Write `~/.config/opencode/opencode.json` with router provider config pointing to `http://127.0.0.1:7352/v1` (§11.1)
- [x] `internal/targets/openclaw.go`: Write `~/.openclaw/openclaw.json` with freemodel provider (§11.2)
- [x] `internal/targets/hermes.go`: Write `~/.hermes/config.yaml` with provider model config (§11.3)
- [x] `internal/targets/pi.go`: Write `~/.pi/pi.json` with model_list entry (§11.4)
- [x] `internal/targets/common.go`: Shared helpers — backup with timestamped suffix, JSON/YAML merge, env var resolution
- [x] Target picker modal (§6.14): each option shows "Save + Launch" (if binary installed) and "Save config only"
- [x] Fallback behavior:
  - Unknown model → fallback to NVIDIA NIM `deepseek-ai/deepseek-v4-pro` (§11.5)
  - Provider remap (e.g., Stepfun → OpenRouter) (§11.5)
  - Missing key → prompt "Add API key now? (Y/n)" (§11.5)
  - Existing configs backed up with timestamped suffixes (§11.5)
- [x] OpenCode launch env: `OPENCODE_CLI_RUN_MODE=true` (§11.1)
- [x] `target_handoff_test.go`: write config to temp dir, verify JSON/YAML output (§13.2)

## 備註
- `FREMODEL_EXPORT_PLAINTEXT_KEYS=1` allows writing API keys to Hermes/Pi config files (§18)
