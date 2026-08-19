---
github_issue: N/A
title: AI Analyst（§41–44 / §73 / §74，唯讀 frozen snapshot）
type: task
priority: P1
status: done
depends_on: [T016]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-19
---

# T017 - AI Analyst（§41–44 / §73 / §74，唯讀 frozen snapshot）

## 目標

實作 `ai/`（analyst / prompts / schema / validator）：AI 只能讀取 frozen snapshot 產出分析（§77.0 依賴圖：snapshot FREEZE → ai_analysis），輸出結構化 schema（§42），含 Hallucination Detection（§44）→ `validator_report`，AI 無法修改任何量化結果（§2.4 AI Isolation、§78 DoD）。

## 驗收標準

- [x] AI 輸入僅來自 frozen snapshot（quant_result.json / analysis_snapshot），無 DB 寫入權限路徑
- [x] AI Output Schema（§42）實作：analysis JSON 合規方可入 `ai_analysis`（status + validator_report，§5.13）
- [x] Prompt Contract（§43）實作；AI 分析層級（§73：Level 0–3）、Context（§74）依 spec
- [x] Hallucination Detection（§44）：數字可驗證性檢查——AI 引用之數值必須與 snapshot 一致，不一致 → validator_report fail，輸出標記
- [x] AI 不得修改 quant result（§78 DoD：AI cannot modify quant result 測試存在且通過）
- [x] AI 成本控制（§72）：token 預算 / 呼叫次數上限，config 可調
- [x] ai_analysis 與 snapshot_id 綁定，可追溯（§78 DoD）

## 備註

- LLM 服務金鑰放環境變數，不得寫入 repo 或 DB（§58）
- AI 不可用的降級：保留「AI 未能產生」（Level 0）而非偽造數字

## 完成摘要（2026-08-19，commit 690c48a）

- `ai/` 套件：`schema.py`（§42 AnalysisOutput + REJECTED）、`validator.py`
  （§44：price/EPS/fair_value/buy zones/score 精度窗口 + rank 敘述專用判定；
  口語序數如「buy zone 2」不誤判）、`prompts.py`（§43 system prompt 逐字）、
  `context.py`（§74：Current/Previous/Changes/Risk flags/market context；
  `facts_of` 與送進 LLM 的 context 同一份）、`providers.py`（OpenAI-compatible
  httpx；key 只走 env）、`analyst.py`（§72/§73 pipeline：Level 0 零呼叫、
  Top 100/30/5、call/token 預算硬頂、未 FROZEN 拒分析、ai_analysis
  ON CONFLICT DO NOTHING）
- `config/ai.yaml`：enabled/level/model/budgets/prompt_version 全部可調
- 測試：46 unit（schema/hallucination/prompt/context/cost/Level 0/唯讀隔離
  靜態檢查）+ 7 e2e（live-PG：VALID 綁定可追溯 / 重跑不覆蓋 / INVALID+
  report / REJECTED 稽核 / Level 0 零呼叫 / 未 FROZEN 拒絕 / market context）
- 品質閘門：ruff 全綠、新檔案 pyright 0 error、全套件 **651 passed, 2 skipped**
- README 新增 T017 段落；§78 DoD 靜態測試保證 ai/ 只有 SELECT + INSERT
  ai_analysis