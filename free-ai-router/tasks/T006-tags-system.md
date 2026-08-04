---
github_issue:
title: Tags System
type: pending
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-04
---

# T006 - Tags System

## 目標
Implement `internal/tags/` (or `internal/models/tags.go`) per spec §4.1-4.2. Handles the tag vocabulary, built-in capability tags from `data/model-tags.json`, user-defined tags, and the coding-only filter logic.

## 驗收標準
- [x] Tag vocabulary: `["coding", "reasoning", "general", "fast", "agentic"]` (§4.1)
- [x] Load built-in tags from `data/model-tags.json` (canonical model ID → tag list)
- [x] User-defined tags via config `modelTags` field and TUI/API (`PUT /api/models/tags`)
- [x] Tag normalization (dedup, case handling)
- [x] `getModelTags`, `setModelTags` functions
- [x] Coding-only filter: by default only models tagged `coding` are eligible for routing (§4.2)
- [x] Filter configuration: TUI `C` key toggle, `--all-models` CLI flag, config `codingOnly: true`
- [x] Models without `coding` tag appear dimmed in TUI
- [x] `tags_test.go` with tag normalization, getModelTags, setModelTags

## 備註
- Coding-only is the default routing behavior (Requirement #8)
- Dimmed display for non-coding models in coding-only mode (§4.2)
