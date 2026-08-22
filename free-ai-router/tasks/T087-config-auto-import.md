---
github_issue: ""
title: "Auto-import config from opencode, modelrelay, .env files"
type: pending
priority: medium
status: done
depends_on: []
assignee: "OpenCode with DeepSeek V4 Flash"
created: "2026-08-22"
updated: "2026-08-22"
---

# T087 - Auto-import config from opencode, modelrelay, .env files

## 目標
新增 `freemodel config import-auto` 命令，自動偵測並匯入其他工具的配置，降低遷移門檻。

## 驗收標準
- [x] 支援偵測來源：
  - `~/.config/opencode/opencode.json` — 解析 `providers` 與 `apiKeys`
  - `~/.modelrelay/config.json` 或 `mrconf:v1:` token
  - 專案目錄 `.env`、`.env.local` — 解析所有 `*_API_KEY` 環境變數
  - `~/.free-router.json`（legacy，已有遷移邏輯）
- [x] 互動式確認：顯示將匯入的 provider/key 列表，使用者勾選確認
- [x] 衝突處理：既有配置不覆蓋，除非 `--force`
- [x] 匯入後自動執行 `config doctor` 驗證
- [x] 支援 `--dry-run` 僅預覽不寫入

## 備註
- 修改位置：`internal/cli/config_cmd.go` 新增 `RunConfigImportAuto`
- OpenCode 配置結構需研究其 JSON schema
- ModelRelay token 格式已支援（`config.ImportToken`），只需偵測檔案位置
- `.env` 解析可用 `github.com/joho/godotenv`（新增依賴）或手寫簡易解析器
- 注意安全性：匯入前顯示將讀取的檔案路徑，要求確認