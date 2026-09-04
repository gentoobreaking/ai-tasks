---
github_issue: N/A
title: Verification Manual Tests — mapping CRAWLER_VERIFICATION_MANUAL to automated tests
type: test
priority: medium
status: pending
depends_on: [T041]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T053 - Verification Manual Tests — mapping CRAWLER_VERIFICATION_MANUAL to automated tests

## 目標

將 CRAWLER_VERIFICATION_MANUAL.md 中的 TST-001~TST-080 驗證項目映射到對應的自動化測試。
對應 CRAWLER_VERIFICATION_MANUAL.md (2614 lines), §Verification。

## 驗收標準

- [ ] 建立 `tests/verification/` 目錄
- [ ] 建立 `tests/verification/coverage.md`: TST-001~TST-080 → 對應 task/test 的 mapping 表格
- [ ] TST-001 (Build verification) → 對應 T045 (`go build` exit 0)
- [ ] TST-002 (Unit tests) → 對應 T039 (`go test` exit 0, race=0)
- [ ] TST-003 (Static analysis) → 對應 T050 (`golangci-lint run` exit 0)
- [ ] TST-009~TST-016 (Taiwan keyword/domain detection) → 對應 T014 (Taiwan Scoring)
- [ ] TST-017~TST-019 (Score determinism + evidence) → 對應 T014 + T015
- [ ] TST-020~TST-021 (Manifest parsing) → 對應 T009
- [ ] TST-022~TST-024 (Dedup) → 對應 T011
- [ ] TST-025~TST-032 (Process execution prohibition) → 對應 T043
- [ ] TST-033~TST-035 (Retry/429/5xx) → 對應 T033
- [ ] TST-036~TST-037 (Failure isolation + idempotency) → 對應 T020 + T027
- [ ] TST-038~TST-040 (Counters + registry consistency) → 對應 T027 + T030
- [ ] TST-041~TST-046 (Categories + scoring + repository status) → 對應 T014 + T025 + T021
- [ ] TST-047~TST-049 (Incremental + deleted) → 對應 T032
- [ ] TST-050~TST-054 (LLM security) → 對應 T035
- [ ] TST-055~TST-057 (Search) → 對應 T036 + T037
- [ ] TST-058~TST-061 (Metrics + logging) → 對應 T034
- [ ] TST-062~TST-065 (Performance + concurrency + crash recovery) → 對應 T051
- [ ] TST-066 (Secret leakage) → 對應 T043
- [ ] TST-067~TST-070 (Build + registry consistency) → 對應 T045
- [ ] TST-071~TST-075 (Registry integrity + production smoke) → 對應 T036 + T052
- [ ] TST-076~TST-080 (KPI verification) → 對應 T046 + T051
- [ ] Verification coverage mapping 100% (all TST-001~TST-080 covered)
- [ ] 建立 `tests/verification/run.sh`: 執行所有 verification tests, output PASS/FAIL

## 備註

- CRAWLER_VERIFICATION_MANUAL.md 定義了完整的驗證標準 (§Verification Manual)
- TST-025~TST-040 為 process execution prohibition + security 驗證
- TST-076~TST-080 為 KPI verification (Recall, Precision, Duplicate, False positive)
