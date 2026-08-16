---
github_issue: N/A
title: CP Gain / Intelligence Efficiency / Research ROI 指標計算與自動化報告
type: feature
priority: high
status: done
depends_on: [T030]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: 2026-08-17
---

# T031 - CP Gain / Intelligence Efficiency / Research ROI 指標計算與自動化報告

## 目標

實作 Spec §36 定義的核心 KPI 自動計算與報告生成，支援 Architecture Validation Gate（§38）的 CP Gain ≥ +15pp 判定。

## 驗收標準

- [x] 實作 `scripts/compute_metrics.py` 核心指標計算模組：
  - [x] **Task Success Rate** = successful_tasks / total_tasks
  - [x] **First Attempt Success Rate** = first_attempt_success / total_tasks
  - [x] **Verification Pass Rate** = passing_final_verification / total_tasks
  - [x] **Retry Count** = average_attempts
  - [x] **Hallucination Rate** = hallucination_evidence / total_attempts（§36.2 error-signature 自動分類）
  - [x] **Unauthorized Mod. Rate** = blocked_changes / attempted_changes
  - [x] **CP Gain** = Success_Rate(F) − Success_Rate(A) （§36.3）
  - [x] **Intelligence Efficiency** = Task Success / Model Compute（或 Success / Token）
  - [x] **Research ROI** = Success Gain / Research Cost（web requests、latency、tokens、local compute）
  - [x] **Prevention Rate** = gate_blocks / total_tasks（§36.2）

- [x] 實作 `scripts/hallucination_classifier.py` 幻覺分類器（§36.2 error-signature 自動分類）
- [x] 實作 `scripts/validation_gate.py` Architecture Validation Gate（§38）
- [x] 實作 `scripts/generate_report.py` 自動化報告生成：
  - [x] 輸入：`results-keep/t030_baseline_abef/` 所有 baseline 結果目錄
  - [x] 輸出：`results-keep/t031_reports/benchmark_report_YYYYMMDD.md` + JSON + CSV
  - [x] 包含：Baseline A–F 對照表、CP Gain 信賴區間、各指標趨勢圖（ASCII/文字）、Architecture Validation Gate 判定結果
  - [x] Hallucination Rate 自動分類（§36.2）

- [x] 整合到 `run_baseline.py` 流程：跑完自動觸發指標計算與報告生成（`--auto-report`）
- [x] Architecture Validation Gate（§38）自動判定（CP Gain ≥ +15pp → PASS/FAIL）
- [x] `research_degraded_tasks` 獨立計數（§14.3 規則 3，已在 compute_metrics.py 實作）
- [x] 結果保存於 `results-keep/t031_reports/` 對應位置（§36.4 清單）

## 基礎建設完成狀況（2026-08-17）

已完成的檔案：
- `scripts/compute_metrics.py` - 核心指標計算（Task Success Rate, First Attempt, Verification Pass, Retry Count, Hallucination Rate, Unauthorized Mod, CP Gain, Intelligence Efficiency, Research ROI, Prevention Rate）
- `scripts/hallucination_classifier.py` - §36.2 error-signature 自動分類（ModuleNotFoundError/ImportError→module_not_found, AttributeError→attribute_error, undefined→undefined_reference, syntax_error）
- `scripts/validation_gate.py` - Architecture Validation Gate（CP Gain ≥ +15pp → PASS/FAIL）
- `scripts/generate_report.py` - 自動化報告生成（Markdown + JSON + CSV，含對照表、ASCII 趨勢圖、CP Gain 分析、Gate 判定）
- `scripts/run_baseline.py` - 整合 `--auto-report` 旗標，跑完 baseline 自動觸發完整 T031 pipeline

已驗證功能：
- ✅ `compute_metrics.py` 正常讀取 `results-keep/t030_baseline_abef/` 並計算指標
- ✅ `hallucination_classifier.py` 正常分類錯誤並輸出 CSV/JSON
- ✅ `validation_gate.py` 正常判定 Gate（目前缺 F baseline 故 FAIL，符合預期）
- ✅ `generate_report.py` 正常生成 Markdown/JSON/CSV 報告
- ✅ `run_baseline.py --auto-report` 完整 pipeline 自動執行驗證通過

## 待完成項目（依賴 T030 F baseline 完整跑分）

- [ ] F baseline（Full CP）需 llama.cpp 實際跑分，產生有效的 CP Gain 數據（目前 stub 模式 verification 為 0%，導致 CP Gain 負值）
- [ ] 完整 Baseline A–F 數據下的 Gate PASS 驗證（需 F baseline success > A baseline success + 15pp）

## 備註

- 依賴：T030 完成（Baseline A/B/C 已在 stub 模式 10/10 success；D/E/F 需 llama.cpp）
- 輸出格式：Markdown 報告 + JSON 機器可讀 + CSV 明細
- 可複用 `scripts/export_sqlite_to_csv.py` 的 join 邏輯

## 實作檔案結構

```
scripts/
├── compute_metrics.py      # 核心指標計算
├── generate_report.py      # 報告生成
├── hallucination_classifier.py  # §36.2 error-signature 分類
├── validation_gate.py      # Architecture Validation Gate
└── run_baseline.py         # T030 runner + --auto-report 整合
```