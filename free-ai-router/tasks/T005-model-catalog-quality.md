---
github_issue:
title: Model Catalog & Quality Scoring
type: pending
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-04
---

# T005 - Model Catalog & Quality Scoring

## 目標
Implement `internal/models/catalog.go` (model registry, aliasing, canonicalization) and `internal/models/quality.go` (quality scoring, OpenRouter catalog fetch, metadata fallback) per spec §4.3 and §15. Uses the full quality scoring hierarchy.

## 驗收標準
- [x] Model registry with aliasing and canonicalization (§15.4, §22.3)
- [x] Quality scoring hierarchy (priority order):
  1. Artificial Analysis coding index from OpenRouter catalog (`benchmarks.artificial_analysis.coding_index / 100`)
  2. Design Arena Elo → coding score (linear regression)
  3. Metadata heuristic (popularity, recency, features, context length)
  4. `scores.json` offline fallback
  5. Default 0.45
- [x] SWE-bench tier computation (S+ >=70%, S 60-70%, A+ 50-60%, A 40-50%, A- 35-40%, B+ 30-35%, B 20-30%, C <20%) (§4.3)
- [x] `model-aliases.json` for URL-friendly alias resolution
- [x] `models_test.go` with model aliasing, canonicalization, quality score resolution

## 備註
- OpenRouter catalog is fetched at runtime for coding_index and Arena Elo data
- Quality scores are normalized 0-1 from the hierarchy (§7.3)
