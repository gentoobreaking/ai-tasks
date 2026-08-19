---
github_issue: 
title: 優化資料時間點處理 - 當日盤後資料尚未出爐時的處理策略
type: pending
priority: medium
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-19
updated: 2026-08-19
---

# T028 - 優化資料時間點處理 - 當日盤後資料尚未出爐時的處理策略

## 目標
優化管線在當日盤後資料尚未出爐時的處理策略，避免因查詢當日尚無資料而導致不必要的錯誤日誌與 fallback。

## 驗收標準
- [x] 管線執行前檢查目標日期是否為當日，若是則跳過當日盤後資料 (融資融券、法人買賣超、月營收等)
- [x] 改為抓取「前一交易日」的盤後資料
- [x] 加入資料可用性檢查：嘗試抓取前先檢查資料是否已發布
- [x] 降低不必要的錯誤日誌噪音 (如 "代碼 2330 於 2026-08-19 無融資融券資料")
- [x] 更新 `ingestion.py` 的 `_ingest_margin_trading`、`_ingest_institutional_flows` 等函數

## 備註
- 目前 log 大量出現：`代碼 2330 於 2026-08-19 無融資融券資料` — 這是正常現象 (當日盤後資料尚未發布)
- 相關檔案：`src/tw_quant_signal/ingestion.py`、`src/tw_quant_signal/twse_client.py`、`src/tw_quant_signal/provider/twse_direct.py`
- 相關任務：T001 (資料管線)
- 風險：需確保不影響歷史回測與手動指定日期的功能
- 建議：加入 `is_trading_day` 與 `is_data_available` 檢查函數