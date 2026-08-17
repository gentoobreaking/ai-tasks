---
github_issue: N/A
title: AI Analyst（§41–44 / §73 / §74，唯讀 frozen snapshot）
type: task
priority: P1
status: pending
depends_on: [T016]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T017 - AI Analyst（§41–44 / §73 / §74，唯讀 frozen snapshot）

## 目標

實作 `ai/`（analyst / prompts / schema / validator）：AI 只能讀取 frozen snapshot 產出分析（§77.0 依賴圖：snapshot FREEZE → ai_analysis），輸出結構化 schema（§42），含 Hallucination Detection（§44）→ `validator_report`，AI 無法修改任何量化結果（§2.4 AI Isolation、§78 DoD）。

## 驗收標準

- [ ] AI 輸入僅來自 frozen snapshot（quant_result.json / analysis_snapshot），無 DB 寫入權限路徑
- [ ] AI Output Schema（§42）實作：analysis JSON 合規方可入 `ai_analysis`（status + validator_report，§5.13）
- [ ] Prompt Contract（§43）實作；AI 分析層級（§73：Level 0–3）、Context（§74）依 spec
- [ ] Hallucination Detection（§44）：數字可驗證性檢查——AI 引用之數值必須與 snapshot 一致，不一致 → validator_report fail，輸出標記
- [ ] AI 不得修改 quant result（§78 DoD：AI cannot modify quant result 測試存在且通過）
- [ ] AI 成本控制（§72）：token 預算 / 呼叫次數上限，config 可調
- [ ] ai_analysis 與 snapshot_id 綁定，可追溯（§78 DoD）

## 備註

- LLM 服務金鑰放環境變數，不得寫入 repo 或 DB（§58）
- AI 不可用的降級：保留「AI 未能產生」（Level 0）而非偽造數字