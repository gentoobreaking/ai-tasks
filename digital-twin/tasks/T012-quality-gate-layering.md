---
title: auto_develop 品質閘門分層（只檢查 diff 檔案）
type: fix
priority: high
status: done
spec_version: v3
commit: a1c28f0
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-05
updated: 2026-08-05
---

# T012 - auto_develop 品質閘門分層（只檢查 diff 檔案）

## 目標
修復 `auto_develop.py run_tests()` 品質閘門失真的問題。實測：`ruff check .` 全專案有 **333 個既有錯誤**、`tests/` 目錄不存在、`pyright` include 指向不存在的 `src/`。導致兩種極端：閘門太鬆（pytest 無測試 rc=5 被當通過）或太嚴（全專案 ruff 錯誤讓任務全 blocked）。

## 驗收標準
- [x] `run_tests` 的 ruff 改為只檢查本次變更檔案（`git diff --name-only` + `ruff check <files>`），不檢查全專案歷史債
- [x] pytest 回傳 rc=5（無測試）時，明確印出「⚠️ 無測試可執行，跳過」警告，而非默默當通過
- [ ] pyright 檢查範圍與實際程式碼位置一致（見 T017）
- [x] 修改後：T011 等新任務在既有 333 個 ruff 錯誤存在下仍能通過閘門（驗證：無變更清單時退路僅查 E9/F821，實測全專案通過）
- [x] 執行 `python3 auto_develop.py --once --dry-run` 無異常

## 備註
- 先做 T011（設定統一）可降低改動衝突
- 閘門分層設計建議：L1 語法/匯入錯誤（必擋）→ L2 diff 檔案 lint（必擋）→ L3 全專案檢查（僅警告不擋）
