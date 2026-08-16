---
github_issue: null
title: twin auto --list PWD 自動判斷不支援 all-done 專案
type: bug
priority: high
status: done
spec_version: v3
commit: a1c28f0
updated: '2026-08-11'
commit: a1b2c3d
depends_on: [60]
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-11'
updated: '2026-08-11'
---
# T064 - twin auto --list PWD 自動判斷不支援 all-done 專案

## 目標
`_detect_project_from_pwd()` 僅檢查 config.py `PROJECT_PATHS`，但 `PROJECT_PATHS`
僅包含「有未完成任務」的專案。當 PWD 位於 all-done 專案（如 `tw-quant-mcp`）下，
判斷失敗，錯誤回退到 `digital-twin`。

## 驗收標準
- [x] `_detect_project_from_pwd()` 在 `~/Projects/<all-done-proj>/` 正確回傳專案名稱
- [x] `~/Projects/<all-done-proj>/` 子目錄也能正確偵測
- [x] 非 Projects 目錄下仍回傳 None；twin auto --list 退回 default
- [x] pytest test_twin_auto_pwd.py 全部通過 (9 tests)
- [x] 手動驗證 `./twin auto --list` 在 `~/Projects/tw-quant-mcp/` 顯示 tw-quant-mcp 任務

## 備註
- 修復方案：`PROJECT_PATHS` 未匹配時，掃描 `~/Projects/*/ `目錄名稱擴充匹配（含 all-done 專案）
- `auto_develop.py` 的 `ValueError` fallback 已可處理非 PROJECT_PATHS 專案，無需改動
- twin:97-119, tests/test_twin_auto_pwd.py:78-110
