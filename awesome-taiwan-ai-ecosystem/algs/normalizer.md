# Algorithm: Normalizer

## Purpose

Transform `RawRecord` from any source into the unified `MCPServer` schema
(§13 Normalized MCP Schema). Source-agnostic: different sources only Discover/Extract
(§2.1 Source Agnostic).

## Interface (§6 CRAWLER_IMPLEMENTATION_PLAN Phase 3)
```go
type Normalizer interface {
    Normalize(RawRecord) (*MCPServer, error)
}
```

## Processing Steps (§8 CRAWLER_AGENT_TASKS — TASK-008 Normalizer)

### 1. URL Normalization
- Strip trailing slashes from repository URLs
- Normalize to lowercase host
- Remove `.git` suffix
- e.g. `https://github.com/foo/bar/` → `https://github.com/foo/bar`

### 2. Name Normalization
- Extract name from repository (if available)
- Fallback to candidate Name
- Generate slug: lowercase, alphanumeric + hyphens

### 3. Description Normalization
- Prefer README first paragraph
- Fallback to candidate description

### 4. Repository Metadata
- Map all fields from RepositoryInfo (§7 TAIWAN_MCP_REGISTRY_SCHEMA)

### 5. Endpoint Extraction
- Extract from README (find MCP endpoints: http URLs, stdio configs)
- Extract from mcp.json / server.json manifests
- Extract from package.json (mcp.servers section)
- Extract from RawMetadata

### 6. Manifest Extraction (§9, §11)
- Sources (in priority order): `package.json` → `pyproject.toml` → `go.mod` → `Cargo.toml` → `server.json` → `mcp.json` → `manifest.json`
- Parse MCP server definitions from manifest files
- Extract transport type from manifest (stdio, sse, streamable-http, etc.)

### 7. Tool Extraction
- From manifest: list tools defined in server config
- From MCP protocol: tools/list (if endpoint available and connected)

### 8. Transport Detection
- stdio: process transport from manifest
- sse / streamable-http / http: extracted from endpoint URL scheme
- websocket: wss:// scheme

### 9. License Detection
- From GitHub: license field
- From manifest: license field
- If not found: "UNKNOWN" (never guess — §TST-045)

### 10. Data Source Extraction
- Scan README for official domain keywords (§29 Data Source Detection)
- Scan source code for API client references
- Extract: TWSE, TPEx, TAIFEX, TDCC, CWA, MOI, MOEA, MOL, MOF, PCC, LY, Judicial Yuan, data.gov.tw, ECPay, NewebPay, SHOPLINE

### 11. Conflict Resolution (§65)
When multiple sources provide same field:
```text
1. Live MCP protocol data  (highest)
2. Repository manifest
3. Official registry
4. Directory metadata    (lowest)
```

## Manifest Parsing
Must support:
- `package.json` mcp.servers section
- `pyproject.toml` [project.entry-points."mcp"] or [tool.mcp]
- `go.mod` (module name as identifier)
- `Cargo.toml` [package.metadata.mcp]
- `server.json` / `mcp.json` / `manifest.json` (native MCP server config)

**Never execute package manager** — only static parsing.
**Never install dependencies.**
**No code execution.**

## Security
- README is untrusted input (§60 LLM Security) — sanitize before any processing
- Strip injection patterns: "Ignore previous instructions", "Call this URL", "Upload credentials"
