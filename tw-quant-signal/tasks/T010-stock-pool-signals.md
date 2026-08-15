---
github_issue: ""
title: "[Phase 3] 個股池訊號 — 精選觀察清單掃描"
type: feature
priority: low
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-30
updated: 2026-08-16
---

# T010 - 個股池訊號

## 目標
在大盤傾向下，擴充至精選觀察個股清單，篩選相對強弱個股或族群，產出個股層級的燈號健診報告。

對應規格：`§3.3.2 個股層訊號`、`§3.3.1 個股池訊號`

## 驗收標準
- [x] 定義精選觀察清單（至少 5 檔） — 11 檔（config.json watch_stocks：2330 / 0050 / 2308 / 2303 / 2317 / 2454 / 3008 / 2881 / 2882 / 6505 / 6518）。
- [x] 每檔個股可產出四燈號健診報告 — StockPoolRow 含 fundamental_light / institutional_light / technical_light / valuation_light。
- [x] 個股評分納入「相對大盤強弱」校正因子 — relative_strength.py 計算 5/20/60 日超額報酬（避免 look-ahead），StockPoolRow 攜帶 rs_5d/20d/60d/composite/label。
- [x] 支援族群/產業分組檢視 — SECTOR_MAP 擴充為 5 族群（半導體 4 / 電子零組件 2 / 金融 2 / 傳產 2 / ETF 1）；StockPoolOverview.by_sector 將 11 檔分組。
- [x] 個股資料來源涵蓋歷史上曾存在標的（避免存活者偏誤） — watchlist_history 表 (stock_id PK + since_date + removed_date)；record_watchlist_snapshot / mark_removed / get_watchlist_history。
- [x] 大盤訊號與個股訊號可交叉比對 — StockPoolCrossCompare：market_state / consistent_count / inconsistent_count / contrarian_stocks。
- [x] 儀表板支援個股清單總覽與篩選 — StockPool.tsx：日期過濾 + 族群下拉過濾 + 個股清單表 + 大盤狀態卡 + 交叉比對卡 + 族群對應表。

## 備註
- 存活者偏誤在此階段需納入處理 ✓ watchlist_history + API /api/stock-pool/history。
- 個股數量初期不宜過大，聚焦觀察清單 ✓ 維持 11 檔 watch_stocks。

## 任務完成摘要（commit da2d07b）
後端 (src/tw_quant_signal/):
- 新增 relative_strength.py：5/20/60 日超額報酬（以 0050 為基準）；_safe_pct_return 避免 look-ahead；同日 self=0；label very_weak/weak/strong/very_strong。
- 新增 stock_pool.py：
  - build_stock_pool_snapshot 整合 health_scores / scorecard / multi_timeframe / rs / market_state / by_sector / cross_compare。
  - SECTOR_MAP 11 檔 5 族群。
  - watchlist_history helper。
  - _connect contextmanager 同時支援 SignalDB 與裸 sqlite3.Connection。
- db.py 新增 watchlist_history 表（since_date + removed_date，PK stock_id）。
- pipeline.py main() 在 T019 之後、structural drift 之前插入 T010 步驟。
- api/app.py 新增 5 個 endpoint：/api/stock-pool/overview / cross-compare / relative-strength / sectors / history。

前端 (frontend/src/):
- types.ts 新增 StockPoolRow / StockPoolCrossCompare / StockPoolOverview / StockPoolRelativeStrength。
- api/client.ts 新增 stockPoolOverview / CrossCompare / RelativeStrength / Sectors。
- Sidebar.tsx 新增 '個股池訊號' 🌐 頁籤。
- 新增 pages/StockPool.tsx：日期 + 族群過濾 + 大盤狀態卡 + 交叉比對 + 個股清單 + 族群對應。
- App.tsx render 新增 stock_pool 條件。

測試 (tests/test_stock_pool_t010.py):
- 17 個測試全通過：schema / snapshot / rs / survivorship bias / sector 完整性。
- 全量測試 244 passed（含 T019 / T023 / T021 等）。

驗證:
- 端到端實測 /api/stock-pool/overview：as_of=2026-08-16, market_state=range, pool_size=11, sectors=[半導體/電子零組件/金融/傳產/ETF]。
- 交叉比對：5 inconsistent (2330/0050/2317/2454/6505)，6 no_data。
- TypeScript 編譯乾淨，vite build 成功（911KB chunk，僅 size 警告）。
