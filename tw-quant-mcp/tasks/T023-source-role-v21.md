---
github_issue: N/A
title: 七來源 Source Role 分級落地（v2.1 §3）
type: feature
priority: high
status: done
assignee: pi with opencode/x-preview-f-free
created: 2026-08-01
updated: 2026-08-02
depends_on: []
---

# T023 - 七來源 Source Role 分級落地（v2.1 §3）

## 目標
將現有七個 Adapter 依 v2.1 §3 表標註 source_role：TWSE OpenAPI / TWSE Web API / TPEx / MOPS / TAIFEX OpenAPI = CANONICAL；TWSE MIS = SEMI_OFFICIAL_REALTIME；TAIFEX 網站下載 = FALLBACK。落實「優先 CANONICAL、不足時降級 FALLBACK 並在 `_lineage` 反映實際使用來源」之設計規則。

## 驗收標準
- [x] 七個 Adapter 之 lineage `source_role` 皆正確標註（以測試或 grep 驗證無遺漏、無舊值 canonical/helper）
      → grep 驗證：無 `"canonical"/"helper"/"fallback"` 舊字面值、無 SourceRoleHelper；
      TWSE_API/TWSE_WEB/TPEX_API/MOPS 全數經 postLineage（tools_bc.go:27 CANONICAL），
      TAIFEX-API 經 taifexLineage（CANONICAL），TAIFEX-DL 經 taifexLineage/rangeLineage（FALLBACK），
      TWSE_MIS 僅 core.go 盤中預設（SEMI_OFFICIAL_REALTIME）
- [x] TAIFEX 歷史回溯（taifex_dl.go）路徑確認：date == 最新交易日走 openapi（CANONICAL），否則走下載頁（FALLBACK），`_lineage.source_role` 如實反映實際使用來源
      → taifexLineage 由 res.Source 判別（SourceTAIFEXAPI→CANONICAL，SourceTAIFEXDL→FALLBACK），
      taifex_query.go:148 load() 之「最新日→API，否則→DL」路由未變；
      測試 TestFGFuturesPathLatestUsesAPI（CANONICAL）+ TestFGFuturesPathHistoryDLAndL2（FALLBACK，
      含 L2 命中後仍為 FALLBACK）覆蓋兩情境
- [x] MIS 路徑僅供 §8 盤中引擎使用（SEMI_OFFICIAL_REALTIME）；其他 domain 模組不得以 MIS 為資料來源（code review / 測試守門）
      → 新增 TestAppendixAMISIntradayOnly：36 工具逐一驗證 A 組 = TWSE_MIS/SEMI_OFFICIAL_REALTIME，
      B–G 組不得為 TWSE_MIS 或 SEMI_OFFICIAL_REALTIME；grep 驗證 SourceTWSEMIS 僅 core.go（預設）
      + model/lineage.go（常數）
- [x] 既有 36 工具全數通過契約測試（輸出無未轉換之原始欄位，配合 T022 normalize 層）
      → make check 全綠（TestAllToolsEnvelopeConsistent / TestAppendixALineageComplete 通過）
- [x] 新增測試：fallback 路徑之 lineage 標註正確（mock 最新日 vs 歷史日兩種情境）
      → 見驗收第 2 項（TestFGFuturesPathLatestUsesAPI / TestFGFuturesPathHistoryDLAndL2 擴充）

## 完成摘要
- taifexLineage（tools_fg.go）：source_role 改由 res.Source 動態判別——TAIFEX_API→CANONICAL、
  TAIFEX_DL→FALLBACK（§3 表），涵蓋全部單日 F 組工具（含 API 失敗退回 DL 之 cold tier 路徑）
- rangeLineage（tools_fg.go）：DL 歷史範圍查詢標 FALLBACK（原誤標 CANONICAL）
- 新增 TestAppendixAMISIntradayOnly：MIS 僅限盤中 A 組之測試守門（§3 設計規則）
- TestFGFuturesPathLatestUsesAPI / TestFGFuturesPathHistoryDLAndL2 擴充 source_role 斷言
  （最新日 API→CANONICAL；歷史 DL→FALLBACK；L2 快取命中後仍 FALLBACK）
- 驗證：無舊值 canonical/helper 殘留；SourceTWSEMIS 僅盤中預設使用；make check 全綠

## 備註
- 前置：T021、T022 ✅
- v1.3 的 helper 角色（VWAP / 技術指標等派生計算）不屬來源分級：派生計算歸 domain 層（T026）
  業務邏輯，Lineage 不再需要 derived_from（已於 T021 移除）
- 與 T024（stale-if-error 降級）相依：STALE_FALLBACK freshness 之 lineage 組合於 T024 驗證

## 執行紀錄（2026-08-25 稽核）
- 驗收條目全數已有勾選；本次稽核以全域門檻複核：`go vet ./...` 通過、`go test ./...` 16 套件全綠（含契約測試/Envelope 一致性/快取一致性/壓力腳本存在性）。
- 本任務產出之模組為現行 155 註冊工具之作用中路徑（非死代碼），接線由 `cmd/mcp-server` 入口經 `App` 組裝達成；真實程序煙霧測試見 snapshots/raw/。
