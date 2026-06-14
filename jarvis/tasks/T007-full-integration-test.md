---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/742
title: T007-全流程整合測試
type: Verification
priority: high
status: done
assignee: 寶寶 代碼農1號執行）
created: 2026-05-13
updated: 2026-05-13
depends: T001, T002, T003, T004, T005, T006
howto:
---

# T007 - 全流程整合測試（端對端）

## Description

端對端驗證：語音輸入 → ASR → LLM 大腦 → TTS 語音輸出 + 口型同步 → HUD 呈現。
覆蓋正常流程 + 異常 fallback + 壓力測試。

## Acceptance Criteria

- [ ] 語音輸入 → HUD 顯示文字 → TTS 語音回應 → 口型同步動畫
- [ ] 文字輸入 → 文字回應 → TTS 語音回應 → 口型同步動畫
- [ ] 任一模組失敗時其餘模組不受影響（隔離測試）
- [ ] 連續對話 10 輪無記憶體洩漏（RSS 穩定）
- [ ] M2 Metal 推理：LLM token/s ≥ 15 tok/s
- [ ] 端對端延遲：語音進（5秒） → 回應（< 3秒）可接受
- [ ] 全流程可從頭重啟（kill + restart 無狀態殘留）
- [ ] `tests/test_e2e.py` 覆蓋全部場景

## Notes

- 這是最終驗收關卡，前面所有任務完成後才執行
- 測試案例分為：happy path、error path、stress path
