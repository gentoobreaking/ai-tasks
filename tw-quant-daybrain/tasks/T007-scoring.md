---
github_issue: N/A
title: 訊號模型 v2.0（Config-Driven 評分）
type: feature
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-08-01
---

# T007 - 訊號模型 v2.0

## 目標
實作 §8 訊號評分模型：Config-Driven 權重（`config/scoring.yaml`）、評分表、Veto 優先、門檻行為、過期重評。§6/§7 策略引擎為此模型之單一標的實作（4×25 分制），本任務為跨標的通用評分框架。

## 驗收標準
- [ ] `scoring.yaml`：§8.2 評分表參數化（量能 +30 / 位階 +30 / 大盤順風 +20 / tick 結構 +20 / 兩項 Veto -100）；`scoring_version` 於設定檔標註（v2.0.0）
- [ ] 評分函式 `score(input) → { total, breakdown, grade, veto_reasons }`；Veto 觸發直接否決不與他項加總
- [ ] 門檻行為（§8.3）：≥80 `STRONG_BUY`、60–79 `WATCH`、<60 `IGNORE`；門檻可設定（`SCORE_THRESHOLD`）；`NEUTRAL_FLEXIBLE` 日門檻提高至 85（`NEUTRAL_SCORE_THRESHOLD`，§5.3）
- [ ] 雙 tick 確認：爆量/突破需連續兩次 tick 確認才進入完整評分（§4 Phase 2）
- [ ] 訊號過期重評：產生後 5 分鐘未觸發 → 重新評分並更新 `expiry_ts`（§8.3）
- [ ] 每筆評分輸出含 `score_breakdown` 與 `scoring_version`（§14.2）
- [ ] 單元測試：各項目加權、Veto 優先、門檻邊界（79/80/84/85）、雙 tick 邏輯、過期重評

## 備註
- 評分模型不依賴 LLM（§1 原則 3），LLM 離線仍可出訊號（§18.3）
- 評分參數修改必須改 `scoring_version`，維持 §14.4 summary 可對應
- v2.0 對齊：§8 評分表（+30/+30/+20/+20/-100）與 §6/§7 策略引擎（4×25 分制）並存；T017/T018 直接呼叫本模組之 score()
