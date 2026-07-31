---
github_issue: N/A
title: 盤中衍生計算（VWAP / 爆量偵測 / 支撐壓力）
type: feature
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T007 - 盤中衍生計算

## 目標
實作 `pkg/engine/vwap.go` 與 `pkg/engine/surge.go`（§8.5）：增量 VWAP、20 分鐘滑動窗口爆量偵測、當日高低點與 Fibonacci 支撐壓力位。

## 驗收標準
- [x] 增量 VWAP：`Σ(p×v)/Σv` 累計更新，O(1)/tick；與全量重算結果一致（fixture 驗證）
- [x] 爆量偵測：前 20 分鐘均量滑動窗口，`volume_ratio = 近 N 分鐘量 / 窗口均值`；`surge_type` 區分 `BULLISH_BREAKOUT` / `BEARISH_BREAKDOWN` / `NONE`
- [x] 支撐/壓力：當日高低點 + Fibonacci 0.382/0.5/0.618
- [x] 產出資料結構與 §10.A 工具輸出對齊（`get_intraday_vwap` / `detect_volume_surge` 之 data 型別）
- [x] 單元測試：增量一致性、窗口滑動邊界（分鐘跨日）、爆量閾值案例

## 實作記錄
- `pkg/model/intraday.go`：`IntradayVWAP`（symbol/date/time/vwap/volume/high/low/last/prev_close/supports/resistances）與 `VolumeSurge`（symbol/date/time/minutes/recent_volume/window_avg_volume/volume_ratio/surge_type/open/close），`FibLevel{ratio,price}`，對齊 §10.A 工具之 data 型別；`_lineage` 依 §3.2 由 response shaping 層統一注入（source_role=helper、derived_from 標明父資料），計算層僅輸出 data
- `pkg/engine/vwap.go`：
  - `VWAPTracker`：p=Snapshot.Last、v=CumulativeVol 之 tick 增量（當日首筆以開盤累計量起算），每 tick O(1)；跨日自動重置；高低點/昨收/最新價隨 tick 維護
  - `fibLevels`：回檔位 = high − ratio×(high−low)（0.382/0.5/0.618），依最新價分類支撐（≤）與壓力（>），各由低價至高價排序
  - `IntradayStore`：per-symbol 登錄，`Update/UpdateAll` 為純記憶體增量（無錯誤回傳），`VWAP(code)` 為讀取路徑
- `pkg/engine/surge.go`：
  - `DetectSurge(snaps, minutes)`：當日 1m 桶（resample1m 共用）＋前一日資料過濾（跨日邊界）；recent=末 N 根（不足時以既有為準）、window=recent 前最多 20 根；ratio=近 N 分鐘均量/窗口均量（每分均量，無尺度偏差）
  - 閾值：ratio ≥ 2.0 且收>開 → `BULLISH_BREAKOUT`、收<開 → `BEARISH_BREAKDOWN`，其餘（含窗口不足）→ `NONE`
  - `Aggregator.Surge(code, minutes)`：由 RingStore 讀取之純記憶體路徑
- `pkg/provider/mis_worker.go`：新增 `WithMISIntraday` 選用注入；pollAndStore 於 RingBuffer 寫入後 best-effort `UpdateAll`（不影響 Poller 寫入）
- 測試（引擎 8 案例 + provider 整合 1 案例）：增量=全量重算（同順序浮點精確一致）、跨日歸零、高低點/昨收追蹤、Fibonacci 分類（102.472/102/101.528）、爆量多空/閾值 2.0 邊界/ratio 1.0 NONE、跨日窗口不被前一日 50,000 股/分污染、資料不足 NONE、部分窗口、Aggregator 讀取路徑；真實 fixture 驗證 VWAP=z=2425、累計量=v×1000=56,896,000
- 排錯紀錄：`vsn` 參數 `s` 遮蔽 `sn()` 函式（vet 抓出）；TestIntradayStore 原 fixture 使最新價恰為當日高點致無壓力位；跨日測試原沿用 `sn()` 固定日期 07-31 致未真跨日
- 驗證：`go build ./... && go vet ./... && go test ./... -count=1 -race` 全 8 套件通過、gofmt 乾淨、make lint 通過

## 備註
- 全部為記憶體計算，禁止引入 HTTP；計算失敗不影響 Poller 寫入
- 所有輸出需帶 `_lineage`（source_role=helper、derived_from 標明父資料）
