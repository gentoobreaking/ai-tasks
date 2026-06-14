---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/649
title: 角色檔案版本歷史管理
type: Feature
priority: P2
status: done
assignee: OpenCode DeepSeek V4 Pro
created: 2026-05-22
updated: 2026-05-23
howto: 實作版本歷史功能，保留多個備份版本，支援版本對比與回滾
---

# T139 - 角色檔案版本歷史管理

## 目標
為角色檔案編輯器增加版本歷史功能，讓用戶可查看過往版本、對比差異、一鍵回滾。

## 背景
T131 完成後，用戶可直接編輯 config/{role}/ 目錄下的檔案。但編輯錯誤可能導致 agent 行為異常，需要版本歷史作為安全保障。

## 需求

### 1. 版本儲存
- 每次儲存時保留舊版本（最多 N 個，預設 10）
- 版本檔案命名：`{filename}.{timestamp}.bak`
- 版本元數據：時間戳、操作者、變更摘要

### 2. 版本列表 API
```
GET /api/roles/{role}/files/{filename}/history
Response: {
  versions: [
    { version_id, timestamp, author, size, preview }
  ]
}
```

### 3. 版本內容 API
```
GET /api/roles/{role}/files/{filename}/history/{version_id}
Response: { content, metadata }
```

### 4. 版本對比 API
```
GET /api/roles/{role}/files/{filename}/diff?v1={id1}&v2={id2}
Response: { diff_html, additions, deletions }
```

### 5. 版本回滾 API
```
POST /api/roles/{role}/files/{filename}/rollback/{version_id}
```

### 6. 前端版本管理面板
- 版本列表（時間軸展示）
- 版本預覽（點擊版本顯示內容）
- 版本對比（選兩個版本顯示 diff）
- 一鍵回滾按鈕

## 驗收標準
- [x] 後端 API 實作完整（5 個 endpoints）
- [x] 版本儲存上限可配置（環境變數 MAX_VERSION_BACKUPS）
- [x] 前端版本管理面板整合至 RoleManagerPage
- [x] 版本對比使用 unified diff 格式
- [x] 回滾前顯示確認對話框
- [ ] 單元測試覆蓋所有 API

## 技術方案
- 使用 Python `difflib` 處理版本對比
- 版本檔案儲存在 `config/{role}/.history/{filename}/`
- 前端使用 react-diff-viewer 展示 diff

## 時間估算
- 後端 API: 2 小時
- 前端面板: 2 小時
- 測試: 1 小時
- **總計: 5 小時**

## 相關任務
- T131 - Agent 角色檔案前端編輯器（已完成）
- T140 - 配置錯誤防護機制
