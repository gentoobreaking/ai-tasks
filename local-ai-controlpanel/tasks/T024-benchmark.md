---
github_issue: N/A
title: Benchmark harness（Phase 5）：50 tasks + Baseline A–F + CP Gain
type: benchmark
priority: high
status: pending
depends_on: [T023]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: 2026-08-13
---

# T024 - Benchmark harness

## 目標

依 spec §33–36：Benchmark 是產品的一部分。建立 `benchmark/{tasks,datasets,runners,metrics,reports,baselines}`；50 tasks（10 Python / 10 TypeScript / 10 Go / 10 Kubernetes-Helm / 10 Ansible-Terraform，§35），Level 3–5 為重點；跑 Baseline Groups A–F（§34，A raw 9B、B research only、C policy only、D verification only、E research+verification、F full CP）；產出 CP Gain / Intelligence Efficiency / Research ROI 與全部核心 KPI。

## 驗收標準

- [ ] benchmark 目錄結構（§33）與 runner 可跑單一 group
- [ ] 50 個 task 入庫（Level 1–5 分布，§35 難度定義；實際題目清單產出）
- [ ] A–F 六組全部可執行
- [ ] metrics：Task Success / First Attempt / Verification Pass / Retry Count / Hallucination Rate（error-signature 自動分類，§36.2）/ Unauthorized Mod. Rate
- [ ] 每次 attempt 完整 event log 存檔（§32 / §36.4）
- [ ] 報告輸出：CP Gain（§36.3）、Research ROI、Intelligence Efficiency、Prevention Rate
- [ ] `research_degraded_tasks` 單獨計數（§14.3 規則 3）
- [ ] results 保存於 results-keep（§36.4 清單）相應位置

## 備註

- **Architecture Validation Gate（§38）**：CP Gain ≥ +15pp 才繼續 Phase 6+；否則回頭修 Research/Policy/Verification 設計。
- Hallucination 判定禁止 LLM-as-judge 進報告數字（§36.2 明確禁止）；人樣本校正（N≈20–50、Cohen's κ ≥ 0.7）為補充項。
- v0.4/v0.5 的 G/L/M 組與 H–K 屬 Phase 11，不在本任務。