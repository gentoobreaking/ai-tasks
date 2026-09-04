# Binary Analysis Algorithm

**Feature:** F68 — Binary analysis  
**Module:** internal/builder  
**Task:** T050  

## Objective

Inspect the compiled binary to verify it contains only expected modules and no unexpected dependencies.

## Methods

### Primary
```bash
go tool nm dist/server
```

### Secondary
```bash
go version -m dist/server
go list -deps ./...
```

## Expected vs Actual Comparison

```text
Expected:
core
http
jwt

Actual (from go tool nm symbols):
core
http
jwt
otel

Result:
UNEXPECTED_MODULE

module:
otel

reason:
module is not part of resolved feature graph
```

## Binary Metadata Extraction

### Size
```bash
stat -c %s dist/server  (or equivalent)
```

### Stripped Size
Record both raw and stripped binary sizes.

### Linked Packages
Parse `go tool nm` output for package paths matching `mcp-go-core/modules/`.

## Acceptance Test Cases

| Case | Binary Contains | Expected |
|---|---|---|
| All expected present | core, http, jwt | PASS |
| Unexpected module | + otel | FAIL with UNEXPECTED_MODULE |
| Missing expected | core missing | FAIL with MISSING_MODULE |
| Binary exists | file exists | PASS |
| Binary executable | executable bit set | PASS |

## Verification Matrix

| Profile | Expected | Forbidden |
|---|---|---|
| minimal | core, stdio | http, jwt, oauth, otel, k8s |
| production | core, http, jwt, logging | sse, oauth, otel, k8s, metrics |
| secure | core, http, jwt, logging, recovery | oauth, otel, k8s |
| observable | core, http, jwt, logging, metrics, tracing | k8s |
| full | all | none |
