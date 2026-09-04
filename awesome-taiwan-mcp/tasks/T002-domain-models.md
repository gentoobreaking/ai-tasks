---
github_issue: N/A
title: 領域模型 — MCPServer, RawCandidate, RawRecord, TaiwanRelevance 等
type: feat
priority: high
^status: done
depends_on: [T001]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T002 - 領域模型 — MCPServer, RawCandidate, RawRecord, TaiwanRelevance 等

## 目標

建立 `internal/models/` 套件，實作所有領域模型 struct。對應 CRAWLER_AGENT_TASKS.md §4 TASK-002，
§13 Normalized MCP Schema, §12 Candidate Schema, §5 MCPServer Schema, §16 Evidence, §17 Taiwan Relevance。

演算法參考: [algs/models.md](../algs/models.md)

## 驗收標準

- [ ] `internal/models/` 套件建立
- [ ] `RawCandidate` struct 實現 (§12): Source, SourceURL, Name, Description, RepositoryURL, HomepageURL, Endpoint, Author, RawMetadata, DiscoveredAt
- [ ] `MCPServer` struct 實現 (§13): ID, Name, Slug, Description, Category, Region, TaiwanRelevance, Repository, Endpoints, Transport, Tools, Resources, Prompts, DataSources, License, Status, Quality, Sources, FirstSeen, LastSeen, LastVerified
- [ ] `TaiwanRelevance` struct 實現 (§14): Score, Level, Evidence, Confidence
- [ ] `Evidence` struct 實現 (§16): Type, Source, Location, ContentHash, MatchedText, Rule, Score, Timestamp
- [ ] `RepositoryInfo` struct 實現 (§7 Registry Schema): URL, Host, Owner, Name, Stars, Forks, Watchers, OpenIssues, Language, License, Topics, DefaultBranch, Archived, Fork, Homepage, CreatedAt, UpdatedAt, PushedAt, LastCommitAt
- [ ] `Endpoint` struct 實現 (§8): URL, Transport, ProtocolVersion, Authentication, TLS, Status
- [ ] `Tool` struct 實現 (§9.1): Name, Description, InputSchema, Annotations
- [ ] `Resource` struct 實現 (§9.2): URI, Name, Description, MIMEType
- [ ] `Prompt` struct 實現 (§9.3): Name, Description
- [ ] `DataSource` struct 實現 (§10): Name, Type, URL, Country, Official, AccessMethod
- [ ] `QualityScore` struct 實現 (§15): Score, Grade, Components
- [ ] `SourceReference` struct 實現 (§16): Source, URL, DiscoveredAt, LastSeen, TrustScore
- [ ] `Status` enum 實現: ACTIVE, MAINTENANCE, STALE, DORMANT, ARCHIVED, DELETED, UNKNOWN
- [ ] `HealthStatus` enum 實現: HEALTHY, DEGRADED, UNAVAILABLE, INVALID, UNKNOWN
- [ ] `Category` controlled vocabulary 實現 (§19 Category Taxonomy): finance, stock, etf, banking, insurance, real-estate, land, housing, government, open-data, legislative, judicial, procurement, weather, earthquake, transport, traffic, railway, metro, bus, logistics, payment, invoice, tax, company, business, healthcare, education, agriculture, food, tourism, geography, gis, language, traditional-chinese, culture, ecommerce, devops, news
- [ ] `Transport` enum 實現: stdio, sse, streamable-http, http, websocket, unknown
- [ ] `DataSourceType` enum 實現: official-government-api, official-company-api, government-open-data, third-party-api, web-scraping, database, static-dataset, unknown
- [ ] `SecurityFinding` struct 實現: Type, Severity (LOW/MEDIUM/HIGH/CRITICAL/UNKNOWN), Source, Location, Evidence
- [ ] 所有 struct 支援 JSON marshal/unmarshal
- [ ] 單元測試: round-trip JSON marshal/unmarshal 測試每一個 struct

## 備註

- Scoring constants 必須來自 §17 Deterministic Relevance Score (Taiwan domain +40, government API +40, financial API +35, Taiwan dataset +30, Taiwan keyword +20, Taiwan language +15, Taiwan company/service +15, README mention +5)
- Level thresholds: >=70 T5, >=55 T4, >=40 T3, >=20 T2, >=5 T1, <5 T0
- Quality component weights: Data Source 20, Maintenance 15, Documentation 10, MCP Compliance 15, Tool Schema 10, Health 10, Repository 5, License 5, Security 5, Community 5
- Data source scores: Official Taiwan API 20, Government OpenData 18, Official company API 15, Known third-party API 10, Web scraping 7, Unknown 0
