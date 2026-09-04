# Feature Lock Generation Algorithm

**Feature:** F57 — Feature lock generation  
**Feature:** F58 — Deterministic resolution  
**Module:** internal/featuregraph  
**Task:** T021  

## Objective

Generate `.mcp/features.lock` containing the deterministic, reproducible result of feature resolution.

## Lock File Schema

```yaml
version: 1
profile: production
enabled:
  - core
  - http
  - streamable-http
  - security
  - jwt
  - logging
disabled:
  - stdio
  - sse
  - oauth
  - mtls
  - tracing
  - metrics
  - tasks
  - filesystem-storage
inferred:
  - http
  - security
graph_hash:
  algorithm: sha256
  value: "<sha256 of sorted feature set + dependency edges>"
metadata:
  framework_version: "0.1.0"
  go_version: "go1.x"
  generator_version: "0.1.0"
```

## Determinism Rule

The same inputs (mcp.yaml + profile + source + framework version + Go version + generator version) must always produce:
1. Same enabled/disabled feature set
2. Same graph_hash value

## Hash Computation

```text
hash_input = sort(features) + sort(dependency_edges) + profile + framework_version
graph_hash = sha256(hash_input)
```

## Acceptance Test Cases

| Case | Input | Expected |
|---|---|---|
| Same input ×3 runs | Identical config | Byte-identical features.lock |
| Config change | Features modified | graph_hash changed |
| Dependency graph change | Edge added/removed | graph_hash changed |
| Lock integrity | Lock exists | hash matches current resolution |
