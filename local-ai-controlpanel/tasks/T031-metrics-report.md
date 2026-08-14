---
github_issue: N/A
title: CP Gain / Intelligence Efficiency / Research ROI 指標計算與自動化報告
type: feature
priority: high
status: pending
depends_on: [T030]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: 2026-08-15
---

# T031 - CP Gain / Intelligence Efficiency / Research ROI 指標計算與自動化報告

## 目標

實作 Spec §36 定義的核心 KPI 自動計算與報告生成，支援 Architecture Validation Gate（§38）的 CP Gain ≥ +15pp 判定。

## 驗收標準

- [ ] 實作 `scripts/compute_metrics.py` 核心指標計算模組：
  - **Task Success Rate** = successful_tasks / total_tasks
  - **First Attempt Success Rate** = first_attempt_success / total_tasks
  - **Verification Pass Rate** = passing_final_verification / total_tasks
  - **Retry Count** = average_attempts
  - **Hallucination Rate** = hallucination_evidence / total_attempts（§36.2 error-signature 自動分類）
  - **Unauthorized Mod. Rate** = blocked_changes / attempted_changes
  - **CP Gain** = Success_Rate(F) − Success_Rate(A) （§36.3）
  - **Intelligence Efficiency** = Task Success / Model Compute（或 Success / Token）
  - **Research ROI** = Success Gain / Research Cost（web requests、latency、tokens、local compute）
  - **Prevention Rate** = gate_blocks / total_tasks（§36.2）

- [ ] 實作 `scripts/generate_report.py` 自動化報告生成：
  - 輸入：`results-keep/t030_baseline_*/` 所有 baseline 結果目錄
  - 輸出：`results-keep/t031_reports/benchmark_report_YYYYMMDD.md` + JSON
  - 包含：Baseline A–F 對照表、CP Gain 信賴區間、各指標趨勢圖（ASCII/文字）、Architecture Validation Gate 判定結果

- [ ] 整合到 `run_baseline_f.py` → `run_baseline.py` 流程：跑完自動觸發指標計算與報告生成

- [ ] Architecture Validation Gate（§38）自動判定：
  - CP Gain ≥ +15pp → PASS（可進入 Phase 6+）
  - CP Gain < +15pp → FAIL（需回頭修 Research/Policy/Verification 設計）

- [ ] Hallucination Rate 自動分類（§36.2）：
  - ModuleNotFoundError / ImportError → hallucinated module/symbol
  - AttributeError → hallucinated field/method
  - Cannot find symbol / undefined reference → 編譯期幻覺（Go/Rust）
  - 禁止 LLM-as-judge 進報告數字；人樣本校正（N≈20–50、Cohen's κ ≥ 0.7）為補充項

- [ ] `research_degraded_tasks` 獨立計數（§14.3 規則 3）

- [ ] 結果保存於 `results-keep/t031_reports/` 對應位置（§36.4 清單）

## 備註

- 依賴：T030 完成（Baseline A–F 數據齊全）
- 輸出格式：Markdown 報告 + JSON 機器可讀 + CSV 明細
- 預估開發時間：2-3 天
- 可複用 `scripts/export_sqlite_to_csv.py` 的 join 邏輯

## 實作檔案結構

```
scripts/
├── compute_metrics.py      # 核心指標計算
├── generate_report.py      # 報告生成
├── hallucination_classifier.py  # §36.2 error-signature 分類
└── validation_gate.py      # Architecture Validation Gate
```