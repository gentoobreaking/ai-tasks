---
github_issue: N/A
title: Regression Golden Dataset — TST-068 classification/identity/dedup accuracy
assignee: pi with opencode
type: test
priority: medium
status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T046 - Regression Golden Dataset — TST-068 classification/identity/dedup accuracy

## 目標

建立 golden dataset regression tests。對應 §TST-068 Regression Golden Dataset, §TST-069 Ground Truth Regression。

## 驗收標準

- [x] `tests/fixtures/golden/` 建立, 包含 100 Taiwan, 100 non-Taiwan, 50 duplicate, 30 ambiguous, 20 invalid, 20 archived, 20 unavailable
- [x] Golden dataset test: classification accuracy = 100%
- [x] Golden dataset test: identity accuracy = 100%
- [x] Golden dataset test: dedup expected cases = 100%
- [x] Golden dataset test: invalid handling = 100%
- [x] 每次 classifier 修改 → 重新執行 golden dataset (§TST-069)
- [x] 若無明確更新 rule → previous expected = actual = 100% (§TST-069)
- [x] 若刻意改變 rule → classifier_version changed, expected dataset updated, change documented (§TST-069)
- [x] Golden dataset test 整合到 CI pipeline
- [x] Golden dataset test 結果保存為 evidence (test_id, result, accuracy, git_commit, timestamp)

## 備註

- Golden dataset 是 regression testing 的基礎
- 每次 classifier 更改都必須重新驗證 (§TST-069)
- 建議將 golden dataset 標記為 dataset-v0.1 (§TST-069)

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
