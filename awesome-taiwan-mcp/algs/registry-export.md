# Algorithm: Registry JSON Export

## Purpose

Generate the final registry output files (§34 Registry Schema, §35 registry.json).

## Output Files
```text
registry/
├── registry.json          — full registry with all fields
├── registry.min.json      — minimal: id, name, description, categories, transport
├── categories.json        — category → count mapping
├── sources.json           — source → count mapping
├── statistics.json        — aggregate stats
└── health.json            — health summary
```

## registry.json Structure (§35)
```json
{
  "schema_version": "0.1",
  "generated_at": "2026-09-04T00:00:00Z",
  "crawler_version": "v0.1.0",
  "servers": [ ... ]
}
```

Each server entry (§4 MCPServer Schema — Registry variant):
```json
{
  "id": "mcp-tw-lvr",
  "name": "mcp-tw-lvr",
  "description": "Taiwan real estate transaction MCP",
  "category": ["real-estate", "government", "open-data"],
  "region": ["TW"],
  "taiwan_relevance": {
    "level": "T5",
    "score": 96,
    "confidence": 1.0
  },
  "official_data_source": true,
  "repository": {
    "url": "https://github.com/...",
    "stars": 120,
    "license": "MIT"
  },
  "transport": ["stdio"],
  "tools": [],
  "quality": { "score": 88 },
  "status": "ACTIVE"
}
```

## registry.min.json Structure
```json
{
  "schema_version": "0.1",
  "generated_at": "...",
  "servers": [
    {
      "id": "...",
      "name": "...",
      "description": "...",
      "category": ["..."],
      "transport": ["..."]
    }
  ]
}
```

## categories.json Structure
```json
{
  "finance": 25,
  "government": 18,
  "real-estate": 12,
  ...
}
```

## sources.json Structure
```json
{
  "github": 120,
  "glama": 85,
  ...
}
```

## statistics.json Structure
```json
{
  "schema_version": "0.1",
  "generated_at": "...",
  "total_servers": 127,
  "taiwan_relevant": 91,
  "by_level": {
    "T5": 18,
    "T4": 21,
    "T3": 35,
    "T2": 17,
    "T1": 0,
    "T0": 0
  },
  "by_health": {
    "healthy": 68,
    "degraded": 11,
    "unavailable": 9,
    "unknown": 3
  },
  "quality_distribution": {
    "A": 30,
    "B": 40,
    "C": 25,
    "D": 10,
    "F": 5
  }
}
```

## health.json Structure
```json
{
  "schema_version": "0.1",
  "generated_at": "...",
  "servers": [
    {
      "id": "...",
      "name": "...",
      "health": "HEALTHY",
      "latency_ms": 120,
      "checks": {
        "repository": true,
        "endpoint": true,
        "tls": true,
        "initialize": true,
        "tools_list": true
      }
    }
  ]
}
```

## Validation Requirements
- Every exported file must be valid JSON (§TST-039)
- File size > 0 (§TST-039)
- registry.json must match schema `schema/registry.json`
- SQLite server count must match registry.json server count (§TST-040, §TST-071)
- Server IDs must be 100% identical between SQLite and all JSON exports

## Naming Convention (§61 Versioning)
```text
Taiwan MCP Registry
v1.2026.09.04
```

## Consistency Requirements
- SQLite server IDs = registry.json server IDs = statistics.json count = health.json count
- 100% identical across all exports (§44, §71, §77)
