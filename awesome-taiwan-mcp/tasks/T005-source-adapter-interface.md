---
github_issue: N/A
title: Source Adapter 介面 — Discover + Fetch interface + mock adapter
type: feat
priority: high
^status: done
depends_on: [T002]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T005 - Source Adapter 介面 — Discover + Fetch interface + mock adapter

## 目標

建立 `internal/sources/` 套件與 `SourceAdapter` interface，並實現 mock adapter。
對應 CRAWLER_AGENT_TASKS.md §7 TASK-005，§4 Source Adapter, §9 Implementation Plan。

演算法參考: [algs/source-adapter.md](../algs/source-adapter.md)

## 驗收標準

- [ ] `internal/sources/` 套件建立
- [ ] `SourceAdapter` interface 實現 (§4): `Name() string`, `Discover(ctx context.Context) ([]RawCandidate, error)`, `Fetch(ctx context.Context, candidate RawCandidate) (*RawRecord, error)`
- [ ] `RawCandidate` struct 在 models 套件中實現 (§12): Source, SourceURL, Name, Description, RepositoryURL, HomepageURL, Endpoint, Author, RawMetadata, DiscoveredAt
- [ ] `RawRecord` struct 實現 (§7, §9): Candidate, Repository, Manifest, Tools, Resources, Prompts, Endpoints, Transport, Readme, PackageFiles
- [ ] `MockAdapter` 實現: 固定候選人列表, configurable failure mode, configurable delay
- [ ] MockAdapter `Discover()` 回傳預設的 RawCandidate 列表 (至少 3 個候選人)
- [ ] MockAdapter `Fetch()` 回傳對應的 RawRecord (README + package.json 內容)
- [ ] MockAdapter 支援 `ShouldFail` 和 `Delay` 配置，用於 pipeline 測試
- [ ] `SourceAdapter` interface 的單元測試: mock adapter Discover→Fetch 整個流程
- [ ] `RawCandidate` 和 `RawRecord` 的 JSON marshal/unmarshal 測試
- [ ] 每個 adapter 實現必須支援 `ctx context.Context` 以實現 context cancellation (§40)

## 備註

- 來源只能負責 Discover + Fetch，不能決定 Registry schema (§2.1 Source Agnostic)
- Mock adapter 用於測試 crawler pipeline (§7 TASK-005 Acceptance)
- RateLimitConfig struct 定義在此或 shared config (§40 Rate Limit)
