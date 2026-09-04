---
github_issue: N/A
title: JSON Registry Export — registry.json, registry.min.json, categories, sources, statistics, health
type: feat
priority: high
^status: done
depends_on: [T027]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T028 - JSON Registry Export — registry.json, registry.min.json, categories, sources, statistics, health

## 目標

建立 `internal/export/` 套件, 產生 registry JSON export 檔案。
對應 CRAWLER_AGENT_TASKS.md §30 TASK-028, §34 Registry Schema, §35 registry.json。

演算法參考: [algs/registry-export.md](../algs/registry-export.md)

## 驗收標準

- [ ] `internal/export/` 套件建立
- [ ] `RegistryExporter` struct 實現: `Export(dir string) error`
- [ ] `registry/registry.json` 生成: schema_version="0.1", generated_at, crawler_version, servers array
- [ ] registry.json 中每個 server 包含: id, name, description, category, region, taiwan_relevance (level, score, confidence), official_data_source, repository (url, stars, license), transport, tools, quality (score), status
- [ ] `registry/registry.min.json` 生成: schema_version, generated_at, servers array (僅 id, name, description, category, transport)
- [ ] `registry/categories.json` 生成: {category_name: count} 映射
- [ ] `registry/sources.json` 生成: {source_name: count} 映射
- [ ] `registry/statistics.json` 生成: total_servers, taiwan_relevant, by_level (T0-T5), by_health, quality_distribution (A-F)
- [ ] `registry/health.json` 生成: 每個 server 的 health status, latency_ms, checks
- [ ] 每個生成的 JSON 檔案: file size > 0, valid JSON (§TST-039)
- [ ] registry.json 通過 `schema/registry.json` schema validation (§TST-039)
- [ ] SQLite server count = registry.json server count = statistics.json total (§TST-040, §TST-044, §TST-071)
- [ ] Server IDs 在 SQLite, registry.json, statistics.json, health.json 中 100% 相同 (§TST-040)
- [ ] 單元測試: 從 mock 數據生成 registry → 驗證 6 個檔案全部存在
- [ ] 單元測試: generated.json 通過 schema validation

## 備註

- registry_version 格式: v1.YYYY.MM.DD (§61 Versioning)
- 所有 category 必須來自 controlled vocabulary (§TST-041)
- Quality score 範圍 0–100 (§TST-042)
