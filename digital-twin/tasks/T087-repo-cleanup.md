---
github_issue: null
title: 清理 repo 根目錄雜檔與目錄結構
type: pending
priority: low
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: '2026-08-17'
fail_count: 2
summary: '第 2 次失敗: 未預期錯誤: TypeError: AutoDevelopScheduler._vprint() takes 2 positional
  arguments but 3 were given'
spec_version: v3
---
# T087 - 清理 repo 根目錄雜檔與目錄結構

## 目標
清理專案根目錄下的臨時/雜項檔案，統一移至適當目錄，保持 repo 整潔。

## 背景
Review 報告（REVIEW_REPORT.md §9）識別以下根目錄雜檔：
- `feedback_raw.md`（616KB）— 最新提取的原始修正點，佔空間
- `feedback_template.md` — 9 筆結構化回饋模板
- `full_sessions.md`（616KB）— 近 7 天完整 session 匯出
- `telegram_bot.log` — 空日誌檔
- `:memory:` 目錄 — 測試用臨時目錄，名稱不直觀

## 驗收標準
- [x] `feedback_raw.md` → 加入 .gitignore（生成產物，不再版控）
- [x] `feedback_template.md` → 移至 `docs/`，更新 `apply_feedback.py` 引用路徑
- [x] `full_sessions.md` → 加入 .gitignore（生成產物）
- [x] `telegram_bot.log` → 加入 .gitignore（`*.log` 規則已覆蓋）
- [x] `:memory:` 目錄 → 加入 .gitignore（該目錄已不存在，防呵）
- [x] 更新 `apply_feedback.py`（`FEEDBACK_FILE`）、`auto_guardrail.py`（ignore_files 已含）
- [x] 現有測試全通過（296 passed；2 個 circuit-breaker 為預既有失敗）
- [x] ruff check 零錯誤

## 備註
- 移動檔案後需檢查 `extract_feedback.py`、`apply_feedback.py` 等引用路徑
- `full_sessions.md` 若為生成產物，建議直接 .gitignore 而非移動
- 注意 `.gitignore` 已有的規則，避免重複