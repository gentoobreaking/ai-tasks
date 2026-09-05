---
github_issue: N/A
title: JSON Schema — mcp-server.json, registry.json schema 驗證
assignee: pi with opencode
type: feat
priority: high
status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T003 - JSON Schema — mcp-server.json, registry.json schema 驗證

## 目標

建立 JSON Schema 文件並驗證機制。對應 CRAWLER_AGENT_TASKS.md §5 TASK-003，
§34 Registry Schema, §6.5 CRAWLER_IMPLEMENTATION_PLAN，§TST-004 Schema Validation。

## 驗收標準

- [x] `schema/mcp-server.json` 存在，定義 MCPServer schema 包含: schema_version, required fields (id, name, slug, description), taiwan_relevance (level T0-T5, score, confidence, evidence), repository (url, stars, license), endpoints, capabilities, data_sources, quality (score 0-100, grade A-F), health, status (ACTIVE/MAINTENANCE/STALE/DORMANT/ARCHIVED/DELETED/UNKNOWN), first_seen_at, last_seen_at, last_verified_at
- [x] `schema/registry.json` 存在，定義 registry wrapper: schema_version, generated_at, servers array
- [x] Schema 包含 enum validation: taiwan_relevance.level ∈ {T0,T1,T2,T3,T4,T5}, status ∈ {ACTIVE,MAINTENANCE,STALE,DORMANT,ARCHIVED,DELETED,UNKNOWN}, health ∈ {HEALTHY,DEGRADED,UNAVAILABLE,INVALID,UNKNOWN}, grade ∈ {A,B,C,D,F}
- [x] Schema 包含 nested objects (classification, repository, endpoints, capabilities, data_sources, runtime, security, health, quality, sources, evidence)
- [x] `tests/fixtures/schema/valid.json` 建立並 PASS schema validation
- [x] `tests/fixtures/schema/invalid.json` 建立並 FAIL schema validation
- [x] `tests/fixtures/schema/missing-required.json` 建立並 FAIL schema validation
- [x] `tests/fixtures/schema/invalid-enum.json` 建立並 FAIL schema validation
- [x] schema validation 測試: valid → ACCEPT, invalid → REJECT, missing-required → REJECT, invalid-enum → REJECT (100% match, §TST-004)

## 備註

- Schema version: "0.1" (§23 Registry Compatibility)
- Category validation: must come from controlled vocabulary (§TST-041)
- Quality score range: 0-100 (§TST-042)

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
