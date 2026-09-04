---
github_issue: N/A
title: JSON Schema — mcp-server.json, registry.json schema 驗證
type: feat
priority: high
status: pending
depends_on: [T002]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T003 - JSON Schema — mcp-server.json, registry.json schema 驗證

## 目標

建立 JSON Schema 文件並驗證機制。對應 CRAWLER_AGENT_TASKS.md §5 TASK-003，
§34 Registry Schema, §6.5 CRAWLER_IMPLEMENTATION_PLAN，§TST-004 Schema Validation。

## 驗收標準

- [ ] `schema/mcp-server.json` 存在，定義 MCPServer schema 包含: schema_version, required fields (id, name, slug, description), taiwan_relevance (level T0-T5, score, confidence, evidence), repository (url, stars, license), endpoints, capabilities, data_sources, quality (score 0-100, grade A-F), health, status (ACTIVE/MAINTENANCE/STALE/DORMANT/ARCHIVED/DELETED/UNKNOWN), first_seen_at, last_seen_at, last_verified_at
- [ ] `schema/registry.json` 存在，定義 registry wrapper: schema_version, generated_at, servers array
- [ ] Schema 包含 enum validation: taiwan_relevance.level ∈ {T0,T1,T2,T3,T4,T5}, status ∈ {ACTIVE,MAINTENANCE,STALE,DORMANT,ARCHIVED,DELETED,UNKNOWN}, health ∈ {HEALTHY,DEGRADED,UNAVAILABLE,INVALID,UNKNOWN}, grade ∈ {A,B,C,D,F}
- [ ] Schema 包含 nested objects (classification, repository, endpoints, capabilities, data_sources, runtime, security, health, quality, sources, evidence)
- [ ] `tests/fixtures/schema/valid.json` 建立並 PASS schema validation
- [ ] `tests/fixtures/schema/invalid.json` 建立並 FAIL schema validation
- [ ] `tests/fixtures/schema/missing-required.json` 建立並 FAIL schema validation
- [ ] `tests/fixtures/schema/invalid-enum.json` 建立並 FAIL schema validation
- [ ] schema validation 測試: valid → ACCEPT, invalid → REJECT, missing-required → REJECT, invalid-enum → REJECT (100% match, §TST-004)

## 備註

- Schema version: "0.1" (§23 Registry Compatibility)
- Category validation: must come from controlled vocabulary (§TST-041)
- Quality score range: 0-100 (§TST-042)
