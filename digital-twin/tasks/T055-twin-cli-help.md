---
github_issue: null
title: twin CLI 子命令 --help 可達（argparse 化或 --help 直通檢核）
type: feature
priority: medium
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-11'
updated: '2026-08-11'
---
# T055 - twin CLI 子命令 --help 可達

## 目標
審查發現 twin（317 行）以手寫 if/elif 分派 19 個子命令，無 argparse，
`twin discuss --help` 等子命令 help 不可達（被當成參數轉傳）——前次 design-review §四.1 未修。
另 `twin bot stop` 直接對映 uninstall（語意怪異，:302-303）。

## 驗收標準
- [ ] 每個子命令支援 `--help`：輸出該命令的參數說明後 exit 0，不觸發實際執行
  （方案 A：twin 對每個 run_script 直通時若 args 含 --help/-h，先以 `python <script> --help`
   顯示被轉發目標的 help；或方案 B：子命令逐一 argparse 化）
- [ ] `twin --help` / `twin help` 維持現有總覽輸出
- [ ] `twin bot stop` 語意釐清（stop 應停止 webhook 服務而非等效 uninstall；文件同步說明差異）
- [ ] 既有命令行為不變（test_telegram_bot 等測試維持通過）
- [ ] pytest 全量維持 151 passed + 1 skipped；ruff 全過；shellcheck（如有）無新增警告

## 備註
- 方案 A 成本低且保留現有薄轉發架構；B 需為 19 個命令建 parser，建議 A
- 注意：被轉發腳本 `--help` 可能落入該腳本自己的 syntax 預檢查（如 multi_ai_discuss），
  需在 twin 層先行攔截並以子程序呼叫該腳本 argparse，確保 help 到達