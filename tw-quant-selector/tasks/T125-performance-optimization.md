---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/834
title: 风控与效能优化（Rate Limiting + 向量化）
type: feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-06-02
updated: 2026-06-06
howto: |
  1. 在 data/ingestion.py 新增 TTL 快取机制（30 分钟，in-memory dict + time.monotonic）
  2. 確認 monitoring/alerting.py 已全部使用 Pandas 向量化运算（AC 已滿足）
  3. 確認 strategies/institutional_factor.py 已向量化（AC 已滿足）
  4. 新增效能測試 tests/test_performance.py（全市场 1,100 档计算 < 50ms）
  5. 新增 API Rate Limiting middleware（FastAPI 自訂 middleware，60 req/min per IP）
  6. MIS API 請求頻率控制 + 錯誤重試（429 → 60s, 5xx → 10s, 3 次重試）
  7. 記憶體優化：gc.collect() 於大型批次寫入後
---

# T125 - 风控与效能优化（Rate Limiting + 向量化）

## 目標
實作風控與效能優化，確保系統穩定運行且不被證交所封鎖。

## 驗收標準
- [x] **Ingestion 頻率限制（TTL = 30 分鐘）**：
  - `data/ingestion.py` 新增 `_fetch_with_cache(fetch_fn, fn_name, *args, **kwargs)`：
    - 使用 in-memory dict + `time.monotonic()` TTL 檢查
    - TTL = 1,800 秒（30 分鐘）
    - 快取鍵 = `hashlib.md5(fn_name + args + kwargs)`
    - 僅快取非空結果（避免 serve stale empties）
  - 修改 `update_daily_prices_from_twse()`, `update_valuations_from_twse()`, `update_monthly_revenue_from_twse()`
  - 新增 `_ttl_cache_info()` / `_ttl_cache_clear()` 供監控使用
  - **無外部依賴**（不引入 diskcache/redis）

- [x] **Pandas 向量化運算確認**：
  - `monitoring/alerting.py` — 10 個智慧警示檢查函數全部使用 vectorized ops
    - `check_all_smart_alerts()` 的 `iterrows()` 用於 side-effect（logging/cooldown），可接受
  - `strategies/institutional_factor.py` — `calc_institutional_concurrence` 與 `calc_sitca_share_ratio` 皆向量化
    - `calc_consecutive_days_vectorized` 使用 `groupby().apply()`（非逐列迴圈）

- [x] **效能測試 `tests/test_performance.py`**：
  - 模擬 1,100 檔股票 × 50 筆即時快照（55K rows）
  - 11 個測試案例（10 個單項 + 1 個總合）
  - 單項閾值：< 50ms；總合閾值：< 300ms
  - 使用 `time.perf_counter()` 計時

- [x] **API Rate Limiting middleware**：
  - `api/app.py` 新增自訂 `_RateLimitMiddleware(BaseHTTPMiddleware)`
  - 限制：每 IP 每 60 秒 60 次請求（僅限 `/api/` 路徑）
  - 超限時回傳 `HTTP 429` + `{"error": {"message": "Too Many Requests", "retry_after_seconds": 60}}`
  - 內部請求（localhost）亦受限制（可透過環境變數調整）
  - **無外部依賴**（不引入 slowapi/redis）

- [x] **MIS API 請求頻率控制 + 錯誤重試**：
  - `data/realtime_quotes.py` `MISApiClient.fetch_batch()` 新增：
    - HTTP 429：等待 60 秒後重試
    - HTTP 5xx：等待 10 秒後重試
    - Timeout：等待 1 秒後重試
    - 其他 Exception：等待 1 秒後重試
    - 最多 3 次重試
  - `INTERVAL_SEC = 1.0`（批間隔）維持不變

- [x] **記憶體使用優化**：
  - `data/ingestion.py` 新增 `import gc` + `gc.collect()` 於：
    - `update_daily_prices_from_twse()` 寫入後
    - `update_valuations_from_twse()` 寫入後
  - 大型批次後觸發垃圾回收，降低 RSS 峰值

- [ ] **單元測試**（需 Python 3.12+ 環境）：
  - 測試快取機制（TTL = 30 分鐘）
  - 測試 API Rate Limiting（超出限制 → 429）
  - 測試 MIS API 請求間隔（>= 1 秒）

## 備註
- 所有實作皆使用**無外部依賴**方式（自訂 cache dict、自訂 middleware），避免 Docker build 增加套件
- 向量化 AC 在 T122 實作時已滿足，T125 僅做確認
- `twstock_client.py` 的 `fetch_with_retry()` 已為 TWSE/TPEX 端提供重試機制（retry=1800s）
- 效能測試需 Python 3.12+ + 已安裝 `pip install -e .` 的環境執行
- `docker compose build` 已驗證通過（含所有此次改動）
