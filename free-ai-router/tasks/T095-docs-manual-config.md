---
github_issue: ""
title: "Create MANUAL.md and CONFIG.md documentation"
type: pending
priority: medium
status: done
depends_on: []
assignee: "OpenCode with DeepSeek V4 Flash"
created: "2026-08-22"
updated: "2026-08-22"
---

# T095 - Create MANUAL.md and CONFIG.md documentation

## 目標
拆分 README.md，建立專門的使用手冊與配置參考文檔，降低新用戶學習曲線。

## 驗收標準
- [x] `MANUAL.md` — 完整使用指南：
  - 快速入門（5 分鐘上手）
  - TUI 操作詳解（每個按鍵、畫面、工作流）
  - Router 模式設定（systemd、Docker、systemd user service）
  - Agent 整合範例（OpenCode、OpenClaw、Hermes、Pi、自訂）
  - 進階主題：自訂 provider、模型別名、pinning 模式
  - 故障排除 FAQ（常見錯誤代碼、網路問題、key 無效）
- [x] `CONFIG.md` — 配置完整參考：
  - 所有 JSON 欄位說明、型別、預設值、環境變數對應
  - Provider 配置範例（每種 provider 完整範例）
  - 環境變數完整表格
  - 遷移指南（legacy → 新格式、modelrelay token 匯入）
  - 安全性最佳實踐（檔案權限、key 輪換、最小權限）
- [x] README.md 精簡為專案簡介 + 連結導向 MANUAL/CONFIG
- [x] 文檔使用相對連結，GitHub/GitLab 可直接瀏覽
- [x] 新增 `docs/` 目錄存放，`make docs` 可驗證連結（可選）

## 備註
- 現有 README.md 內容豐富，可直接重組拆分
- 建議參考 `docs/task-summaries/` 風格，保持技術文檔一致性
- 故障排除部分需收集實際 issue，可從 git log、測試案例推導
- 考慮未來國際化（i18n），結構預留語言代碼