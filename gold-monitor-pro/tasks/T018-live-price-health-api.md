---
github_issue: ""
title: 即時價格與強化健康 API
type: feature
priority: medium
status: pending
depends_on: []
assignee: pi
created: 2026-08-28
updated: 2026-08-28
---

# T018 - 即時價格與強化健康 API

## 目標
在 history_api.py 新增 `GET /api/v1/latest`，回傳四個監控物件的最新價格（含買/賣、來源、報價時間、相對基準變動），並強化 `/health` 使其包含每個金屬的最後更新時間與年齡，供儀表板（T015）直接消費。

## 驗收標準
- [ ] `GET /api/v1/latest` 回傳：gold_local（buy/sell）、gold_intl、silver_intl、platinum_intl 的最新價格、timestamp、source、相對基準的絕對/百分比變動。
- [ ] `/health` 回傳每個來源（taiwan_bank / esun_bank / yahoo_finance）狀態，並附加各金屬 `last_update` 與 `age_seconds`。
- [ ] 僅讀取現有 `/tmp/gold_monitor_*.json` 快取，不發起任何新網路請求；快取缺失時回傳 `no cache` 而非錯誤。
- [ ] 與既有 `/api/v1/history/{metal}` 及舊 `/health` 消費者向後相容。

## 備註
- 複用 `gold_local_monitor` 與 `gold_intl_monitor` 既有的快取讀取函式（`_load_json_cache`、`_intl_cache_file`），不重複解析邏輯。
- 變動計算與 monitor 內部的「基準比對」定義保持一致。
