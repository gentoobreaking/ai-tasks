# T021 Summary — 回測資料載入器（CsvDataLoader）

- 完成日期：2026-08-11
- Commit：`e1812a4`
- 狀態：done（9/9 驗收全勾）

## 實作內容

`src/backtest/types.ts`（§12.2 資料契約）：
- `MinuteBar` / `TradeRecord` / `ActivePosition` 三型別，T021/T022 共用（避免循環依賴）

`src/backtest/data_loader.ts`（§12.3）：
- **時間格式收斂**：`parseAndNormalizeTimestamp` 支援 ISO 空白/T 分隔、斜線 `YYYY/MM/DD`、民國曆 2 位數（`15/07/31` → 1926）與 3 位數（`115/07/31` → 2026，+1911）→ 統一 ISO 8601 `+08:00`
- **成交量單位校正**：`volume_unit` LOTS（原值）/ SHARES（÷1000 轉張）
- **去重與排序**：重複時間戳取首筆 + 時間軸順向排序
- **交易時段濾除**：預設僅保留 09:00:00–13:30:00（可關閉）
- **欄位別名**：時間 datetime/time/date/timestamp/日期、價格 open/開盤價…、量 volume/vol/成交量/qty
- **`loadCsvFile(filePath, symbol)` / `loadDirectory(dirPath)`**：檔名前 4–6 位數字提取 symbol（`2308_20260731.csv` → 2308），同名合併去重
- **壞列跳過附 warning（含列號）**，不中斷載入；warn 可注入
- 檔案不存在 throw；空檔/僅標頭 → 空陣列

## 測試
19 tests：三種時間格式、民國曆邊界（100→2011 / 99→2010 / 2 位數）、SHARES 轉 LOTS、重複戳記、非交易時段濾除、中文欄別名、time/vol 別名、壞列 warning、目錄批量合併、真實 fixture（`testdata/historical_1m/2308.csv` 1350 筆 + 排序驗證）。

## 除錯紀錄
- **CRLF 行尾**：fixture 為 `\r\n`，readline 預設切分導致 header `volume\r` 找不到欄位 → `crlfDelay: Infinity` 修正
- **fixture header 用 `timestamp`**：別名清單補上（原規格範例用 datetime）

全套測試：**313/313 pass**（294 + 19）+ lint/type check 過。
