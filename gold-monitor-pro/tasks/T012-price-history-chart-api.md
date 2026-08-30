---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/258
title: 新增黃金/白銀/鉑金價格歷史圖表 API
type: feature
priority: medium
status: done
depends_on:
  - T009
assignee: "pi with opencode"
created: 2026-08-28
updated: 2026-08-30
---

## 目標

v2 T004 曾實作雙線走勢圖（sell=buy），但 v4 SPEC.md 未列入此功能。新增一支 HTTP API，提供最近 N 天的價格歷史資料，供前端繪製走勢圖。

## 設計

- **端點**：`GET /api/v1/history/{metal}`
- **支援金屬**：`gold_local`, `gold_intl`, `silver_intl`, `platinum_intl`
- **回應格式**：JSON array，包含 `timestamp`, `price`, `baseline` (前一比對基準)
- **資料來源**：`/tmp/gold_monitor_*.json` 快取 + `/tmp/gold_monitor_history.json`
- **預設天數**：7 天

## 驗收標準

- [x] `/api/v1/history/gold_local` 回傳最近 7 天 buy/sell 歷史
- [x] `/api/v1/history/gold_intl` 回傳最近 7 天國際黃金價格
- [x] `/api/v1/history/silver_intl` 回傳白銀價格
- [x] `/api/v1/history/platinum_intl` 回傳鉑金價格
- [x] 回應包含 baseline 字段，用於走勢比對

## 執行紀錄
- history_api.py 實作 /api/v1/history/{metal} 端點
- 複用既有快取讀取邏輯