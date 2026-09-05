# Algorithm: Deduplication & Canonical Identity

## Purpose

Ensure the same MCP does not appear as multiple records in the registry
(§20 Deduplication). Establish a deterministic canonical identity
(§21, §22 Canonical Identity).

## CanonicalIdentity Algorithm (§21, §22)

Priority order for canonical identity:
1. Repository URL (highest priority)
2. Package identifier
3. Official MCP Registry name
4. Canonical endpoint
5. Normalized name + author (fallback)

```go
func CanonicalIdentity(server MCPServer) Identity {
    // Priority 1: repository URL
    if server.Repository.URL != "" {
        normalized := NormalizeURL(server.Repository.URL)
        return Identity{
            CanonicalID: sha256(normalized),
            GitHubURL: normalized,
        }
    }

    // Priority 2: package identifier
    if pkgID := getPackageID(server); pkgID != "" {
        return Identity{
            CanonicalID: sha256(pkgID),
            PackageName: pkgID,
        }
    }

    // Priority 3: official registry name
    if server.RegistryName != "" {
        return Identity{
            CanonicalID: sha256(server.RegistryName),
            RegistryName: server.RegistryName,
        }
    }

    // Priority 4: canonical endpoint
    for _, ep := range server.Endpoints {
        if ep.URL != "" && ep.Status != "unknown" {
            normalized := NormalizeURL(ep.URL)
            return Identity{
                CanonicalID: sha256(normalized),
                Fingerprints: []string{normalized},
            }
        }
    }

    // Priority 5: fingerprint fallback
    fingerprint := sha256(
        NormalizeName(server.Name) +
        server.Author +
        strings.Join(sortedEndpoints(server.Endpoints), "") +
        strings.Join(sortedTools(server.Tools), "")
    )
    return Identity{
        CanonicalID: fingerprint,
        Fingerprints: []string{fingerprint},
    }
}
```

## URL Normalization
```text
https://github.com/foo/bar     → github.com/foo/bar
https://github.com/foo/bar/    → github.com/foo/bar
https://github.com/foo/bar.git → github.com/foo/bar
https://WWW.GitHub.com/Foo/Bar → github.com/foo/bar
```

## Deduplication Engine (§23 MCP Fingerprint)

Input: `[]MCPServer`
Output: `[]MCPServer` (deduplicated)

### Algorithm
1. For each server, compute `CanonicalIdentity`
2. Group by `CanonicalID`
3. Within each group, merge:
   - Sources: union all discovery sources
   - Evidence: union all evidence
   - Tools: merge, deduplicate by name
   - Resources: merge, deduplicate by URI
   - Prompts: merge, deduplicate by name
   - Endpoints: union
   - DataSources: union
4. Keep the highest-trust source metadata (§64 Source Trust)
5. Output: one MCPServer per group, with all sources merged

### Merge Priority (§65 Conflict Resolution)
```text
1. Live MCP protocol data  (trust 1.0)
2. Repository manifest      (trust 0.95)
3. Official registry        (trust 1.0, but only for metadata)
4. Directory metadata       (trust varies)
```

For conflicting field values, use the highest-trust source that provided the value.

## Fingerprint (no repository, §23)
```go
fingerprint = sha256(
    normalized_name +
    author +
    endpoint +
    sorted(tool_names)
)
```
Purpose: avoid same MCP being duplicated due to different directory names.

## Idempotency
- Same input MUST always produce the same CanonicalID
- Running dedup twice on same data = single output (§TST-037)
