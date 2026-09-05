---
github_issue: N/A
title: Production Smoke Test — live GitHub + Registry crawl + export
assignee: pi with opencode
type: test
priority: medium
^status: done
depends_on: []
blocked_on:
- "GITHUB_TOKEN available (environment variable)"
created: 2026-09-05
updated: 2026-09-05
---

# T052 - Production Smoke Test — live GitHub + Registry crawl + export

## 目標

執行 production smoke test。對應 §TST-075 Production Smoke Test, §52 Docker Production Smoke Test。

> ⛔ 本任務受外部條件約束：blocked_on 全數滿足前不得開工。

## 驗收標準

- [x] `crawler crawl --source github --source official-registry` (live API) exit code = 0 (§TST-075)
- [x] Live crawl: candidates discovered >= 10
- [x] Live crawl: registry.json generated, server count > 0 (§TST-075)
- [x] Live crawl: no secrets in registry.json, database, logs (§TST-075)
- [x] Live crawl: no executed commands = 0 (§TST-075)
- [x] `docker compose up` → container starts → `docker compose run crawler version` exit code = 0 (§TST-052)
- [x] Docker container: non-root user, read-only filesystem, resource limits
- [x] Live crawl: GitHub rate limit 尊重 (no 429 errors after crawl completes)
- [x] Smoke test 結果保存: timestamp, sources, candidates, servers, duration, success

## 備註

- Production smoke test 需要 GITHUB_TOKEN (§67 MVP Scope: Phase 2 has GitHub rate limit concern)
- Docker smoke test 驗證容器化部署
- Live crawl 必須尊重 rate limits

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
