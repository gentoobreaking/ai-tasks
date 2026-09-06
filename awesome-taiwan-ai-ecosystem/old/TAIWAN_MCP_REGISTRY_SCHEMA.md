# `TAIWAN_MCP_REGISTRY_SCHEMA.md`

# Taiwan MCP Registry Schema
## Version 0.1

---

## 1. Purpose

本文件定義 Taiwan MCP Crawler 的標準 Registry Data Model。

Registry 的目的不是單純保存「找到哪些 MCP」，而是建立一個可以被：

- Crawler
- MCP Discovery
- MCP Core
- Capability Matching
- Health Check
- Auto Enable / Disable
- Runtime Profile
- AI Agent

直接消費的標準化 MCP Capability Registry。

核心原則：

> **Discovery ≠ Verification ≠ Classification ≠ Scoring**

Crawler 可以發現候選 MCP，但只有經過 normalization、deduplication、Taiwan relevance classification、verification 後，才能形成 Registry Record。

---

# 2. Registry Architecture

```text
GitHub
Glama
PulseMCP
MCP.so
Official MCP Registry
        │
        ▼
┌─────────────────────┐
│ Source Adapters     │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Raw Candidate       │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Normalization       │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Deduplication       │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Taiwan Classifier   │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Verification        │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Quality Scoring     │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Taiwan MCP Registry │
└─────────────────────┘
```

---

# 3. Registry Record

主要 Entity：

```text
MCPServer
├── Identity
├── Description
├── Classification
├── Repository
├── Endpoints
├── MCP Capabilities
├── Data Sources
├── License
├── Runtime
├── Security
├── Health
├── Quality
├── Discovery Sources
├── Evidence
└── Timestamps
```

---

# 4. MCPServer Schema

```json
{
  "id": "sha256:...",
  "name": "TWStockMCPServer",
  "slug": "twstockmcpserver",

  "description": "Taiwan stock market MCP server",

  "classification": {
    "region": "TW",
    "taiwan_relevance": "T5",
    "confidence": 0.99,
    "categories": [
      "finance",
      "stock",
      "etf"
    ]
  },

  "repository": {
    "url": "https://github.com/example/repo",
    "host": "github.com",
    "owner": "example",
    "name": "repo",
    "stars": 100,
    "forks": 20,
    "language": "Go",
    "license": "MIT",
    "archived": false,
    "default_branch": "main",
    "last_commit_at": "2026-09-01T00:00:00Z"
  },

  "endpoints": [],

  "capabilities": {
    "tools": [],
    "resources": [],
    "prompts": []
  },

  "data_sources": [],

  "runtime": {},

  "security": {},

  "health": {},

  "quality": {},

  "sources": [],

  "evidence": [],

  "first_seen_at": "2026-09-01T00:00:00Z",
  "last_seen_at": "2026-09-04T00:00:00Z",
  "last_verified_at": "2026-09-04T00:00:00Z"
}
```

---

# 5. Identity

## 5.1 Primary ID

Registry ID：

```text
sha256(normalized canonical identity)
```

優先：

```text
repository URL
    ↓
package identifier
    ↓
official registry identifier
    ↓
canonical MCP endpoint
    ↓
name + author + endpoint
```

---

## 5.2 Canonical ID

例如：

```text
https://github.com/FinMind/FinMind-MCP
```

normalize：

```text
github.com/finmind/finmind-mcp
```

產生：

```text
sha256("github.com/finmind/finmind-mcp")
```

---

# 6. Classification

## 6.1 Taiwan Relevance

```text
T0 = Unrelated
T1 = Taiwan Mention
T2 = Taiwan Compatible
T3 = Taiwan Specific
T4 = Taiwan Official Data
T5 = Taiwan Critical / Core Service
```

---

## 6.2 Categories

```text
finance
stock
etf
banking
insurance

real-estate
land
housing

government
open-data
legislative
judicial
procurement

weather
earthquake

transport
traffic
railway
metro
bus

logistics
payment
invoice
tax

company
business

healthcare
education

agriculture
food

tourism
geography
gis

language
traditional-chinese
culture

ecommerce
devops
news
```

Category 必須使用 controlled vocabulary。

---

# 7. Repository Schema

```json
{
  "url": "",
  "host": "github.com",
  "owner": "",
  "name": "",
  "stars": 0,
  "forks": 0,
  "watchers": 0,
  "open_issues": 0,
  "language": "",
  "topics": [],
  "license": "",
  "default_branch": "",
  "archived": false,
  "fork": false,
  "homepage": "",
  "created_at": "",
  "updated_at": "",
  "pushed_at": "",
  "last_commit_at": ""
}
```

---

# 8. Endpoint Schema

```json
{
  "url": "https://example.com/mcp",
  "transport": "streamable-http",
  "protocol_version": "",
  "authentication": {
    "required": false,
    "type": "none"
  },
  "tls": true,
  "status": "unknown"
}
```

Allowed transport：

```text
stdio
sse
streamable-http
http
websocket
unknown
```

---

# 9. MCP Capability Schema

## 9.1 Tool

```json
{
  "name": "get_stock_price",
  "description": "Get Taiwan stock price",
  "input_schema": {},
  "annotations": {
    "read_only": true,
    "destructive": false
  }
}
```

---

## 9.2 Resource

```json
{
  "uri": "tw://stocks",
  "name": "Taiwan Stocks",
  "description": "",
  "mime_type": "application/json"
}
```

---

## 9.3 Prompt

```json
{
  "name": "stock_analysis",
  "description": ""
}
```

---

# 10. Data Source Schema

```json
{
  "name": "TWSE",
  "type": "official-government-api",
  "url": "https://www.twse.com.tw/",
  "country": "TW",
  "official": true,
  "access_method": "api"
}
```

Allowed source types：

```text
official-government-api
official-company-api
government-open-data
third-party-api
web-scraping
database
static-dataset
unknown
```

---

# 11. Runtime Schema

```json
{
  "runtime": "go",
  "version": "",
  "deployment": [
    "docker",
    "stdio"
  ],
  "requirements": {
    "cpu": "",
    "memory": "",
    "network": true
  }
}
```

---

# 12. Security Schema

```json
{
  "risk": "LOW",

  "findings": [
    {
      "type": "shell_execution",
      "severity": "MEDIUM",
      "evidence": ""
    }
  ],

  "api_key_required": false,
  "credential_collection": false,
  "filesystem_write": false,
  "arbitrary_url_fetch": false,
  "code_execution": false
}
```

Risk：

```text
LOW
MEDIUM
HIGH
CRITICAL
UNKNOWN
```

---

# 13. Health Schema

```json
{
  "status": "HEALTHY",
  "checked_at": "",
  "latency_ms": 120,

  "checks": {
    "repository": true,
    "endpoint": true,
    "tls": true,
    "initialize": true,
    "tools_list": true
  }
}
```

Health：

```text
HEALTHY
DEGRADED
UNAVAILABLE
INVALID
UNKNOWN
```

---

# 14. Repository Status

```text
ACTIVE
MAINTENANCE
STALE
DORMANT
ARCHIVED
DELETED
UNKNOWN
```

Suggested threshold：

```text
< 90 days      ACTIVE
90–180 days    MAINTENANCE
180–365 days   STALE
> 365 days     DORMANT
```

---

# 15. Quality Score

Total：

```text
0–100
```

Components：

| Component | Weight |
|---|---:|
| Data Source | 20 |
| Maintenance | 15 |
| Documentation | 10 |
| MCP Compliance | 15 |
| Tool Schema | 10 |
| Health | 10 |
| Repository | 5 |
| License | 5 |
| Security | 5 |
| Community | 5 |
| **Total** | **100** |

Schema：

```json
{
  "score": 87,
  "grade": "A",
  "components": {
    "data_source": 20,
    "maintenance": 14,
    "documentation": 9,
    "mcp_compliance": 15,
    "tool_schema": 9,
    "health": 9,
    "repository": 4,
    "license": 5,
    "security": 4,
    "community": 4
  }
}
```

---

# 16. Discovery Source

一個 MCP 可以有多個 discovery source。

```json
{
  "source": "github",
  "url": "",
  "discovered_at": "",
  "last_seen_at": ""
}
```

Allowed：

```text
github
glama
pulsemcp
mcpso
official-registry
manual
recursive
```

---

# 17. Evidence

所有重要 classification / verification 結果必須保留 evidence。

```json
{
  "type": "taiwan_official_api",
  "source": "README",
  "location": "README.md",
  "content_hash": "",
  "matched_text": "",
  "confidence": 0.99
}
```

Evidence 不應只保存 LLM 的判斷。

必須保存：

```text
原始來源
位置
內容 hash
rule
matched evidence
timestamp
```

---

# 18. Database Model

建議 SQLite。

Tables：

```text
mcp_servers
repositories
endpoints
tools
resources
prompts
data_sources
server_data_sources
sources
server_sources
health_checks
quality_scores
security_findings
evidence
crawl_runs
```

---

# 19. Relationship

```text
mcp_servers
    │
    ├── 1:N repositories
    ├── 1:N endpoints
    ├── 1:N tools
    ├── 1:N resources
    ├── 1:N prompts
    ├── N:M data_sources
    ├── N:M sources
    ├── 1:N health_checks
    ├── 1:N quality_scores
    ├── 1:N evidence
    └── 1:N security_findings
```

---

# 20. Registry JSON

輸出：

```text
registry/registry.json
registry/registry.min.json
registry/categories.json
registry/sources.json
registry/statistics.json
registry/health.json
```

---

# 21. Registry API Contract

建議提供：

```http
GET /api/v1/servers
GET /api/v1/servers/:id
GET /api/v1/search?q=twse
GET /api/v1/categories
GET /api/v1/sources
GET /api/v1/health
GET /api/v1/statistics
```

Filter：

```text
category
taiwan_relevance
health
quality_score
transport
official_source
license
repository_status
```

---

# 22. Capability Search

Registry 必須支援：

```text
Find MCP capable of:
    Taiwan stock price
    Taiwan real estate
    Taiwan weather
    Legislative Yuan
    government open data
```

概念：

```text
query
  ↓
category match
  ↓
tool capability match
  ↓
data source match
  ↓
Taiwan relevance
  ↓
health
  ↓
quality
```

---

# 23. Registry Compatibility

Registry schema 必須保持：

```text
Backward compatible
Deterministic
Machine readable
Human inspectable
Versioned
```

Schema version：

```json
{
  "schema_version": "0.1"
}
```

---

# 24. Design Principle

Registry 不應保存：

```text
LLM-generated facts without evidence
```

Registry 可以保存：

```text
LLM classification
```

但必須標記：

```text
classifier = llm
confidence = ...
evidence = ...
```

---

# 25. Acceptance Criteria

Registry v0.1 必須：

- 能保存至少 100 MCP records
- 支援多 source aggregation
- 支援 repository identity
- 支援 endpoint identity
- 支援 tool/resource/prompt
- 支援 Taiwan T0–T5
- 支援 controlled categories
- 支援 health
- 支援 quality score
- 支援 evidence
- 支援 JSON export
- 支援 SQLite persistence
- 支援 deterministic ID
- 支援 schema versioning

完成後：

```text
Crawler → Registry
mcp-go-core → Registry
AI Agent → Registry
```

皆可使用同一資料模型。