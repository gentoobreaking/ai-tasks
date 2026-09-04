# Algorithm: Quality Scoring Engine

## Purpose

Calculate quality score (0–100) for each MCP server (§31 Quality Score).
Score must be deterministic — same input always produces same output.

## Score Components (§31, §15 Registry Schema)

| Component | Max Points | Sub-fields |
|-----------|-----------|------------|
| Data Source | 20 | Based on data source type |
| Maintenance | 15 | Based on last commit date |
| Documentation | 10 | README presence + quality |
| MCP Compliance | 15 | Protocol support + manifest |
| Tool Schema | 10 | Number of tools with valid schemas |
| Health | 10 | Endpoint health status |
| Repository | 5 | Stars, activity |
| License | 5 | License present + permissive |
| Security | 5 | No critical security findings |
| Community | 5 | Stars, forks, topics |

## 1. Data Source Score (§32)

| Source Type | Points |
|-------------|--------|
| Official Taiwan API | 20 |
| Government OpenData | 18 |
| Official company API | 15 |
| Known third-party API | 10 |
| Web scraping | 7 |
| Unknown | 0 |

### Logic
- Scan data_sources list
- If any official Taiwan API → 20
- If any government open data → 18
- If any official company API → 15
- If any known third-party API → 10
- If web scraping detected → 7
- Otherwise → 0

## 2. Maintenance Score (max 15)

| Last Commit | Points |
|-------------|--------|
| < 90 days | 15 |
| 90–180 days | 12 |
| 180–365 days | 8 |
| > 365 days | 3 |

## 3. Documentation Score (max 10)

| Condition | Points |
|-----------|--------|
| README exists and > 200 chars | 5 |
| README has setup instructions | 3 |
| README has examples | 2 |

## 4. MCP Compliance Score (max 15)

| Condition | Points |
|-----------|--------|
| Has MCP manifest/config | 5 |
| Supports stdio transport | 3 |
| Supports HTTP transport | 3 |
| Supports SSE transport | 2 |
| Supports streamable-http | 2 |

## 5. Tool Schema Score (max 10)

| Condition | Points |
|-----------|--------|
| tools/list successful | 3 |
| >= 1 tool with name + description | 3 |
| >= 1 tool with input schema | 2 |
| >= 5 tools total | 2 |

## 6. Health Score (max 10)

| Health Status | Points |
|---------------|--------|
| HEALTHY | 10 |
| DEGRADED | 5 |
| UNAVAILABLE | 0 |
| INVALID | 0 |
| UNKNOWN | 0 |

## 7. Repository Score (max 5)

| Condition | Points |
|-----------|--------|
| Repository exists and accessible | 3 |
| Stars >= 10 | 1 |
| Stars >= 100 | 1 (total 5) |

## 8. License Score (max 5)

| Condition | Points |
|-----------|--------|
| License detected (any) | 3 |
| Permissive license (MIT/Apache/BSD) | 2 |
| No license / UNKNOWN | 0 |

## 9. Security Score (max 5)

| Finding Severity | Penalty |
|------------------|---------|
| CRITICAL | -5 (score = 0) |
| HIGH | -3 |
| MEDIUM | -1 |
| LOW | -0.5 |
| None | +5 |

Security score cannot go negative; minimum is 0.

## 10. Community Score (max 5)

| Condition | Points |
|-----------|--------|
| Stars >= 10 | 1 |
| Stars >= 50 | 1 |
| Stars >= 100 | 1 |
| Forks >= 5 | 1 |
| Has topics/tags | 1 |

## Grade Mapping
```text
score >= 90 → A
score >= 80 → B
score >= 70 → C
score >= 60 → D
score < 60  → F
```

## Determinism (§TST-043)
- Same fixture input across 100 iterations MUST yield `unique(score) = 1`
- All scoring rules must be deterministic functions of server metadata
- LLM must not influence quality scoring
