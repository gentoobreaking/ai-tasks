---
github_issue: null
title: twin auto --list 自動從 $PWD 判斷當前專案
type: feature
priority: medium
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-11'
updated: '2026-08-11'
---
# T060 - twin auto --list 自動從 $PWD 判斷專案

## 目標
`twin auto --list` 目前預設 `--project digital-twin`，需增加 PWD 自動判斷：
- 若 `$PWD` = `~/Projects/<project folder>`，自動帶入該 project 名稱
- 若無對應 `<project folder>`，才套用 config.py 動態載入的第一順位專案
- `--project` 明確指定者不受影響

## 驗收標準
- [x] `./twin auto --list` 在 `~/Projects/tw-quant-signal/` → 自動列出 tw-quant-signal 任務
- [x] `./twin auto --list` 在 `~/Projects/digital-twin/` → 自動列出 digital-twin 任務
- [x] `./twin auto --list` 在其他路徑 → 退回 config.py 第一順位專案（digital-twin）
- [x] `./twin auto --project <name> --list` 明確指定者仍正常運作
- [x] `./twin auto --project tw-quant-daybrain --list` 仍可指定 tw-quant-daybrain（T061 修正）
- [x] 既有 `./twin auto`（非 --list）行為不受影響
- [x] pytest 126 passed + 2 skipped（T062 尚未完成）；ruff auto_develop.py 通過

## 備註
- 判斷邏輯放在 `twin` 腳本內 `_get_project()`，在 `--project` 未指定時，嘗試從 PWD 匹配 `~/Projects/<name>`
- 需要考慮 PWD 是子目錄的情況（如 `~/Projects/digital-twin/tests`）—應向上查找直到匹配 project 目錄
