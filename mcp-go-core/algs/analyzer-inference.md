# Application Analyzer Inference Algorithm

**Feature:** F62 — Application analysis  
**Module:** internal/analyzer  
**Task:** T026  

## Objective

Infer which features an application uses by examining configuration, generated metadata, known API patterns, and Go AST.

## Inference Priority

```text
Explicit Configuration  >
Generated Metadata      >
Known API Usage         >
Go AST Analysis          (lowest; v0.1 partial only)
```

## Algorithm

```text
func analyze(appPath):
    inferred = set{}

    // 1. Explicit configuration
    if mcp.yaml has "features" list:
        for f in mcp.yaml.features:
            inferred.add(f)

    // 2. Generated metadata
    if .mcp/generated/metadata.json exists:
        for f in metadata.inferred:
            inferred.add(f)

    // 3. Known API usage (static grep for Configure calls)
    for pattern in known_apis:
        if grep(pattern, appPath):
            inferred.add(pattern.feature)

    // 4. Go AST analysis (minimal v0.1)
    for file in appPath/**/*.go:
        ast = parse(file)
        for imp in ast.imports:
            if imp matches known_module_packages:
                inferred.add(imp.feature)

    return sort_deterministically(inferred)
```

## Known API Patterns

| Pattern | Inferred Feature |
|---|---|
| `http.Configure(` | http |
| `jwt.Configure(` | jwt |
| `stdio.Configure(` | stdio |
| `sessions.Configure(` | sessions |
| `logging.Configure(` | logging |

## Output

File: `.mcp/inferred-features.json`

```json
{
  "features": ["http", "jwt"],
  "source": ["mcp.yaml", "generated metadata", "known API usage"],
  "hash": "sha256:..."
}
```

Output must be deterministic.

## Acceptance Test Cases

| Case | Setup | Expected |
|---|---|---|
| Explicit config | mcp.yaml lists http | inferred: [http] |
| Known API usage | app calls jwt.Configure | inferred: [jwt, security] |
| Unused module | app doesn't import oauth | oauth NOT in inferred |
| Determinism | Same source + config ×2 | Identical inference result |
| No mcp.yaml | Only AST analysis possible | Partial inference from imports |
