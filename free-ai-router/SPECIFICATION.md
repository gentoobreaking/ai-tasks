# FreeModel Router — Development Specification v1.0

## Project Name
**freemodel-router** (`freemodel` CLI binary, Go module `github.com/freemodel/router`)

A high-performance, free-tier-only AI model router that discovers, pings, and routes requests to the best available free LLM, with an interactive TUI for live model health monitoring.

---

## 1. Overview

FreeModel Router combines the best of two proven open-source projects:

| Aspect | Source Project | Adaptation |
|---|---|---|
| TUI rendering & live model table | **free-router** (TypeScript/ANSI) | Rebuilt in Go using raw terminal I/O |
| Config schema & provider model catalog | **modelrelay** (Node.js) | Adopted as-is; expanded with coding filter |
| OpenAI-compatible proxy routing | **modelrelay** (Express) | Rebuilt in Go `net/http` with connection pooling |
| Provider auto-discovery & multi-key round-robin | **modelrelay** | Adopted |
| Failover retry on 429/5xx | **modelrelay** | Enhanced with sub-second retry |
| Target handoff (OpenCode/OpenClaw/Hermes) | **free-router** | Adopted, plus Pi agent |

### Core Value Proposition
- **100% free**: Only free-tier models, no paid APIs required
- **Live TUI**: Parallel pings every 2s with real-time latency, uptime, verdict
- **Smart routing**: QoS-based model selection with automatic failover
- **Multi-agent support**: OpenCode, OpenClaw, Hermes, and Pi agent
- **Coding filter**: Only models flagged with coding capability are eligible by default

---

## 2. Architecture

```
freemodel-router (Go binary)
├── cmd/freemodel/          # CLI entry point (main.go)
├── internal/
│   ├── config/             # Config I/O (~/.freemodel-router.json)
│   ├── providers/          # Provider definitions, discovery, auth
│   ├── models/             # Model catalog, aliasing, quality scoring
│   ├── ping/               # Parallel ping engine with keep-alive pool
│   ├── router/             # OpenAI-compatible HTTP reverse proxy
│   ├── tui/                # Interactive terminal UI (ANSI raw mode)
│   ├── targets/            # Config writers for agent targets
│   ├── tags/               # Capability tags (coding, reasoning, etc.)
│   └── cli/                # CLI argument parsing, commands
├── data/
│   ├── sources.json        # Provider definitions (from modelrelay sources.js)
│   ├── scores.json         # Offline model quality fallbacks (from modelrelay scores.js)
│   └── model-tags.json     # Built-in capability tags (from modelrelay tags.js)
└── go.mod
```

### Design Principles
1. **Zero runtime dependencies**: Only Go standard library (except optional `golang.org/x/term` for raw mode)
2. **Single binary**: Compiled, no Node.js/Python required
3. **Concurrent everything**: Ping loop uses goroutine pool; HTTP proxy uses concurrent upstream requests
4. **Connection reuse**: Shared `http.Transport` with keep-alive and connection pooling per provider host
5. **Fail-fast failover**: Proxy retries on 429/5xx with 50ms backoff, cycling to next-best model

---

## 3. Provider System

### 3.1 Provider Sources (adapted from modelrelay `sources.js`)

The provider catalog mirrors modelrelay's `sources.js` structure exactly:

```json
{
  "nvidia": {
    "name": "NIM",
    "url": "https://integrate.api.nvidia.com/v1/chat/completions",
    "discoverable": true,
    "models": [["model/id", "Display Name", "128k"], ...]
  },
  "groq": { ... },
  "cerebras": { ... },
  "opencode": { ... },
  "openai-compatible": { "name": "OpenAI-Compatible", "url": "", "models": [] },
  "ollama": { ... },
  "openrouter": { ... },
  "codestral": { ... },
  "scaleway": { ... },
  "kilocode": { ... },
  "kiro": { ... },
  "googleai": { ... }
}
```

**Note**: All providers from modelrelay are supported. The `openai-compatible` and `ollama` providers support dynamic instance configuration (multiple endpoints).

### 3.2 Environment Variable Overrides (adapted from modelrelay `config.js`)

| Provider Key | Env Var |
|---|---|
| nvidia | `NVIDIA_API_KEY` |
| groq | `GROQ_API_KEY` |
| cerebras | `CEREBRAS_API_KEY` |
| opencode | `OPENCODE_API_KEY` |
| openrouter | `OPENROUTER_API_KEY` |
| openai-compatible | `OPENAI_COMPATIBLE_API_KEY` |
| ollama | `OLLAMA_API_KEY` / `OLLAMA_BASE_URL` / `OLLAMA_MODEL` |
| codestral | `CODESTRAL_API_KEY` |
| scaleway | `SCALEWAY_API_KEY` |
| kilocode | `KILOCODE_API_KEY` |
| googleai | `GOOGLE_API_KEY` |
| new-api | `NEW_API_API_KEY` |
| siliconflow | `SILICONFLOW_API_KEY` |

### 3.3 Provider Discovery

Providers marked `"discoverable": true` (nvidia, groq, cerebras, openrouter, googleai, siliconflow, new-api) support dynamic model discovery by probing `GET /v1/models` at the provider's base URL. Discovered models are merged into the static catalog, with static entries taking precedence (preserving curated quality scores).

Discovery intervals:
- **OpenRouter**: 60 minutes
- **OpenCode Zen**: 60 minutes
- **KiloCode**: 30 minutes
- **Ollama**: 60 minutes
- **OpenAI-Compatible endpoints**: 30 minutes
- **Discoverable providers (NIM, Groq, Cerebras, Google AI)**: 30 minutes

### 3.4 Multi-Account Round-Robin

API key values in config can be a string or an array of strings. When an array is configured, the router rotates through accounts in round-robin fashion. A `maxTurns` field per provider configures proactive rotation before rate limits are hit.

### 3.5 Free-Tier Enforcement

Only models with **zero-cost pricing** are included. The ping layer sends a minimal `max_tokens: 1` chat completion probe:

- **HTTP 200**: Model is reachable and free (pricing prompt/completion = "0")
- **HTTP 401**: Key missing/invalid (model may be free but needs auth)
- **HTTP 429**: Rate limited
- **HTTP 404/5xx**: Model unavailable

OpenRouter models are filtered at discovery time to only include those with `pricing.prompt === "0"` and `pricing.completion === "0"`.

---

## 4. Coding Capability Filter

### 4.1 Tag Vocabulary

```go
var TagVocabulary = []string{"coding", "reasoning", "general", "fast", "agentic"}
```

Each model receives built-in tags from `data/model-tags.json` (adapted from modelrelay's `tags.js`), which are curated by maintainers. User-defined tags can also be added via the TUI or API.

### 4.2 Coding Filter (Requirement #8)

By default, **only models tagged with `coding`** are eligible for routing. This filter can be configured:

- **TUI**: Press `C` to toggle "Coding-only mode" on/off
- **CLI flag**: `--all-models` disables the filter
- **Config**: `codingOnly: true` in config file

Models without the `coding` tag (e.g., pure reasoning or general chat models) are hidden from routing when coding-only mode is enabled, but still appear in the TUI with a dimmed indicator.

### 4.3 Model Quality Scoring (adapted from modelrelay)

Scoring hierarchy (in priority order):

1. **Artificial Analysis coding index** (from OpenRouter catalog, `benchmarks.artificial_analysis.coding_index / 100`)
2. **Design Arena Elo → coding score** (linear regression from catalog models that have both values)
3. **Metadata heuristic** (popularity, recency, features, context length)
4. **scores.json offline fallback** (pre-baked SWE-bench % scores)
5. **Default 0.45** (when no data available)

SWE-bench tiers (adapted from free-router):

| Tier | SWE-bench Score | Description |
|---|---|---|
| S+ | >= 70% | Elite frontier |
| S | 60–70% | Excellent |
| A+ | 50–60% | Great |
| A | 40–50% | Good |
| A- | 35–40% | Decent |
| B+ | 30–35% | Average |
| B | 20–30% | Below average |
| C | < 20% | Lightweight / edge |

---

## 5. Ping Engine

### 5.1 Architecture (adapted from free-router)

The ping engine continuously measures model latency by sending minimal chat completion requests (`max_tokens: 1`).

### 5.2 Parallel Ping Loop

- **Interval**: Every 2 seconds (configurable via `W`/`X` keys)
- **Concurrency**: Initial pass at 64 concurrent pings; steady state at 20 concurrent
- **Timeout**: Initial pass 2.5s; steady state 6s
- **History cap**: 100 ping entries per model (rolling window)

### 5.3 Connection Performance (Requirement #6)

- **Keep-alive transport**: A shared `http.Transport` per provider host with `MaxIdleConns=200`, `MaxIdleConnsPerHost=100`, `IdleConnTimeout=90s`
- **Connection pool isolation**: Each provider's base URL gets its own transport to prevent noisy-neighbor effects
- **TTFB measurement**: Latency is measured as time-to-first-byte (status code received), not full response time
- **Response draining**: Response bodies are drained and closed immediately after reading the status code for ping probes, returning sockets to the pool

### 5.4 Progressive Backoff

Models that fail consecutively are progressively backed off:

| Consecutive Failures | Skip Rounds |
|---|---|
| 3+ | Skip 1 round |
| 4+ | Skip 2 rounds |
| 5+ | Skip 4 rounds |
| 6+ | Skip 8 rounds |
| 7+ | Skip 16 rounds (max) |

### 5.5 Staleness Guard

An epoch counter tracks ping cycles. When an epoch bumps (e.g., interval change, config reload), all in-flight results from the old epoch are discarded to prevent stale data polluting the display.

### 5.6 QoS Tracking

Per-model rolling metrics:
- **Avg latency**: Moving average of HTTP 200 latencies only
- **Uptime %**: (200-count / total-count) * 100 over the rolling window
- **Status**: up, noauth, forbidden, ratelimit, unavailable, notfound, timeout, down, pending, banned, disabled, excluded
- **Verdict**: Derived from status + avg latency thresholds

---

## 6. TUI Design (adapted from free-router)

### 6.1 Rendering Model

The TUI uses **raw ANSI escape sequences** written directly to stdout, with the terminal in raw mode. This approach (from free-router) provides:

- **No external dependencies** for rendering (pure Go + `x/term` for raw mode)
- **Alt-screen buffer** (`CSI ? 1049 h`) for full-screen mode
- **Focus tracking** (`CSI ? 1004 h`) to defer redraws when terminal is blurred
- **Manual cursor management** for sub-30ms redraw latency

### 6.2 Terminal Lifecycle

1. Enter alternate screen buffer + enable focus events + hide cursor
2. Set raw mode on stdin
3. Register SIGINT/SIGTERM/SIGWINCH handlers
4. On exit: restore terminal state

### 6.3 Layout

```
┌─ provider tags: NIM ✓  OpenRouter:✗  Groq:○ ───────────────────────────┐
│ Model Search  /query_                          842/1024 models       │
│ Selected: nvidia/deepseek-ai/deepseek-v3.2  SWE:72.3%  Code:✓        │
├────┬──────────┬─────────┬─────────────────────────────┬──────┬────┬───┤
│ #  │  Tier    │ Provider│ Model                       │ Ctx  │Avg │Lat│Up%│Verdict │
├────┴──────────┴─────────┴─────────────────────────────┴──────┴────┴───┤
│ >  1   S+     NIM      DeepSeek V3.2                 128k  342ms   │
│    2   S+     OpenR.   Kimi K2.5                     128k  410ms   │
│    ...                                              ...            │
└─────────────────────────────────────────────────────────────────────┘
 ↑↓/jk:nav  PgUp/PgDn:page  /:search  Enter:configure  A:key  ?:help  q:quit
```

### 6.4 Columns (adapted from free-router)

| Column | Width | Description |
|---|---|---|
| `#` | 5 | Rank (right-aligned, `>` prefix for selected) |
| `Tier` | 6 | Capability tier S+ → C (color-coded) |
| `Provider` | 13 | NIM, OpenRouter, Groq, etc. |
| `Model` | 34 | Display name (truncated to fit) |
| `Ctx` | 7 | Context window (7k, 32k, 128k, 1M) |
| `Bench` | 6 | Arena Elo / intelligence score |
| `Avg` | 8 | Rolling average latency (right-aligned) |
| `Lat` | 8 | Latest ping latency (right-aligned, color-coded) |
| `Up%` | 6 | Uptime percentage (right-aligned, color-coded) |
| `Verdict` | 16 | ✓ Perfect / x Slow / x Overloaded / - Pending |

### 6.5 Status Dots (adapted from free-router)

| Symbol | Color | Meaning |
|---|---|---|
| `*` | Green | Up (HTTP 200) |
| `!` | Yellow | No auth (401) |
| `!` | Red | Forbidden (403) |
| `~` | Orange | Rate limited (429) |
| `#` | Red | Unavailable (503) |
| `?` | Red | Not found (404) |
| `o` | Red | Timeout |
| `x` | Red | Down (5xx) |
| `.` | Dim | Pending/no data |

### 6.6 Provider Status Tags (top bar)

Right-aligned status badges for each provider:
- **READY** (green bg): Key exists and healthy
- **NO KEY** (yellow bg): Key missing
- **WRONG KEY** (red bg): Key exists but all models rejecting auth
- **OFF** (dim bg): Provider toggled off

### 6.7 Verdict Legend

| Verdict | Trigger |
|---|---|
| ✓ Perfect | Avg < 400ms |
| ✓ Normal | Avg < 1000ms |
| x Slow | Avg < 3000ms |
| x Very Slow | Avg < 5000ms |
| x Unusable | Avg >= 5000ms |
| x Overloaded | HTTP 429 |
| x Unstable | Was up, now failing |
| x Not Active | Never responded |
| - Pending | Waiting for first success |

### 6.8 Keyboard Shortcuts

| Key | Action |
|---|---|
| ↑↓ / j k | Navigate models |
| PgUp / PgDn | Page up/down |
| g | Jump to top |
| G | Jump to bottom |
| `/` | Toggle search (Enter configures target, ESC clears) |
| Enter | Configure current model for a target agent |
| `A` | Quick API key add/change |
| `R` | Edit API key for rejected provider |
| `P` | Settings screen (keys, provider toggles, test pings) |
| `T` | Cycle tier filter: All → S+ → S → A+ → ... |
| `C` | Toggle coding-only filter |
| `W` / `X` | Decrease / increase ping interval |
| `N` | Cycle provider filter: All → NIM → OpenRouter → ... |
| `0-9` | Sort by column (press again to reverse) |
| `?` | Help overlay |
| `q` / Ctrl+C | Quit |

### 6.9 Sort Columns

| Key | Column | Sort Key |
|---|---|---|
| `0` | Priority (default) | status → tier → avg latency → uptime → provider → model |
| `1` | Tier | S+ → S → A+ → ... → C |
| `2` | Provider | Alphabetical |
| `3` | Model | Alphabetical |
| `4` | Avg latency | Lowest first |
| `5` | Latest ping | Fastest first |
| `6` | Uptime % | Highest first |
| `7` | Context window | Smallest first |
| `8` | Verdict | Best to worst |
| `9` | Intelligence | Highest first |

### 6.10 Auto-Sort Pause

When the user actively navigates (arrow keys), auto re-sorting is paused for `scrollSortPauseMs` (default 1500ms, configurable in config). This prevents row-jumping while browsing.

### 6.11 Render Throttling

Render calls are throttled to ~30fps (33ms interval) to prevent terminal overwhelm during rapid input. A trailing render ensures the final cursor position is always shown.

### 6.12 First-Run Wizard

On first launch (no config file found), the TUI enters a wizard that:
1. Shows a welcome screen with the freemodel-router ASCII art
2. For each provider, offers: "Open browser + enter key" / "Enter key manually" / "Skip"
3. Auto-opens the signup URL for the selected provider
4. Validates key format (prefix check)
5. Saves config and starts the TUI

### 6.13 Settings Screen (`P`)

```
free-router Settings
  ↑↓:navigate  Enter:edit key  Space:toggle  T:test  D:delete  ESC/Q:back

  [ON]  NVIDIA NIM     nvapi-...****  [342ms 200 ✓]
  [ON]  OpenRouter    sk-or-...****  [410ms 200 ✓]
  [OFF] Groq          (no key)
  ...
```

Features:
- Toggle provider enabled/disabled (Space)
- Edit API key inline (Enter) — masked input with bullet characters
- Live test ping for current provider (T)
- Delete key (D)
- Auto-opens signup page when navigating to a provider with no key

### 6.14 Target Picker

Pressing Enter on a model opens a modal with target choices:
- **OpenCode** → writes `~/.config/opencode/opencode.json`
- **OpenClaw** → writes `~/.openclaw/openclaw.json`
- **Hermes Agent** → writes `~/.hermes/config.yaml`
- **Pi Agent** → writes `~/.pi/pi.json`

Each option shows "Save + Launch" (if the agent binary is installed) and "Save config only".

### 6.15 Help Overlay (`?`)

A full-screen overlay listing all keyboard shortcuts, sort columns, tier definitions, and verdict descriptions. Uses the same chrome as the main TUI.

---

## 7. Router Proxy Server

### 7.1 Core Design (adapted from modelrelay)

The router is an **OpenAI-compatible reverse proxy** that listens on `http://127.0.0.1:<port>` (default 7352). It intercepts `/v1/chat/completions` and `/v1/models` requests, selects the best available upstream model based on live QoS data, and proxies the request.

### 7.2 Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/models` | List all routable models (grouped, with tags) |
| `POST` | `/v1/chat/completions` | Chat completion (proxied to best backend) |
| `GET` | `/` | Static web UI (minimal single-page TUI launcher) |
| `GET` | `/api/models` | Full model list with live ping data |
| `GET` | `/api/config` | Current provider configuration |
| `GET` | `/api/meta` | Version, update availability |
| `GET` | `/api/pinned` | Currently pinned model |
| `POST` | `/api/pinned` | Set/clear pinned model |
| `GET` | `/api/auto-ping` | Auto-ping status |
| `POST` | `/api/auto-ping` | Toggle auto-ping |
| `POST` | `/api/config` | Update provider config (key, enabled, etc.) |
| `POST` | `/api/models/ban` | Ban/unban a model |
| `POST` | `/api/models/ping` | Trigger immediate ping for a model |
| `POST` | `/api/providers/:key/refresh` | Refresh a provider's model list |
| `POST` | `/api/providers/refresh-all` | Refresh all providers |
| `POST` | `/api/config/import` | Import config from token |
| `GET` | `/api/config/export` | Export config as token |
| `GET` | `/api/account-status` | Multi-account rotation state |
| `GET` / `POST` | `/api/autoupdate` | Auto-update settings |
| `PUT` | `/api/models/tags` | Set user-defined tags |
| `GET` | `/api/filter-rules` | Min score, excluded providers |
| `POST` | `/api/filter-rules` | Update filter rules |
| `GET` | `/api/logs` | Recent request logs |

### 7.3 Request Routing Logic

When a `POST /v1/chat/completions` request arrives:

1. Parse the requested model from the payload:
   - `auto-fastest` → route to best overall model (QoS-ranked)
   - `minimax-m2.5` → route to best model in that group (across providers)
   - `tag:coding` → route to best model with the `coding` tag
   - `provider/model-id` → route to exact match (with failover)
   - `<specific model id>` → match by group alias or exact ID

2. Filter eligible models:
   - Must be `status: up` (not banned, disabled, excluded)
   - If coding-only mode is enabled, must have `coding` tag
   - Must pass `minSweScore` floor if configured
   - Must not be in `bannedModels` list

3. Compute QoS for each eligible model:
   ```
   QoS = qualityScore × availabilityMultiplier(uptime) + pingTieBreaker
   ```
   - `qualityScore`: normalized 0–1 from model quality hierarchy (§4.3)
   - `availabilityMultiplier`: 1.0 (≥95% uptime), 0.9 (85%), 0.6 (70%), 0.2 (<70%)
   - `pingTieBreaker`: `max(0, 1000 - avgLatency) / 1000`

4. Rank by QoS descending, pick top candidate.

5. Resolve API key (env var > config > multi-account pool rotation).

6. Forward request to provider's `/v1/chat/completions` endpoint with the resolved model ID and Bearer auth.

### 7.4 Automatic Failover (Requirement #6)

On upstream failure (HTTP 5xx, 429, or connection error):

1. Mark the failed model/provider as rate-limited or down
2. Re-rank remaining eligible models (same QoS, recompute)
3. Retry with the next-best model (up to `MAX_PROACTIVE_RETRIES = 5`)
4. Retry backoff: 50ms between attempts (sub-second failover)
5. If all models fail, return HTTP 503 with error details

**Connection performance optimizations for failover:**
- Each failover attempt uses a **fresh keep-alive connection** from the pool (no TLS handshake on retry if same host)
- If the failed model is on the same provider host, the next retry may reuse the same connection
- If switching providers, the per-host transport caches the new connection
- Rate-limited accounts (429) are marked with a 60-second cooldown and skipped in the rotation

### 7.5 Streaming Support

Both streaming (`stream: true`) and non-streaming responses are proxied transparently. For streaming, a `Transform` stream pipes the upstream SSE stream to the client while capturing TTFB, usage tokens, and response content for logging.

### 7.6 Model Pinning

Users can pin a specific model so all requests route to it (with failover only on hard failures). Two modes:
- **Canonical** (default): Pins the model group (all provider variants of the same model)
- **Exact**: Pins a single provider+model combination

### 7.7 Request Logging

Request logs are persisted to `~/.freemodel-router-logs.json` (max 200 entries, mode 0600). Each entry includes:
- Timestamp, resolved model/provider
- Duration, TTFB, HTTP status
- Message content (truncated for errors, full for debug mode)
- Tool calls and usage tokens
- Retry attempts with status codes

---

## 8. TUI Ping Integration (Requirement #3)

The TUI and router server share the same ping state. When running interactively, the TUI drives the ping loop directly. When running as a background router (`freemodel start`), the router's internal scheduler drives pings.

### 8.1 Ping-to-TUI Data Flow

```
Ping Loop (every 2s)
  ├── pingAllOnce(models)  [parallel goroutines]
  │   ├── For each model: HTTP POST /v1/chat/completions
  │   ├── Apply result → model.pings[], model.status, model.httpCode
  │   └── Update rolling metrics (avg, uptime, verdict)
  └── onUpdate() callback → re-sort models → renderTUI()
```

### 8.2 Live Updates

- Each individual ping completion triggers a **throttled render** (300ms throttle) updating the status dot, latency value, and avg in-place — without re-sorting
- Each completed ping round triggers a **full re-render** with re-sort if auto-sort is not paused (user actively navigating)

### 8.3 Rendering While Blurred

When the terminal loses focus (via OSC 1014 focus tracking):
- Renders are deferred (not skipped)
- A `renderDeferredWhileBlurred` flag is set
- On focus-in, a single deferred render fires
- This prevents background-tab blinking without losing data freshness

---

## 9. Config Schema

### 9.1 Config File Location
`~/.freemodel-router.json` (mode 0600)

### 9.2 Schema

```json
{
  "apiKeys": {
    "nvidia": "nvapi-xxx",
    "openrouter": ["sk-or-xxx", "sk-or-yyy"],
    "openai-compatible:my-vllm": "sk-xxx"
  },
  "providers": {
    "nvidia": {
      "enabled": true
    },
    "openrouter": {
      "enabled": true
    },
    "openai-compatible:my-vllm": {
      "enabled": true,
      "name": "Local vLLM",
      "baseUrl": "http://localhost:8000/v1",
      "modelId": "qwen-coder",
      "discoverModels": true,
      "maxTurns": 20
    },
    "ollama": {
      "enabled": true,
      "name": "My Ollama",
      "baseUrl": "http://127.0.0.1:11434",
      "modelId": "llama3",
      "discoverModels": false
    },
    "kiro": {
      "enabled": true,
      "refreshToken": "aorAAAAA...",
      "authMode": "manual-token"
    }
  },
  "bannedModels": [],
  "autoUpdate": {
    "enabled": true,
    "intervalHours": 24,
    "lastCheckAt": "2026-08-03T12:59:59Z",
    "lastUpdateAt": null,
    "lastVersionApplied": null,
    "lastError": null
  },
  "minSweScore": null,
  "excludedProviders": [],
  "pinningMode": "canonical",
  "modelTags": {
    "deepseek-ai/deepseek-v3.2": ["coding", "my-custom-tag"]
  },
  "autoPingEnabled": true,
  "codingOnly": true,
  "ui": {
    "scrollSortPauseMs": 1500
  }
}
```

### 9.3 Config Operations

| Operation | Priority |
|---|---|
| Environment variable | Highest |
| Config file (`~/.freemodel-router.json`) | Medium |
| Keyless ping (latency only, no auth) | Fallback |

Config export/import uses a base64url-encoded token format: `mrconf:v1:<base64url(json)>`, compatible with modelrelay's token format for interoperability.

---

## 10. CLI Commands

### 10.1 Main Commands

```bash
freemodel                           # Interactive TUI (default)
freemodel start [--port 7352]       # Start router server (background mode)
freemodel onboard                   # Interactive key setup wizard
freemodel --best                    # Non-interactive: print best model ID
freemodel status                     # Show provider/account status
freemodel update                     # Manual update check & apply
freemodel refresh-scores             # Re-fetch model quality scores from OpenRouter
freemodel config export              # Print config as transfer token
freemodel config import <token>      # Import config from token
freemodel config set-keys <provider> <key1,key2,...>
freemodel config add-key <provider> <key>
freemodel config remove-key <provider> <key|index>
freemodel config set-maxturns <provider> <number>
freemodel autoupdate [--enable|--disable|--status] [--interval <hours>]
freemodel autostart [--install|--start|--uninstall|--status]
```

### 10.2 Flags

| Flag | Description |
|---|---|
| `--port <n>` | Router HTTP port (default: 7352) |
| `--log` | Enable request payload logging |
| `--no-log` | Disable request logging (default) |
| `--ban <ids>` | Comma-separated model IDs to ban |
| `--all-models` | Disable coding-only filter (show all free models) |
| `--onboard` | Same as `onboard` subcommand |
| `--help` / `-h` | Show help |
| `--version` / `-v` | Show version |

### 10.3 `--best` Mode

Non-interactive mode that pings all models for 4 rounds and prints the best model ID to stdout. Designed for scripting:

```bash
# Print best model ID after ~10s analysis
freemodel --best

# Capture in a variable
MODEL=$(freemodel --best)
```

Selection tri-key sort: status=up → lowest avg latency → highest uptime.

---

## 11. Target Agent Integration (Requirement #7)

### 11.1 OpenCode

Config file: `~/.config/opencode/opencode.json`

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "router": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "freemodel",
      "options": {
        "baseURL": "http://127.0.0.1:7352/v1",
        "apiKey": "dummy-key"
      },
      "models": {
        "auto-fastest": { "name": "Auto Fastest" }
      }
    }
  },
  "model": "router/auto-fastest"
}
```

**Launch**: `freemodel` sets `OPENCODE_CLI_RUN_MODE=true` in the child environment to reduce startup noise.

### 11.2 OpenClaw

Config file: `~/.openclaw/openclaw.json`

```json
{
  "models": {
    "providers": {
      "freemodel": {
        "baseUrl": "http://127.0.0.1:7352/v1",
        "api": "openai-completions",
        "apiKey": "no-key",
        "models": [{ "id": "auto-fastest", "name": "Auto Fastest" }]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": { "primary": "freemodel/auto-fastest" },
      "models": { "freemodel/auto-fastest": {} }
    }
  }
}
```

### 11.3 Hermes Agent

Config file: `~/.hermes/config.yaml`

```yaml
model:
  provider: freemodel
  default: auto-fastest
```

API key optionally written to `~/.hermes/.env` (only if `ALLOW_PLAINTEXT_KEY_EXPORT=1`).

### 11.4 Pi Agent

Config file: `~/.pi/pi.json`

```json
{
  "model_list": [
    {
      "model_name": "freemodel",
      "model": "openai/auto-fastest",
      "api_base": "http://127.0.0.1:7352/v1"
    }
  ],
  "agents": {
    "defaults": {
      "model_name": "freemodel"
    }
  }
}
```

**Note**: Pi Agent uses the same OpenClaw-style provider config format, with `model_name` as the key instead of provider name.

### 11.5 Fallback Behavior

- If a selected model is not supported by the target agent, fall back to NVIDIA NIM `deepseek-ai/deepseek-v4-pro`
- If a model has a known provider remap (e.g., Stepfun → OpenRouter on models.dev), use the remapped provider
- If the effective provider key is missing a key, prompt: "Add API key now? (Y/n, default: Y)"
- Existing target configs are backed up with timestamped suffixes before writing

---

## 12. Auto-Update & Autostart

### 12.1 Auto-Update

- Checks npm/GitHub releases every 24 hours (configurable)
- Applies updates by downloading the new binary and restarting
- When running from source (git), auto-update is disabled (manual `git pull`)
- Can override update source for local testing via `FREMODEL_UPDATE_TARBALL`

### 12.2 Autostart

Supports:
- **macOS**: Launches via `launchctl` plist at `~/Library/LaunchAgents/`
- **Linux**: Creates `~/.config/autostart/freemodel-router.desktop` (XDG)
- **Windows**: Registers with Task Scheduler or Startup folder

Commands:
```bash
freemodel autostart --install    # Enable start-on-login
freemodel autostart --start      # Start now
freemodel autostart --uninstall  # Disable
freemodel autostart --status     # Check status
```

### 12.3 Status Command

```bash
freemodel status
```

Shows:
- Configured providers and their account pools
- Live request counts and rate-limit status (if router is running)
- Current autostart and auto-update state

---

## 13. Testing Strategy

### 13.1 Unit Tests

Go standard library `testing` package:

| Test File | Coverage |
|---|---|
| `config_test.go` | Config load/save, normalizeConfigShape, legacy migration |
| `utils_test.go` | getAvg, getUptime, getVerdict, sortModels, filterByTier, filterBySearch, findBestModel |
| `tags_test.go` | Tag normalization, getModelTags, setModelTags |
| `models_test.go` | Model aliasing, canonicalization, quality score resolution |
| `cli_test.go` | Arg parsing for all CLI flags and subcommands |
| `ping_test.go` | Ping result status mapping, backoff logic, staleness guard |

### 13.2 Integration Tests

| Test | Description |
|---|---|
| `tui_render_test.go` | Mock terminal captures ANSI output, verifies table layout |
| `router_proxy_test.go` | `httptest` mock upstream returns 200/429/500; verify failover behavior |
| `discovery_test.go` | Mock `/v1/models` endpoint; verify model merging with static catalog |
| `target_handoff_test.go` | Write config to temp dir; verify OpenCode/OpenClaw/Hermes/Pi JSON/YAML output |

---

## 14. Build & Release

### 14.1 Go Module

```
module github.com/freemodel/router
go 1.23

require (
    golang.org/x/term v0.31.0
)
```

### 14.2 Build Targets

```makefile
GOOS=darwin GOARCH=amd64     # macOS Intel
GOOS=darwin GOARCH=arm64     # macOS Apple Silicon
GOOS=linux  GOARCH=amd64     # Linux x86_64
GOOS=linux  GOARCH=arm64     # Linux ARM64
GOOS=windows GOARCH=amd64   # Windows x64
```

### 14.3 Release Process

1. Bump `version` in `version.go`
2. Run `go build -o dist/freemodel-router` for all platforms
3. Create GitHub Release with cross-platform binaries
4. Auto-update fetches `https://github.com/freemodel/router/releases/latest` on startup

### 14.4 Dockerfile

```dockerfile
FROM alpine:latest
RUN apk --no-cache add ca-certificates
COPY freemodel-router /usr/local/bin/
EXPOSE 7352
ENTRYPOINT ["freemodel-router", "start"]
```

### 14.5 Docker Compose

```yaml
services:
  freemodel-router:
    build: .
    container_name: freemodel-router
    restart: unless-stopped
    ports:
      - "7352:7352"
    volumes:
      - freemodel_config:/root/.config/freemodel-router
    environment:
      - NVIDIA_API_KEY=nvapi-xxx
      - OPENROUTER_API_KEY=sk-or-xxx
volumes:
  freemodel_config:
```

---

## 15. Data Files

### 15.1 sources.json
Adapted from modelrelay `sources.js`. Contains all 12 providers with their URLs, discoverability flags, and static model lists (ID, label, context window). The `MODELS` array is pre-computed at startup as a flat list of `[modelId, label, score, context, providerKey]`.

### 15.2 scores.json
Adapted from modelrelay `scores.js`. Offline quality score fallbacks (0–1) for ~150 models, keyed by canonical model ID. Used as level 4 in the scoring hierarchy (§4.3).

### 15.3 model-tags.json
Adapted from modelrelay `tags.js`. Maps canonical model IDs to built-in capability tags from the vocabulary: `coding`, `reasoning`, `general`, `fast`, `agentic`. Stored as a JSON object: `{"model/id": ["coding", "agentic"], ...}`.

### 15.4 model-aliases.json
Adapted from modelrelay `MODEL_ID_ALIASES`. Maps short aliases to canonical model IDs for URL-friendly model names (e.g., `"kimi-k2.5"` → `"moonshotai/kimi-k2.5"`).

---

## 16. Concurrency Model

### 16.1 TUI Mode
- Single goroutine for the ping loop (manages a pool of worker goroutines via `pooled()`)
- Single goroutine for stdin reading (raw mode, dispatch to main thread)
- Single goroutine for rendering (throttled via timer)
- Connection pool per provider host (shared `http.Transport`)

### 16.2 Router Mode
- HTTP server handles requests concurrently (Go scheduler)
- Ping loop runs on a separate goroutine, updating a shared, RWMutex-protected model registry
- Proxy requests read from the registry lock-free for model selection, lock for updates
- Each upstream proxy request flows through the transport's connection pool

### 16.3 Thread Safety
- The model registry is protected by `sync.RWMutex`
- Config reads are lock-free (atomic pointer swap on save)
- Ping results are applied to model structs under the registry write lock
- Keep-alive transports are goroutine-safe by design

---

## 17. Error Handling

### 17.1 Ping Errors
- **Timeout (code "000")**: Set status to `timeout`, retry after backoff
- **Network error (code "ERR")**: Set status to `down`, retry after backoff
- **401/403**: Set status to `noauth`/`forbidden`, prompt for key update
- **429**: Set status to `ratelimit`, mark account cooldown
- **503**: Set status to `unavailable`, retry with backoff

### 17.2 Proxy Failures
- If the selected model returns a retryable status (429, 5xx), retry with next-best model
- If no models are available after all retries, return `503 Service Unavailable`
- If config is invalid, return `400 Bad Request`

### 17.3 Config Errors
- Corrupted config file: back up to `.corrupt-<timestamp>`, load defaults
- Invalid API key format: reject in TUI editor with validation message
- Missing config file: create with defaults on first run

---

## 18. Environment Variables

| Variable | Default | Description |
|---|---|---|
| `FREMODEL_PORT` | 7352 | Router listen port |
| `FREMODEL_LOG` | false | Enable request payload logging |
| `FREMODEL_CONFIG_PATH` | `~/.freemodel-router.json` | Override config file path |
| `FREMODEL_EXPORT_PLAINTEXT_KEYS` | 0 | Write API keys into OpenClaw/Hermes/Pi config files |
| `FREMODEL_SCROLL_SORT_PAUSE_MS` | 1500 | Auto-sort pause after user navigation (ms) |
| `FREMODEL_TUI_FORCE_CLEAR` | 0 | Force full screen clear on each render instead of cursor home |
| `FREMODEL_METRICS_CACHE` | 1 | Use rolling metrics cache for ping stats |
| `FREMODEL_NO_FETCH` | 0 | Disable model discovery fetches (use static catalog only) |
| `FREMODEL_STRICT_RENDER_AUTH` | 0 | Panic on non-authoritative render attempt (testing) |
| `OPENCODE_CLI_RUN_MODE` | true | Reduce OpenCode startup log noise when launching |

---

## 19. Non-Goals

The following features from either source project are **explicitly out of scope**:

1. **Web dashboard UI** — modelrelay's React-based web dashboard is not being ported. The TUI is the primary interface.
2. **Kiro OAuth device-code flow** — The server supports Kiro OAuth token passing, but the interactive browser OAuth flow is out of scope. Users must provide a refresh token.
3. **Multi-account key pool management in TUI** — The config supports arrays of keys, but the TUI editor manages single keys. Multi-key setup uses CLI commands.
4. **npm-based packaging** — Go compiles a single binary. No `npm install -g`.

---

## 20. File Manifest

| File | Purpose |
|---|---|
| `go.mod` | Go module definition |
| `go.sum` | Dependency checksums |
| `main.go` | CLI entry point, arg parsing, command dispatch |
| `internal/config/config.go` | Config load/save/export/import, env var resolution |
| `internal/providers/providers.go` | Provider definitions, auth resolution, URL building |
| `internal/models/catalog.go` | Model registry, aliasing, canonicalization |
| `internal/models/quality.go` | Quality scoring, OpenRouter catalog fetch, metadata fallback |
| `internal/models/tags.go` | Tag vocabulary, built-in tags, user tags |
| `internal/ping/engine.go` | Parallel ping loop, keep-alive pool, backoff, staleness guard |
| `internal/ping/metrics.go` | Rolling avg, uptime, verdict computation |
| `internal/router/server.go` | HTTP server, `/v1/chat/completions` proxy, `/v1/models` |
| `internal/router/routing.go` | QoS ranking, model selection, failover logic |
| `internal/router/logging.go` | Request logging, log persistence |
| `internal/tui/tui.go` | TUI lifecycle (raw mode, alt screen, signal handlers) |
| `internal/tui/render.go` | ANSI rendering: table, headers, footer, search, settings |
| `internal/tui/input.go` | Key dispatch, escape sequence parsing, command handler |
| `internal/tui/colors.go` | ANSI color constants, color helpers |
| `internal/tui/primitives.go` | UI primitives (table cells, bars, blocks, status dots) |
| `internal/targets/opencode.go` | OpenCode config writer |
| `internal/targets/openclaw.go` | OpenClaw config writer |
| `internal/targets/hermes.go` | Hermes Agent config writer |
| `internal/targets/pi.go` | Pi Agent config writer |
| `internal/targets/common.go` | Shared helpers (backup, JSON/YAML merge, env var resolution) |
| `internal/cli/flags.go` | CLI flag parsing, arg resolution |
| `internal/cli/best.go` | `--best` mode implementation |
| `internal/cli/update.go` | Update checking, download, restart |
| `internal/cli/autostart.go` | Platform-specific autostart (launchd/systemd/Task Scheduler) |
| `internal/cli/status.go` | Status display |
| `internal/cli/onboard.go` | Interactive key setup wizard |
| `data/sources.json` | Provider catalog (modelrelay sources.js) |
| `data/scores.json` | Offline model quality scores (modelrelay scores.js) |
| `data/model-tags.json` | Built-in capability tags (modelrelay tags.js) |
| `data/model-aliases.json` | Alias to canonical ID mapping (modelrelay MODEL_ID_ALIASES) |
| `data/opencode-fallbacks.json` | OpenCode provider+model remapping rules |
| `VERSION` | Build-time version string |
| `Dockerfile` | Container build |
| `docker-compose.yml` | Docker Compose deployment |
| `Makefile` | Build, test, lint targets |
| `SPECIFICATION.md` | This document |

---

## 21. Milestones

### Phase 1: Core Router (Weeks 1-2)
- Go module scaffolding
- Config system (load/save/export/import)
- Provider definitions (sources.json)
- Model catalog + quality scoring
- Ping engine (parallel, keep-alive, backoff)
- HTTP router server (`/v1/models`, `/v1/chat/completions`)
- Proxy failover logic

### Phase 2: TUI (Weeks 3-4)
- TUI lifecycle (raw mode, alt screen, signal handlers)
- ANSI rendering engine (table, chrome, colors)
- Live ping display (latency, uptime, verdict columns)
- Search/filter, tier/provider filters
- Sorting (0-9 keys, priority default)
- Settings screen (key editor, provider toggle, test ping)
- First-run wizard
- Target picker (OpenCode, OpenClaw, Hermes, Pi)

### Phase 3: Polish & Release (Week 5)
- Auto-update system
- Autostart (macOS/Linux)
- Docker support
- Unit + integration tests
- CLI commands (status, update, onboard, config)
- `--best` mode
- Documentation (README, help text)

---

## 22. Compatibility & Migration

### 22.1 From modelrelay
- Config export/import tokens are interoperable (`mrconf:v1:` prefix)
- Users can run `freemodel config import $(modelrelay config export)` to migrate
- The router endpoint is the same: `http://127.0.0.1:7352/v1`

### 22.2 From free-router
- Config format is upgraded from `~/.free-router.json` to `~/.freemodel-router.json`
- On first launch, if `~/.free-router.json` exists, auto-migrate API keys and provider toggles
- TUI keyboard shortcuts are identical (same key bindings)

### 22.3 Model Compatibility
- The model catalog uses the same aliases and canonicalization as modelrelay
- SWE-bench tiers match free-router's scale exactly
- Tag vocabulary is identical (coding, reasoning, general, fast, agentic)
- The `/v1/models` endpoint exposes the same grouped model IDs (e.g., `minimax-m2.5`, `kimi-k2.5`, `glm4.7`)

---

## 23. Performance Targets

| Metric | Target | Source |
|---|---|---|
| TUI ping cycle | < 2s interval, all models in parallel | free-router |
| Ping TTFB accuracy | ±5ms | free-router |
| Proxy first-byte latency | < 10ms overhead (local) | modelrelay |
| Failover retry latency | < 200ms (sub-second switch) | Enhanced from modelrelay |
| Max concurrent upstream pings | 64 (initial) / 20 (steady) | free-router |
| Connection reuse | 90s keep-alive, 200 max idle conns | Enhanced |
| Memory footprint | < 50MB idle | Go advantage over Node.js |
| TUI redraw latency | < 5ms (throttled to 33ms) | free-router |
