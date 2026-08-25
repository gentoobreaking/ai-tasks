# parity 任務執行進度（交接紀錄）

> 最後更新: 2026-08-25｜已完成 24 / 151

## 已完成
| 任務 | commit |
|---|---|
| T040 after_hours_trading | 88bcb4f |
| T041 annual_trading_volume | b471e87 |
| T042 block_trades_daily＋webListSpec 框架 | fa8d076(前) |
| T043 block_trades_detail | （併入批次）|
| T044 block_trades_monthly | （併入批次）|
| T045 block_trades_yearly | （併入批次）|
| T115/T116/T119/T122/T139/T142/T149/T163/T172/T175/T176/T177/T179/T184 | a970f47 |
| T146/T147/T164/T165 | f8480b5 |

## 已建立的基礎建設（後續任務直接沿用）
1. `pkg/mcp/tools_weblist.go`：`webListSpec{ds, withDate}.handler()` —— TWSE-WEB 報表清單型工具泛用 handler
   （code/name 過濾、limit/offset 分頁、Envelope+lineage 自動處理）
2. `pkg/provider/webreport.go`：`ParseWebReport`／`ZipRow`／`normalizeWebTable`（中文欄位直通）
3. 測試慣例：
   - `app_envelope_test.go` 的 `allToolProbes()` 需為每個新工具加 probe＋fake stub
   - fake 的 SourceURL 是快取鍵字串，Normalize 是恆等——stub 直接放「正規化後」的 JSON
   - `fetch.go cacheDataset` 需登錄 dataset → 政策類別，否則 CacheConsistency 測試失敗
   - 工具數斷言已改為動態 ≥40

## 待辦群組（127 個）
- 行情歷史與指數 medium：T143/T144/T145/T148(TAIFEX)/T166/T168/T169/T170/T171/T173/T174/T180-T183/T185/T186/T187-T190
- 公司治理與內部人 26（TWSE-API openapi JSON 直通——建議加 normalizePassthroughObject）
- 期貨與選擇權 21（registry_fg.go + model.TAF* + taifexAPIPaths，參考 T041 模式）
- ESG 細項 20 low、券商 9 low、監理 6、財務 9、上櫃 3、上市 4

## 注意事項
- TAIFEX 工具模式參考 T041：model.TAF* 常數 → taifexAPIPaths → normalize case → handler 用 q.Fetch(latest)
- TWSE-API openapi 端點回傳英文欄位 JSON 物件/陣列——適合 passthrough（參考 normalizePassthroughArray）
- 部分遠端工具已被既有本機工具涵蓋（如 get_taiex_index_history ≈ get_twse_index），
  實作前先檢查，重複者於任務書註記後標 done
