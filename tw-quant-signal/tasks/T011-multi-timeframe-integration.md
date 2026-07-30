---
github_issue: ""
title: "[Phase 3] 多時間框架整合 — 日線+週線"
type: feature
priority: low
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-30
updated: 2026-07-30
closed: 2026-07-30
---

# T011 - 多時間框架整合

## 目標
整合日線與週線時間框架，產出不同週期下的燈號訊號，並提供多時間框架共識判斷（如：日線偏多 + 週線偏多 = 強烈偏多）。

對應規格：`§3.3.1 多時間框架整合`

## 驗收標準
- [x] 週線級別的四燈號健診計算 — `health_check.py:compute_health_check_weekly`(已存在)
- [x] 日線燈號與週線燈號的整合規則 — `multi_timeframe.py:CONSENSUS_MAP` + `compute_multi_timeframe`
- [x] 多時間框架共識判斷邏輯 — `_signal_type()` (含 low/high split 修復) + `CONSENSUS_MAP` (56 種映射)
- [x] 短線（1–5日）、波段（1–4週）訊號分類輸出 — `signal_type` (short/swing/both/conflicting/neutral)
- [x] 儀表板同時顯示多時間框架燈號 — HealthCheckCard (日/週/月三級別) + StockObservation 共識卡
- [x] 中期（1–3個月）框架預留擴充點 — `compute_monthly_indicators` + `monthly_health_scores` 表 + `compute_health_check_monthly` + API 端點 `/api/monthly-health`
- [x] 月線指標已接入管線 pipeline（每月 MA3/6/12, BB(6), RSI(9)）
- [x] 月線健診評分已實作 (`_score_technical_monthly`) — 同 scoring logic，註解在 multi_timeframe.py 標明 extension point
- [x] API `/api/stocks/{id}/detail` 回傳 `monthly_health`
- [x] 前端 HealthCheckCard 日/週/月三級別並排顯示
- [x] `_signal_type` 邏輯改善：conflicting 優先判斷，避免方向衝突時誤判為 both

## 備註
- 此為第三階段進階功能，需先完成 T006（四燈號健診）與 T009（儀表板）
