# Taiwan AI Ecosystem Registry
## System Specification v1.0

**Document:** `TAIWAN_AI_ECOSYSTEM_REGISTRY_SPEC.md`  
**Status:** REQUIRED IMPLEMENTATION SPECIFICATION  
**Purpose:** Refactor the existing Taiwan MCP Registry crawler into a Taiwan AI Ecosystem discovery and classification system.

---

# 1. Executive Summary

The existing crawler is too MCP-centric.

The current implementation searches for Taiwan-related MCP projects and attempts to determine whether discovered repositories are MCP servers.

This approach produces excessive false positives because many repositories:

- mention MCP in documentation
- use MCP clients
- depend on MCP SDKs
- provide MCP-related examples
- provide MCP skills
- provide AI agents
- provide AI SDKs
- provide data libraries
- provide tutorials
- provide registries or collections
- consume an external MCP service

but are **not MCP servers**.

The new architecture MUST therefore change the discovery strategy.

## Old Architecture

```text
Search MCP
    ↓
Taiwan relevance
    ↓
Candidate
    ↓
Registry
```

## New Architecture

```text
Taiwan + AI Ecosystem Discovery
            ↓
       Candidate Pool
            ↓
     Taiwan Relevance
            ↓
        AI Relevance
            ↓
     Entity Classification
            ↓
      MCP Identity Check
            ↓
     Runtime Verification
            ↓
       Security Scan
            ↓
      Quality Assessment
            ↓
          Registry
```

The fundamental design principle is:

> **Discovery MUST maximize recall. Classification and verification MUST maximize precision.**

---

# 2. Primary Objective

The system SHALL discover and classify Taiwan-related AI ecosystem projects across multiple public sources.

The registry SHALL NOT assume that discovered projects are MCP servers.

The registry SHALL be capable of representing:

- MCP Servers
- MCP Clients
- MCP Hosts
- MCP SDKs
- MCP Libraries
- MCP Extensions
- AI Agents
- AI Tools
- AI SDKs
- AI Frameworks
- AI Skills
- AI Knowledge Bases
- AI Datasets
- AI APIs
- AI Applications
- AI Infrastructure
- AI Plugins
- AI Tutorials
- AI Examples
- AI Collections
- AI Registries
- AI-related Projects
- Non-AI Projects
- Unknown / Requires Review

MCP is a **classification category**, not the discovery boundary.

---

# 3. Non-Goals

The crawler MUST NOT:

1. Assume repositories containing the string `MCP` are MCP servers.
2. Assume repositories depending on an MCP SDK are MCP servers.
3. Assume repositories listed by an MCP registry are MCP servers without verification.
4. Treat GitHub repository URLs as MCP runtime endpoints.
5. Treat documentation URLs as MCP runtime endpoints.
6. Treat installer URLs as MCP runtime endpoints.
7. Treat an application that consumes an MCP server as an MCP server.
8. Treat MCP-related skills as MCP servers.
9. Treat an MCP collection/awesome-list as an MCP server.
10. treat AI applications as MCP servers merely because they integrate MCP.

---

# 4. Design Principles

## 4.1 Discovery First

Discovery MUST prioritize recall.

False positives are acceptable during discovery.

False positives MUST be removed during classification and verification.

---

## 4.2 Classification Before Registry Inclusion

No discovered entity SHALL be inserted directly into the `MCP Servers` registry.

Every candidate MUST pass classification.

---

## 4.3 MCP Identity Is Independent

The following properties MUST be independent:

```yaml
taiwan_relevance
ai_relevance
mcp_identity
runtime_verification
security_status
quality
```

Taiwan relevance MUST NOT increase MCP confidence.

AI relevance MUST NOT increase MCP confidence.

MCP keyword presence MUST NOT be sufficient for MCP identity.

---

## 4.4 Evidence-Based Classification

Classification MUST be based on evidence.

Each classification decision SHOULD record:

```yaml
classification:
  type: MCP_SERVER
  confidence: 0.94
  evidence:
    - README
    - source_code
    - package_manifest
    - entrypoint
    - runtime_handshake
```

---

# 5. Discovery Sources

The crawler SHOULD support:

```text
GitHub
Glama
PulseMCP
MCP.so
Official MCP Registry
Other MCP registries
Package registries
Public AI directories
Taiwan open-source communities
```

The system SHALL treat external registries as **discovery sources**, not authoritative proof.

For example, an MCP directory can identify a candidate, but the candidate's actual repository/runtime still needs independent classification.

This is especially important because MCP registries differ in how deeply they verify or index servers. Current ecosystem directories range from simple aggregation to deep server/tool inspection.

---

# 6. Discovery Query Strategy

Discovery SHALL NOT primarily search for:

```text
Taiwan MCP
Taiwan MCP Server
Taiwan MCP GitHub
```

Instead, use multiple discovery dimensions.

## 6.1 Geographic / Taiwan Signals

Examples:

```text
Taiwan
台灣
臺灣
Taipei
Taiwanese
TW
twse
tpex
taifex
MOPS
中央氣象署
政府資料開放
健保
實價登錄
交通
台灣法律
```

The crawler SHOULD maintain a configurable Taiwan signal dictionary.

---

# 7. AI Relevance Signals

AI discovery signals include:

```text
AI
LLM
agent
agentic
generative AI
GenAI
machine learning
deep learning
RAG
retrieval
embedding
vector
LLM tool
AI assistant
AI agent
Claude
ChatGPT
Gemini
OpenAI
Anthropic
MCP
Model Context Protocol
tool calling
function calling
AI workflow
```

These are discovery signals only.

They MUST NOT determine final entity classification.

---

# 8. Candidate Discovery Model

Every discovered item MUST initially become:

```yaml
entity_status: DISCOVERED
```

Example:

```yaml
candidate:
  source: github
  repository: example/taiwan-ai
  discovered_at: "2026-09-05T00:00:00Z"

taiwan:
  relevance_score: 0.92

ai:
  relevance_score: 0.87

classification:
  status: PENDING
```

At this stage, the candidate is NOT an MCP server.

---

# 9. Taiwan Relevance

Taiwan relevance SHALL be scored independently.

Recommended score:

```text
0-100
```

Example:

| Score | Meaning |
|---:|---|
| 90-100 | Core Taiwan project/data/service |
| 75-89 | Strong Taiwan relevance |
| 50-74 | Moderate Taiwan relevance |
| 25-49 | Weak Taiwan relevance |
| 0-24 | Not meaningfully Taiwan-related |

Evidence examples:

```yaml
taiwan:
  score: 94
  evidence:
    - Taiwan government data
    - Taiwan financial market
    - Taiwan legal data
```

---

# 10. AI Relevance

AI relevance SHALL also be independent.

Recommended score:

```text
0-100
```

Example:

```yaml
ai:
  score: 91
  evidence:
    - LLM integration
    - agent tools
    - AI API
```

---

# 11. Entity Classification Taxonomy

The classifier MUST support at least the following primary types.

```text
MCP_SERVER
MCP_CLIENT
MCP_HOST
MCP_SDK
MCP_LIBRARY
MCP_EXTENSION
MCP_SKILL
MCP_EXAMPLE
MCP_TUTORIAL
MCP_COLLECTION
MCP_REGISTRY

AI_AGENT
AI_APPLICATION
AI_TOOL
AI_SDK
AI_FRAMEWORK
AI_SKILL
AI_KNOWLEDGE_BASE
AI_DATASET
AI_API
AI_PLUGIN
AI_INFRASTRUCTURE

DATA_LIBRARY
DATASET
API
CLI
WEB_APPLICATION
DATABASE
RESEARCH
TUTORIAL
COLLECTION
OTHER
NOT_AI
UNKNOWN
```

---

# 12. Classification Rules

## 12.1 MCP_SERVER

A project MAY be classified as `MCP_SERVER` only if there is evidence that it actually implements an MCP server.

Strong evidence includes:

### TypeScript / JavaScript

```text
McpServer
Server
StdioServerTransport
StreamableHTTPServerTransport
SSEServerTransport
setRequestHandler
tool()
resource()
prompt()
```

### Python

```text
FastMCP
@mcp.tool
@mcp.resource
@mcp.prompt
Server
stdio_server
streamable_http
```

### Other languages

Equivalent MCP server implementation MUST be identified.

---

# 13. MCP Server Minimum Evidence

Static evidence alone is not sufficient for:

```text
VERIFIED_MCP_SERVER
```

Minimum requirements:

```text
MCP implementation evidence
+
Executable entrypoint
+
Successful initialization
+
Successful MCP protocol handshake
```

Preferred additional verification:

```text
tools/list
resources/list
prompts/list
```

depending on what the server exposes.

---

# 14. MCP_CLIENT

Example:

```text
Application connects to another MCP server
```

If the project implements MCP client functionality but does not expose an MCP server:

```yaml
type: MCP_CLIENT
```

It MUST NOT be classified as:

```yaml
type: MCP_SERVER
```

---

# 15. MCP_HOST

Examples:

```text
AI desktop application
AI IDE
agent runtime
application orchestrating multiple MCP servers
```

If the project hosts/controls MCP servers but does not implement an MCP server endpoint itself:

```yaml
type: MCP_HOST
```

---

# 16. MCP_SDK / MCP_LIBRARY

A repository providing:

```text
SDK
library
framework
helper classes
protocol implementation
```

but not an executable MCP server SHALL be:

```yaml
type: MCP_SDK
```

or:

```yaml
type: MCP_LIBRARY
```

---

# 17. MCP_SKILL

Skills/configuration/instruction repositories MUST NOT be MCP servers.

Examples:

```text
SKILL.md
Claude skills
Codex skills
Agent skills
prompt packs
agent instructions
```

Classification:

```yaml
type: MCP_SKILL
```

or:

```yaml
type: AI_SKILL
```

---

# 18. MCP_COLLECTION

Repositories such as:

```text
awesome-mcp
awesome-taiwan-mcp
mcp-list
mcp-directory
mcp-collection
```

MUST be classified as:

```yaml
type: MCP_COLLECTION
```

They MUST NOT appear in:

```text
MCP Servers
```

---

# 19. Tutorial / Example

Tutorials and examples MUST be separated.

Examples:

```text
pydantic-ai-tutorial
MCP getting started
MCP demo
example-mcp-server
```

A tutorial containing sample MCP server code does not automatically become a production MCP server.

Classification:

```yaml
type: MCP_TUTORIAL
```

or:

```yaml
type: MCP_EXAMPLE
```

unless the repository itself provides an independently executable server intended for use.

---

# 20. AI Agent

An AI agent application may:

- use LLMs
- use tools
- use MCP
- call APIs
- execute workflows

but this does not make it an MCP server.

Example:

```yaml
type: AI_AGENT
```

MCP integration can be represented separately:

```yaml
mcp:
  related: true
  role: CLIENT
```

---

# 21. AI Tool

A Taiwan project providing an AI-oriented capability SHOULD be:

```yaml
type: AI_TOOL
```

Examples:

```text
stock analysis tool
Taiwan legal search
Taiwan OCR
Taiwan document parser
Taiwan financial analysis
Taiwan weather AI tool
```

It does not need to implement MCP.

---

# 22. Data Library / SDK

A data library MUST remain a data library.

For example:

```text
twmarketdata
```

provides market-data functionality and should not become an MCP server merely because it can be consumed by AI/MCP systems.

Classification:

```yaml
type: DATA_LIBRARY
```

Optional:

```yaml
ai:
  relevant: true
```

---

# 23. Data Infrastructure

Projects such as:

```text
database schema
migration system
ETL
data warehouse
data pipeline
```

MUST NOT be classified as MCP servers unless an actual MCP server implementation exists.

For example, the current `tw-quant-db` entry explicitly describes itself as a shared PostgreSQL schema/data layer rather than an MCP server.

---

# 24. Endpoint Classification

Endpoint extraction MUST be redesigned.

Every discovered URL MUST receive a URL type.

Supported values:

```text
MCP_RUNTIME_ENDPOINT
REPOSITORY_URL
DOCUMENTATION_URL
INSTALLER_URL
PACKAGE_URL
DEMO_URL
WEBSITE_URL
API_URL
UNKNOWN_URL
```

---

# 25. Runtime Endpoint Rules

A URL MUST NOT be stored as:

```yaml
mcp.endpoint
```

unless evidence indicates that it is an actual MCP runtime endpoint.

Examples of invalid assumptions:

```text
https://github.com/user/project
```

=> repository

```text
https://docs.example.com/mcp
```

=> documentation

```text
https://raw.githubusercontent.com/user/project/main/install.sh
```

=> installer

These MUST NOT become MCP runtime endpoints.

The current dataset contains examples of these endpoint misclassifications, including repository URLs and installer URLs incorrectly labeled as HTTP MCP endpoints. 
---

# 26. External MCP Endpoint Verification

A URL that looks like:

```text
https://example.com/mcp
```

is still only a candidate endpoint.

The crawler SHOULD perform an MCP protocol verification.

Minimum:

```text
connect
↓
initialize
↓
protocol negotiation
↓
server capabilities
```

If supported:

```text
tools/list
resources/list
prompts/list
```

Only after successful verification:

```yaml
endpoint:
  type: MCP_RUNTIME_ENDPOINT
  verified: true
```

---

# 27. MCP Identity Confidence

Create a dedicated score:

```yaml
mcp_identity:
  confidence: 0-100
```

Suggested evidence weighting:

| Evidence | Weight |
|---|---:|
| MCP keyword | +5 |
| MCP topic/tag | +5 |
| MCP SDK dependency | +10 |
| MCP server classes/functions | +25 |
| MCP tool definitions | +15 |
| Executable MCP entrypoint | +15 |
| Valid server configuration | +10 |
| Runtime handshake | +20 |
| tools/list success | +10 |
| resources/list success | +5 |
| prompts/list success | +5 |

The scoring system MUST NOT simply sum blindly.

The classifier MUST apply hard rules.

---

# 28. Hard Rule: MCP Keyword Is Not Enough

This MUST fail:

```text
README contains "MCP"
```

with no implementation evidence.

Expected:

```yaml
type: UNKNOWN
```

or appropriate non-server classification.

---

# 29. Hard Rule: SDK Dependency Is Not Enough

This:

```text
package.json
  "@modelcontextprotocol/sdk": ...
```

does NOT prove:

```yaml
type: MCP_SERVER
```

The project could be:

```text
MCP client
MCP library
MCP host
MCP example
```

---

# 30. Hard Rule: Registry Listing Is Not Proof

If Glama/PulseMCP/MCP.so/another registry lists a project:

```yaml
source_registry: true
```

but:

```yaml
runtime_verified: false
```

then the project remains:

```yaml
verification_status: UNVERIFIED
```

---

# 31. Classification Output

Every candidate MUST contain:

```yaml
classification:
  primary: MCP_SERVER
  secondary:
    - FINANCE
    - DATA
  confidence: 94
```

Example non-MCP:

```yaml
classification:
  primary: DATA_LIBRARY
  secondary:
    - FINANCE
    - TAIWAN
  confidence: 96
```

Example agent:

```yaml
classification:
  primary: AI_AGENT
  secondary:
    - FINANCE
  confidence: 91

mcp:
  related: true
  role: CLIENT
```

---

# 32. Registry State Machine

Every entity SHALL follow:

```text
DISCOVERED
    ↓
NORMALIZED
    ↓
CLASSIFIED
    ↓
VERIFICATION_PENDING
    ↓
VERIFIED
    ↓
SECURITY_SCANNED
    ↓
QUALITY_ASSESSED
    ↓
PUBLISHED
```

Alternative states:

```text
REJECTED
QUARANTINED
UNAVAILABLE
UNKNOWN
```

---

# 33. MCP Verification States

Use:

```text
NOT_MCP
MCP_CANDIDATE
MCP_STATIC_VERIFIED
MCP_RUNTIME_VERIFIED
MCP_VERIFIED
```

Definitions:

### NOT_MCP

Evidence indicates the project is not an MCP server.

### MCP_CANDIDATE

Static evidence suggests an MCP server but runtime verification has not completed.

### MCP_STATIC_VERIFIED

Source code clearly implements an MCP server.

### MCP_RUNTIME_VERIFIED

The server successfully performs an MCP initialization handshake.

### MCP_VERIFIED

Static + runtime + basic security verification passed.

---

# 34. Security Classification

Security MUST be independent from MCP identity.

Required security fields:

```yaml
security:
  malware_scan:
    status: PASS

  dependency_scan:
    status: PASS

  secret_scan:
    status: PASS

  sast:
    status: PASS

  prompt_injection:
    status: PASS

  tool_poisoning:
    status: PASS

  supply_chain:
    status: PASS

  overall:
    risk: LOW
```

MCP-specific security MUST inspect:

```text
README.md
SKILL.md
AGENTS.md
CLAUDE.md
tool descriptions
tool schemas
prompt templates
server metadata
configuration
examples
```

This is important because MCP security is not limited to traditional malware; malicious tool metadata can influence AI behavior.

---

# 35. Suspicious Code

Repositories containing highly suspicious or obfuscated code MUST be quarantined.

Example indicators:

```text
extreme code obfuscation
encoded payloads
dynamic remote execution
unexpected shell execution
credential harvesting
unknown binary downloads
suspicious install scripts
```

The current dataset already contains an example of highly obfuscated code and this type of item should not proceed directly into normal registry publication.

Classification:

```yaml
verification_status: QUARANTINED
```

---

# 36. Quality Score

Quality MUST be independent from classification.

A project can be:

```text
MCP_SERVER + F
```

or:

```text
AI_TOOL + A
```

Quality does not determine identity.

Recommended dimensions:

```text
documentation
maintenance
release activity
test coverage
license
dependency health
runtime reliability
security
community adoption
```

---

# 37. Registry Schema

Minimum entity schema:

```yaml
id: string

name: string

description: string

source:
  primary: github
  urls:
    - url: string
      type: REPOSITORY_URL

taiwan:
  score: 0-100
  evidence: []

ai:
  score: 0-100
  evidence: []

classification:
  primary: string
  secondary: []
  confidence: 0-100

mcp:
  related: false
  role: null
  identity:
    status: NOT_MCP
    confidence: 0

  endpoints: []

verification:
  status: UNVERIFIED
  checked_at: null

security:
  status: UNKNOWN
  risk: UNKNOWN

quality:
  grade: UNKNOWN
  score: null

lifecycle:
  discovered_at: timestamp
  updated_at: timestamp
  last_verified_at: timestamp
```

---

# 38. MCP Endpoint Schema

```yaml
mcp:
  endpoints:
    - url: https://example.com/mcp
      type: MCP_RUNTIME_ENDPOINT

      transport: streamable_http

      verified: true

      verification:
        initialize: PASS
        tools_list: PASS
        resources_list: PASS
        prompts_list: PASS

        checked_at: "2026-09-05T00:00:00Z"
```

---

# 39. Source Evidence

Every important classification SHOULD preserve evidence.

Example:

```yaml
evidence:
  - type: SOURCE_CODE
    file: src/server.ts
    signal: McpServer

  - type: SOURCE_CODE
    file: src/index.ts
    signal: StdioServerTransport

  - type: PACKAGE
    file: package.json
    signal: "@modelcontextprotocol/sdk"

  - type: RUNTIME
    signal: initialize_success

  - type: RUNTIME
    signal: tools_list_success
```

This enables auditability.

---

# 40. Deduplication

The crawler MUST deduplicate entities across sources.

Primary identity:

```text
canonical repository URL
```

Secondary:

```text
package identifier
organization + repository
verified runtime endpoint
```

Example:

```text
GitHub
Glama
PulseMCP
MCP.so
Official Registry
```

may all refer to the same entity.

They MUST become:

```yaml
sources:
  - github
  - glama
  - pulsemcp
  - mcp.so
```

not four separate projects.

---

# 41. Source Trust Model

Sources have different roles.

Recommended:

```text
Official MCP Registry
    ↓
High-confidence discovery metadata

GitHub
    ↓
Primary source code evidence

Glama / PulseMCP / MCP.so
    ↓
Discovery + external metadata

Runtime verification
    ↓
Authoritative MCP identity evidence
```

Runtime verification SHOULD have higher authority than registry naming.

---

# 42. Search Result Filtering

The crawler MUST NOT use simple keyword filters such as:

```python
if "mcp" in text:
    include()
```

Instead:

```python
candidate = discover()

taiwan_score = evaluate_taiwan(candidate)
ai_score = evaluate_ai(candidate)

if taiwan_score < MIN_TAIWAN_SCORE:
    reject()

classification = classify(candidate)

if classification.primary == "MCP_SERVER":
    verify_mcp(candidate)
```

---

# 43. Recommended Pipeline

Implementation SHALL follow:

```text
┌─────────────────────────┐
│       DISCOVERY         │
│ GitHub / Registries     │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│       NORMALIZER        │
│ canonical identity      │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│   TAIWAN RELEVANCE      │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│      AI RELEVANCE       │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│      CLASSIFIER         │
│ What is this project?   │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│     MCP IDENTITY        │
│ Is it actually MCP?     │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│   RUNTIME VERIFICATION  │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│    SECURITY SCANNER     │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│    QUALITY SCORING      │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│         REGISTRY        │
└─────────────────────────┘
```

---

# 44. Registry Views

The database SHALL support multiple views over the same entities.

## Taiwan AI Ecosystem

```text
All Taiwan AI projects
```

## MCP Servers

```text
classification.primary == MCP_SERVER
AND
mcp.identity.status == MCP_VERIFIED
```

## MCP Candidates

```text
classification.primary == MCP_SERVER
AND
mcp.identity.status IN (
    MCP_CANDIDATE,
    MCP_STATIC_VERIFIED
)
```

## AI Agents

```text
classification.primary == AI_AGENT
```

## AI Tools

```text
classification.primary == AI_TOOL
```

## AI Data

```text
classification.primary IN (
    DATA_LIBRARY,
    DATASET,
    AI_KNOWLEDGE_BASE
)
```

---

# 45. Important Separation

The system MUST maintain:

```text
Discovery
Classification
Verification
Quality
Security
```

as independent dimensions.

Do NOT combine them into one score.

Bad:

```yaml
score: 87
```

Good:

```yaml
taiwan_score: 93
ai_score: 88
mcp_identity_score: 96
security_score: 91
quality_score: 84
```

---

# 46. Example: False Positive

Input:

```text
pydantic-ai-tutorial
```

If repository is a tutorial:

```yaml
classification:
  primary: TUTORIAL
```

NOT:

```yaml
classification:
  primary: MCP_SERVER
```

The current dataset demonstrates this type of false positive.

---

# 47. Example: MCP Collection

Input:

```text
awesome-taiwan-mcp
```

Expected:

```yaml
classification:
  primary: MCP_COLLECTION

mcp:
  related: true
  identity:
    status: NOT_MCP
```

It must not appear in the MCP Server list.

---

# 48. Example: AI Data Layer

Input:

```text
tw-quant-db
```

Expected:

```yaml
classification:
  primary: DATA_LIBRARY
```

or:

```yaml
classification:
  primary: AI_INFRASTRUCTURE
```

depending on actual implementation.

It MUST NOT become `MCP_SERVER` without MCP server implementation evidence.

---

# 49. Example: AI Agent

Input:

```text
fugle-agent
```

The classifier MUST inspect whether it is:

```text
AI_AGENT
MCP_CLIENT
MCP_SERVER
```

and MUST NOT infer MCP server identity from a URL appearing in documentation.

The current data contains an example where an endpoint points to Claude Agent SDK MCP documentation; that URL must not be interpreted as this project's MCP runtime endpoint.

---

# 50. Example: Repository URL

Input:

```text
https://github.com/asgard-ai-platform/mcp-ecpay.git
```

Expected:

```yaml
type: REPOSITORY_URL
```

NOT:

```yaml
type: MCP_RUNTIME_ENDPOINT
```

The existing crawler incorrectly performs this kind of inference and MUST be fixed.

---

# 51. Migration Requirements

The existing implementation MUST NOT be discarded.

Refactor it.

Preserve:

```text
source collectors
normalization
deduplication
GitHub metadata
health checking
quality scoring
output generation
```

but insert the new classification architecture before MCP registry inclusion.

---

# 52. Existing Data Migration

Existing records MUST be reclassified.

For every existing record:

```text
load
↓
normalize
↓
classify
↓
calculate Taiwan score
↓
calculate AI score
↓
calculate MCP identity
↓
verify
```

Do NOT simply copy existing:

```yaml
taiwan_relevant: true
```

into the new schema.

---

# 53. Backward Compatibility

The existing MCP registry output MAY remain available:

```text
awesome-taiwan-mcp.md
```

but it SHALL become a generated view.

New canonical database:

```text
taiwan_ai_ecosystem
```

Generated views:

```text
taiwan-ai-ecosystem.md
taiwan-mcp.md
taiwan-ai-agents.md
taiwan-ai-tools.md
taiwan-ai-data.md
```

---

# 54. Quality Gates

A project SHALL enter:

```text
Verified MCP Servers
```

only when:

```text
Taiwan relevance >= threshold
AND
AI relevance >= threshold
AND
classification == MCP_SERVER
AND
MCP identity verified
AND
runtime verification passed
AND
security status != BLOCKED
```

---

# 55. Candidate vs Verified

The registry MUST distinguish:

```text
DISCOVERED
CANDIDATE
VERIFIED
QUARANTINED
REJECTED
```

Never present:

```text
CANDIDATE
```

as:

```text
VERIFIED SERVER
```

---

# 56. Acceptance Tests

## Test 1 — MCP keyword only

Input:

```text
README mentions MCP
No MCP implementation
```

Expected:

```text
PASS:
NOT MCP_SERVER
```

---

## Test 2 — MCP SDK dependency only

Input:

```text
@modelcontextprotocol/sdk
```

but project implements client only.

Expected:

```text
PASS:
MCP_CLIENT
```

---

## Test 3 — MCP server implementation

Input:

```text
McpServer
StdioServerTransport
tool definitions
executable entrypoint
```

Expected:

```text
PASS:
MCP_SERVER
```

---

## Test 4 — Runtime verification

Expected:

```text
initialize = PASS
```

Only then:

```text
MCP_RUNTIME_VERIFIED
```

---

## Test 5 — GitHub URL

Input:

```text
https://github.com/user/repo
```

Expected:

```text
REPOSITORY_URL
```

Never:

```text
MCP_RUNTIME_ENDPOINT
```

---

## Test 6 — Documentation URL

Input:

```text
https://docs.example.com/mcp
```

Expected:

```text
DOCUMENTATION_URL
```

---

## Test 7 — Installer

Input:

```text
https://raw.githubusercontent.com/user/repo/main/install.sh
```

Expected:

```text
INSTALLER_URL
```

---

## Test 8 — Collection

Input:

```text
awesome-taiwan-mcp
```

Expected:

```text
MCP_COLLECTION
```

---

## Test 9 — Tutorial

Input:

```text
MCP tutorial
```

Expected:

```text
MCP_TUTORIAL
```

---

## Test 10 — Data SDK

Input:

```text
Taiwan financial data Python SDK
```

Expected:

```text
DATA_LIBRARY
```

unless actual MCP server implementation exists.

---

## Test 11 — AI Agent

Input:

```text
Taiwan AI agent using MCP
```

Expected:

```text
AI_AGENT
```

with:

```yaml
mcp:
  related: true
  role: CLIENT
```

unless the agent itself exposes MCP server functionality.

---

## Test 12 — Suspicious code

Input:

```text
obfuscated shell execution
remote binary download
credential extraction
```

Expected:

```text
QUARANTINED
```

---

# 57. Success Metrics

The new crawler SHALL optimize:

## Discovery Recall

Find as many relevant Taiwan AI entities as reasonably possible.

## Classification Precision

Minimize incorrect classifications.

## MCP Precision

The percentage of entries labeled `MCP_SERVER` that actually implement MCP servers.

Target:

```text
>= 95%
```

for verified MCP servers.

---

# 58. Critical KPI

The most important KPI is:

```text
MCP False Positive Rate
```

Target:

```text
< 5%
```

Long-term:

```text
< 2%
```

This is more important than maximizing the raw number of MCP entries.

---

# 59. Current Dataset Baseline

The current registry reports:

```text
561 Servers
200 Taiwan Relevant
361 T0
503 Quality F
```

This indicates that the existing pipeline is admitting too many low-confidence/non-server entities into the MCP registry.

After migration, the number of entities labeled `MCP_SERVER` is expected to decrease substantially.

This is NOT considered a regression.

A smaller, correctly classified MCP registry is preferable to a large registry with false positives.

---

# 60. Expected Result

After implementation, the system should conceptually produce:

```text
Taiwan AI Ecosystem
│
├── MCP
│   ├── Verified MCP Servers
│   ├── MCP Candidates
│   ├── MCP Clients
│   ├── MCP Hosts
│   ├── MCP SDKs
│   ├── MCP Skills
│   └── MCP Collections
│
├── AI
│   ├── AI Agents
│   ├── AI Applications
│   ├── AI Tools
│   ├── AI SDKs
│   ├── AI Frameworks
│   ├── AI Skills
│   └── AI Infrastructure
│
├── Data
│   ├── AI Datasets
│   ├── Data APIs
│   ├── Data Libraries
│   └── Knowledge Bases
│
└── Other
    ├── Tutorials
    ├── Research
    ├── Collections
    └── Non-AI
```

---

# 61. Agent Implementation Directive

The Coding Agent MUST interpret this specification as a refactoring requirement.

DO NOT:

```text
rewrite the project from scratch
```

unless required.

DO:

```text
inspect current crawler
identify existing discovery collectors
identify existing classifier
identify current registry schema
identify current endpoint parser
identify current scoring pipeline
```

Then refactor the architecture to:

```text
Discovery
→ Normalization
→ Taiwan/AI scoring
→ Classification
→ MCP identity
→ Runtime verification
→ Security
→ Quality
→ Registry views
```

---

# 62. Mandatory Implementation Order

Implement in this order:

```text
Phase 1
Canonical Entity Model

Phase 2
Taiwan Relevance

Phase 3
AI Relevance

Phase 4
Entity Classification

Phase 5
MCP Identity Detection

Phase 6
Endpoint Type Detection

Phase 7
MCP Runtime Verification

Phase 8
Security Verification

Phase 9
Quality Scoring

Phase 10
Registry Views

Phase 11
Existing Dataset Migration

Phase 12
Acceptance Test Suite
```

---

# 63. Final Architecture Rule

The following rule is NON-NEGOTIABLE:

```text
DISCOVER BROADLY
      ↓
CLASSIFY EXPLICITLY
      ↓
VERIFY OBJECTIVELY
      ↓
PUBLISH CONSERVATIVELY
```

The system must never reverse this logic.

In particular:

```text
"MCP mentioned"
        ≠
"MCP used"
        ≠
"MCP client"
        ≠
"MCP server"
        ≠
"Verified MCP server"
```

These are separate states and MUST remain separate in the data model.

---

# 64. Definition of Done

The refactor is complete only when all of the following are true:

- [ ] Discovery no longer depends on MCP keywords.
- [ ] Taiwan relevance is independent from MCP identity.
- [ ] AI relevance is independent from MCP identity.
- [ ] Every candidate receives a primary classification.
- [ ] MCP Server is a specific verified classification.
- [ ] MCP client and MCP host are separated from MCP server.
- [ ] SDK/library projects are separated from servers.
- [ ] Skills are separated from servers.
- [ ] Tutorials/examples are separated from servers.
- [ ] Collections/registries are separated from servers.
- [ ] Data libraries are separated from servers.
- [ ] Repository URLs cannot become MCP runtime endpoints.
- [ ] Documentation URLs cannot become MCP runtime endpoints.
- [ ] Installer URLs cannot become MCP runtime endpoints.
- [ ] Runtime MCP handshake is supported.
- [ ] MCP verification state is explicitly stored.
- [ ] Security status is independent from classification.
- [ ] Quality score is independent from classification.
- [ ] Existing records can be migrated.
- [ ] False-positive acceptance tests pass.
- [ ] MCP false-positive rate is below 5%.
- [ ] MCP Server registry is generated as a filtered view of the Taiwan AI Ecosystem registry.

---

# 65. Core Principle

> **This project is no longer an MCP crawler.**
>
> **It is a Taiwan AI Ecosystem crawler with MCP as one of its verified entity types.**

That architectural distinction is the foundation of v1.0.