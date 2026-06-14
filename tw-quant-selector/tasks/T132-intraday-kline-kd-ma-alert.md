---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/846
title: 即時技術分析警示（60分K線 / MA / KD 指標）
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-06-07
updated: 2026-06-07
---

# T132 - 即時技術分析警示（60分K線 / MA / KD 指標）

## 目標
建立即時 60 分鐘 K 線聚合、技術指標計算（MA、KD），以及可自訂條件的交易警示系統，讓使用者能設定如「站上 60MA 且 K 值站上 50」等技術面觸發規則。

目前系統只有日 OHLC 資料，MIS 即時報價雖有 `o/h/l` 欄位但未解析儲存，無任何技術指標函式，且警示規則為 26 條硬編碼。

## 驗收標準

### 1. MIS o/h/l 資料解析
- [x] `_parse_mis_quote()` 新增解析 `o`（開盤）、`h`（最高）、`l`（最低）欄位
- [x] `RealtimeQuote` 資料結構新增 `open_price`、`high_price`、`low_price` 欄位
- [x] `realtime_quotes` 表擴充欄位（open_price, high_price, low_price）儲存開高低價
- [x] `RealtimeQuoteModel` SQLAlchemy model 同步擴充

### 2. intraday_kline 資料表與聚合邏輯
- [x] 遷移腳本 `005-intraday-kline.sql` 建立 `intraday_kline` 表
- [x] `IntradayKline` SQLAlchemy model + Stock relationship
- [x] `build_intraday_kline()` 聚合函式：從 `realtime_quotes` 聚合 60 分 K 棒（整點邊界）
- [x] 盤中未完成 K 棒使用 `ON CONFLICT DO UPDATE` 即時更新
- [x] 整合至 `app.py` 背景輪詢迴圈，每 3600 秒自動聚合
- [x] API 端點 `GET /api/v1/intraday/{stock_id}/kline`

### 3. 技術指標函式庫
- [x] 實作 `compute_sma(values, period)` — SMA 簡單移動平均（sliding window O(n)）
- [x] 實作 `compute_kd(highs, lows, closes, n, k1, d1)` — KD 隨機指標（RSV/K/D）
- [x] 模組化於 `monitoring/indicators.py`

### 4. 技術警示規則引擎
- [x] 新增 `TECH_MA_CROSS` 規則：價格站上/跌破 MA（threshold 為 % 偏移）
- [x] 新增 `TECH_KD_CROSS` 規則：K 值穿越門檻（threshold 為 K 值）
- [x] `AlertChecker.check_technical_alerts()` 盤中定期評估
- [x] 整合進 `check_all()`，觸發時發送通知
- [x] 種子資料新增 2 條技術規則至 `seed_alert_rules.py`

### 5. 前端設定面板
- [x] 「警示規則」分頁新增「技術分析 Technical」類別（橘色）
- [x] `getThresholdHint` 支援 `TECH_MA_CROSS`（% 偏移）、`TECH_KD_CROSS`（K值）
- [ ] 提供下拉選單選擇技術條件（MA 關係 / KD 位置）— 暫用現有閾值機制
- [ ] 提供數字輸入調整 MA 週期、KD 參數 — 暫用固定值 60/3/3

### 6. 即時 K 線圖預覽（選項）
- [ ] 在股票詳情頁或新面板顯示即時 60 分 K 線圖
- [ ] 疊加 MA 線
- [ ] 顯示 KD 指標

## 備註
- MIS 原始 API 已回傳 `o/h/l`，只需修改 parse 邏輯即可取得，不需要額外 API 呼叫
- `intraday_kline` 可與現有 `intraday_snapshots` 共存，前者是聚合 K 棒，後者是點位快照
- KD 實作可參考標準 Stochastic Oscillator 公式：RSV = (Close - LLn) / (HHn - LLn) × 100；K = 2/3×K_prev + 1/3×RSV；D = 2/3×D_prev + 1/3×K
- MA 只需標準簡單移動平均（SMA），不需 EMA/WMA
- 盤中僅最後一根 K 棒會持續更新，歷史 K 棒寫入後不再變動
- 前端可設定「條件全部成立才觸發」（AND）或「任一成立即觸發」（OR）
- `TECH_KD_CROSS` 的 threshold 代表 K 值門檻，預設 50（轉強訊號）
- `TECH_MA_CROSS` 的 threshold 代表價格相對於 MA 的偏移百分比，預設 0（站上即發）
- MA 週期與 KD 參數目前為固定值（60, 3, 3），待後續任務可調整為使用者設定