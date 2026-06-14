---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/551
title: T047 - API Key 安全處理
type: Security
priority: low
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: implement
---

# T047 - API Key 安全處理

## 目標
`engine/llm_factory.py` 將 API Key 以明文傳遞給 `ChatOpenAI(api_key=...)`，保留在記憶體中。若發生未捕捉例外或 logging 層級過高，API Key 可能意外曝光於日誌或 error traceback。

## 驗收標準
- [x] 新增 `mask_api_key()` 函數，使用 regex 遮罩 `api_key=sk-xxxx...xxxx` 中的金鑰（保留前 4 碼 + 後 4 碼）
- [x] `get_llm()` 中 logging 輸出 API Key 前先透過 `mask_api_key()` 遮罩
- [x] error traceback 捕捉例外時先遮罩再寫入 log
- [x] dockerfile 已支援從 .env 載入環境變數

## 備註
- ChatOpenAI 的 repr 預設會顯示 `api_key='sk-...'`，需注意
- 可透過 `langchain` 的 callback 機制過濾敏感資訊
