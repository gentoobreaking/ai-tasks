# Algorithm: Observability (Metrics + Logging)

## Purpose

Provide Prometheus metrics and structured JSON logging
(§42 Observability, §43 Logging).

## Metrics (§42)

All metrics must use Prometheus naming conventions.

### Counter Metrics
```text
crawler_candidates_total
  — Total candidates discovered (label: source)

crawler_candidates_taiwan_total
  — Candidates classified as Taiwan-related (label: level=T0..T5)

crawler_duplicates_total
  — Total duplicates removed

crawler_verification_success_total
  — Successful verifications (label: check_type=repository|endpoint|protocol)

crawler_verification_failed_total
  — Failed verifications (label: check_type, error_type)

crawler_source_errors_total
  — Source errors (label: source, error_type)

crawler_http_requests_total
  — HTTP request count (label: source, status_code, method)
```

### Gauge Metrics
```text
crawler_servers_total
  — Current total servers in registry (by level: T0..T5)

crawler_servers_healthy
  — Healthy server count

crawler_servers_unhealthy
  — Unhealthy server count
```

### Histogram Metrics
```text
crawler_crawl_duration_seconds
  — Total crawl duration (label: source)

crawler_http_request_duration_seconds
  — HTTP request duration (label: source, path, status_code)
```

## Logging (§43)

### Format: Structured JSON
```json
{
  "level": "info",
  "component": "github",
  "crawl_id": "20260904T120000Z",
  "event": "candidate_discovered",
  "repository": "foo/bar"
}
```

### Required Fields
- `level` — debug, info, warn, error
- `component` — github, glama, normalizer, dedup, classify, verify, scorer, storage, export
- `crawl_id` — current crawl run identifier
- `stage` — discover, fetch, normalize, dedup, classify, verify, score, persist, export
- `event` — specific event name
- `error` — error details (when applicable)
- `timestamp` — RFC3339 formatted

### Forbidden Fields (§43 Security)
```text
API Key
OAuth token
password
Authorization header
```

Any field matching these patterns MUST be redacted before logging.

## Error Context
All error logs must include:
- `source` — which adapter/source
- `candidate_id` or `server_id`
- `crawl_id`
- `stage`
- `error` — error message (no secrets)
- `timestamp`
