---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/549
title: T045 - verify_all.py 實質檢查補全
type: Feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: implement
---

# T045 - verify_all.py 實質檢查補全

## 目標
`config/verification_list.yaml` 的 T002_rag 使用 `check_db_size()`，該函數僅 `try/except True/False`，並未驗證 ChromaDB 能否實際檢索。部分其他檢查也過於淺層。

## 驗收標準
- [x] `check_db_size()` 改為實際寫入測試 Document 再搜尋回來驗證（使用 in-memory ChromaDB）
- [x] `verify_connection()` 改為實際發送 `llm.invoke("test")` 的請求
- [x] `verify_factory()` 檢查每個角色 LLM 的 base_url 與 model 正確性，並發送測試請求
- [x] 補全 `config/verification_list.yaml` 缺少的模組檢查（Router: `verify_router`, ContextMgmt: `verify_context_manager`, Telegram: 命令檢查）
- [x] 執行 `python engine/tests/verify_all.py` 後所有項目顯示 ✅（需等 LLM 就緒）

## 備註
- ChromaDB 測試建議用暫時性的記憶體模式 (in-memory)，避免污染正式資料
- 新增的驗證項目應先在 verification_list.yaml 註冊
