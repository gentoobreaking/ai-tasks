---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/844
title: 加權指數（TAIEX）技術分析警示
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-06-07
updated: 2026-06-07
---

# T133 - 加權指數（TAIEX）技術分析警示

## 目標
新增加權指數（代號 `^TWII` / `TAIEX`）的技術分析規則，讓使用者能監控大盤站上/跌破關鍵 MA 或 KD 超買/超賣訊號。

## 驗收標準
- [x] 確認 `tw_stock_client` 能取得 TAIEX 指數資料作為即時報價（確認 stocks 表已有 `^TWII`，MIS 報價經 `t00` 映射）
- [x] `build_intraday_kline()` 支援 TAIEX 聚合（60 分 K 棒）
- [x] 新增 `TECH_INDEX_MA` 規則：大盤站上/跌破 MA（與 TECH_MA_CROSS 同邏輯但專用於 `^TWII`）
- [x] 新增 `TECH_INDEX_KD` 規則：大盤 KD 超買（K>80）/ 超賣（K<20）
- [x] 種子資料新增 2 條規則含預設 `message_template` 及 `config_json`
- [x] 整合進 `check_technical_alerts()` 中判斷（`^TWII` 走 index 分支）
- [x] 觸發時發送通知（含 Telegram 整合）

## 備註
- TAIEX 代號需確認在 `stocks` 表中是否存在，若無需先補入
- 大盤 K 線聚合邏輯與個股相同，依賴 MIS 即時報價的 o/h/l
- MA 週期與 KD 參數可沿用現有 config_json 機制
- 規則可獨立設定閾值（MA 偏移% / KD 門檻值）