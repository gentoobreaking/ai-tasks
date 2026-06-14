---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/686
title: 多功能執行腳本 run.sh
type: feature
priority: medium
status: done
assignee: gemini-3-flash-preview
created: 2026-05-26
updated: 2026-05-26
howto: |
  1. 建立 ~/Projects/tw-quant-selector/run.sh
  2. 使用 Bash function 寫法，每個功能為獨立函數
  3. 主選單使用光棒選擇（select 或 case 選單）
  4. 支援項目：
     - 啟動 API 伺服器 (uvicorn)
     - 啟動前端 dev server (npm run dev)
     - 執行所有測試
     - 執行回測
     - 執行排程器 (ingest next bucket)
     - Docker compose up
     - Docker build
     - 顯示說明
  5. 虛擬環境自動啟動偵測
  6. 標題顯示當前狀態（venv、port 占用等）
---

# T033 - 多功能執行腳本 run.sh

## 目標
建立單一 Bash 腳本，以選單方式集中管理所有常用操作，避免每次輸入冗長指令。

## 驗收標準
- [x] 所有功能以 Bash function 定義（非直接 inline 指令）
- [x] 主選單顯示數字選項，使用者輸入數字選擇
- [x] 支援：啟動 API、啟動前端、執行測試、執行回測、執行排程、Docker up、Docker build
- [x] 自動偵測 `.venv` 並提示啟用狀態
- [x] 腳本具備 `set -euo pipefail` 安全模式
- [x] 錯誤時顯示明確訊息

## 備註
- 腳本置於專案根目錄，與 pyproject.toml 同層
