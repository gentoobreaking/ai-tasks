---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/712
title: 策略設定歷史記錄
type: feature
priority: low
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-27
updated: 2026-05-28
howto: 後端資料表 + API + 前端歷史面板
---

# T069 - 策略設定歷史記錄

## 目標
記錄每次策略設定變更的歷史，支援版本回溯與變更原因備註。

- 來源：spec §4.3、§9.3

## 驗收標準
- [x] 建立 `strategy_config_history` 資料表
- [x] 每次套用設定時自動寫入記錄
- [x] `changed_by` 欄位標記：`'user'` 或 `'preset:{name}'`
- [x] 新增 `GET /api/v1/strategy/config-history` endpoint（分頁、倒序）
- [x] 新增 `DELETE /api/v1/strategy/config-history/{config_id}` endpoint
- [x] 前端設定頁面底部顯示最近 10 筆歷史紀錄
- [x] 支援用戶輸入備註（選填），套用前彈出簡短輸入框

## 備註
- 低優先級任務，可在其他策略功能完成後實作
- 歷史資料有助於 A/B 測試不同設定組合的效果
