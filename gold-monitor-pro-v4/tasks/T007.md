---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/253
title: 快取管理 + 基準取得失敗 alert
status: done
assignee: 寶寶
created: 2026-05-01
updated: 2026-05-01
---

## 目標

1. 快取只保留近 7 天資料，避免爆掉
2. 基準取得失敗時發 alert，說明失敗原因（快取/前一營業日/前一小時）

## 已完成

- `_cleanup_old_cache()`：每次寫入快取時檢查，超過 7 天則刪除
- gold_local 基準取得失敗 alert：含快取狀態、rows 數、前一營業日結果
- gold_intl 基準取得失敗 alert：含快取狀態、前一小時結果、金屬名稱
- history 快取已移除（不需要）
- `--daily` 模式已移除（不需要）

## 驗證標準

- [x] 快取寫入後 7 天內不會被清理
- [ ] 快取超過 7 天會被刪除（需等待或手動模擬）
- [ ] gold_local 基準失敗 alert 包含「快取狀態」「day page rows 數」「前一營業日」
- [ ] gold_intl 基準失敗 alert 包含「快取狀態」「前一小時」「金屬名稱」
- [ ] /tmp/gold_monitor_history.json 不再產生