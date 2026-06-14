---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/564
title: API Keys Manager
type: Feature
priority: medium
assignee: OpenCode DeepSeek V4 Flash
status: done
created: 2026-05-18
updated: 2026-05-21
howto: null
---

# T074 - API Keys Manager

## 目標
在 Dashboard 中實現 `.env` 檔案中 API keys 的 CRUD 管理介面。

## 驗收標準
- [x] 讀取並顯示 `.env` 中所有變數
- [x] 按 category 分組（LLM Providers / Tool API Keys / Messaging Platforms / Agent Settings）
- [x] 顯示變數是否已設定（紅色遮罩顯示部分值）
- [x] 提供 set / update / delete 功能
- [x] 每個 key 顯示用途說明和供應商連結
- [x] 隱藏高檔 / 罕用的 key 預設值（toggle 顯示）
- [x] 安全性：仅在 localhost 访问

## 備註
- 直接操作 `~/.env` 檔案
- 嚴格輸入驗證
- 不在日誌或錯誤訊息中暴露 key 值

## T074 完成。原本頁面已接近完整，補上兩個缺漏：

前端 (ApiKeysPage.tsx)

maskValue → displayPreview：簡化命名、移除無效的 sensitive 條件（後端已處理 redaction）
後端 (router_v1.py)

新增 _verify_localhost dependency，GET/POST/DELETE /api/v1/keys 三個 endpoint 加入 localhost-only 保護（可透過 ALLOW_REMOTE_KEYS=1 繞過）

