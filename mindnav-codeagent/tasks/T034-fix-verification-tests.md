---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/538
title: T034 - 修復驗證框架測試使其全部通過
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: fix
---

# T034 - 修復驗證框架測試使其全部通過

## 目標
`projects/mindnav/logs/verification_report.md` 顯示 4/5 驗證項目失敗：

| 項目 | 結果 |
|------|------|
| T001_inference | ❌ |
| T002_rag | ❌ |
| T009_security | ❌ |
| T013_llm_factory | ❌ |
| T023_git_audit | ✅ |

需逐一排查失敗原因並修復，使驗證框架 100% 通過。

## 驗收標準
- [x] 修復 T001_inference 驗證：確認推理伺服器端點可連通或 mock 模式正常運作
- [x] 修復 T002_rag 驗證：確認 ChromaDB 初始化與檢索無錯誤
- [x] 修復 T009_security 驗證：確認 SafeShell 白名單/黑名單規則正確觸發
- [x] 修復 T013_llm_factory 驗證：確認 LLMFactory 返回正確的 ChatOpenAI 實例
- [x] 執行 `python engine/tests/verify_all.py` 後 5/5 顯示 ✅

## 備註
- 部分驗證需 mock 外部服務（推理伺服器、Tavily API）
- `config/verification_list.yaml` 可能需要補全缺少的驗證項目（如 Router、Context Mgmt、Telegram 等模組）
