---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/532
title: T028 - 缺失 Shell Script 與 CI/CD 補全
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: fix
---

# T028 - 缺失 Shell Script 與 CI/CD 補全

## 目標
Review 發現多個檔案缺失或位置錯誤：`src/scripts/pre-commit-review.sh` 不存在導致 Git Hook 無法安裝、`src/scripts/start_all.sh` 不存在導致無法一鍵啟動、CI/CD 配置 `github/workflows/ci.yml-notyet` 位於錯誤目錄且未啟用。

## 驗收標準
- [x] 建立 `src/scripts/pre-commit-review.sh`：Git pre-commit hook 腳本，串接 `interface/git_review_api.py` 進行提交前審查
- [x] 建立 `src/scripts/start_all.sh`：一鍵啟動腳本，依序啟動 Redis、推理伺服器、Git Review API、Telegram Bot、Coder Workers
- [x] 修復 CI/CD 位置：建立 `.github/workflows/ci.yml`（正確路徑），保留原 `github/workflows/ci.yml-notyet` 向後相容
- [x] 補全 CI/CD pipeline：加入測試階段（`pytest`），確保 `workflow_dispatch` 手動觸發後先跑測試再建置

## 備註
- `pre-commit-review.sh` 實作容錯：若 API 未啟動則跳過審查，不阻塞工作流
- `start_all.sh` 支援 `Ctrl+C` 優雅停止所有子進程
- 原 `github/workflows/ci.yml-notyet` 保留作為備份
