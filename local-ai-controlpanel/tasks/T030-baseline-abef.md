---
github_issue: N/A
title: Baseline Groups A–E 完整跑分與對照驗證
type: benchmark
priority: high
status: in_progress
depends_on: [T024]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: 2026-08-15
---

# T030 - Baseline Groups A–E 完整跑分與對照驗證

## 目標

完成 Spec §34 定義的 Baseline Groups A–E 全部跑分，建立完整的對照實驗數據，支撐 CP Gain、Research ROI、Intelligence Efficiency 等核心 KPI 的統計分析。

目前僅 Baseline F（Full CP）已驗證；Baseline A（Raw 9B）經 stub 驗證；B–E 尚未完整跑分。

| Group | Research | Policy | Verification | 說明 |
|-------|:--------:|:------:|:------------:|------|
| **A** | ❌ | ❌ | ❌ | Raw 9B baseline |
| **B** | ✅ | ❌ | ❌ | Research Only |
| **C** | ❌ | ✅ | ❌ | Policy Only |
| **D** | ❌ | ❌ | ✅ | Verification Only |
| **E** | ✅ | ❌ | ✅ | Research + Verification |
| **F** | ✅ | ✅ | ✅ | Full CP（已驗證） |

## 驗收標準

- [x] Baseline A（Raw 9B）：research=off, policy=off, verification=off → stub/llama 模式可跑通
- [x] Baseline B（Research Only）：research=on, policy=off, verification=off → 可驗證 research 對成功率的獨立貢獻
- [ ] Baseline C（Policy Only）：research=off, policy=on, verification=off → 驗證 policy 對成功率的獨立貢獻（需實作 3-retry ASK_USER 流程）
- [ ] Baseline D（Verification Only）：research=off, policy=off, verification=on → 驗證 verification 獨立貢獻
- [ ] Baseline E（Research + Verification）：research=on, policy=off, verification=on → 驗證 research+verification 組合效果
- [x] Baseline F（Full CP）：已完成，作為基準線
- [ ] 所有 Baseline 在 Python 10 tasks（T023–T032）上完整跑分
- [ ] 產出 Baseline A–F 對照表：success rate、first attempt success、avg attempts、evidence count、CP Gain
- [ ] 結果保存至 `results-keep/t030_baseline_abef/`，含完整 event log、e2e.db、patch_evidence_join.csv

## 基礎建設完成項目（2026-08-15）

- **PolicyEngine 增強**：新增 `enabled` 選項，關閉時自動 ALLOW_PLANNING、evaluateResearch PASS、researchFailurePolicy 直接 allow_local
- **Benchmark Runner**：`benchmark/runners/baseline-runner.ts` 支援 `--baseline A|B|C|D|E|F|all`、`--max-tasks N`、`--tasks T023...`、`--mode llama|stub`、`--keep`
- **Python 10 Tasks Dataset**：新增 4 個缺失的 seed datasets（`py-pandas`、`py-sqlalchemy`、`py-fastapi`、`py-redis`）到 `benchmark/datasets/`，共 10 個 Python datasets 就緒
- **Evidence Injection**：修正 `recordEvidence` 格式（array of facts），研究注入邏輯正常
- **Baseline A、B（stub/llama）**：單任務驗證通過
- **Results 儲存**：自動輸出 JSON 到 `results-keep/t030_baseline_abef/`

## 待完成項目（預估 8-12h 計算時間）

| Baseline | 狀態 | 問題 |
|---------|------|------|
| A (Raw 9B) | ✅ Stub/Llama 單任務驗證 | 需完整 10 tasks |
| B (Research Only) | ✅ Stub/Llama 單任務驗證 | 需完整 10 tasks |
| C (Policy Only) | ❌ | 需實作 research-off + policy-on 的 3-retry ASK_USER 流程 |
| D (Verification Only) | ❌ | 需實作 verification-only 流程（policy off + verification on） |
| E (Research + Verification) | ❌ | 需實作 research + verification 組合流程 |
| F (Full CP) | ✅ 完成 | 已有完整數據 |

- **完整 10 Python tasks × 6 Baselines**：需 8-12h（50 task-runs × 3-6 min/推理，含重試）
- **Baseline C、D、E 流程邏輯**：需補全 runner 中的 research-off/policy-on/verification-on 組合邏輯
- **對照報告生成**：自動產出 CP Gain、success rate、first attempt success、avg attempts 表格

## 備註

- 需修改 `run_baseline_f.py` → `run_baseline.py` 支援 `--baseline A|B|C|D|E|F|all` 參數
- Policy Engine 需支援 `policy.enabled=false`、`verification.enabled=false` 等關閉開關
- Runner 需支援關閉 verification engine、policy engine 的對應路徑
- 預估時間：5 組 × 10 tasks × 4 attempts ≈ 200 次推理 ≈ 8-12 小時
- 依賴：T024 基礎架構已就緒、T027 風格規範、T028 Few-shot、T029 RAG（可選）

## 實作順序建議

1. 修改 `runner.ts` 支援 baseline 參數控制 research/policy/verification 三開關
2. 修改 `policy/engine.ts` 支援 policy/verification enabled 開關（✅ 已完成）
3. 擴充 `run_baseline_f.py` → `run_baseline.py` 支援 `--baseline A|B|C|D|E|F|all`（✅ 已完成 runner 核心邏輯）
4. 實作 Baseline C、D、E 的 research/policy/verification 組合邏輯（進行中）
5. 依序跑 Baseline A、B、C、D、E、F（F 已完成可復用）
6. 產出對照報告與 CP Gain 計算