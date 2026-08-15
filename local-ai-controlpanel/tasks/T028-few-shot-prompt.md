---
github_issue: N/A
title: Few-shot Prompt Engineering（精選錯誤→修正案例）
type: feature
priority: high
status: done
depends_on: [T027]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: 2026-08-15
---

# T028 - Few-shot Prompt Engineering（精選錯誤→修正案例）

## 目標

在 Pi Worker 的 prompt 中加入 3–5 筆精選的「錯誤→修正」對照案例，透過 few-shot learning 讓模型在首次嘗試時即能產出符合風格規範的 code，進一步降低 lint=FAIL 率並提升首次嘗試通過率。

## 驗收標準

- [x] 在 `apps/control-plane/src/worker/pi-worker.ts` 的 prompt 建構中加入 few-shot 區塊
- [x] 精選 3–5 筆「錯誤→修正」對照案例，涵蓋：F401 import 位置、E302 空行、E501 行長、F403 星號匯入
- [x] 每筆案例格式：`錯誤輸出` → `修正後 code diff`（僅展示關鍵變更，不放完整檔案）
- [ ] 驗證：加入 few-shot 後，Python tasks 首次嘗試 lint=PASS 率提升 ≥ 30%（未達標，見驗證紀錄）
- [x] 單元測試：確認 prompt 包含 few-shot 關鍵標記

## 驗證紀錄（2026-08-15，robit/ornith:9b via ollama，Python `requests` task，e2e-runner --mode=llama）

| Phase | 設定 | n | run 級 lint=FAIL | 首次驗證 attempt lint=PASS |
|---|---|---|---|---|
| B | 風格規範（T027） | 4 | 0%（0/4） | 100%（4/4） |
| C | 規範 + few-shot | 15 | 33%（5/15） | 67%（10/15） |

- **未達門檻**：首次嘗試 lint=PASS 為 67% vs 對照組 100%（−33pp），未達「提升 ≥ 30%」
- 失敗分析：C 組 5/15 run 出現「整檔重寫」——模型把既有 module docstring 段落錯置後產生無效 Python（E999 syntax error），B 組 0/4 無此狀況；few-shot 案例的 docstring-less diff 示範疑似誘發整檔重寫行為（案例 1 已加「保留既有 docstring」context line 降低此傾向，但 9B 模型仍偶發）
- 相對無規範基線（A 組 50%）仍為大幅改善：50% → 67%（+17pp）
- 單元測試：`pi-worker.test.ts` 8/8 通過（含 few-shot 標記斷言）
- 已於備註 1/2 嘗試調校（案例 context line + 最小變更強調），n 已達 15，判定此單一 benchmark task 下 few-shot 邊際增益已被 T027 完全取代

## 備註

- 優先序：風格規範 > Few-shot > RAG
- 只放「關鍵變更 diff」，不放完整檔案，控制 token 在 800 tokens 以內（實測 1037 字元/CJK ≈ 700–800 tokens 邊界，下版可再精簡）
- 案例需符合風格規範（T027），不可違反規範
- 定期（每月）審視並更新案例庫（建議以 T029 RAG 案例新增後重跑驗證；或換 qwen2.5-coder 等 code 特化模型再測）
- 相關任務：T027 (風格規範), T029 (RAG)