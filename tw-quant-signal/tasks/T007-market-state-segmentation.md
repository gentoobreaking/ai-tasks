---
github_issue: ""
title: "[Phase 2] 分市場狀態運作 — 多空震盪權重切換"
type: feature
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-30
updated: 2026-07-30
---

# T007 - 分市場狀態運作

## 目標
區分多頭、空頭、震盪市三種市場狀態，在不同狀態下套用不同的規則權重與燈號門檻，提升訊號在不同市場環境下的適應性。

對應規格：`§3.2.2 分市場狀態運作`

## 驗收標準
- [x] 定義多頭/空頭/震盪市的判斷標準（指數 vs MA60 + MA60 trend + RSI）
- [x] 每種狀態下可設定不同的規則權重（bull ×1.5, bear ×1.5, range ×1.0）
- [x] 狀態偵測可自動每日更新（`market_state.py:detect_market_state()`）
- [x] 同一規則在不同市場狀態下有獨立統計報告（`backtest.py:state_win_rate`）
- [x] 狀態切換有明確記錄與通知（`pipeline.py:market_state` 寫入 log）
- [x] 支援回測時指定市場狀態進行分組績效分析（`returns_by_state` 追蹤）

## 備註
- 需先完成規則引擎（T003）與回測框架（T004）
- 狀態切換不宜過度敏感，避免頻繁切換導致訊號不穩定
