# Code Generation Algorithm

**Feature:** F64 — Code generation  
**Module:** internal/generator  
**Task:** T032  

## Objective

Transform the resolved feature set into static Go composition files.

## Input

`Resolution` with:
- `Enabled []string` (features)
- `Disabled []string` (features)
- `Inferred []string` (features)
- `Modules []string` (module paths)

## Generated Files

```text
.mcp/generated/
├── features.go       // Feature flag constants (metadata only)
├── modules.go        // Static module composition
├── router.go         // Generated tool/resource/prompt router
├── server.go         // Generated server bootstrap
└── buildinfo.go      // Build metadata injection
```

## features.go Template

```go
package generated

const (
    FeatureCore = true
    FeatureHTTP = true
    FeatureJWT  = true
    FeatureOTel = false
    FeatureOAuth = false
)
```

Note: These constants are metadata. The actual optimization is via static imports + Go linker dead-code elimination.

## server.go Template

```go
package generated

import (
    "context"
    "github.com/project/mcp-go-core/core"
)

func NewServer(opts ...core.Option) *core.Server {
    s := core.New(opts...)
    Configure(s)
    return s
}
```

## buildinfo.go Template

```go
package generated

var (
    FrameworkVersion = "0.1.0"
    BuildProfile    = "production"
    FeatureLockHash = ""
    BuildTimestamp  = ""
    GitCommit       = ""
)
```

## Acceptance Tests

- Generated files must exist in `.mcp/generated/`
- All 5 files present: features.go, modules.go, server.go, router.go, buildinfo.go
- `generate --check` fails if generated source differs from committed state
- Deterministic: same resolution produces identical output
