---
github_issue: N/A
title: context 收集器 fan-out
type: feat
priority: high
status: done
depends_on:
- T001
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T003 - context 收集器 fan-out

## 目標
`collect/`：goroutine 併發收集 prometheus/deploys/scaling/logs 四路 context，
合成 ContextBundle。**降級模式依 algs/triage-pipeline.md §A.5。**

## 驗收標準
- [x] 四路並行、整體逾時保護（單路慢不拖垮其他）
- [x] 全失敗/部分失敗時 ContextBundle 標注 unavailable 區塊（§A.5 降級模式）
- [x] scaling.go 能呈現事故前 HPA 副本數變化軌跡（spec.md F2）
- [x] 各收集器以 interface 注入，fake 測試

## 執行紀錄（2026-08-24 稽核）
- 已達成 4 項並打勾。
- **未竟事項**：無。
- 補充（證據）：fanout_test.go：TestFanOut_RunsInParallel（4×300ms <900ms）、SlowPathDoesNotBlockOthers、AllFail_DegradedMode/PartialFailure（degraded_sources 標注）；scaling.go 軌跡測試（fake Prometheus 序列 4→12→8）；Collector 介面＋fakeCollector 注入；-race 綠。
