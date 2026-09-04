# Algorithm: Crawl Coordinator & Scheduler

## Purpose

Orchestrate the full crawl pipeline (§3 System Architecture, §6.3 Pipeline).
Each stage must be recoverable, observable, retryable, and idempotent
(§21 Error Handling from Implementation Plan).

## Pipeline (§6.3, §6.6 Crawl Coordinator)
```text
Source
  ↓
Discover
  ↓
Fetch
  ↓
Normalize
  ↓
Dedup
  ↓
Classify
  ↓
Verify
  ↓
Score
  ↓
Persist
  ↓
Export
```

## Coordinator Interface (§6.6)
```go
type CrawlCoordinator struct {
    sources    []SourceAdapter
    normalizer Normalizer
    dedupEngine *DedupEngine
    classifier *TaiwanClassifier
    verifier  *VerificationEngine
    scorer    *QualityScorer
    store     *SQLiteStore
    exporter  *RegistryExporter
    config    *Config
    logger    *slog.Logger
}

func (c *CrawlCoordinator) Run(ctx context.Context, opts CrawlOptions) error
```

## Crawl Options
```go
type CrawlOptions struct {
    Source       string  // "github", "all", "glama", etc.
    FullCrawl    bool    // true = full, false = incremental
    Workers      int     // per-source worker pool
}
```

## Crawl Run ID (§37)
```text
crawl_id = YYYYMMDDTHHMMSSZ
```
e.g. `20260904T120000Z`

## Per-Stage Error Handling (§21, §41 Failure Isolation)
- Each stage catches its own errors
- Stage failure → record error, continue with next candidate/server
- Source adapter failure → mark source SOURCE_DEGRADED, continue
- Context cancellation propagates to all stages

## Concurrency Model (§23, §29)
- Each source has independent worker pool
- GitHub: 4 workers (rate-limited at 2 req/s)
- Glama: 2 workers
- PulseMCP: 2 workers
- MCP.so: 2 workers
- Registry: 2 workers
- Each source has independent rate limiter (§40)

## Incremental Crawl (§38, §27 TST-047, §28 TST-048)

### Tracking Fields
```text
last_seen     — when server was last seen by crawler
last_updated  — GitHub updated_at
last_verified — when server was last verified
etag          — for HTTP sources
last_modified — HTTP Last-Modified header
pushed_at     — GitHub push timestamp
```

### Logic
- Full crawl: scan all sources, process all candidates
- Incremental crawl: only fetch candidates where pushed_at/updated_at > last_seen
- If ETag matches previous: skip body download
- Unchanged repositories: not reprocessed
- Deleted repositories (404): marked DELETED, historical record retained

## Crawl Run Metadata (§37)
```json
{
  "crawl_id": "20260904T120000Z",
  "started_at": "...",
  "finished_at": "...",
  "sources_scanned": 5,
  "candidates_found": 1284,
  "candidates_normalized": 1250,
  "duplicates_removed": 542,
  "taiwan_candidates": 91,
  "verified": 742,
  "failed": 3,
  "errors": []
}
```

## Scheduler (§39)
Recommended cron schedule:
```text
06:00 — GitHub incremental
07:00 — Official Registry
08:00 — Glama
09:00 — PulseMCP
10:00 — MCP.so

Sunday 02:00 — Full Crawl (all sources)
```

**Note:** Crawler itself should NOT depend on scheduler. Scheduler runs externally
(cron, systemd timer, Kubernetes CronJob). Crawler exposes CLI for manual invocation.

## Observability Integration (§42, §43)
Before each stage: increment/start metrics
After each stage: record metrics + log structured event

### Structured Log Format
```json
{
  "level": "info",
  "component": "github",
  "crawl_id": "20260904T120000Z",
  "stage": "discover",
  "event": "candidate_discovered",
  "repository": "foo/bar"
}
```

### Forbidden in logs (§43):
API keys, OAuth tokens, passwords, Authorization headers.
