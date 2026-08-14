---
github_issue: N/A
title: Few-shot Prompt Engineering（精選錯誤→修正案例）
type: feature
priority: high
status: pending
depends_on: [T027]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: 2026-08-15
---

# T028 - Few-shot Prompt Engineering（精選錯誤→修正案例）

## 目標

在 Pi Worker 的 prompt 中加入 3–5 筆精選的「錯誤→修正」對照案例，透過 few-shot learning 讓模型在首次嘗試時即能產出符合風格規範的 code，進一步降低 lint=FAIL 率並提升首次嘗試通過率。

## 驗收標準

- [ ] 在 `apps/control-plane/src/worker/pi-worker.ts` 的 prompt 建構中加入 few-shot 區塊
- [ ] 精選 3–5 筆「錯誤→修正」對照案例，涵蓋：F401 import 位置、E302 空行、E501 行長、F403 星號匯入
- [ ] 每筆案例格式：`錯誤輸出` → `修正後 code diff`（僅展示關鍵變更，不放完整檔案）
- [ ] 驗證：加入 few-shot 後，Python tasks 首次嘗試 lint=PASS 率提升 ≥ 30%
- [ ] 單元測試：確認 prompt 包含 few-shot 關鍵標記

## 備註

- 優先序：風格規範 > Few-shot > RAG
- 只放「關鍵變更 diff」，不放完整檔案，控制 token 在 800 tokens 以內
- 案例需符合風格規範（T027），不可違反規範
- 定期（每月）審視並更新案例庫
- 相關任務：T027 (風格規範), T029 (RAG)