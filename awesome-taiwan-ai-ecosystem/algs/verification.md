# Algorithm: Verification Engine

## Purpose

Verify that discovered MCP candidates are real, healthy, and safe
(§25 Verification Engine). Three sub-systems: Repository, Endpoint, Protocol.

## Security Constraint
**NEVER execute discovered MCP code.** (§58 Security KPI, §43 TASK-043)

Allowed operations only:
- HTTP requests
- GitHub API calls
- Git clone (shallow, for static analysis)
- Static file parsing
- MCP protocol handshake (initialize, tools/list only — NO tool execution)

Forbidden:
- Execute discovered code
- npm install / pip install / docker run
- Execute README commands
- Arbitrary shell execution

Any discovered code execution = P0 FAIL = RELEASE BLOCKED.

## Sub-system 1: Repository Verification (§25, internal/verify/repository.go)

### Checks
```text
Repository
  ├── HTTP status (reachable → 200)
  ├── Git repository exists (clone check)
  ├── archived? (GitHub archived flag)
  ├── last commit date
  ├── package manifest exists (package.json/pyproject.toml/etc.)
  ├── README available
  └── MCP implementation detectable (manifest/config file)
```

### Repository Status (§26, §27)
```text
< 90 days       → ACTIVE
90–180 days    → MAINTENANCE
180–365 days   → STALE
> 365 days     → DORMANT
archived       → ARCHIVED   (overrides time-based)
deleted/404    → DELETED
otherwise      → UNKNOWN
```

Archived status takes priority over time-based classification.

### Evidence Collection
Record for each check:
- Check type
- Result (pass/fail)
- HTTP status code / error message
- Timestamp

## Sub-system 2: Endpoint Health (§25, §26, internal/verify/endpoint.go)

### Checks
```text
Endpoint
  ├── DNS resolution
  ├── TLS handshake (if https)
  ├── HTTP reachable
  ├── MCP initialize (protocol handshake)
  └── latency
```

### Health Status (§26)
```text
HEALTHY     — all checks pass, latency < 2s
DEGRADED    — endpoint reachable but some checks fail
UNAVAILABLE — cannot reach endpoint (DNS/TLS/HTTP failure)
INVALID     — MCP protocol response is invalid
UNKNOWN     — not yet checked
```

### Timeout Configuration
- MCP protocol operations: timeout ≤ 10s (§TST-032)
- HTTP operations: timeout ≤ 30s

## Sub-system 3: MCP Protocol Verification (§25, §28, internal/verify/protocol.go)

### Only protocol-level communication — NO tool execution
```text
initialize   → send initialize request, expect valid response
tools/list   → request list of tools, expect valid response
resources/list → request list of resources, expect valid response
prompts/list  → request list of prompts, expect valid response
```

### Protocol Response Validation
- Initialize response must contain valid `protocolVersion`
- Must parse `capabilities` from initialize response
- tools/list response must contain array of tools
- Each tool: name != empty, description != empty OR explicitly allowed, input_schema valid
- Invalid JSON → health = INVALID, do not panic (§TST-031)

## Security Scanner (§33, internal/verify/security.go)

### Static analysis patterns
```text
exec, shell, eval, subprocess, child_process, os.system,
filesystem write, credential collection, arbitrary URL,
browser automation, RCE patterns, hardcoded secrets
```

### Security Risk Levels (§33)
```text
LOW, MEDIUM, HIGH, CRITICAL, UNKNOWN
```

### Findings must include (§TST-044)
- type (e.g. "shell_execution")
- severity (LOW/MEDIUM/HIGH/CRITICAL)
- source (file path)
- location (line number)
- evidence (code snippet)

## Retry / Backoff (§22, §TST-034, §TST-035)
- HTTP 429 → exponential backoff, respect Retry-After header
- HTTP 5xx → retry with backoff
- HTTP 4xx → no retry (except 429)
- Max retries = 3 (initial + 3 retries = 4 requests max)
- Base delay = 1s, max delay = 30s
- No infinite retry loops

## Failure Isolation (§41)
- Source failure → SOURCE_DEGRADED
- Overall crawl continues
- Individual server verification failure → mark health=UNAVAILABLE, continue
