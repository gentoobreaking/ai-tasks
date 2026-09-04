---
github_issue: N/A
title: Docker — Dockerfile + docker-compose with security best practices
type: chore
priority: high
^status: done
depends_on: [T001]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T042 - Docker — Dockerfile + docker-compose with security best practices

## 目標

建立 Dockerfile 和 docker-compose.yaml。對應 CRAWLER_AGENT_TASKS.md §34 TASK-034, §52 TST-052 (Production Smoke Test)。

## 驗收標準

- [ ] `Dockerfile` 建立, multi-stage build (builder + runtime)
- [ ] Base image: `golang:1.26-alpine3.24` for builder, `alpine:latest` for runtime
- [ ] Runtime image: non-root user (non-root UID)
- [ ] Dockerfile: read-only filesystem where possible (VOLUME for data)
- [ ] Dockerfile: no privileged, no Docker socket mount
- [ ] Dockerfile: resource limits in docker-compose (cpus, mem_limit)
- [ ] `docker-compose.yaml` 建立, 包含 container_name
- [ ] docker-compose.yaml mounts: ./registry, ./data, ./config
- [ ] docker-compose.yaml 環境變數: GITHUB_TOKEN (optional), OPENAI_API_KEY (optional)
- [ ] `docker build` 成功
- [ ] `docker compose up` 成功啟動 (crawler container starts)
- [ ] `docker compose run crawler version` 回傳版本 (§TST-052 Production Smoke Test)
- [ ] Docker image size < 100MB (alpine base)
- [ ] Security scan: no root user, no SSH keys, no secrets in image

## 備註

- Docker 非 v0.1 強制要求 (§67 MVP Scope), 但 T042 為 infrastructure support
- docker-compose container_name 為必要 (§repo-rules)
- Image 使用 alpine + latest (§repo-rules)
