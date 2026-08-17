---
github_issue: N/A
title: Snapshot Lifecycle（§70 / §45 / §45.1：create → freeze → hash → archive）
type: task
priority: P0
status: pending
depends_on: [T002, T014]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T016 - Snapshot Lifecycle（§70 / §45 / §45.1：create → freeze → hash → archive）

## 目標

實作 `snapshot.py`：Daily Snapshot 生命週期（create / freeze / hash / archive，§45.1），snapshot_id 格式 `YYYYMMDD-HHMMSS-xxxx`，quant_result.json 落盤，analysis_snapshot 為版本唯一擁有者（§84 #1）。此為全系統「可重現」的錨點（§83 ①）。

## 驗收標準

- [ ] snapshot_id 格式：`20260818-210000-a82f`（§53 meta 範例）
- [ ] analysis_snapshot 記錄：model / parameter / data version、輸入資料 lineage 摘要、hash
- [ ] FREEZE：資料源（universe / factor / valuation / ranking / alert）於 freeze 後不得變更；freeze 後計算結果以 snapshot_id 關聯、永遠不覆蓋（§45）
- [ ] HASH：量化結果 hash 保證 bit-identical 重現；重建（重新跑同一 date）hash 必須一致（§45）
- [ ] quant_result.json 每 snapshot 一份存檔（§53: /api/v1/snapshots/{date} 原樣回傳）
- [ ] Archive / retention：歷史 snapshot 保留策略（§45.1），刪除需稽核紀錄
- [ ] §70 Daily Snapshot 內容欄位（universe 數、排名、warnings）與 spec 一致
- [ ] unit test：重跑同日 pipeline hash 一致；改任何輸入 → hash 改變

## 備註

- AI 只能讀 frozen snapshot（T017 依賴本任務的只讀介面）
- snapshot 是 search 與前端「當天為什麼排這樣」唯一溯源入口（§53.1 第 6 點）