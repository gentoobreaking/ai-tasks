# tw-quant-mcp：get_etf_nav 端到端完成 + Registry 權證污染修復

日期：2026-08-18 19:40 | commit：`b2c32d1`

## 目標
完成 `get_etf_nav` 工具端到端驗證（spec §30.1 L1：歷史 NAV/折溢價）。

## 根因與修復（本輪新增）

### 1. Symbol Registry 權證污染（11765 → 2326）
**根因**：`parseTPExList` 解析 TPEx 全市場收盤清單（10561 行），
其中 **6 碼 7xx 開頭權證約 9,600 檔**全數通過 `Validate()`（只查 4-6 碼）被收入 Registry。

**修復**：`parseTPExList` 增加 `len(code)==6 && strings.HasPrefix(code,"7")` 排除權證；
保留 4 碼上櫃股票、5 碼 ETF/特別股、6 碼 00/02 開頭 ETF/ETN（020001 富邦存股雙十N 等）。

**驗證**：server 啟動 log「Symbol Registry 已載入 symbols=2326」（tse 1321 + otc 1005），
0050/0056/006208/00636/00679B/006201 全在，ETN 020000/REIT 01001T/DR 910322 正確排除。

### 2. 舊 L2 快取污染
`data/cache.db` 存有 3 條 24h TTL 內舊資料（tse 1085 / otc 10560 權證 / etf 120 舊版 6 碼）
→ 刪除後新程式碼才生效（`DELETE FROM cache_entries WHERE key IN (...)`）。

## get_etf_nav 端到端驗證（全數通過）
- `get_etf_nav("0050")`：65 點（05/18-08/18），最新 2026-08-18 NAV=105.06、市價=104.9、折溢價=-0.15%
- `get_etf_nav("0056", 08/01-08/18)`：12 點，NAV=52.59、PD=0.21%，cached=True
- `get_etf_nav("006208", 08/10-08/18)`：7 點，NAV=240.7
- `get_etf_nav("00679B")`：正確回「上櫃 ETF 暫無 NAV 資料源（e添富僅涵蓋上市）」
- lineage：TWSE_WEB / FALLBACK / 2026-08-18 ✅

## 檔案變更（13 files, +603/-24）
- **新**：`pkg/model/etf.go`、`pkg/provider/etf.go`、`pkg/mcp/tools_etf.go`、`pkg/mcp/registry_etf.go`、`pkg/mcp/tools_etf_test.go`
- **改**：`pkg/registry/loader.go`（權證過濾）、`loader_test.go`（fixture 加權證/ETN/特別股案例）、`pkg/mcp/app*.go`、`cmd/mcp-server/main_test.go`

## 測試
`go test ./...` 16 套件全綠（registry/model/mcp 含新測試）。

## 剩餘缺口
- **上櫃 ETF NAV**（00679B 等）：e添富僅收上市，TPEx 改版舊端點全 302（T012a 待接）
- **即時/預估 NAV**：TWSE 無統一端點，MIS `nu` 指向各投信官網
- **cacheDataset TTL 政策**：etf_nav 已登錄（沿用每日類別）
