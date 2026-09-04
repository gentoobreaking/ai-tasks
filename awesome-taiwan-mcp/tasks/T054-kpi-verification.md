---
github_issue: N/A
title: KPI Verification — Recall, Precision, Duplicate rate, False positive
type: test
priority: high
status: pending
depends_on: [T046, T051, T041]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T054 - KPI Verification — Recall, Precision, Duplicate rate, False positive

## 目標

驗證業界關鍵績效指標 (KPI)。對應 CRAWLER_AGENT_TASKS.md §51 TASK-054, §51 Global Acceptance Criteria, §TST-076~TST-080。

## 驗收標準

- [ ] Recall >= 80% (§51): (Taiwan MCPs found) / (Taiwan MCPs exist in universe of discourse) >= 0.80
- [ ] Precision >= 85% (§51): (True positive Taiwan classifications) / (Total Taiwan classifications) >= 0.85
- [ ] False positive rate <= 5% (§51): (Non-Taiwan classified as Taiwan) / (Total non-Taiwan) <= 0.05
- [ ] Duplicate rate < 5% (§51): (Duplicate servers in registry) / (Total servers) < 0.05
- [ ] KPI test 使用 golden dataset (T046) 計算:
  - True Positives: Taiwan labeled as Taiwan
  - False Negatives: Taiwan labeled as non-Taiwan
  - False Positives: non-Taiwan labeled as Taiwan
  - Precision = TP / (TP + FP)
  - Recall = TP / (TP + FN)
  - F1 Score = 2 * (P * R) / (P + R)
- [ ] KPI test: 100 Taiwan fixtures → recall >= 80%, precision >= 85%, false positive <= 5%
- [ ] KPI test: 100 non-Taiwan fixtures → false positive <= 5% (no non-Taiwan labeled as T3+)
- [ ] KPI test: 50 duplicate pairs → all identified and deduped
- [ ] KPI test: 10 連續 crawl → duplicate server IDs = 0 (§TST-074)
- [ ] KPI test 結果保存: recall, precision, f1, false_positive_rate, duplicate_rate, timestamp

## 備訊

- KPI 是 v0.1 release gate (§3 Release-Level Acceptance: Overall >= 95%)
- KPI thresholds: Recall 80%, Precision 85%, False positive 5%, Duplicate 5% (§51)
- KPI test 基於 golden dataset, 每次 classifier 更改都要重新驗證
