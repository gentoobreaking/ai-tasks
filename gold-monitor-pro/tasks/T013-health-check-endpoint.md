---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/259
title: 新增 Health check endpoint + 結構化 JSON 日誌
status: pending
assignee: 寶寶
created: 2026-08-28
updated: 2026-08-28
---

## 目標

新增 HTTP health check endpoint，供監控系統輪詢。同時添加結構化 JSON 日誌輸出選項，方便 ELB / Prometheus 串接。

## 設計

### Health check endpoint

- **端點**：`GET /health`
- **回應**：`{"status": "ok", "sources": {"taiwan_bank": "ok", "esun_bank": "ok", "yahoo_finance": "ok"}, "timestamp": "2026-08-28T..."}`
- 可選參數 `--serve` 啟動 lightweight HTTP server (基於 `http.server`)

### 結構化日誌

- `--log-format json` 選項
- 每次 `--check` 輸出 JSON 格式日誌：`{"timestamp":..., "metal":..., "source":..., "buy":..., "sell":..., "change":..., "threshold":..., "alert":true/false}`

## 驗證標準

- [ ] `--serve` 模式下 `GET /health` 回傳 200 與 sources 狀態
- [ ] `--log-format json` 輸出符合 JSON schema
- [ ] 日誌包含 metal, source, buy, sell, change, threshold, alert 欄位
- [ ] Health check 可配置監聽 port (預設 8080)
