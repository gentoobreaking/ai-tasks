---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/535
title: T031 - 補全整合測試腳本 Integration Test
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: implement
---

# T031 - 補全整合測試腳本 Integration Test

## 目標
Review 發現 `engine/tests/integration_test.py`（T011 備註中提及）不存在。需建立完整的端到端整合測試腳本，涵蓋全流程走通、多 Thread 隔離、節點流轉正確性等測試場景。

## 驗收標準
- [x] 建立 `engine/tests/integration_test.py`
- [x] 全流程走通測試：從用戶下指令到 PM→Coder→Doc 循環完成
- [x] 多 Thread 隔離測試：模擬兩個並發對話，驗證記憶不混淆
- [x] 節點流轉測試：驗證 Supervisor 路由至各 Agent 的正確性
- [x] Message Pruning 觸發測試：超過 15 條訊息時確認壓縮邏輯生效
- [x] 測試結果自動輸出至 `projects/mindnav/logs/integration_report.md`

## 備註
- 不依賴真實 LLM 推理，使用 Mock LLM 回傳固定結果以確保測試可重複
- 需 mock Redis 連線，避免測試環境需要實際 Redis 實例
