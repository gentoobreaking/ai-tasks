---
github_issue: 
title: GET /api/config 回傳明文 API key（安全性）
type: security
priority: high
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-23
updated: 2026-08-24
---

# T108 - /api/config 金鑰遮罩

## 目標
`GET /api/config` 無認證且回傳完整 config 含所有 provider API key 明文。
雖只綁 127.0.0.1，本機任意行程都能竊取全部金鑰。

## 驗收標準
- [x] handleAPIConfigGet 對 apiKeys 做遮罩（保留前 4 後 4 字元，短 key 全遮）
- [x] 支援 string 與 []interface{} 兩種 key 值型態
- [x] 保留 config 結構形狀，客戶端仍可看出哪些 provider 已設定
- [x] router 測試通過

## 備註
commit e6ed157。新增 maskSecret() helper。
