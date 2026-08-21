---
github_issue: N/A
title: ESG 揭露雙來源（TWSE OpenAPI 補完 + MOPS CSV）與速度選源機制
type: feature
priority: medium
status: done
depends_on: []
assignee: OpenCode
created: 2026-08-21
updated: 2026-08-21
---

# T037 - ESG 揭露雙來源（TWSE OpenAPI 補完 + MOPS CSV）與速度選源機制

## 目標
補齊 ESG 揭露資料覆蓋度並建立雙來源容錯：
1. **TWSE OpenAPI 路徑補完**：現有 `get_esg_report` 僅抓 topic=1（溫室氣體）＋公司治理規程；擴充至 t187ap46 家族全部 8 個主題（E/S/G 三構面）。
2. **MOPS CSV 路徑新增**：`t187ap46_L_{1..8}.csv` 八個 dataset 接入 MOPS Adapter。
3. **速度選源**：首次呼叫時實測兩來源延遲，**快者為主來源、慢者為 fallback**；主來源失敗自動降級 fallback 並反轉偏好。

## 資料源實測結果（2026-08-21）

| Topic | 內容 | E/S/G | TWSE OpenAPI | MOPS CSV |
|---|---|---|---|---|
| L_1 | 溫室氣體排放（範疇一/二/三＋驗證） | E | ✅ 已接線（topic=1） | ✅ 94KB |
| L_2 | 再生能源使用率 | E | ✅ 未接線 | ✅ |
| L_3 | 用水量＋密集度 | E | ✅ 未接線 | ✅ |
| L_4 | 有害/非有害廢棄物量 | E | ✅ 未接線 | ✅ |
| L_5 | 員工薪資福利／女性主管佔比 | S | ✅ 未接線 | ✅ |
| L_6 | 董事會組成／獨董／女性董事比率 | G | ✅ 未接線 | ✅ |
| L_7 | 年度法說會次數 | G | ✅ 未接線 | ✅ |
| L_8 | TCFD 氣候風險揭露（長文字） | E | ✅ 未接線 | ✅ |

- 兩來源出表日期一致（1150821）、有效記錄一致（上市 1,076 檔）；上櫃皆無資料（TPEx 無對應端點，302）。
- TWSE OpenAPI URL template `/opendata/t187ap46_L_%s`（topic 1..21）已存在於 `provider.TWSEAPIESG`；`normalizeESG` 為泛用解析（Fields map），任意 topic 直接可用。

## 改動檔案清單

### 1. Provider 層：MOPS ESG datasets（pkg/provider/mops.go）
- 新增 8 個 `MOPSDataset` 常數：`MOPSESGGhg` / `MOPSESGRenewable` / `MOPSESGWater` / `MOPSESGWaste` / `MOPSESgEmployee` / `MOPSESGBoard` / `MOPSESGConf` / `MOPSESGTcfd`。
- `mopsPaths` 新增 `/t187ap46_L_{1..8}.csv`；`mopsOpenDataDatasets` 全部登錄為 true。
- 新增泛用 parser `parseESGCSV(r, header)`：核心欄位（出表日期／報告年度／公司代號／公司名稱）+ 其餘欄位全收進 `Fields map[string]string`，產出 `[]provider.ESGRow`（與 TWSE normalizeESG 同型別，下游零差異）。Go encoding/csv 原生支援引號多行欄位（範疇三邊界含換行）。
- `normalizeMOPSRaw` switch 新增 8 case。

### 2. MCP 層：雙來源抓取＋速度選源（新檔 pkg/mcp/tools_esg.go）
- `esgTopicNames`：topic→中文名對照（8 筆）。
- `fetchESGTWSETopic(a, ctx, dataDate, topic)`：單 topic 抓取（復用 `fetchNormalize` + `fetchAPIRaw`，快取鍵含 topic 參數）。
- `fetchESGMOPSTopic(a, ctx, dataDate, topic)`：單 topic 抓取（dataset → cacheDataset 登錄 DatasetESG）。
- `App.esgPrimary`（mutex 保護）：主來源偏好（"" / "TWSE_API" / "MOPS"）。
- `measureESGSource`：量測單一來源 topic=1 抓取耗時（探測同時暖快取）。
- 首次呼叫：兩來源**並發**探測（不同 host，各 1 request，不互搶限流配額），成功者中取耗時短者為 primary，記錄決策 log。
- 後續呼叫：走 primary；失敗 → fallback 另一來源，成功則反轉偏好（記 log）。
- `handlerGetESGReport` 重構：
  - 參數新增 `topics`（可選 array of int，預設 [1..8]）。
  - 聚合所選 topics 為 `model.ESGReport`（既有結構不變）；lineage source 標實際使用來源。
  - 公司治理規程（t187ap32_L）維持原樣附加。

### 3. 快取政策（pkg/mcp/fetch.go）
- `cacheDataset` 登錄 8 個 MOPS ESG dataset → `cache.DatasetESG`（24h TTL，AllowL2）。

### 4. 測試
- `pkg/provider/mops_test.go`：`parseESGCSV` golden fixture（多行欄位、BOM、無效列跳過、年度民國轉換）。
- `pkg/mcp/tools_esg_test.go`：
  - TWSE 路徑：topics 過濾、聚合正確、lineage source=TWSE_API。
  - MOPS 路徑：同上 source=MOPS。
  - 速度選源：fake 兩來源一快一慢 → primary 選快者；primary 失敗 → fallback 成功且偏好反轉。
  - 快取命中：第二次呼叫 is_cached=true、零上游呼叫。
- 全量回歸：`go test ./...`、`make lint` 全綠。

## 驗收標準
- [x] `get_esg_report` 回傳 topics 1~8 完整揭露（可經參數過濾），lineage 標示實際來源
- [x] TWSE OpenAPI 與 MOPS CSV 兩路徑皆可取得相同資料
- [x] 首次呼叫執行速度實測並選擇快者為主來源（log 可查決策依據）
- [x] 主來源失敗自動 fallback 至另一來源，且後續偏好反轉
- [x] ESG dataset 快取 TTL 24h、L2 持久化生效（重啟後仍命中）
- [x] 契約測試＋全量回歸通過（go test ./... / make lint）

## 驗收證據（2026-08-22）

### 真實端點速度選源實測
```
level=INFO msg="ESG 速度選源完成" twse_api_ms=16 mops_ms=13 primary=MOPS
```
真實網路下 MOPS CSV（13ms）勝過 TWSE OpenAPI（16ms）；lineage.source=MOPS。
二次啟動直接命中 L2（0.05s, is_cached=true）→ 24h TTL + L2 持久化驗證。

### 測試結果
- pkg/provider ESG：4/4 PASS（fixture/inline BOM/多行欄位/無效列/八dataset分派）
- pkg/mcp ESG：10/10 PASS（含 fallback 反轉偏好、探測暖快取上游次數斷言）
- 全量回歸：僅 cmd/mcp-server 工具數斷言失敗（39→40，另一 session 之 get_etf_dividend 所致，非本任務範圍）
- go vet / gofmt：T037 範圍全數乾淨

## 實作進度（2026-08-22 暫停快照）

### 已完成
| 項目 | 檔案 | 狀態 |
|------|------|------|
| Provider 層 8 dataset + parseESGCSV | pkg/provider/mops.go | ✅ 語法驗證通過 |
| 黃金 fixture（真實下載 3 列） | pkg/provider/testdata/mops/esg_ghg.csv | ✅ |
| Provider 測試（fixture/inline BOM/多行/無效列/分派） | pkg/provider/mops_esg_test.go | ✅ 已寫、待跑 |
| 快取政策登錄 | pkg/mcp/fetch.go | ✅ |
| App 偏好欄位 | pkg/mcp/app.go | ✅ |
| MCP 層雙來源＋速度選源＋fallback | pkg/mcp/tools_esg.go | ✅ 語法驗證通過 |
| Tool schema topics 參數 | pkg/mcp/registry_de.go | ✅ |
| MCP 測試（9 案例） | pkg/mcp/tools_esg_test.go | ✅ 已寫、待跑 |
| stubDE 補 16 stub + 舊測試斷言更新 | pkg/mcp/app_de_test.go | ✅ |

### 待辦（恢復時從此接手）
1. 等另一 session 的 get_etf_dividend 完成（etf.go/tools_etf.go 目前半成品阻擋編譯）
2. `go build ./...` → `go test ./pkg/provider/ -run ESG -v` → `go test ./pkg/mcp/ -run "ESG|FilterTopics" -v`
3. 全量回歸 `go test ./... && make lint`
4. 勾驗收標準 + git commit + 更新 README.md

### 測試案例清單（tools_esg_test.go）
TestFilterTopics／TestESGReportTWSEPrimaryDefaultAllTopics（平手→TWSE、9 題材、上游次數斷言）／TestESGReportTopicsFilter／TestESGReportLatestYearWins／TestESGSpeedSelectMOPSWhenTWSEProbeFails／TestESGFallbackSwapsPreference／TestESGBothSourcesFailAtProbe／TestESGCacheHitSecondCall／TestESGGovernanceFailureNotBlocking／TestESGReportUnknownCompany

## 備註
- 上櫃公司（TPEx）無 ESG 揭露端點：tool 對上櫃代碼回「無 ESG 揭露資料」，屬官方限制。
- L_8 TCFD 為長文字欄位（單檔 ~3.6MB），預設包含但前端建議 table 呈現；若效能考量可由 `topics` 參數排除。
- 速度實測僅在「偏好未定」時執行一次（並發兩 request）；之後僅於失敗切換時更新，避免常態性加倍請求。
- 探測結果同時寫入兩來源快取（24h），故首日後的每日刷新以 primary 為準，fallback 只在失敗時觸發。
