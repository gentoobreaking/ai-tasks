---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/731
title: 後端 data/status API 接上 Dashboard 資料狀態面板
type: feature
priority: low
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-28
updated: 2026-05-29
howto: |
  1. `GET /api/v1/data/status` 回傳各資料集的最新更新時間、筆數、狀態（ok/failed/ingesting）。
  2. 在 `Dashboard.tsx` 底部或側面板加入資料狀態摘要，替代或補充 Monitor 頁面。
  3. 使用 `StatCard` 或小型表格呈現每個資料集的狀態與更新時間。
  4. 異常狀態（failed/ingesting）以顏色標示。
---

# T077 - 後端 data/status API 接上 Dashboard 資料狀態面板

## 目標
後端已實作 `GET /api/v1/data/status` 回傳所有資料集的擷取狀態（最新 update 時間、筆數、ok/failed/ingesting），但前端從未呼叫此端點。Dashboard 目前僅顯示選股訊號摘要，缺少資料健康度概覽。

## 驗收標準
- [x] `client.ts` 新增 `fetchDataStatus()` 方法
- [x] `Dashboard.tsx` 底部 grid 顯示資料狀態摘要面板（取代原本的「本週換股異動」假資料區塊）
- [x] 每個資料集顯示：名稱、筆數、最後更新時間、狀態（🟢 ok / 🔴 failed / 🟡 ingesting）
- [x] 異常狀態以色塊和 emoji 標示
- [x] 載入期間顯示「載入中⋯」文字（沿用 `muted` 樣式，避免額外 Skeleton）
- [x] API 錯誤時優雅降級（`.catch(() => {})` 不影響主內容）
- [x] TypeScript 編譯無錯誤，`npm run build` 成功

## 備註
- 避免與 Monitor 頁面功能重疊過多—Dashboard 只顯示摘要，完整細節仍導向 Monitor 頁面
- 可與 Monitor.tsx 已有的 datasets loading 邏輯共用型別定義

## 實作紀錄 (2026-05-29)
### 後端改動
- `app.py:655-678` — `GET /api/v1/data/status` 增強：
  - 新增 `signal_dates`（不同交易日數）、`latest_signal_date`
  - 新增 `datasets[]` 陣列，從 `ingestion_tracker` GROUP BY dataset/status 查詢（name / status / count / last_updated）

### 前端改動
- `client.ts` — 新增 `DatasetStatus`、`DataStatus` 型別及 `fetchDataStatus()`
- `Dashboard.tsx`:
  - 新增 `dataStatus` state + `useEffect(() => fetchDataStatus().then(setDataStatus).catch(() => {}), [])`
  - 底部 right panel 取代原本「本週換股異動」假資料，改為「資料狀態 Data Status」面板
  - 顯示價量（stock_count + last_price_update）、訊號（signal_dates + latest_signal_date）、各 ingestion dataset 的 名稱/筆數/日期/狀態(🟢🔴🟡)
  - 下方連結 → `/monitor` 查看完整監控
- `Dashboard.module.css` — 新增 `.datasetList`、`.datasetRow`、`.datasetLabel/Count/Date/Status`、`.monitorLink` 樣式；移除不再使用的 `.changeList`/`.changeItem` 等樣式
