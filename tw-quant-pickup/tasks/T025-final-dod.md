---
github_issue: N/A
title: Final Integration & Definition of Done（§78 / §83 / §85）
type: task
priority: P0
status: pending
depends_on: [T002, T003, T004, T005, T006, T007, T008, T009, T010, T011, T012a, T012, T013, T014, T015, T016, T017, T018, T019, T020, T021, T022, T023, T024]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T025 - Final Integration & Definition of Done（§78 / §83 / §85）

## 目標

全系統端到端整合驗收：完整跑一次 Daily Pipeline（真實資料或錄製 fixture），逐一核對 §78 Definition of Done 清單、§83 v0.3 Acceptance Target（可重現 / 可解釋 / 可驗證）、§85 Handoff Checklist 已核銷之項目。

## 驗收標準

- [ ] DoD（§78）逐項通過：daily collection works / ranking generated（stock + ETF，ETF 含 ranking_validity）/ ETF DATA_UNAVAILABLE 不靜默剔除因子 / buy zones / analysis_snapshot（snapshot_id + hash + lineage）/ backtest works（含 OTC fallback）/ look-ahead 測試過 / report generated / AI analysis generated（validated、綁定 snapshot）/ AI cannot modify quant result / alerts work（alert_log）/ API contract works
- [ ] MacroContextProvider works（白名單欄位 + FALLBACK 標註，不進個股 FV）——§78 DoD 已含此項
- [ ] §83 三目標實證：① 可重現（同日重跑 hash 相同）② 可解釋（score_breakdown 層層可拆）③ 可驗證（backtest PIT 通過）
- [ ] §85 Handoff 10 項交付物全部存在於 repo / spec：Change Log（§84）、ERD（§5.14）、MCP→DB 對映（§7.1）、Lineage（§8.1）、Snapshot Lifecycle（§45.1）、API Contract（§53）、Availability Matrix（§37.1）、Dependency Graph（§77.0）、Sprint Plan（§77）、DoD（§78）
- [ ] 端到端指令：`make run` 一鍵 daily pipeline（容器環境）成功，無 critical error
- [ ] README 說明安裝 / 設定 / 執行 / 測試方式

## 備註

- 若任一 DoD 不過 → 回到對應任務修正，不得降級 acceptance
- 完成後即達 v0.3 可用版本（§83 前言：先求可重現 / 可解釋 / 可驗證）