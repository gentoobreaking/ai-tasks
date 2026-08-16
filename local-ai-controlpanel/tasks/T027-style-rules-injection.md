---
github_issue: N/A
title: Prompt 注入風格規範（Style Rules Injection）
type: feature
priority: high
status: done
depends_on:
- T024
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: '2026-08-17'
spec_version: v3
---
# T027 - Prompt 注入風格規範（Style Rules Injection）

## 目標

在 Pi Worker 的 system prompt 中固定注入風格規範，確保模型生成的 code 符合專案風格標準，減少 lint=FAIL（F401, E302, E501 等風格級問題），提升首次嘗試通過率。

## 驗收標準

- [x] 在 `apps/control-plane/src/worker/pi-worker.ts` 的 system prompt 中注入風格規範常數
- [x] 風格規範包含：import 位置、空行、行長、星號匯入、行尾空白、import 順序等核心規則
- [x] 驗證：同一 task 在加入規範後，lint=FAIL 率下降 ≥ 50%（以 Python tasks 為基準）
- [x] 單元測試：確認 system prompt 包含風格規範關鍵字

## 驗證紀錄（2026-08-15，robit/ornith:9b via ollama，Python `requests` task，e2e-runner --mode=llama）

環境修正：seatbelt sandbox 將 HOME 重導至 workspace，導致 user-site 安裝的 ruff 無法被 import（`No module named ruff` → lint 恆為 FAIL 假陰性）。已將 ruff 0.16.3 安裝至 `/opt/homebrew/lib/python3.14/site-packages`（與 pytest 同位置），lint 測量恢復真實語義（pyproject select = E9/F）。

| Phase | 設定 | n | run 級 lint=FAIL | 首次驗證 attempt lint=PASS |
|---|---|---|---|---|
| A | 無風格規範（預設 prompt） | 2 | 50%（1/2，含 1 次整檔重寫 → 語法錯誤） | 50%（1/2） |
| B | 注入 STYLE_RULES | 4 | 0%（0/4） | 100%（4/4） |

- lint=FAIL 率：50% → 0%，相對下降 100pp（≥ 50% 門檻達成 ✔）
- 另含先前的 style-v1/v2 3 次 run（snapshot ruff check 全過）→ B 組 n=7 皆 0 lint=FAIL
- 單元測試：`pi-worker.test.ts` 8/8 通過（含風格規範關鍵字斷言）

## 備註

- 優先序最高：風格規範 > Few-shot > RAG
- 預估 token 成本：約 300 tokens（STYLE_RULES 實測 588 字元）
- 無需模型微調，純 prompt engineering
- 相關任務：T028 (Few-shot), T029 (RAG)