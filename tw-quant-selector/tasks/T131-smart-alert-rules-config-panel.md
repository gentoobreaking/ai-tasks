---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/845
title: 智慧警示啟用及設定值面板
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-06-07
updated: 2026-06-07
---

# T131 - 智慧警示啟用及設定值面板

## 目標
建立前端設定面板，讓使用者可以視覺化地啟用/停用各項智慧警示規則，並調整其閾值、冷卻時間、嚴重度等參數。

目前後端已存在 `GET/PUT /api/v1/alerts/rules` API 及 `alert_rules` 資料表（26 條規則），但前端完全沒有對應的設定 UI，只能直接打 API 或修改資料庫。

## 驗收標準

### 1. 規則列表頁面/面板
- [x] 在「系統設定」頁（`/settings`）中新增「警示規則」分頁（tab）
- [x] 以卡片列表展示所有 26 條警示規則，按 5 類別分組（Data Freshness / System Health / Institutional / Price / Smart Alerts）
- [x] 每條規則顯示：`rule_name`、`description`、`severity`、`threshold`、`cooldown_seconds`、`enabled` 狀態

### 2. 啟用/停用切換
- [x] 每條規則提供 toggle switch 可切換 `enabled` 狀態
- [x] 切換後即時呼叫 `PUT /api/v1/alerts/rules/{rule_name}` 更新
- [x] 更新失敗時顯示錯誤提示，並重新載入規則以回復正確狀態

### 3. 設定值編輯
- [x] `threshold`：依規則類型提供數字輸入框，支援 float，並顯示對應單位（小時/天/%/比率等）
- [x] `cooldown_seconds`：數字輸入框，顯示為分鐘，儲存時自動轉換為秒
- [x] `severity`：下拉選單（LOW / MEDIUM / HIGH / CRITICAL）
- [x] 編輯後 800ms debounce 自動觸發 API 更新，無需手動按儲存
- [x] 顯示更新成功/失敗 toast 提示

### 4. 整合現有 API
- [x] `GET /api/v1/alerts/rules` 取得所有規則與當前設定值
- [x] `PUT /api/v1/alerts/rules/{rule_name}` 更新單一規則欄位
- [x] 載入中顯示 SkeletonScreen，失敗顯示錯誤 toast 與重新載入按鈕

### 5. 操作反饋與 UX
- [x] 成功更新後顯示 success toast
- [x] 失敗時顯示 error toast 並重新載入規則
- [x] 頁面載入時顯示 SkeletonScreen

### 6. 後端修正（過程中發現）
- [x] 修復 `scheduler.py` 自動播種邏輯：誤查 `alert_settings` 表改為 `alert_rules` 表
- [x] `GET /api/v1/alerts/rules` 端點加入自動播種（`alert_rules` 為空時自動呼叫 `seed_alert_rules()`）
- [x] `seed_alert_rules.py` 所有 26 條規則描述修正為繁體中文

## 備註
- 前後端皆已修改（原先預估為純前端任務，但發現後端自動播種 bug 與 seed 描述簡體問題）
- 若 `alert_rules` 表已有舊資料，需執行 `python scripts/seed_alert_rules.py --force` 強制重設以取得繁體描述
- `threshold` 為 `null` 的規則（如 SYS_DB_UNREACHABLE）不顯示閾值輸入框
- 儲存機制使用 800ms debounce，輸入即自動儲存