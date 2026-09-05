---
github_issue: N/A
title: JSON Registry Export — registry.json, registry.min.json, categories, sources, statistics, health
assignee: pi with opencode
type: feat
priority: high
status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T028 - JSON Registry Export — registry.json, registry.min.json, categories, sources, statistics, health

## 目標

建立 `internal/export/` 套件, 產生 registry JSON export 檔案。
對應 CRAWLER_AGENT_TASKS.md §30 TASK-028, §34 Registry Schema, §35 registry.json。

演算法參考: [algs/registry-export.md](../algs/registry-export.md)

## 驗收標準

- [x] `internal/export/` 套件建立
- [x] `RegistryExporter` struct 實現: `Export(dir string) error`
- [x] `registry/registry.json` 生成: schema_version="0.1", generated_at, crawler_version, servers array
- [x] registry.json 中每個 server 包含: id, name, description, category, region, taiwan_relevance (level, score, confidence), official_data_source, repository (url, stars, license), transport, tools, quality (score), status
- [x] `registry/registry.min.json` 生成: schema_version, generated_at, servers array (僅 id, name, description, category, transport)
- [x] `registry/categories.json` 生成: {category_name: count} 映射
- [x] `registry/sources.json` 生成: {source_name: count} 映射
- [x] `registry/statistics.json` 生成: total_servers, taiwan_relevant, by_level (T0-T5), by_health, quality_distribution (A-F)
- [x] `registry/health.json` 生成: 每個 server 的 health status, latency_ms, checks
- [x] 每個生成的 JSON 檔案: file size > 0, valid JSON (§TST-039)
- [x] registry.json 通過 `schema/registry.json` schema validation (§TST-039)
- [x] SQLite server count = registry.json server count = statistics.json total (§TST-040, §TST-044, §TST-071)
- [x] Server IDs 在 SQLite, registry.json, statistics.json, health.json 中 100% 相同 (§TST-040)
- [x] 單元測試: 從 mock 數據生成 registry → 驗證 6 個檔案全部存在
- [x] 單元測試: generated.json 通過 schema validation

## 備註

- registry_version 格式: v1.YYYY.MM.DD (§61 Versioning)
- 所有 category 必須來自 controlled vocabulary (§TST-041)
- Quality score 範圍 0–100 (§TST-042)

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
