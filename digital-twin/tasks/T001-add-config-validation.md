---
status: done
spec_version: v3
commit: a1c28f0
depends_on: []
priority: high
assignee: OpenCode
created: 2026-08-03
updated: '2026-08-04'
summary: '實作 T001: add-config-validation'
commit: 83dca247
---
# T001: 新增配置驗證層 (Config Schema Validation)

## 背景
目前 `.env` 無 schema 驗證，缺少鍵值不會在啟動時報錯，導致執行時才發現配置錯誤。

## 需求
1. 新增 `config/validate.py`，使用 `pydantic-settings` 定義 `.env` schema
2. 啟動時自動驗證，缺少鍵值立即 `sys.exit(1)` 並列印缺失欄位
3. 整合到 `twin` CLI 入口與 `telegram_bot.py`、`multi_ai_discuss.py` 等啟動點

## 驗收標準
- 缺少必要環境變數時，程式啟動即報錯並列出缺失項目
- `.env.example` 與 schema 定義同步
- 現有腳本啟動流程不中斷（僅在缺配置時提前退出）

## 參考
- v3 討論 DEC-09 / SPEC-12 / DeepSeek 第 2 輪建議 2.3