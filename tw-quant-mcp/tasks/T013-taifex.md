---
github_issue: N/A
title: TAIFEX Adapter 與歷史回溯模組
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-08-01
---

# T013 - TAIFEX API + Download 歷史回溯模組

## 目標
實作 `pkg/provider/taifex_api.go`（最新交易日，§2 TAIFEX-API）與 `taifex_dl.go`（官方下載頁 CSV 歷史回溯，§9），並落地 L2 永久 TTL 快取。

## 驗收標準
- [x] API 路徑：三大法人期貨/選擇權部位、大額交易人未沖銷部位、每日行情、Put/Call Ratio、保證金（最新交易日）
- [x] DL 路徑（§9.2 資料集全數）：期貨每日 OHLC、三大法人期貨部位歷史、PCR 歷史、大額交易人部位歷史、選擇權每日 OHLC
- [x] 查詢流程（§9.3）：L2 命中→回傳；date==最新交易日→API；否則→下載 CSV（Rate Limit 1/5s）→解析→驗證→Normalize（單位統一「口」與「元」）→L2 永久 TTL
- [x] 下載失敗缺口處理：鄰近交易日補檔需標 `derived_from`，否則以 null 註明缺口
- [x] 契約測試：CSV fixture 解析（BOM、千分位、欄位對齊）、L2 命中後不再重複下載（計數器驗證）、範圍查詢（start/end）
- [ ] 供應 §10.F 全部期權工具（T015）

## 備註
- openapi 僅最新一日（hot tier）；歷史一律走 DL（cold tier），兩路徑皆為 canonical
- 契約數/口數不可混淆，CSV 欄位對應表需以 fixtures 逐一驗證

## 實作紀錄（2026-08-01）
- 契約測試 16 項全綠（`go build` / `go vet` / `go test ./...`；commit `1ef95b1`）
- DL 實測發現 6 個下載端點（§9.2 之 5 + largeTraderOptDown），單次 POST 即成功（無需 view session），仍維持二步式；CSV 為 Big5/MS950
- 實測發現並修正：DL 日期為西元（非民國年，parseROCDate 誤用會 +1911）；大額交易人 CSV 備註列含未跳脫引號（LazyQuotes）；週六僅表頭 CSV → 空陣列/缺口
- 缺口（gapError）不寫入 L2；FetchRange 一次 DL 範圍下載 + `cache.Get` L2 探測
- 待辦：MCP Handler 接線（T015 供應 §10.F 期權工具）
