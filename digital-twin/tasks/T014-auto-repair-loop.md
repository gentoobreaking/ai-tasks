---
title: 測試失敗自動修復迴圈（錯誤回饋給模型）
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-05
updated: 2026-08-05
---

# T014 - 測試失敗自動修復迴圈（錯誤回饋給模型）

## 目標
`auto_develop.py` 在測試失敗時直接 `_record_failure`，程式碼中留有 `# TODO: 這裡可以加入自動修復迴圈`。實作：把測試/檢查失敗輸出回饋給模型，要求產出修復 diff，最多 2 輪；修不好才標記 blocked。

## 驗收標準
- [x] 測試失敗時自動呼叫模型，輸入 = 原任務 + 失敗輸出（ruff/pytest/pyright stderr），要求輸出修復 diff
- [x] 修復 diff 套用後重跑測試，最多 2 輪（`repair_max_rounds = 2`）
- [x] 2 輪內通過 → 進入 commit 流程；仍失敗 → `_record_failure`（沿用現有 fail_count/blocked 機制）
- [x] 每輪修復的 prompt 與模型輸出存檔（`logs/repair-T0XX-rN.md`）供事後檢視（logs/ 已在 .gitignore）
- [x] 修復迴圈可被 `--no-repair` 參數關閉（維持現有行為）

## 備註
- 依賴 T012（閘門分層）完成後實作，否則修復迴圈會被全專案 333 個舊錯誤誤觸發
- 修復 prompt 需包含原始任務的驗收標準，避免模型偏離任務目標
- 成本考量：修復呼叫失敗也計入 fail_count 比較合理（防止無限燒 token）
