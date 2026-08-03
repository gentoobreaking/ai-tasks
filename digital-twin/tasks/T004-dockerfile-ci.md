---
status: pending
priority: medium
assignee: OpenCode
created: 2026-08-03
updated: 2026-08-03
---


# T004: 新增 Dockerfile + docker-compose.yml + GitHub Actions CI

## 背景
專案缺少容器化與 CI/CD（SPEC-07, DEC-04）。`cloud-arch-clone.md` 講 Docker 多階段建構，但實際缺少 Dockerfile。

## 需求
1. 新增 `Dockerfile`：
   - 多階段建構、非 root 執行、健康檢查
   - 基於 `python:3.12-slim` 或 `python:3.14-slim`
2. 新增 `docker-compose.yml`：
   - 包含 app、redis（可選）、postgres（可選）服務
3. 新增 `.github/workflows/ci.yml`：
   - `ruff check`、`pyright`、`pytest`
   - 多架構映像建構 (`linux/amd64,arm64`)
   - CD 推送至 `ghcr.io`

## 驗收標準
- `docker build .` 成功
- `docker-compose up` 服務啟動正常
- GitHub Actions CI 綠燈

## 參考
- v3 討論 DEC-04 / SPEC-07 / DeepSeek 第 1 輪建議 4, 第 2 輪建議 2.5
