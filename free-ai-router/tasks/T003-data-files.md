---
github_issue:
title: Data Files (sources.json, scores.json, model-tags.json, model-aliases.json)
type: pending
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-04
---

# T003 - Data Files

## 目標
Create the four static data files in `data/` per spec §15. These are adapted from modelrelay's sources.js, scores.js, tags.js, and MODEL_ID_ALIASES. These provide the provider catalog, offline quality scores, built-in capability tags, and model aliasing.

## 驗收標準
- [x] `data/sources.json`: All 12 providers (nvidia, groq, cerebras, opencode, openai-compatible, ollama, openrouter, codestral, scaleway, kilocode, kiro, googleai) with URL, discoverable flag, and static model lists
- [x] `data/scores.json`: Offline quality scores (0-1) for ~150 models keyed by canonical model ID
- [x] `data/model-tags.json`: Maps canonical model IDs to built-in tags from vocabulary (coding, reasoning, general, fast, agentic)
- [x] `data/model-aliases.json`: Short alias → canonical model ID mapping (e.g., `"kimi-k2.5"` → `"moonshotai/kimi-k2.5"`)
- [x] `data/opencode-fallbacks.json`: OpenCode provider+model remapping rules

## 備註
- The MODELS array is pre-computed at startup as a flat list of [modelId, label, score, context, providerKey] (§15.1)
- Sources structure mirrors modelrelay sources.js exactly (§3.1)
