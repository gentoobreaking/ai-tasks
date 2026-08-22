---
github_issue: ""
title: "Quick win: freemodel doctor command (health check)"
type: pending
priority: high
status: done
depends_on: []
assignee: "OpenCode with DeepSeek V4 Flash"
created: "2026-08-22"
updated: "2026-08-22"
---

# T098 - Quick win: freemodel doctor command (health check)

## 目標
實作 `freemodel doctor` 命令，提供一鍵健康檢查，作為 T082/T086 的核心輸出。

## 驗收標準
- [x] `freemodel doctor` 執行完整檢查並輸出報告：
  - 配置檔：語法、權限、路徑
  - API Keys：存在性、格式、環境變數優先級
  - Provider 連線：HTTP GET `/v1/models` 驗證可達性（可選 `--ping` 執行實際 ping）
  - Ping 引擎：運行狀態、最近結果統計
  - Router：端口佔用、監聽狀態（若 server 模式）
  - 磁碟空間：config、cache、log 目錄
- [x] 輸出格式：預設人類可讀表格，`--json` 結構化
- [x] 退出碼：0=全部通過，1=有警告，2=有錯誤
- [x] `--fix` 旗標：自動修復安全項目（如：有 key 卻 disabled → enable）
- [x] 整合現有 `config doctor`（T086）邏輯，避免重複

## 備註
- 修改位置：`internal/cli/` 新增 `doctor.go`、更新 `flags.go` 註冊命令
- 可複用：`config.Load()`、`providers.Manager.GetAllProviders()`、`ping.Engine.Running()`、`router.Server` 狀態
- 執行時間目標：< 5 秒（不含 `--ping`），網路檢查並發執行
- 適合加入 CI/CD pipeline、系統啟動腳本、cron 定期檢查
- 此任務獨立於 T082/T086，可優先交付核心功能