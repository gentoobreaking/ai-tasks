---
github_issue: N/A
title: predictions 表 retention 清理
type: chore
priority: low
status: done
depends_on:
- T004
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-25
updated: 2026-08-26

---

# T029 - predictions 表 retention 清理

## 背景
每次輪詢對每顆感測 AppendPrediction——60s 間隔 × N 感測 × 86400/60，
單感測一年約 52 萬列。表無任何清理機制，SQLite 檔案無限成長。

## 目標
預測紀錄有保留期限，資料庫體積有上界。

## 實作要點
1. daemon 每日（或隨每日摘要）執行一次清理：
   `DELETE FROM predictions WHERE predicted_at < now - retention`
2. retention 預設 90 天（/accuracy 的視窗需求遠小於此）；config 可調
3. 清理後順手 `PRAGMA optimize`／檢查 wal checkpoint
4. /accuracy 只查近 N 天——確認 retention 不影響其正確性

## 驗收標準
- [x] 插入過期假資料後觸發清理 → 列數符合預期、近期資料完好
- [x] config 可調 retention；0 = 停用清理
- [x] /accuracy 在清理後仍回傳正確統計
- [x] 長跑模擬（加速時鐘）下 DB 體積有界

## 備註
sensor_state 為 upsert 快照不受影響；本任務僅處理 append-only 的 predictions。
