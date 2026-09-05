# Algorithm: Domain Models

## Purpose

Define all Go structs for the Taiwan MCP Crawler domain model. Every struct must
marshal/unmarshal to/from JSON and SQLite.

## Structs (from §13 Normalized MCP Schema + §12 Candidate Schema + §5.1–5.5 Registry Schema)

### RawCandidate (§12)
```go
type RawCandidate struct {
    Source        string         // "github", "glama", "pulsemcp", "mcpso", "official-registry"
    SourceURL     string         // URL of the candidate in the source
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

### MCPServer (§13)
```go
type MCPServer struct {
    ID              string           // sha256 hex
    Name            string
    Slug            string           // kebab-case name
    Description     string
    Category        []string         // from controlled vocabulary (§19)
    Region          []string         // e.g. ["TW"]
    TaiwanRelevance TaiwanRelevance
    Repository      RepositoryInfo
    Endpoints       []Endpoint
    Transport       []string         // stdio, sse, streamable-http, http, websocket, unknown
    Tools           []Tool
    Resources       []Resource
    Prompts          []Prompt
    DataSources      []DataSource
    License          string
    Status           Status           // ACTIVE, MAINTENANCE, STALE, DORMANT, ARCHIVED, DELETED, UNKNOWN
    Quality          QualityScore
    Sources          []SourceReference
    FirstSeen        time.Time
    LastSeen         time.Time
    LastVerified     time.Time
}
```

### TaiwanRelevance (§14)
```go
type TaiwanRelevance struct {
    Score     float64
    Level     string  // T0–T5
    Evidence  []Evidence
    Confidence float64
}
```

### RepositoryInfo (§7 Repository Schema)
```go
type RepositoryInfo struct {
    URL           string
    Host          string
    Owner         string
    Name          string
    Stars         int
    Forks         int
    Watchers      int
    OpenIssues    int
    Language      string
    License       string
    Topics          []string
    DefaultBranch   string
    Archived        bool
    Fork            bool
    Homepage        string
    CreatedAt       time.Time
    UpdatedAt       time.Time
    PushedAt        time.Time
    LastCommitAt    time.Time
}
```

### Endpoint (§8 Endpoint Schema)
```go
type Endpoint struct {
    URL            string
    Transport        string  // stdio, sse, streamable-http, http, websocket, unknown
    ProtocolVersion  string
    Authentication   AuthenticationInfo
    TLS             bool
    Status          string  // unknown, reachable, etc.
}
```

### Tool (§9.1)
```go
type Tool struct {
    Name        string
    Description string
    InputSchema map[string]any
    Annotations ToolAnnotations
}

type ToolAnnotations struct {
    ReadOnly    bool
    Destructive  bool
}
```

### Resource (§9.2)
```go
type Resource struct {
    URI         string
    Name        string
    Description string
    MIMEType    string
}
```

### Prompt (§9.3)
```go
type Prompt struct {
    Name        string
    Description string
}
```

### DataSource (§10)
```go
type DataSource struct {
    Name          string
    Type          string  // official-government-api, official-company-api, government-open-data, third-party-api, web-scraping, database, static-dataset, unknown
    URL           string
    Country       string
    Official      bool
    AccessMethod  string
}
```

### Evidence (§16, §5.4 Registry Schema Evidence, §66 Data Provenance)
```go
type Evidence struct {
    Type          string  // official_domain, repository_keyword, data_source, etc.
    Source        string  // README, package.json, manifest, mcp_protocol, etc.
    Location      string  // file path or URL
    ContentHash   string  // sha256 of matched text
    MatchedText   string
    Rule          string  // scoring rule name that produced this evidence
    Score         float64 // weight contributed
    Confidence     float64
    Timestamp     time.Time
}
```

### QualityScore (§15 Registry Schema Quality)
```go
type QualityScore struct {
    Score      int     // 0–100
    Grade      string  // A–F
    Components QualityComponents
}

type QualityComponents struct {
    DataSource    int  // max 20
    Maintenance   int  // max 15
    Documentation  int  // max 10
    MCPCompliance  int  // max 15
    ToolSchema    int  // max 10
    Health        int  // max 10
    Repository    int  // max 5
    License       int  // max 5
    Security      int  // max 5
    Community     int  // max 5
}
```

### SourceReference (§16 Discovery Source)
```go
type SourceReference struct {
    Source       string  // github, glama, pulsemcp, mcpso, official-registry, manual, recursive
    URL          string
    DiscoveredAt time.Time
    LastSeen     time.Time
    TrustScore   float64 // §64 Source Trust: official=1.0, github=0.95, glama=0.85, pulsemcp=0.80, mcpso=0.75
}
```

### Additional Types
- `Status` — string enum: ACTIVE, MAINTENANCE, STALE, DORMANT, ARCHIVED, DELETED, UNKNOWN
- `AuthenticationInfo` — { Required: bool, Type: string }
- `SecurityFinding` — { Type, Severity (LOW/MEDIUM/HIGH/CRITICAL/UNKNOWN), Source, Location, Evidence }

## Scoring Constants

### Taiwan Relevance Deterministic Score (§17)
| Rule              | Points |
|-------------------|--------|
| official Taiwan domain       | +40 |
| Taiwan government API        | +40 |
| Taiwan financial API         | +35 |
| Taiwan-specific dataset      | +30 |
| Taiwan-specific keyword      | +20 |
| Taiwan language              | +15 |
| Taiwan company/service       | +15 |
| README Taiwan mention        | +5 |

### Relevance Level Thresholds (§17)
| Score >= | Level |
|----------|-------|
| 70       | T5    |
| 55       | T4    |
| 40       | T3    |
| 20       | T2    |
| 5        | T1    |
| < 5      | T0    |

### Quality Score Weights (§31)
| Component | Max |
|-----------|-----|
| Data Source | 20 |
| Maintenance | 15 |
| Documentation | 10 |
| MCP Compliance | 15 |
| Tool Schema | 10 |
| Health | 10 |
| Repository | 5 |
| License | 5 |
| Security | 5 |
| Community | 5 |
| **Total** | **100** |

### Data Source Score (§32)
| Source Type | Score |
|-------------|-------|
| Official Taiwan API | 20 |
| Government OpenData | 18 |
| Official company API | 15 |
| Known third-party API | 10 |
| Web scraping | 7 |
| Unknown | 0 |

## Notes
- All enums use string constants, not iota.
- All time fields use RFC3339 format in JSON.
- JSON field names use snake_case per spec examples.
