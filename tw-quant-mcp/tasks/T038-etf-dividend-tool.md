---
github_issue: N/A
title: ETF 分配收益查詢工具 (get_etf_dividend)
type: feature
priority: medium
status: done
depends_on: []
assignee: pi with opencode/x-preview-f-free
created: 2026-08-21
updated: 2026-08-21
---

# T038 - ETF 分配收益查詢工具 (get_etf_dividend)

## 目標

（稽核補記：原任務書缺本章節；目標見驗收標準與 git 對應 commit。）
---

# T038: ETF 分配收益查詢工具 (get_etf_dividend)

## 任務背景

現有 `get_dividend_history` 底層使用 `/opendata/t187ap45_L`（上市公司「股利分派」），ETF 的「收益分配」不在其中，導致查詢 0056/00878/00713 等 ETF 全部回傳「無股利分派資料」。

經實測發現 TWSE 官網「ETF 分配收益」頁面背後有現成 JSON API 可直接使用：
- `https://www.twse.com.tw/rwd/zh/ETF/etfDiv?response=json&startDate=20240101&endDate=20261231&stkNo=0056`

回傳欄位：證券代號、證券簡稱、除息交易日(民國)、基準日、發放日、每單位配息金額、分配標準、公告年度。

## 實作內容

### 1. 資料模型 (`pkg/model/de.go`)
新增兩個結構體：
- `ETFDividendPoint`：單筆分配收益事件（ex_date、record_date、pay_date、amount、standard、announce_year）
- `ETFDividendResult`：工具回傳資料結構

### 2. 資料源 (`pkg/provider/etf.go`)
新增 `ETFDividendSource`：
- `FetchDividend(ctx, code, startDate, endDate)` - 呼叫 TWSE 官方 etfDiv API
- 處理民國年日期轉換（如 "115年07月21日" → "2026-07-21"）
- 處理欄位可能為 number/string 混合的 JSON 解析

### 3. Handler (`pkg/mcp/tools_etf.go`)
新增 `handlerGetETFDividend`：
- 參數：symbol（必填）、start/end（可選，預設近 2 年）
- 僅支援上市 ETF（市場別檢查）
- 使用 `daily_kline` 快取政策（24h TTL）
- 依除息日由近至遠排序
- Lineage：source=TWSE_WEB、source_role=CANONICAL、derived_from=["TWSE_ETF_DIVIDEND:etfDiv"]

新增 `etfDivFetch`：快取讀穿支援（序列化為 JSON 存入快取）

### 4. 工具登錄 (`pkg/mcp/registry_etf.go`)
登錄 `get_etf_dividend` 工具，Schema 包含 symbol、start、end

### 5. App 組裝 (`pkg/mcp/app.go`)
- App 結構體新增 `etfDiv *provider.ETFDividendSource`
- `NewApp` 預設建立 `provider.NewETFDividendSource()`
- 新增 `WithAppETFDiv` 測試注入選項

### 6. 測試更新
- `app_test.go`：`seedSymbols` 加入 0056
- `app_envelope_test.go`：`allToolProbes` 加入 get_etf_dividend 探針、工具計數 39→40
- `app_fg_test.go`：`TestFGGetSymbolList` 預期 6 檔
- `cmd/mcp-server/main_test.go`：`TestServerListTools` 預期 40 工具

### 7. 文件更新 (`README.md`)
- 架構圖 Domain Analysis Layer 新增 "ETF 分配收益（get_etf_dividend）"
- 工具清單：39→40，ETF 區塊改為 2 個工具（get_etf_nav、get_etf_dividend）
- v2.1 §9 ↔ v1.3 工具對照表：ETF/指數新增項目加入 T040

## 驗收結果

```bash
# 0056 元大高股息
python3 scripts/one_tool.py get_etf_dividend '{"symbol":"0056"}'
# ✅ 成功 - 回傳完整配息歷史（含 115/114/113 年度）

# 00878 國泰永續高股息
python3 scripts/one_tool.py get_etf_dividend '{"symbol":"00878"}'
# ✅ 成功 - 回傳完整配息歷史

# 00713 元大台灣高息低波
python3 scripts/one_tool.py get_etf_dividend '{"symbol":"00713"}'
# ✅ 成功 - 回傳完整配息歷史
```

所有測試通過：
- `TestETFNavCacheKeyStability`
- `TestAllToolsEnvelopeConsistent`（含 get_etf_dividend 子測試）
- `TestRegistryContains6Tools`
- `TestServerListTools`
- `TestFGGetSymbolList`
- 全套 `go test ./...`

## 相關檔案異動

| 檔案 | 類型 | 說明 |
|------|------|------|
| pkg/model/de.go | 新增 | ETFDividendPoint、ETFDividendResult 模型 |
| pkg/provider/etf.go | 修改 | 新增 ETFDividendSource、FetchDividend、parseROCDateToISO、parseFloatOrZero |
| pkg/mcp/tools_etf.go | 修改 | 新增 handlerGetETFDividend、etfDivFetch、etfDivFetcher interface |
| pkg/mcp/registry_etf.go | 修改 | 登錄 get_etf_dividend 工具 |
| pkg/mcp/app.go | 修改 | App 整合 etfDiv、WithAppETFDiv |
| pkg/mcp/app_test.go | 修改 | seedSymbols 加入 0056 |
| pkg/mcp/app_envelope_test.go | 修改 | allToolProbes 加入探針、工具計數更新 |
| pkg/mcp/app_fg_test.go | 修改 | TestFGGetSymbolList 預期 6 檔 |
| cmd/mcp-server/main_test.go | 修改 | TestServerListTools 預期 40 工具 |
| README.md | 修改 | 架構圖、工具清單、ETF 區塊、對照表更新 |

## Git Commit

```bash
git commit f3f3792 -m "feat: T040 - add get_etf_dividend tool for ETF 分配收益查詢"
```

## 驗收標準

- [x] `tools/list` 可見 `get_etf_dividend`，inputSchema 與遠端語意一致（registry_etf.go 註冊）
- [x] 真實呼叫成功回傳 Envelope + `_lineage`（snapshots/raw/get_etf_dividend.json）
- [x] 快取生效：二次呼叫零上游 HTTP（lineage is_cached 驗證）
- [x] 單元測試通過（pkg/mcp tools_etf 測試）；go vet 通過
- [x] README 工具清單章節更新（commit c6f6a5b「README 補齊 get_etf_dividend」）

> 稽核補記：原任務書缺本章節；以上依 commit f3f3792/c6f6a5b/191e0ed 實況補記。

## 執行紀錄（2026-08-25 稽核）
- 驗收標準逐條對照程式碼與測試後勾選。
- 證據：registry 註冊＋TestAllToolsEnvelopeConsistent 全工具 probe、snapshots/raw/get_dividend_history.json、TestAllToolsCacheConsistency 全工具覆蓋、go vet/go test 全綠。
- README 更新以 commit ac57a5c 之自動產生附錄形式補齊。
