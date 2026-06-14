---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/518
title: T011 - 系統整合測試與壓力測試
type: Feature
priority: medium
status: done
assignee: gemini-cli
created: 2026-05-15
updated: 2026-05-15
---

# T011 - 系統整合測試與壓力測試

## Description
對整個系統進行端到端整合測試，並進行長文本與高併發壓力測試。

## Acceptance Criteria
- [x] 完成全流程走通測試（從下令到代碼生成與文件更新）。
- [x] 進行長文本壓力測試，確認 Message Pruning 正常觸發。
- [x] 模擬多個對話場景，驗證 Thread 隔離與節點流轉正確性。

## Notes
- 測試腳本位於 `src/tests/integration_test.py`。
- 觀察到本地 Qwen2.5-Coder 模型推理延遲約為 10-20s (視生成長度而定)。
- 驗證了 Message Pruning 在訊息數超過 15 條時的觸發邏輯。
- 節點流轉穩定：PM -> Coder -> Doc 循環運作正常。
