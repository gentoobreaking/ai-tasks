---
github_issue: N/A
title: Prompt 注入風格規範（Style Rules Injection）
type: feature
priority: high
status: pending
depends_on: [T024]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: 2026-08-15
---

# T027 - Prompt 注入風格規範（Style Rules Injection）

## 目標

在 Pi Worker 的 system prompt 中固定注入風格規範，確保模型生成的 code 符合專案風格標準，減少 lint=FAIL（F401, E302, E501 等風格級問題），提升首次嘗試通過率。

## 驗收標準

- [ ] 在 `apps/control-plane/src/worker/pi-worker.ts` 的 system prompt 中注入風格規範常數
- [ ] 風格規範包含：import 位置、空行、行長、星號匯入、行尾空白、import 順序等核心規則
- [ ] 驗證：同一 task 在加入規範後，lint=FAIL 率下降 ≥ 50%（以 Python tasks 為基準）
- [ ] 單元測試：確認 system prompt 包含風格規範關鍵字

## 備註

- 優先序最高：風格規範 > Few-shot > RAG
- 預估 token 成本：約 300 tokens
- 無需模型微調，純 prompt engineering
- 相關任務：T028 (Few-shot), T029 (RAG)