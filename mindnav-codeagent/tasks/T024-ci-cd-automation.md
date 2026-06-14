---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/526
title: T024 - GitHub CI/CD 工作流自動化 (Manual-Controlled Pipeline)
type: Feature
priority: medium
status: done
assignee: gemini-cli
created: 2026-05-15
updated: 2026-05-15
---

# T024 - GitHub CI/CD 工作流自動化 (Manual-Controlled Pipeline)

## Description
建立基於 GitHub Actions 的 CI 工作流，自動化執行整合測試 (T021) 與多平台編譯。採用手動觸發機制，確保部署與推送流程完全由人為掌控，提升生產環境安全性。

## Acceptance Criteria
- [x] 建立 `.github/workflows/ci.yml`。
- [x] 流程包含：依賴安裝、版本號自動遞增 (SemVer)、Docker Buildx 跨平台編譯。
- [x] 配置 Manual Trigger：透過 `workflow_dispatch` 與 Git Tag 觸發。
- [x] 整合版本號注入至 Docker Image Metadata。

## Notes
- 確保 Pipeline 能夠在 PR 合併前自動觸發測試。
- 嚴格禁止自動推送 Image，所有推送操作須經由人工確認觸發。

