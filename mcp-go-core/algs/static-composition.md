# Static Composition Algorithm

**Feature:** F65 — Static composition  
**Module:** internal/generator  
**Task:** T032  

## Objective

Generate Go source that directly imports only the enabled modules, producing the actual Go dependency tree where the linker can eliminate unused code.

## Input

`Resolution` — the final enabled feature set and module list.

## Generated Output

### modules.go
```go
package generated

import (
    "github.com/project/mcp-go-core/core"
    "github.com/project/mcp-go-core/modules/transport/http"
    "github.com/project/mcp-go-core/modules/security/jwt"
    "github.com/project/mcp-go-core/modules/middleware/logging"
)

func Configure(s *core.Server) {
    http.Configure(s)
    jwt.Configure(s)
    logging.Configure(s)
}
```

## Rules

- Only enabled modules appear in the import block.
- `modules.ConfigureAll(server)` is FORBIDDEN.
- Each module exposes a `Configure(*core.Server)` function.
- Import ordering must be deterministic (sorted by path).
- The generated code must compile.

## Acceptance Test Cases

| Case | Resolution | Expected Generated Code |
|---|---|---|
| Minimal | core, stdio | imports: core, stdio only |
| HTTP+JWT | core, http, jwt | imports: core, http, jwt only |
| No unused modules | oauth disabled | oauth import NOT present |
| Deterministic | same resolution ×3 | identical generated source checksum |
