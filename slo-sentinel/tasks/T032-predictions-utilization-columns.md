---
github_issue: N/A
title: predictions 補存 ceiling/utilization——「當下使用率」一等公民欄位
type: feat
priority: medium
status: done
depends_on:
- T031-sentinel-ui-human-readable-columns
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-26
updated: 2026-08-26

---

# T032 - predictions 補存 ceiling/utilization

## 目標
`internal/store` 的 predictions 表目前只存 actual_value——歷史預測無法
還原「當下使用率」。本任務 migration 加 `ceiling`/`utilization` 兩欄，
daemon 寫入時帶上（引擎 Forecast 已算好，純補存），UI 感測詳情新增
「當下使用率」欄。

## 實作要點
1. store migration v5：
   ```sql
   ALTER TABLE predictions ADD COLUMN ceiling REAL;
   ALTER TABLE predictions ADD COLUMN utilization REAL;
   ```
2. `store.Prediction` struct 新增 `Ceiling *float64` / `Utilization *float64`
   （json tag 同步：`ceiling` / `utilization`）；AppendPrediction /
   ListPredictions 讀寫對齊；舊列兩欄為 NULL → UI 顯示「—」不誤導
3. daemon runOnePoll 寫入時帶 `f.Ceiling` / `f.Utilization`
   （Forecast 既有欄位，engine.go §Forecast）
4. sentinel-ui 感測詳情表新增「當下使用率」欄：
   - 有值 → 百分比一位小數（如 `13.5%`）
   - NULL（歷史列）→ `—`
5. 影響面確認：/accuracy 只讀筆數與 ETA、T029 retention 只 DELETE——
   兩者不受加欄影響（回歸測試佐證）

## 驗收標準
- [x] migration v5 對既有 DB 升級成功；舊列 ceiling/utilization 為 NULL（升級路徑測試）
- [x] AppendPrediction 寫入 ceiling/utilization 後 ListPredictions 回傳值一致（roundtrip 測試，含 NULL 案例）
- [x] daemon 整合測試：跑一輪 poll 後最新 prediction 的 utilization = Value/Ceiling（斷言具體數值）
- [x] UI 渲染測試：fixture 含有利用率與 NULL 兩種列，分別斷言 `13.5%` 與 `—`
- [x] 既有 /accuracy、retention（T029）測試全數通過（行為不變）

## 備註
- depends_on T031：同檔案（感測詳情頁）連續改動，避免合併衝突
- 舊列不追溯填補（與 T029 catalog_version 同一哲學：新列起才正確）
- utilization 未來可支撐「使用率隨時間趨勢圖」（spec F2 延伸），本任務不做圖表
