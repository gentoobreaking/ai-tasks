# tw-quant-mcp：Symbol Registry 納入 4/5 碼上市 ETF 修復（T032-fix）

## 時間
2026-08-18 19:05（Asia/Taipei）

## 背景
診斷 tw-quant-mcp 無法取得 ETF 即時 NAV/預估 NAV/折溢價（spec §30.1 L1），確認兩層根因，本次修復第一層：

1. **被動 ETF 不在 Symbol Registry**：`parseTWSEETFList` 只收 6 碼 00 開頭（如 000050），但 STOCK_DAY_ALL 實測上市 ETF 代碼為 4/5 碼（0050、00636、00679B）或 6 碼（006208、00400A），非 6 碼 00 開頭 → 漏掉 116 檔（4 碼 8 檔 + 5 碼 108 檔），0050/0056/006208/00713/00878/00940 全數缺列。
2. NAV 資料源缺口：TWSE 官方 NAV 端點全 404（官方改版），屬另一層次，本次未處理。

## 修改內容（commit 3064cfd）
| 檔案 | 修改 |
|---|---|
| `pkg/registry/loader.go` | `parseTWSEETFList` 過濾放寬為 **4~6 碼且 00 開頭**；仍排除 4 碼一般股票、權證、6 碼非 00 開頭（ETN 020000、不動產 01001T、特別股 2887Z1、DR 910322） |
| `pkg/model/symbol.go` | `IsETF()` 同步放寬：`len(code)>=2 && code[:2]=="00"`（原僅 6 碼） |
| `pkg/registry/loader_test.go` | fixture 改為真實 4/5/6 碼（0050/0056/00636/006208/00400A/00679B + 上櫃 006201），新增 6 碼非 00 開頭排除案例；期望值修正 14→13（3 上市 + 3 上櫃 + 7 上市 ETF + 1 上櫃 ETF，006201 在上櫃 fixture） |

## 驗證
- `go build ./...` OK；`go vet` 乾淨；`go test ./...` 16 套件全綠
- MCP 實測（新 binary）：
  - `get_symbol_list(market=tse)` → 1321 檔，含 0050 元大台灣50、0056 元大高股息、006208 富邦台50、00636 國泰中國A50、00940 元大台灣價值高息 ✅
  - `get_stock_daily_quote(symbol=0050)` → 2026-08-18 close 104.9，含 MA20/RSI/MACD 指標 ✅
  - `get_intraday_quote(0050)` → 正確回「非交易時段」而非「非法代號」 ✅
  - `get_company_profile(0050)` → 「無公司基本資料」（ETF 無 MOPS 個股資料，預期行為）

## 已知限制 / 待辦
- **00899 FT潔淨能源**：STOCK_DAY_ALL 中唯一可能非 ETF 的 00 開頭列，官方無類型欄位，先保留
- **NAV 資料源缺口（§30.1 L1）**：TWSE 官方端點（etfEstimateNAV/etfNav 等）全 404、TPEx 也 404、MIS getETFInfo redirect；需另尋資料源（投信官網/新官方路徑），另開議題
- 主動 ETF（00400A 等 10 檔）與槓桿/反向（00631L/00632R）、債券型（00679B）已隨修復入 registry，可查 K 線/報價

## 參考
- 專案：~/Projects/tw-quant-mcp（code）、~/tasks/tw-quant-mcp（doc）
- 相關 task：T032（ETF+加權指數，5fb65a8c）、T012a-etf-data-adapter（P1 pending，需 NAV 資料源）
