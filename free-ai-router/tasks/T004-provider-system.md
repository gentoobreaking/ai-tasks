---
github_issue:
title: Provider System (providers.go - definitions, auth, URL building)
type: pending
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-03
---

# T004 - Provider System

## 目標
Implement `internal/providers/providers.go` per spec §3. Handles provider definitions, auth resolution, URL building, dynamic discovery, and multi-account round-robin. Reads from `data/sources.json` and supports env var overrides.

## 驗收標準
- [ ] Load provider definitions from `data/sources.json`
- [ ] Provider struct with name, URL, discoverable, models, enabled flag
- [ ] Environment variable resolution: `NVIDIA_API_KEY`, `GROQ_API_KEY`, etc. (§3.2)
- [ ] Dynamic instance support for `openai-compatible` and `ollama` providers (multiple endpoints)
- [ ] Dynamic model discovery for discoverable providers (nvidia, groq, cerebras, openrouter, googleai) — probe `GET /v1/models` at base URL (§3.3)
- [ ] Discovery interval config: OpenRouter 60min, NIM/Groq/Cerebras/Google AI 30min, KiloCode 30min, Ollama 60min, OpenAI-Compatible 30min
- [ ] Multi-account round-robin: API key can be string or array; rotate accounts; `maxTurns` for proactive rotation (§3.4)
- [ ] Free-tier enforcement: ping layer sends `max_tokens: 1` probe; 200=reachable+free, 401=auth needed, 429=rate limited, 404/5xx=unavailable (§3.5)

## 備註
- Static entries take precedence over discovered models (§3.3)
- OpenRouter models filtered at discovery to only include pricing.prompt === "0" and pricing.completion === "0" (§3.5)
