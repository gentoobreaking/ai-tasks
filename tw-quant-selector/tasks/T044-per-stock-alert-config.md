---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/713
title: 個股損益門檻設定與視覺警示
type: feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-27
updated: 2026-05-27
howto: |
  1. Portfolio 頁面每檔持有列加入門檻設定區（inline expand）。
  2. 儲存於 localStorage key: `tw_quant_alert_configs`，格式 Record<stock_id, {pl_threshold?, pl_percent_threshold?, alert_enabled: boolean}>。
  3. 未設定個股門檻時自動讀取全域名額（從 GET /api/v1/settings/alerts 取得）。
  4. 比較 P&L vs 門檻，超標時顯示 ⚠ Badge。
  5. 每檔持股有「啟用警示」toggle，關閉時不發通知但視覺警示仍顯示。
  6. 符合 frontend_design_spec.md 3.9 Alert Toast 規格。
---

# T044 - 個股損益門檻設定與視覺警示（前端）

## 目標
在 Portfolio 頁面中，讓使用者可以針對每檔持股個別設定損益監控門檻（金額門檻、百分比門檻），未設定者自動套用全域設定。超過門檻時顯示視覺警示，並可獨立啟用/停用通知發送。

## 驗收標準
- [ ] 每檔持股列顯示當前門檻狀態（未設定/個股值/套用全域值）
- [ ] 點擊可展開 inline 編輯區，包含：
  - 金額門檻輸入（TWD）
  - 百分比門檻輸入（%）
  - 「清除設定，回退至全域」按鈕
  - 「啟用通知」toggle
- [ ] 門檻儲存於 localStorage key `tw_quant_alert_configs`，格式 `Record<stock_id, {pl_threshold?: number, pl_percent_threshold?: number, alert_enabled: boolean}>`
- [ ] 從 `GET /api/v1/settings/alerts` 取得全域門檻作為 fallback
- [ ] 每次價格刷新時自動計算 P&L 是否超標
- [ ] 超標時顯示 `⚠` 警示 Badge + 工具提示顯示超標數值
- [ ] 未設定個股門檻也無全域門檻時不顯示警示
- [ ] 符合設計規格 §3.9 Alert Toast 樣式（若使用 Toast）

## 備註
- 投組資料本身仍在 localStorage，不後送後端
- 後端通知觸發由 T045 實作
- 視覺警示不受 `alert_enabled` 影響（永遠顯示）；該開關僅控制是否發送 Telegram/Email
