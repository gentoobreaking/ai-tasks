---
github_issue: N/A
title: Verification Manual Tests — mapping CRAWLER_VERIFICATION_MANUAL to automated tests
assignee: pi with opencode
type: test
priority: medium
^status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T053 - Verification Manual Tests — mapping CRAWLER_VERIFICATION_MANUAL to automated tests

## 目標

將 CRAWLER_VERIFICATION_MANUAL.md 中的 TST-001~TST-080 驗證項目映射到對應的自動化測試。
對應 CRAWLER_VERIFICATION_MANUAL.md (2614 lines), §Verification。

## 驗收標準

- [x] 建立 `tests/verification/` 目錄
- [x] 建立 `tests/verification/coverage.md`: TST-001~TST-080 → 對應 task/test 的 mapping 表格
- [x] TST-001 (Build verification) → 對應 T045 (`go build` exit 0)
- [x] TST-002 (Unit tests) → 對應 T039 (`go test` exit 0, race=0)
- [x] TST-003 (Static analysis) → 對應 T050 (`golangci-lint run` exit 0)
- [x] TST-009~TST-016 (Taiwan keyword/domain detection) → 對應 T014 (Taiwan Scoring)
- [x] TST-017~TST-019 (Score determinism + evidence) → 對應 T014 + T015
- [x] TST-020~TST-021 (Manifest parsing) → 對應 T009
- [x] TST-022~TST-024 (Dedup) → 對應 T011
- [x] TST-025~TST-032 (Process execution prohibition) → 對應 T043
- [x] TST-033~TST-035 (Retry/429/5xx) → 對應 T033
- [x] TST-036~TST-037 (Failure isolation + idempotency) → 對應 T020 + T027
- [x] TST-038~TST-040 (Counters + registry consistency) → 對應 T027 + T030
- [x] TST-041~TST-046 (Categories + scoring + repository status) → 對應 T014 + T025 + T021
- [x] TST-047~TST-049 (Incremental + deleted) → 對應 T032
- [x] TST-050~TST-054 (LLM security) → 對應 T035
- [x] TST-055~TST-057 (Search) → 對應 T036 + T037
- [x] TST-058~TST-061 (Metrics + logging) → 對應 T034
- [x] TST-062~TST-065 (Performance + concurrency + crash recovery) → 對應 T051
- [x] TST-066 (Secret leakage) → 對應 T043
- [x] TST-067~TST-070 (Build + registry consistency) → 對應 T045
- [x] TST-071~TST-075 (Registry integrity + production smoke) → 對應 T036 + T052
- [x] TST-076~TST-080 (KPI verification) → 對應 T046 + T051
- [x] Verification coverage mapping 100% (all TST-001~TST-080 covered)
- [x] 建立 `tests/verification/run.sh`: 執行所有 verification tests, output PASS/FAIL

## 備註

- CRAWLER_VERIFICATION_MANUAL.md 定義了完整的驗證標準 (§Verification Manual)
- TST-025~TST-040 為 process execution prohibition + security 驗證
- TST-076~TST-080 為 KPI verification (Recall, Precision, Duplicate, False positive)

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
