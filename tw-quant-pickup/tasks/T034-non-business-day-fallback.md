---
github_issue: 
title: 非營業日查詢自動回退至最近營業日（API / CLI / 前端）
type: feat
priority: high
status: done
depends_on: []
assignee: pi with opencode/x-preview-f-free
created: 2026-08-23
updated: 2026-08-24
---

# T34 - 非營業日查詢自動回退至最近營業日（API / CLI / 前端）

## 目標
解決非營業日（如 2026-08-23 週日）查詢 0050 估值資料找不到的問題：API snapshot 查詢改為「指定日（含）之前最新 FROZEN snapshot」，meta 回傳實際 market_date；CLI 明確指定非交易日時自動回推；前端顯示回退說明。

## 驗收標準
- [x] `_snapshot_row` 改查 `market_date <= 指定日`，meta 新增 `market_date`
- [x] snapshots/reports 端點讀檔與目錄以實際營業日為準
- [x] CLI `_market_date` 非交易日自動回推（交易日曆含國定假日）
- [x] Valuation/Ranking/Dashboard 顯示實際資料日期與回退提示
- [x] 單元測試涵蓋週末回退情境

## 備註
假日表需定期更新：`python -m universe.trading_calendar --update --year <year>`
