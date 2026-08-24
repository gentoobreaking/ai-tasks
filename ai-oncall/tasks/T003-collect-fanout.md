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
## 執行紀錄（2026-08-24 二輪稽核：接線審計）
- 元件層驗收全數達成（首輪已打勾）。
- **未竟事項（接線）**：`collect.FanOut` 目前無 production caller——
  spec §3.1「core → gate 收集 context」箭頭需要 gate 端提供 gRPC server
  實作 CollectContext RPC（proto 已定義），此為跨任務整合缺口，
  已列為下一批次工作（gate gRPC server + FanOut 接線 + 契約測試）。
