---
github_issue: N/A
title: 盤中衍生計算（VWAP / 爆量偵測 / 支撐壓力）
type: feature
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T007 - 盤中衍生計算

## 目標
實作 `pkg/engine/vwap.go` 與 `pkg/engine/surge.go`（§8.5）：增量 VWAP、20 分鐘滑動窗口爆量偵測、當日高低點與 Fibonacci 支撐壓力位。

## 驗收標準
- [ ] 增量 VWAP：`Σ(p×v)/Σv` 累計更新，O(1)/tick；與全量重算結果一致（fixture 驗證）
- [ ] 爆量偵測：前 20 分鐘均量滑動窗口，`volume_ratio = 近 N 分鐘量 / 窗口均值`；`surge_type` 區分 `BULLISH_BREAKOUT` / `BEARISH_BREAKDOWN` / `NONE`
- [ ] 支撐/壓力：當日高低點 + Fibonacci 0.382/0.5/0.618
- [ ] 產出資料結構與 §10.A 工具輸出對齊（`get_intraday_vwap` / `detect_volume_surge` 之 data 型別）
- [ ] 單元測試：增量一致性、窗口滑動邊界（分鐘跨日）、爆量閾值案例

## 備註
- 全部為記憶體計算，禁止引入 HTTP；計算失敗不影響 Poller 寫入
- 所有輸出需帶 `_lineage`（source_role=helper、derived_from 標明父資料）
