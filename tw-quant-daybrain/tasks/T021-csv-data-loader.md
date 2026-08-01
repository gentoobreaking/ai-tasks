---
github_issue: N/A
title: 回測資料載入器（CsvDataLoader）
type: feature
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-01
updated: 2026-08-01
---

# T021 - 回測資料載入器（CsvDataLoader）

## 目標
實作 §12.3 歷史 1 分 K 資料載入模組：多格式時間解析（ISO/斜線/民國曆）、成交量單位校正（股/張）、去重排序、交易時段過濾、目錄批量載入。實作於 `src/backtest/data_loader.ts`。

## 驗收標準
- [ ] 時間格式自動收斂（§12.3-1）：`YYYY-MM-DD HH:mm:ss`、`YYYY/MM/DD HH:mm`、民國曆 `115/07/31 09:00`（+1911）統一轉 ISO 8601（帶 `+08:00`）
- [ ] 成交量單位校正（§12.3-2）：`volume_unit` 支援 `LOTS`（張）/ `SHARES`（股，÷1000）
- [ ] 去重與排序（§12.3-3）：過濾重複時間戳、時間軸順向排序
- [ ] 交易時段濾除（§12.3-4）：預設僅保留 09:00:00–13:30:00
- [ ] 欄位別名支援：time/datetime/date、open/開盤價、volume/vol/成交量/qty 等（§12.3 範例）
- [ ] `loadCsvFile(filePath, symbol)` 與 `loadDirectory(dirPath)`（依檔名 4–6 位數字提取 symbol，§12.3 範例）
- [ ] 壞列跳過附 warning（含列號），不中斷載入
- [ ] 回傳 `MinuteBar[]`（§12.2 資料契約：symbol / datetime / open / high / low / close / volume）
- [ ] 單元測試：三種時間格式、民國曆邊界（100 年以前）、SHARES 轉 LOTS、重複戳記、非交易時段濾除、目錄批量

## 備註
- 對齊 §12.3 提供之 `CsvDataLoader` TypeScript 完整實作範例，可直接採用
- 支援 Shioaji / FinMind / 富邦 / 凱基匯出檔（§12.3）
- 為 T022 模擬器、T023 Grid Search、T024 WFO 之資料基礎；測試 fixtures 由 T013 提供（`testdata/historical_1m/`）
