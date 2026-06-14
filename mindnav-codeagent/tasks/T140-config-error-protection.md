---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/650
title: 配置錯誤防護機制
type: Feature
priority: P2
status: done
assignee: OpenCode DeepSeek V4 Pro
created: 2026-05-22
updated: 2026-05-23
howto: 實作配置驗證與安全重置機制，防止錯誤配置導致 agent 行為異常
---

# T140 - 配置錯誤防護機制

## 目標
建立配置驗證機制，在儲存前檢查語法與必要欄位，並提供「安全模式」重置功能。

## 背景
T131 完成後，用戶可直接編輯 agent 配置檔案。錯誤配置可能導致：
- Agent 啟動失敗
- 行為異常（如角色定義衝突）
- 系統不穩定

需要防護機制確保配置安全。

## 需求

### 1. 配置驗證 API
```
POST /api/roles/{role}/files/{filename}/validate
Body: { content }
Response: {
  valid: bool,
  errors: [{ line, message, severity }],
  warnings: [{ line, message }]
}
```

### 2. 驗證規則

#### 通用規則
- 檔案不能為空（至少 10 bytes）
- UTF-8 編碼有效
- 無不可見控制字元

#### SOUL.md 規則
- 必須包含 `# Who Am I?` 或 `# SOUL` 標題
- 至少 100 字元

#### TOOLS.md 規則
- Markdown 列表格式有效
- 工具名稱符合命名規範（小寫、連字號）

#### USER.md 規則
- YAML frontmatter 有效（若有）
- 無語法錯誤

### 3. 前端驗證提示
- 即時驗時驗證（儲存前）
- 錯誤行高亮
- 懸浮提示錯誤訊息
- 阻擋儲存無效配置（紅色警告）

### 4. 安全重置功能
```
POST /api/roles/{role}/files/{filename}/factory-reset
Response: { content, message }
```
- 重置到出廠預設（從 default templates 載入）
- 需二次確認（前端對話框）

### 5. 配置健康檢查
```
GET /api/roles/health-check
Response: {
  roles: [
    { role, status, issues: [...] }
  ]
}
```
- 檢查所有角色配置是否有效
- 列出問題與建議修復

## 驗收標準
- [x] 驗證 API 實作完整（validate endpoint）
- [x] SOUL.md / TOOLS.md 驗證規則
- [x] 前端即時驗證提示（RoleManagerPage 儲存前驗證）
- [x] 安全重置功能（factory-reset endpoint）
- [x] 配置健康檢查 API（health-check endpoint）
- [ ] 單元測試覆蓋所有規則

## 技術方案
- Markdown 解析使用 `mistune` 或 `markdown-it-py`
- YAML 解析使用 `pyyaml`
- 驗證器使用 Pydantic 模型
- 前端 Monaco Editor marker API

## 時間估算
- 驗證 API: 2 小時
- 驗證規則實作: 2 小時
- 前端整合: 2 小時
- 測試: 1 小時
- **總計: 7 小時**

## 相關任務
- T131 - Agent 角色檔案前端編輯器（已完成）
- T139 - 角色檔案版本歷史管理
