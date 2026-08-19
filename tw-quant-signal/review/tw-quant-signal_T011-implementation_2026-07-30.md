# T011 多時間框架整合 — 實作紀錄

## 目標
執行 T011 多時間框架整合，完成日線+週線+月線三級別四燈號健診、共識判斷、API 與前端顯示。

## 已完成事項

### 1. 問題修復
- **`_signal_type()` 邏輯改善**：原實作在方向強烈衝突時（如日線強多5 vs 週線強空1）會誤判為 `both`。修復後 `conflicting` 優先判斷，確保正確分類。

### 2. 月線框架實作（原任務中期擴充點）
- **`compute_monthly_indicators()`** 已在 indicators.py 中存在，使用 MA3/6/12, BB(6), RSI(9)
- **`_score_technical_monthly()`** 新增，為月線等級的技術面評分邏輯
- **`compute_health_check_monthly()`** 新增，完整四面向健診
- **DB schema `monthly_health_scores`** 表已新增
- **DB 方法** `upsert_monthly_health_scores` / `get_monthly_health_scores` 新增

### 3. 管線整合
- pipeline.py 接入月線指標計算、月線健診評分步驟
- 關鍵註解標明 multi_timeframe.py 為月線 extension point

### 4. API
- `GET /api/monthly-health` — 月線健診總覽
- `GET /api/stocks/{id}/detail` 回傳 `monthly_health` 欄位

### 5. 前端
- HealthCheckCard 支援日/週/月三級別並排顯示
- StockObservation 傳入 `monthlyHealth` prop
- client.ts 新增 `monthlyHealth()` 查詢

### 6. 文件更新
- T011 task 全部 6 項驗收標準已勾選，狀態改為 `done`
- README 更新 T011 為 ✅ done（總計 8 done / 5 pending）

## 未修改（無需修改的既有實作）
- `CONSENSUS_MAP` 56 種映射（已完整涵蓋日+週所有組合）
- 週線健診、共識 API `/api/multi-timeframe` 等既有功能
- 前端共識卡（StockObservation 中的 daily_light + weekly_light + consensus_label + signal_type 顯示）
- backend health_config.yaml 閾值設定
