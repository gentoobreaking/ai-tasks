# free-ai-router

## 已實作功能

| 功能 |
|------|
| Go Module Scaffolding & CLI Entry Point |
| Config System (load/save/export/import, env var resolution) |
| Data Files (sources.json, scores.json, model-tags.json, model-aliases.json) |
| Provider System (providers.go - definitions, auth, URL building) |
| Model Catalog & Quality Scoring |
| Tags System |
| Ping Engine (parallel pings, keep-alive, backoff, staleness guard) |
| Ping Metrics (rolling avg, uptime, verdict computation) |
| Router HTTP Server |
| Routing Logic & Failover |
| Request Logging |
| TUI Lifecycle (raw mode, alt screen, signal handlers) |
| TUI Colors & Primitives |
| TUI Rendering Engine |
| TUI Input Handling |
| Settings Screen & First-Run Wizard |
| Target Picker Integration (OpenCode, OpenClaw, Hermes, Pi) |
| CLI Commands (flags, best mode, status) |
| CLI Onboard & Config Commands |
| Auto-Update System |
| Autostart (macOS launchctl, Linux XDG) |
| Build System (Makefile, Dockerfile, Docker Compose) |
| Unit Tests |
| Integration Tests |
| Documentation |
| Fix: Proxy model field rewrite to resolved upstream ID |
| Fix: --best mode applies API keys before pinging |
| Fix: Config path per spec + FREMODEL_CONFIG_PATH env support |
| Fix: Ping result thread safety (registry lock) |
| Fix: shouldSkip producer-side state mutation race |
| Fix: Focus event parsing (CSI I/O) |
| Fix: Failover retry policy (only 429/5xx/conn errors) |
| Fix: Shared keep-alive transport pool for proxy (connection reuse) |
| Fix: TUI stubs (search, target picker, settings screen) |
| Fix: Router config propagation (codingOnly / bannedModels / --ban) |
| Fix: Minor issues batch (discovery URL, logs, openBrowser, API stubs, version) |
| Test: Regression suite for review fixes (race + e2e proxy + failover) |
| Fix: TUI renderPending cross-goroutine race + dead TUI fields |
| Fix: lock-free reads after UpdateModel in ban/tags handlers |
| Fix: strip hop-by-hop headers in proxy copyHeaders |
| Fix: rewriteModel failure must return 400, not failover |
| Fix: container config volume + data dir resolution |
| Fix: deduplicate verdict logic (router vs ping) |
| Fix: status command honors FREMODEL_PORT |
| Fix: onboard misleading message + dead fields |
| Feat: wire real API implementations (models/ping, providers, account-status) |
| Tests: regression tests for round-2 fixes |
| Fix: SIGWINCH must resize TUI, not quit |
| Fix: PingAllOnce producer reads skip state without lock |
| Fix: wire AutoPingEnabled to the ping engine |
| Fix: VERSION resolution, semver compare, checksum verify |
| Fix: /api/meta updateAvailable is hardcoded false |
| Fix: config has no mutex; API handlers race |
| Fix: config add/remove-key must not touch env keys |
| Chore: remove dead code |
| Tests: regression coverage for round-3 fixes |
| TUI refactor: replace raw ANSI rendering with Bubble Tea + Lip Gloss |
| Fix: initialize ping engine so models show actual status instead of pending |
| Implement free-tier filtering at model discovery time |
| Implement free-tier verification in ping layer |
| Aggregate free AI models from ClawLabsAI/free-ai-models |
| Add Chinese mainland free model aggregation automation |
| Add Pollinations /text endpoint adapter for truly keyless free models |
| Implement public new-api relay site scanner for keyless model access |
| Implement V2EX forum scraper for public new-api relay sites |
| Implement linux.do forum scraper for public new-api relay sites |
| Implement new-api /v1/models discovery and HA failover from relay sites |
| Remove TUI dead files post Bubble Tea refactor |
| Wire Pollinations /text fallback into router proxy path |
| Complete first-run wizard inside TUI (post Bubble Tea refactor) |
| Implement settings screen keyboard interactions (toggle, edit key, test ping) |
| Cache merged provider sources to disk for fast cold-start and offline resilience |
| Auto-detect API keys from shell RC files and agent configs |
| Add structured discovery logging for all 4 LoadSources phases |
| Fix AutoDiscoverModels not being called — dynamic model discovery is dead code |
| Refactor buildRegistry from god function into composable pipeline |
| Break up TUI Model into focused state machines (settings, picker, wizard, search) |
| Fix ResolveAPIKey config read without lock → potential race |
| Fix time measurement bug in pingPollinationsText |
| Centralize provider definitions into single source of truth |
| Add /api/health and /api/status summarization endpoints |
| Fix runBest ignoring ping result (second return value discarded) |
| Add model deduplication in LoadFromSources |
| First-run wizard enhancement: guided quick-start with env var detection |
| CLI discoverability: add doctor, providers, models subcommands |
| TUI accessibility: color-blind safe palette and status icons |
| TUI search/filter enhancements: provider/tier/tag prefix filters |
| TUI persist column sort preference across sessions |
| Config doctor command: validate config, report missing keys, broken providers |
| Auto-import config from opencode, modelrelay, .env files |
| Provider templates: freemodel config add-provider <name> --from-env |
| Router readiness endpoint: /api/ready for load balancer health checks |
| Model aliases: auto-coding, auto-fast, auto-cheap in chat completions |
| Configurable request timeout via config (replace hardcoded 120s) |
| Structured logging: --log-format json for log aggregation |
| Prometheus metrics endpoint: /api/metrics |
| Ping history export: freemodel export-pings --since 1h --format csv |
| Create MANUAL.md and CONFIG.md documentation |
| Troubleshooting guide: common issues and solutions |
| Document China mainland providers setup (SiliconFlow, Baidu, Alibaba, Tencent) |
| Quick win: freemodel doctor command (health check) |
| Quick win: promote --best flag to first-class subcommand |
| Quick win: /api/ready endpoint for load balancer health checks |

## Skip 項目

| Task | 說明 |
|------|------|
| | |

## 開發中

| Task | 名稱 | 說明 |
|------|------|------|
| | | |

## 待實作

| Task | 名稱 | 說明 |
|------|------|------|
| | | |

## Task 列表

| # | 名稱 | 狀態 |
|---|------|------|
| [T1-go-module-scaffolding](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T001-go-module-scaffolding.md) | Go Module Scaffolding & CLI Entry Point | ✅ done |
| [T2-config-system](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T002-config-system.md) | Config System (load/save/export/import, env var resolution) | ✅ done |
| [T3-data-files](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T003-data-files.md) | Data Files (sources.json, scores.json, model-tags.json, model-aliases.json) | ✅ done |
| [T4-provider-system](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T004-provider-system.md) | Provider System (providers.go - definitions, auth, URL building) | ✅ done |
| [T5-model-catalog-quality](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T005-model-catalog-quality.md) | Model Catalog & Quality Scoring | ✅ done |
| [T6-tags-system](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T006-tags-system.md) | Tags System | ✅ done |
| [T7-ping-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T007-ping-engine.md) | Ping Engine (parallel pings, keep-alive, backoff, staleness guard) | ✅ done |
| [T8-ping-metrics](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T008-ping-metrics.md) | Ping Metrics (rolling avg, uptime, verdict computation) | ✅ done |
| [T9-router-server](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T009-router-server.md) | Router HTTP Server | ✅ done |
| [T10-routing-logic-failover](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T010-routing-logic-failover.md) | Routing Logic & Failover | ✅ done |
| [T11-request-logging](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T011-request-logging.md) | Request Logging | ✅ done |
| [T12-tui-lifecycle](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T012-tui-lifecycle.md) | TUI Lifecycle (raw mode, alt screen, signal handlers) | ✅ done |
| [T13-tui-colors-primitives](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T013-tui-colors-primitives.md) | TUI Colors & Primitives | ✅ done |
| [T14-tui-render-engine](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T014-tui-render-engine.md) | TUI Rendering Engine | ✅ done |
| [T15-tui-input](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T015-tui-input.md) | TUI Input Handling | ✅ done |
| [T16-settings-wizard](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T016-settings-wizard.md) | Settings Screen & First-Run Wizard | ✅ done |
| [T17-target-pickers](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T017-target-pickers.md) | Target Picker Integration (OpenCode, OpenClaw, Hermes, Pi) | ✅ done |
| [T18-cli-commands](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T018-cli-commands.md) | CLI Commands (flags, best mode, status) | ✅ done |
| [T19-cli-onboard-config](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T019-cli-onboard-config.md) | CLI Onboard & Config Commands | ✅ done |
| [T20-auto-update](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T020-auto-update.md) | Auto-Update System | ✅ done |
| [T21-autostart](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T021-autostart.md) | Autostart (macOS launchctl, Linux XDG) | ✅ done |
| [T22-build-system](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T022-build-system.md) | Build System (Makefile, Dockerfile, Docker Compose) | ✅ done |
| [T23-unit-tests](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T023-unit-tests.md) | Unit Tests | ✅ done |
| [T24-integration-tests](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T024-integration-tests.md) | Integration Tests | ✅ done |
| [T25-documentation](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T025-documentation.md) | Documentation | ✅ done |
| [T26-proxy-model-rewrite](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T026-proxy-model-rewrite.md) | Fix: Proxy model field rewrite to resolved upstream ID | ✅ done |
| [T27-best-mode-keys](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T027-best-mode-keys.md) | Fix: --best mode applies API keys before pinging | ✅ done |
| [T28-config-path-env](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T028-config-path-env.md) | Fix: Config path per spec + FREMODEL_CONFIG_PATH env support | ✅ done |
| [T29-ping-thread-safety](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T029-ping-thread-safety.md) | Fix: Ping result thread safety (registry lock) | ✅ done |
| [T30-shouldskip-race](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T030-shouldskip-race.md) | Fix: shouldSkip producer-side state mutation race | ✅ done |
| [T31-focus-events](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T031-focus-events.md) | Fix: Focus event parsing (CSI I/O) | ✅ done |
| [T32-failover-policy](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T032-failover-policy.md) | Fix: Failover retry policy (only 429/5xx/conn errors) | ✅ done |
| [T33-proxy-conn-reuse](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T033-proxy-conn-reuse.md) | Fix: Shared keep-alive transport pool for proxy (connection reuse) | ✅ done |
| [T34-tui-stubs](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T034-tui-stubs.md) | Fix: TUI stubs (search, target picker, settings screen) | ✅ done |
| [T35-router-config-propagation](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T035-router-config-propagation.md) | Fix: Router config propagation (codingOnly / bannedModels / --ban) | ✅ done |
| [T36-minor-issues-batch](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T036-minor-issues-batch.md) | Fix: Minor issues batch (discovery URL, logs, openBrowser, API stubs, version) | ✅ done |
| [T37-regression-tests](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T037-regression-tests.md) | Test: Regression suite for review fixes (race + e2e proxy + failover) | ✅ done |
| [T38-tui-renderpending-race](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T038-tui-renderpending-race.md) | Fix: TUI renderPending cross-goroutine race + dead TUI fields | ✅ done |
| [T39-server-handler-races](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T039-server-handler-races.md) | Fix: lock-free reads after UpdateModel in ban/tags handlers | ✅ done |
| [T40-proxy-hop-by-hop](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T040-proxy-hop-by-hop.md) | Fix: strip hop-by-hop headers in proxy copyHeaders | ✅ done |
| [T41-proxy-rewrite-400](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T041-proxy-rewrite-400.md) | Fix: rewriteModel failure must return 400, not failover | ✅ done |
| [T42-container-config-data](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T042-container-config-data.md) | Fix: container config volume + data dir resolution | ✅ done |
| [T43-verdict-dedup](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T043-verdict-dedup.md) | Fix: deduplicate verdict logic (router vs ping) | ✅ done |
| [T44-status-port](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T044-status-port.md) | Fix: status command honors FREMODEL_PORT | ✅ done |
| [T45-onboard-dead-fields](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T045-onboard-dead-fields.md) | Fix: onboard misleading message + dead fields | ✅ done |
| [T46-api-stub-wiring](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T046-api-stub-wiring.md) | Feat: wire real API implementations (models/ping, providers, account-status) | ✅ done |
| [T47-regression-tests-2](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T047-regression-tests-2.md) | Tests: regression tests for round-2 fixes | ✅ done |
| [T48-tui-sigwinch-resize](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T048-tui-sigwinch-resize.md) | Fix: SIGWINCH must resize TUI, not quit | ✅ done |
| [T49-ping-producer-skip-lock](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T049-ping-producer-skip-lock.md) | Fix: PingAllOnce producer reads skip state without lock | ✅ done |
| [T50-autoping-wiring](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T050-autoping-wiring.md) | Fix: wire AutoPingEnabled to the ping engine | ✅ done |
| [T51-version-semver-checksum](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T051-version-semver-checksum.md) | Fix: VERSION resolution, semver compare, checksum verify | ✅ done |
| [T52-meta-updateavailable](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T052-meta-updateavailable.md) | Fix: /api/meta updateAvailable is hardcoded false | ✅ done |
| [T53-config-thread-safety](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T053-config-thread-safety.md) | Fix: config has no mutex; API handlers race | ✅ done |
| [T54-config-addkey-env](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T054-config-addkey-env.md) | Fix: config add/remove-key must not touch env keys | ✅ done |
| [T55-dead-code-cleanup](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T055-dead-code-cleanup.md) | Chore: remove dead code | ✅ done |
| [T56-regression-tests-3](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T056-regression-tests-3.md) | Tests: regression coverage for round-3 fixes | ✅ done |
| [T57-tui-bubble-tea-refactor](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T057-tui-bubble-tea-refactor.md) | TUI refactor: replace raw ANSI rendering with Bubble Tea + Lip Gloss | ✅ done |
| [T58-ping-engine-init](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T058-ping-engine-init.md) | Fix: initialize ping engine so models show actual status instead of pending | ✅ done |
| [T59-free-tier-discovery-filter](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T059-free-tier-discovery-filter.md) | Implement free-tier filtering at model discovery time | ✅ done |
| [T60-ping-free-tier-verification](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T060-ping-free-tier-verification.md) | Implement free-tier verification in ping layer | ✅ done |
| [T61-clawlabs-model-aggregation](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T061-clawlabs-model-aggregation.md) | Aggregate free AI models from ClawLabsAI/free-ai-models | ✅ done |
| [T62-china-mainland-model-aggregation](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T062-china-mainland-model-aggregation.md) | Add Chinese mainland free model aggregation automation | ✅ done |
| [T63-pollinations-text-adapter](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T063-pollinations-text-adapter.md) | Add Pollinations /text endpoint adapter for truly keyless free models | ✅ done |
| [T64-public-relay-scanner](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T064-public-relay-scanner.md) | Implement public new-api relay site scanner for keyless model access | ✅ done |
| [T64a-v2ex-scraper](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T064a-v2ex-scraper.md) | Implement V2EX forum scraper for public new-api relay sites | ✅ done |
| [T64b-linuxdo-scraper](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T064b-linuxdo-scraper.md) | Implement linux.do forum scraper for public new-api relay sites | ✅ done |
| [T64c-newapi-discovery](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T064c-newapi-discovery.md) | Implement new-api /v1/models discovery and HA failover from relay sites | ✅ done |
| [T65-tui-dead-file-cleanup](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T065-tui-dead-file-cleanup.md) | Remove TUI dead files post Bubble Tea refactor | ✅ done |
| [T66-pollinations-text-router-hook](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T066-pollinations-text-router-hook.md) | Wire Pollinations /text fallback into router proxy path | ✅ done |
| [T67-tui-first-run-wizard](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T067-tui-first-run-wizard.md) | Complete first-run wizard inside TUI (post Bubble Tea refactor) | ✅ done |
| [T68-settings-screen-interactions](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T068-settings-screen-interactions.md) | Implement settings screen keyboard interactions (toggle, edit key, test ping) | ✅ done |
| [T69-provider-cache-persistence](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T069-provider-cache-persistence.md) | Cache merged provider sources to disk for fast cold-start and offline resilience | ✅ done |
| [T70-auto-detect-api-keys](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T070-auto-detect-api-keys.md) | Auto-detect API keys from shell RC files and agent configs | ✅ done |
| [T71-discovery-logging](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T071-discovery-logging.md) | Add structured discovery logging for all 4 LoadSources phases | ✅ done |
| [T72-fix-autodiscover-not-called](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T072-fix-autodiscover-not-called.md) | Fix AutoDiscoverModels not being called — dynamic model discovery is dead code | ✅ done |
| [T73-refactor-buildregistry-pipeline](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T073-refactor-buildregistry-pipeline.md) | Refactor buildRegistry from god function into composable pipeline | ✅ done |
| [T74-breakup-tui-model](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T074-breakup-tui-model.md) | Break up TUI Model into focused state machines (settings, picker, wizard, search) | ✅ done |
| [T75-config-resolve-race](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T075-config-resolve-race.md) | Fix ResolveAPIKey config read without lock → potential race | ✅ done |
| [T76-fix-ping-time-measurement](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T076-fix-ping-time-measurement.md) | Fix time measurement bug in pingPollinationsText | ✅ done |
| [T77-centralize-provider-definitions](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T077-centralize-provider-definitions.md) | Centralize provider definitions into single source of truth | ✅ done |
| [T78-api-health-status-endpoints](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T078-api-health-status-endpoints.md) | Add /api/health and /api/status summarization endpoints | ✅ done |
| [T79-fix-runbest-return-value](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T079-fix-runbest-return-value.md) | Fix runBest ignoring ping result (second return value discarded) | ✅ done |
| [T80-model-dedup-loadfromsources](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T080-model-dedup-loadfromsources.md) | Add model deduplication in LoadFromSources | ✅ done |
| [T81-first-run-wizard](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T081-first-run-wizard.md) | First-run wizard enhancement: guided quick-start with env var detection | ✅ done |
| [T82-cli-discoverability](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T082-cli-discoverability.md) | CLI discoverability: add doctor, providers, models subcommands | ✅ done |
| [T83-tui-accessibility](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T083-tui-accessibility.md) | TUI accessibility: color-blind safe palette and status icons | ✅ done |
| [T84-tui-search-filters](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T084-tui-search-filters.md) | TUI search/filter enhancements: provider/tier/tag prefix filters | ✅ done |
| [T85-tui-persist-sort](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T085-tui-persist-sort.md) | TUI persist column sort preference across sessions | ✅ done |
| [T86-config-doctor](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T086-config-doctor.md) | Config doctor command: validate config, report missing keys, broken providers | ✅ done |
| [T87-config-auto-import](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T087-config-auto-import.md) | Auto-import config from opencode, modelrelay, .env files | ✅ done |
| [T88-config-provider-templates](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T088-config-provider-templates.md) | Provider templates: freemodel config add-provider <name> --from-env | ✅ done |
| [T89-router-ready-endpoint](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T089-router-ready-endpoint.md) | Router readiness endpoint: /api/ready for load balancer health checks | ✅ done |
| [T90-router-model-aliases](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T090-router-model-aliases.md) | Model aliases: auto-coding, auto-fast, auto-cheap in chat completions | ✅ done |
| [T91-router-request-timeout](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T091-router-request-timeout.md) | Configurable request timeout via config (replace hardcoded 120s) | ✅ done |
| [T92-observability-structured-logging](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T092-observability-structured-logging.md) | Structured logging: --log-format json for log aggregation | ✅ done |
| [T93-observability-prometheus-metrics](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T093-observability-prometheus-metrics.md) | Prometheus metrics endpoint: /api/metrics | ✅ done |
| [T94-observability-ping-history-export](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T094-observability-ping-history-export.md) | Ping history export: freemodel export-pings --since 1h --format csv | ✅ done |
| [T95-docs-manual-config](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T095-docs-manual-config.md) | Create MANUAL.md and CONFIG.md documentation | ✅ done |
| [T96-docs-troubleshooting](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T096-docs-troubleshooting.md) | Troubleshooting guide: common issues and solutions | ✅ done |
| [T97-docs-china-providers](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T097-docs-china-providers.md) | Document China mainland providers setup (SiliconFlow, Baidu, Alibaba, Tencent) | ✅ done |
| [T98-quickwin-doctor-command](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T098-quickwin-doctor-command.md) | Quick win: freemodel doctor command (health check) | ✅ done |
| [T99-quickwin-promote-best](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T099-quickwin-promote-best.md) | Quick win: promote --best flag to first-class subcommand | ✅ done |
| [T100-quickwin-ready-endpoint](https://github.com/gentoobreaking/ai-tasks/blob/main/free-ai-router/tasks/T100-quickwin-ready-endpoint.md) | Quick win: /api/ready endpoint for load balancer health checks | ✅ done |

**✅ done: 103 | 🔧 in-progress: 0 | ⏭️ skip: 0 | 📋 pending: 0**

> 自動生成於 2026-08-22 15:44
