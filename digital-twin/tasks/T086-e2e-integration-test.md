---
github_issue: 
title: 補充 end-to-end 整合測試（auto_dev → git commit → README sync）
type: pending
priority: medium
status: done
spec_version: v3
commit: a1c28f0
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: 2026-08-16
---

# T086 - 補充 end-to-end 整合測試

## 目標
新增整合測試，驗證自動開發的完整流程：任務挑選 → AI 實作 → 品質閘門 → git commit → README 同步，確保各模組串聯正確。

## 背景
目前有 266 個單元測試，覆蓋各模組的獨立邏輯，但缺少跨模組的整合測試。主要風險：
- 模組介面變更時，單元測試仍通過但整合行為可能斷裂
- git commit 與 README 同步的互動未被驗證
- 品質閘門失敗後的修復迴圈路徑未被端到端驗證

## 驗收標準
- [x] 新增 `tests/test_e2e_auto_dev.py`
- [x] 測試場景 1：正常流程（mock AI 回傳有效 diff → 品質閘門通過 → git commit → README 更新）
- [x] 測試場景 2：品質閘門失敗（AI 回傳有 ruff 錯誤的 diff → 修復迴圈 → 最終通過）
- [x] 測試場景 3：blocked 流程（連續失敗 4 次 → 進入 blocked → review/supersede）
- [x] 全部使用 fake adapter / tempdir 隔離，不觸網、不碰真實 git repo
- [x] 測試執行時間 < 10 秒
- [x] 現有測試全通過

## 備註
- 使用 `tmp_path` fixture 建立臨時 git repo
- mock AI provider 回傳預設 diff 字串
- 驗證 git log / README 內容而非內部狀態
- 參考 `test_auto_develop_deps.py` 的 mock 模式
