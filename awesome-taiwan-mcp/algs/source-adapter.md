# Algorithm: Source Adapter Interface

## Purpose

Define the `SourceAdapter` interface and its implementations for all discovery
sources. Each source adapter must only handle `Discover` and `Fetch` — never
final Registry schema decisions (§2.1 Source Agnostic).

## Interface (§4, §9 Implementation Plan)
```go
type SourceAdapter interface {
    Name() string
    Discover(ctx context.Context) ([]RawCandidate, error)
    Fetch(ctx context.Context, candidate RawCandidate) (*RawRecord, error)
}
```

## RawCandidate (§12)
```go
type RawCandidate struct {
    Source        string         // github, glama, pulsemcp, mcpso, official-registry
    SourceURL     string
    Name          string
    Description   string
    RepositoryURL string
    HomepageURL   string
    Endpoint      string
    Author        string
    RawMetadata   map[string]any
    DiscoveredAt  time.Time
}
```

## RawRecord (§7 Candidate Extraction + §9 PulseMCP)
```go
type RawRecord struct {
    Candidate RawCandidate
    // Full raw data from source
    Repository  *RepositoryInfo
    Manifest    *ManifestInfo
    Tools       []Tool
    Resources   []Resource
    Prompts      []Prompt
    Endpoints   []Endpoint
    Transport   []string
    Readme      string
    PackageFiles map[string]string // "package.json": "...", "pyproject.toml": "..."
}
```

## Mock Adapter (for testing pipeline)
```go
type MockAdapter struct {
    Candidates []RawCandidate
    Records    map[string]*RawRecord
    ShouldFail bool
    Delay      time.Duration
}
```

## Rate Limiting (§40)
Each adapter uses independent rate limiter:
```go
type RateLimitConfig struct {
    RequestsPerSecond float64
    Burst             int
    MaxConcurrency    int
}
```

## Retry / Backoff (§41 Failure Isolation, §33 Agent Tasks, §22 Retry Policy)
- HTTP 429 → exponential backoff respecting Retry-After
- HTTP 5xx → retry
- HTTP 4xx → no retry (unless transient)
- Timeout → retry
- DNS failure → retry
- Max retries = 3, base delay = 1s, max delay = 30s
- Context cancellation must propagate

## Failure Isolation (§41)
- Single source failure → SOURCE_DEGRADED
- Crawl continues with other sources
- Never propagate panic across source boundaries

## Source Trust Scores (§64)
| Source | Trust |
|--------|-------|
| Official MCP Registry | 1.00 |
| GitHub | 0.95 |
| Glama | 0.85 |
| PulseMCP | 0.80 |
| MCP.so | 0.75 |

Used only for metadata conflict resolution (§65), NOT for Taiwan relevance.

## Keyword Matrix (§5.1, §6 GitHub Search Query)
### Taiwan keywords
```text
Taiwan, Taiwanese, 台灣, 臺灣, TW, zh-TW, 繁體中文, 繁體
```

### Taiwan government domains
```text
data.gov.tw, gov.tw, moi.gov.tw, moea.gov.tw, mof.gov.tw,
mohw.gov.tw, cwa.gov.tw, ly.gov.tw, judicial.gov.tw, law.moj.gov.tw
```

### Taiwan finance
```text
TWSE, TPEx, TAIFEX, TDCC, FinMind, Fugle, 台股, 上市, 上櫃
```

### Taiwan real estate
```text
實價登錄, LVR, land.moi.gov.tw, 房價, 房地產, 土地, 預售屋
```

### Taiwan payment
```text
ECPay, NewebPay, 綠界, 藍新
```

### Taiwan language
```text
Taiwan Mandarin, Traditional Chinese, zh-TW, 注音, TOCFL
```

### GitHub search query examples (§6)
```text
mcp Taiwan
mcp 台灣
mcp 臺灣
mcp TWSE
mcp "實價登錄"
mcp "data.gov.tw"
mcp "立法院"
mcp "Taiwan Legal"
mcp ECPay
mcp NewebPay
mcp SHOPLINE
topic:mcp Taiwan
topic:model-context-protocol Taiwan
```

## Candidate Extraction (§7)
For each GitHub candidate, extract:
```text
repository_url, owner, name, description,
stars, forks, watchers,
created_at, updated_at, pushed_at,
license, language, topics, default_branch,
open_issues, archived, fork, homepage,
README content,
package.json, pyproject.toml, go.mod, Cargo.toml content
```

If present: server.json, mcp.json, manifest.json — parse them.
