---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/808
title: SQL f-string 加入白名單驗證
type: security
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-30
updated: 2026-06-01
howto: /Users/claw/Projects/tw-quant-selector/CODE_REVIEW_REPORT.md
---

# T095 - SQL f-string 加入白名單驗證

## 目標
`src/tw_quant_selector/api/app.py` 第 429-432 行使用 f-string 組裝 SQL 表名，存在潛在的 SQL 注入風險。雖然目前 `t` 是硬編碼的表名（風險低），但未來如果有人修改程式碼、傳入使用者輸入的表名，就會有 SQL 注入風險。

此任務要加入白名單驗證，確保所有動態表名都經過驗證。

## 驗收標準
- [x] 定義 `ALLOWED_TABLES` 白名單（17 張表）
- [x] 建立 `validate_table_name()` 驗證函數
- [x] 修改 `data_status()` 端點（改為 `dashboard_data()`），加入白名單驗證
- [x] 檢查並修復所有 f-string SQL（3 處）
- [x] 所有使用者輸入都使用參數化查詢（`?` 佔位符）
- [x] 建立 `docs/SQL_SECURITY.md` 安全規範文件
- [x] 測試案例通過（合法表名、非法表名、SQL 注入攻擊模擬）

## 備註
- **為什麼不用 ORM？** DuckDB 的 ORM 支援有限，專案規模較小，直接使用 SQL 更靈活
- **防禦深度（Defense in Depth）**：
  1. 第一層：白名單驗證
  2. 第二層：參數化查詢
  3. 第三層：資料庫權限控制（唯讀帳號、寫入帳號分離）
- **參考**：CODE_REVIEW_REPORT.md 問題 8（🟡 中等）
