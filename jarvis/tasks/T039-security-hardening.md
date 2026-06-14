---
github_issue:https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/786
type: pending
priority: high
status: done
assignee: OpenCode MinniMax-M2.7
created: 2026-05-13
updated: 2026-05-13
howto: ~/howto
---

# T039 - 安全性改進：認證、CORS、輸入限制

## 目標
提升 API 的安全性，包括：認證機制、CORS 限制、音頻輸入大小限制。

## 驗收標準
- [x] 新增 API 認證機制（API_KEY 環境變數）
- [x] CORS 限定允許的域名（CORS_ORIGINS 環境變數）
- [x] WAV 輸入有大小上限（10MB）
- [x] 驗證安全性測試通過

## 備註