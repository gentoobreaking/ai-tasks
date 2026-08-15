---
github_issue: ""
title: "[Phase 3] 標的池擴充與管線效率優化"
type: enhancement
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-02
updated: 2026-08-15
---

# T018 — 標的池擴充與管線效率優化

## 目標
- 將 watchlist 從 3 檔擴充至 10–20 檔核心權值股和代表性標的，提升系統代表性與代入實用性
- 確保擴充後泵線不當處理效能瓶頸
- 確保後業務寬擴充不因現狀結構破損

## 驗收標準

### S1: 標的擴充
- [x] config.json 的 `watch_stocks` 擴充至至少 10 檔
- [x] 建議步驟清單（逐步選定）：
  1. 保留現有 3 檔 (2330, 0050, 2308)
  2. 新的 7+ 檔從臺灣 50 成份股或代表性權值中選出
  - 電子：2303(聯電)、2317(旺宏)、2454(聯發科)、3008(大立光)
  - 金融：2881(富邦金)、2882(國泰金)
  - 其他：6505(台塑石化)、6518(長榮)
- [x] `market_breadth` 計算在擴充前後保留一致性
- [x] 每一新標的資料取出成功且正常通過管線

### S2: 管線效能優化
- [x] 每月營收獲取從 sequential HTTP 改為並行池（per-stock async，不跨股票平行）
- [x] 在 `ingestion.py` 中 `fetch_monthly_revenue_batch` 已實作批次內部並行
- [x] 多重變數預轉 (reduce) 從 `compute_all_features` 中回饋到 ingestion
- [x] 每日管線滿程時間 < 90 秒（目前約 7s 已達到）

### S3: DB 查詢優化
- [x] 針對 `institutional_flows` 和 `daily_prices` 大型表格建立複合索引
  - `idx_daily_date_stock` (trade_date, stock_id) — 覆蓋 MA計算前查
  - `idx_inst_flows_date_stock` (trade_date, stock_id) — 法人流量查
- [x] 清理舊資料：刪除 `structural_drift` 表中超過 90 天的記錄

### S4: 驗證與回退
- [x] 擴充前進行回測（全體規則在新標的池上試跑）
- [x] 回測結果驗證通過
- [x] 回退方案：保留原 3 標的備份 config.json 副本（config.json.backup）

## 後續交付檔案

```
config.json                    ← watch_stocks 欄位更新
data/signal.db                 ← patches-更新資料模式
src/tw_quant_signal/ingestion.py ← 管線更新為多目標批次
src/tw_quant_signal/db.py      ← 加索引更新
```

## 備註
- 此項擴充提事項在 T015（多空指標）、T016（品質）完成後實作（以便發揮改善後代碼）
- 標的增多的直接影響：回測基準線改變（因為樣本變多了），不要和擴充前的結果比較
- 管線效能優化從別項目（T016）帶入，這裡執行驗證和實在上線
