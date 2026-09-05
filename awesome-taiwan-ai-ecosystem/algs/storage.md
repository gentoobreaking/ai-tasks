# Algorithm: SQLite Storage

## Purpose

Persist MCPServer records and all related data to SQLite (§36 Storage Architecture).
Storage must be idempotent — same crawl run twice doesn't create duplicates (§TST-037).

## Schema Tables (§37, §18 Registry Schema Database Model)

### Core Tables
```sql
CREATE TABLE mcp_servers (
    id TEXT PRIMARY KEY,  -- sha256 hex canonical ID
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category JSON,        -- JSON array
    region JSON,          -- JSON array
    taiwan_relevance JSON, -- JSON object
    repository JSON,      -- JSON object
    endpoints JSON,       -- JSON array
    transport JSON,       -- JSON array
    tools JSON,           -- JSON array
    resources JSON,       -- JSON array
    prompts JSON,         -- JSON array
    data_sources JSON,    -- JSON array
    license TEXT,
    status TEXT,          -- ACTIVE, MAINTENANCE, STALE, DORMANT, ARCHIVED, DELETED, UNKNOWN
    quality JSON,         -- JSON object
    first_seen_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    last_verified_at TEXT,
    schema_version TEXT
);

CREATE TABLE sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,     -- github, glama, pulsemcp, mcpso, official-registry, etc.
    url TEXT,
    discovered_at TEXT,
    last_seen_at TEXT,
    trust_score REAL
);

CREATE TABLE server_sources (
    server_id TEXT NOT NULL,
    source_id INTEGER NOT NULL,
    PRIMARY KEY (server_id, source_id),
    FOREIGN KEY (server_id) REFERENCES mcp_servers(id),
    FOREIGN KEY (source_id) REFERENCES sources(id)
);

CREATE TABLE crawl_runs (
    crawl_id TEXT PRIMARY KEY,  -- e.g. 20260904T120000Z
    started_at TEXT,
    finished_at TEXT,
    sources_scanned INTEGER,
    candidates_found INTEGER,
    candidates_normalized INTEGER,
    duplicates_removed INTEGER,
    taiwan_candidates INTEGER,
    verified INTEGER,
    failed INTEGER,
    errors JSON
);

CREATE TABLE server_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id TEXT NOT NULL,
    crawl_id TEXT NOT NULL,
    snapshot JSON NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (server_id) REFERENCES mcp_servers(id),
    FOREIGN KEY (crawl_id) REFERENCES crawl_runs(crawl_id)
);

CREATE TABLE health_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id TEXT NOT NULL,
    crawl_id TEXT,
    status TEXT,        -- HEALTHY, DEGRADED, UNAVAILABLE, INVALID, UNKNOWN
    latency_ms INTEGER,
    checks JSON,        -- {repository: true, endpoint: true, tls: true, ...}
    checked_at TEXT,
    FOREIGN KEY (server_id) REFERENCES mcp_servers(id)
);

CREATE TABLE quality_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id TEXT NOT NULL,
    crawl_id TEXT,
    score INTEGER,
    grade TEXT,
    components JSON,
    calculated_at TEXT,
    FOREIGN KEY (server_id) REFERENCES mcp_servers(id)
);

CREATE TABLE security_findings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id TEXT NOT NULL,
    finding_type TEXT NOT NULL,
    severity TEXT,      -- LOW, MEDIUM, HIGH, CRITICAL, UNKNOWN
    source TEXT,
    location TEXT,
    evidence TEXT,
    detected_at TEXT,
    FOREIGN KEY (server_id) REFERENCES mcp_servers(id)
);

CREATE TABLE evidence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id TEXT NOT NULL,
    type TEXT NOT NULL,
    source TEXT,
    location TEXT,
    content_hash TEXT,
    matched_text TEXT,
    rule TEXT,
    score REAL,
    confidence REAL,
    timestamp TEXT,
    FOREIGN KEY (server_id) REFERENCES mcp_servers(id)
);

CREATE TABLE tools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    input_schema JSON,
    annotations JSON,
    UNIQUE(server_id, name),
    FOREIGN KEY (server_id) REFERENCES mcp_servers(id)
);

CREATE TABLE resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id TEXT NOT NULL,
    uri TEXT NOT NULL,
    name TEXT,
    description TEXT,
    mime_type TEXT,
    UNIQUE(server_id, uri),
    FOREIGN KEY (server_id) REFERENCES mcp_servers(id)
);

CREATE TABLE prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    UNIQUE(server_id, name),
    FOREIGN KEY (server_id) REFERENCES mcp_servers(id)
);

CREATE TABLE data_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    url TEXT,
    country TEXT,
    official BOOLEAN,
    access_method TEXT,
    UNIQUE(server_id, name),
    FOREIGN KEY (server_id) REFERENCES mcp_servers(id)
);

CREATE TABLE repositories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id TEXT NOT NULL,
    url TEXT,
    host TEXT,
    owner TEXT,
    name TEXT,
    stars INTEGER,
    forks INTEGER,
    watchers INTEGER,
    open_issues INTEGER,
    language TEXT,
    topics JSON,
    license TEXT,
    default_branch TEXT,
    archived BOOLEAN,
    fork BOOLEAN,
    homepage TEXT,
    created_at TEXT,
    updated_at TEXT,
    pushed_at TEXT,
    last_commit_at TEXT,
    status TEXT,
    UNIQUE(server_id),
    FOREIGN KEY (server_id) REFERENCES mcp_servers(id)
);

CREATE TABLE endpoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id TEXT NOT NULL,
    url TEXT NOT NULL,
    transport TEXT,
    protocol_version TEXT,
    tls BOOLEAN,
    status TEXT,
    UNIQUE(server_id, url),
    FOREIGN KEY (server_id) REFERENCES mcp_servers(id)
);
```

## Migration Strategy
- Migration files in `migrations/` directory
- Each migration: `001_create_mcp_servers.up.sql` / `001_create_mcp_servers.down.sql`
- Migrations are idempotent (§TST-005)
- Running migration twice produces no error

## Idempotency (§TST-037)
- Insert with ON CONFLICT DO UPDATE (upsert)
- Crawl run ID is deterministic per execution timestamp
- Server snapshots are append-only (never overwrite)
- Same crawl_id + same server_id → update, never duplicate
