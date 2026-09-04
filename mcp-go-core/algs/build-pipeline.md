# Build Pipeline Algorithm

**Feature:** F61-F69 — Configuration, Compilation, Manifest, Binary Analysis, Smoke Test, Benchmark  
**Module:** internal/builder  
**Task:** T038  

## Objective

Execute the full pipeline: Config → Analyze → Resolve → Lock → Generate → Compile → Verify.

## Stage Interface

```go
type Stage interface {
    Name() string
    Run(ctx context.Context, bc *BuildContext) error
}

type BuildContext struct {
    Config       Config
    Resolution   Resolution
    Manifest     Manifest
    GeneratedDir string
    OutputPath   string
}
```

## Pipeline Sequence

```text
ConfigStage(ctx, bc)    // load mcp.yaml, validate schema
AnalyzeStage(ctx, bc)   // run analyzer → inferred-features.json
ResolveStage(ctx, bc)   // run feature resolver → Resolution
LockStage(ctx, bc)      // write .mcp/features.lock
GenerateStage(ctx, bc)  // write .mcp/generated/*.go
CompileStage(ctx, bc)   // go build with -trimpath -ldflags="-s -w"
VerifyStage(ctx, bc)    // binary audit, smoke test
BenchmarkStage(ctx, bc) // optional benchmark
```

## BuildContext Contract

```go
type Config struct {
    Profile    string
    Enabled    []string
    Disabled   []string
    Transport  TransportConfig
    Security   SecurityConfig
    Runtime    RuntimeConfig
    Observability ObservabilityConfig
    Storage    StorageConfig
}
```

## Compile Step

Default: `go build ./cmd/server`
Production: `go build -trimpath -ldflags="-s -w" ./cmd/server`
CGO default: `CGO_ENABLED=0` where compatible.

## Acceptance Test Cases

| Case | Input | Expected |
|---|---|---|
| Minimal build | profile=minimal | dist/server exists, executable |
| Production build | profile=production | stripped binary, build-manifest.json |
| Pipeline trace | verbose | [1/10]...[10/10] progress output |
| Clean workspace | rm -rf .mcp dist | full rebuild succeeds |
| Error propagation | invalid config | pipeline fails with actionable error code |
