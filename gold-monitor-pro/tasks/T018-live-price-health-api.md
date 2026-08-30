---
github_issue: ""
title: 即時價格與強化健康 API
type: feature
priority: medium
status: done
depends_on:
  - T012
assignee: "pi with opencode"
created: 2026-08-28
updated: 2026-08-30
---

## 目標
在 history_api.py 新增 `GET /api/v1/latest`，回傳四個監控物件的最新價格（含買/賣、來源、報價時間、相對基準變動），並強化 `/health` 使其包含每個金屬的最後更新時間與年齡，供儀表板（T015）直接消費。

## 驗收標準

- [x] `GET /api/v1/latest` 回傳：gold_local（buy/sell）、gold_intl、silver_intl、platinum_intl 的最新價格、timestamp、source、相對基準的絕對/百分比變動
- [x] `/health` 回傳每個來源（taiwan_bank / esun_bank / yahoo_finance）狀態，並附加各金屬 `last_update` 與 `age_seconds`
- [x] 僅讀取現有 `/tmp/gold_monitor_*.json` 快取，不發起任何新網路請求；快取缺失時回傳 `no cache` 而非錯誤
- [x] 與既有 `/api/v1/history/{metal}` 及舊 `/health` 消費者向後相容

## 執行紀錄
- history_api.py 實作 /api/v1/latest 端點
- 強化 /health 回應含 metals.last_update 與 age_seconds
- 複用既有 _load_json_cache、_intl_cache_file 讀取快取