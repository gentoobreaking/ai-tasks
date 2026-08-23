---
github_issue: 
title: CI 前端 job 與 repo 衛生
type: chore
priority: high
status: done
depends_on: []
assignee: pi with opencode/x-preview-f-free
created: 2026-08-23
updated: 2026-08-23
---

# T43 - CI 前端 job 與 repo 衛生

## 目標
CI 僅涵蓋 Python，新增 frontend job（npm ci → lint → node:test → tsc → build）；frontend/.gitignore 防止 node_modules/tsbuildinfo 再度入版控並解除追蹤（11,906 檔）；git filter-branch 重寫歷史使 repo 由 23.89 MiB 縮至 893 KiB；修復 tw-quant-mcp 子模組既有 ruff 錯誤。

## 驗收標準
- [x] ci.yml frontend job（setup-node 24 + cache）
- [x] node_modules / *.tsbuildinfo 解除追蹤
- [x] 歷史重寫完成（備份 bundle 於 /tmp/tw-quant-pickup-backup-20260823.bundle）
- [x] sync_symbol_registry.py 未使用變數修復

## 備註
歷史已重寫，遠端需 `git push --force -u origin main`。
