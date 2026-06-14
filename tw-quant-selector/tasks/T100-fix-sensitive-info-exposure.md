---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/813
title: 修復敏感資訊透過 API 暴露
type: security
priority: high
status: done
assignee: OpenCode DeepSeek V4 Pro
created: 2026-05-30
updated: 2026-06-07
howto: |
  1. GET /api/v1/settings/alerts: 敏感欄位返回 "***" + has_value 旗標
  2. POST: 跳過 value="***" 防止以遮罩字串覆蓋真實密碼
  3. 前端 Settings.tsx: 顯示「已設定/未設定」badge，不顯示實際值
  4. AlertSettingsItem 模型新增 has_value 布林欄位
---

# T100 - 修復敏感資訊透過 API 暴露

## 验收狀態：✅ 已完成 (2026-06-07)

## 目標
`src/tw_quant_selector/api/app.py` 第 318-341 行的 `/api/v1/alert-settings` 端點返回 Telegram Token、SMTP 密碼等敏感資訊，這會導致：
1. **瀏覽器開發者工具可直接看到** Token 和密碼
2. **XSS 攻擊**：如果網站有 XSS 漏洞，攻擊者可以竊取這些資訊
3. **內部人員濫用**：任何有權限查看網路請求的人都可以拿到 Token

此任務要過濾敏感欄位，返回 `***` 或完全移除這些欄位。

## 驗收標準
- [x] GET `/api/v1/settings/alerts`：敏感欄位返回 `"***"` + `has_value: true` ✅
- [x] POST `/api/v1/settings/alerts`：跳過 `"***"` 值，防止以遮罩字串覆蓋真實密碼 ✅
- [x] 前端 `Settings.tsx`：敏感欄位顯示「✓ 已設定」/「✗ 未設定」狀態 badge ✅
- [x] 前端儲存時跳過 `value === "***"` 的敏感欄位 ✅
- [x] 前端輸入框 placeholder：「輸入新值以變更...」（已設定時） ✅
- [x] 測試：6 用例全部通過（遮罩驗證、POST 跳脫、has_value 旗標） ✅

## 備註
- **風險**：Telegram Token 被竊取後，攻擊者可以發送假通知；SMTP 密碼被竊取後，攻擊者可以冒充系統發送釣魚郵件
- **修復方式**：
  1. 後端：敏感欄位返回 `***`
  2. 前端：只顯示狀態，不顯示實際內容
  3. 未來擴充：使用加密儲存（如 AES-256）
- **參考程式碼**：
  ```python
  @app.get("/api/v1/alert-settings")
  def get_alert_settings():
      row = db.execute("SELECT * FROM alert_settings LIMIT 1").fetchone()
      if not row:
          return api_response({})
      
      result = dict(row)
      
      # 過濾敏感欄位
      if "telegram_token" in result:
          result["telegram_token"] = "***" if result["telegram_token"] else ""
      if "smtp_password" in result:
          result["smtp_password"] = "***" if result["smtp_password"] else ""
      
      return api_response(result)
  ```
- **參考**：CODE_REVIEW_REPORT.md 問題 3（🔴 嚴重）
