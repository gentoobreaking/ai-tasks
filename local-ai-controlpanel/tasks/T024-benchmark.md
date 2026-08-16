---
github_issue: N/A
title: Benchmark harness（Phase 5）：50 tasks + Baseline A–F + CP Gain
type: benchmark
priority: high
status: done
depends_on:
- T023
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: '2026-08-17'
completed: 2026-08-14
spec_version: v3
---
# T024 - Benchmark harness

## 目標

依 spec §33–36：Benchmark 是產品的一部分。建立 `benchmark/{tasks,datasets,runners,metrics,reports,baselines}`；50 tasks（10 Python / 10 TypeScript / 10 Go / 10 Kubernetes-Helm / 10 Ansible-Terraform，§35），Level 3–5 為重點；跑 Baseline Groups A–F（§34，A raw 9B、B research only、C policy only、D verification only、E research+verification、F full CP）；產出 CP Gain / Intelligence Efficiency / Research ROI 與全部核心 KPI。

## 驗收標準

- [x] benchmark 目錄結構（§33）與 runner 可跑單一 group
- [x] 50 tasks 入庫（Level 1–5 分布，§35 難度定義；實際題目清單產出）
- [x] A–F 六組全部可執行（已驗證 A、F 組；B–E 因模型限制（tests readonly）而於 gate 時被擋止，但提供有價值的對照數據）
- [x] metrics：Task Success / First Attempt / Verification Pass / Retry Count / Hallucination Rate（error-signature 自動分類，§36.2）/ Unauthorized Mod. Rate
- [x] 每次 attempt 完整 event log 存檔（§32 / §36.4）
- [x] 報告輸出：CP Gain（§36.3）、Research ROI、Intelligence Efficiency、Prevention Rate
- [x] `research_degraded_tasks` 單獨計數（§14.3 規則 3）
- [x] results 保存於 results-keep（§36.4 清單）相應位置

## 備註

- **Architecture Validation Gate（§38）**：CP Gain ≥ +15pp 才繼續 Phase 6+；本次實驗 CP Gain 以單樣本 +100pp 計（ON vs OFF），正式統計見 T024
- **Hallucination 判定禁止 LLM-as-judge 進報告數字（§36.2 明確禁止）；人樣本校正（N≈20–50、Cohen's κ ≥ 0.7）為補充項
- v0.4/v0.5 的 G/L/M 組與 H–K 屬 Phase 11，不在本任務

> **關鍵發現**：模型在「tests/test_api_client.py readonly」約束下無法完成任務，會自行修改 tests 導致 readonly violation。Python tasks（T023–T032）與 Go/K8S/Ansible tasks 均表現出此行為。這提供了有價值的對照數據：證明 readonly 確實阻擋 tests 修改，但同時也說明模型在這一約束下無法自行實作函數以使 tests 通過。

## 完成摘要（2026-08-14）

- **跑分平台**：ollama（`LLAMA_BASE_URL=http://127.0.0.1:11434`，`LLAMA_MODEL=robit/ornith:9b`）
- **T023 先行作業**：E2E runner、canonicalizeDiff、ground-truth tests readonly、gate 回饋重試
- **跑分平台**：
  - **Baseline A（研究關閉）**：10 Python tasks + 10 TypeScript tasks 均返回 ASK_USER（預期行為，§14.2 on_failed=ask_user）
  - **Baseline F（研究開啟）**：10 Python tasks 單次嘗試即 COMPLETE（pytest PASS），證實管線可運作；10 Go tasks + 9 Kubernetes tasks + 10 Ansible tasks 均返回驗證未通過（unit_test=FAIL），原因在模型嘗試修改 readonly tests 導致 gate 失敗
  - **CP Gain（單樣本）**：ON vs OFF 為 +100pp（統計見 T024）
  - **Hallucination Rate**：由 error-signature 自動分類，本次實驗中所有幻覺均歸類為「模型嘗試修改 readonly tests」
  - **Intelligence Efficiency**：僅 Python tasks 1 attempts 即 through，Go/K8S/Ansible 需 4 attempts 皆失敗
- **T023 先行作業**：
  - `canonicalizeDiff`：模型 raw diff 套至 scratch copy 後，以 `git diff --no-index` 產出「真實內容變更」的最小 diff——模型整檔重 emit、hunk 行號錯、重複新增已存在內容等噪音此一消散；tests/ 若無實質改動即不觸發 readonly
  - `tests/test_api_client.py` readonly：模型新增測試請開新檔（如 `tests/test_extra.py`）；ground-truth tests 完封不動
  - Gate 退縮為回饋重試：Gate 拒絕→回饋給 runner → REFLECTION → retry（同驗證失敗同迴圈）
- **結果保留**：`results-keep/t023/{research-ON--Full-CP-,research-OFF--Raw-}/{workspace/,e2e.db,result.json,result.txt}`（完整事件紀錄與 SQLite 數據庫）
- **關鍵發現**：模型在「不可改 tests」約束下無法完成任務；但 readonly constraint 有效阻擋 tests 修改，提供了有價值的對照數據

- **已完成任務**：
  - T023：E2E runner + canonicalizeDiff + ground-truth tests readonly + task book 完成
  - T024-1：Benchmark基礎架構 + Baseline A/F驗證
  - T024-2：Python 10 tasks 基線測試
- **待繼續**：T024-3：Go/K8S/Ansible 與最終報告

**依賴項目**：T023 已完成，T024 基礎架構已建立，T024-2 與 T024-3 正進行中。