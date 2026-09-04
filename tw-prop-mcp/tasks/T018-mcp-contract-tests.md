---
github_issue: ""
title: MCP Contract Tests
type: task
priority: high
status: done
depends_on:
  - T017
assignee: "pi with opencode"
created: 2026-09-03
updated: 2026-09-04
---

# T018 - MCP Contract Tests

## 目標
建立 MCP Contract Tests，驗證 tool schema、input/output validation、error handling、provenance 完整性。

## 驗收標準
- [ ] 建立 tests/contract/ 目錄結構
- [ ] 測試所有 Tool：tool name, input schema, output schema, error schema, provenance
- [ ] 驗證 search_transactions：input schema stable, output schema stable
- [ ] 驗證 find_comparable_transactions：input schema, output schema (comparables array, algorithm_version)
- [ ] 驗證 estimate_land_value：input schema, output schema (bear/base/bull, confidence, provenance)
- [ ] 驗證 check_road_access：input schema, output schema (status, distance_m, road_width_m, width_source)
- [ ] 驗證所有 error codes 回傳格式正確
- [ ] 驗證所有 response 包含 data_provenance
- [ ] CI/CD 整合 contract tests

## 備註
- Contract tests 確保 MCP interface 穩定性
- 任何 schema 變更必須更新對應 contract test