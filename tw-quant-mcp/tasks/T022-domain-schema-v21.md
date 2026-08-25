---
github_issue: N/A
title: 六大正規化 Schema 與 Normalize 層（v2.1 §6）
type: feature
priority: high
status: done
assignee: pi with opencode/x-preview-f-free
created: 2026-08-01
updated: 2026-08-02
depends_on: []
---

# T022 - 六大正規化 Schema 與 Normalize 層（v2.1 §6）

## 目標
建立 `pkg/model/domain/` 六大共用正規化 Schema（TrendComposite / InstitutionalFlow / DividendRecord / FinancialHealthReport / RiskFlags / DerivativesSnapshot）與 `StockIdentity`；建立 `pkg/model/normalize/` 轉換層，定義各 Adapter → Schema 之 From&lt;Source&gt;() 介面並實作首批兩條完整路徑。

## 驗收標準
- [x] `pkg/model/domain/`：StockIdentity + 六個 Schema，欄位與 v2.1 §6 一致（含 json tag、omitempty 規則）
      → pkg/model/domain/domain.go：StockIdentity/TrendComposite(+TechnicalView/FundamentalView/ChipView)/
      InstitutionalFlow/DividendRecord/FinancialHealthReport(+DimensionScore)/RiskFlags/DerivativesSnapshot，
      json tag 逐欄對照 §6；`_lineage` 依 §6 為 model.Lineage 或 []model.Lineage；domain_test.go round-trip 驗證
- [x] `pkg/model/normalize/`：定義 FromTWSEOpenAPI / FromTWSEWeb / FromMIS / FromTPEx / FromMOPS / FromTAIFEXOpenAPI / FromTAIFEXDownload 之轉換函式（或介面）簽名統一
      → pkg/model/normalize/normalize.go：簽名約定 `From<Source>(raw []byte) (T, error)`（raw 為官方 payload，
      語意參數由 raw 自帶）；7 個函式全數定義，5 條路徑回傳 ErrNotImplemented（骨架，T026/T027 填實）
- [x] 至少實作 FromMIS → KlineBar（供盤中引擎）與 FromTWSEWeb → InstitutionalFlow 一條完整路徑，以 fixture 驅動
      → mis.go（MIS msgArray → tick bar：OHLC=z、tv 張×1000→股、tlong→Asia/Taipei HH:MM:SS）；
      twse_web.go（T86 日報 → InstitutionalFlow：千分位逗號/負數、Market=TSE、raw date→YYYY-MM-DD、
      Lineage 標 TWSE_WEB/CANONICAL/POST_MARKET）；
      測試以 pkg/model/normalize/testdata/（複製自 provider/testdata 官方錄製原文）驅動
- [x] normalize 層為唯一「知道上游原始欄位」之處；既有 pkg/provider 之 Normalize 輸出標記為相容層（deprecated 註解）或改為呼叫 normalize 層
      → SourceContract.Normalize + 六個 Adapter 實作標 `// Deprecated: v2.1 §6 起轉換集中於 pkg/model/normalize
      （From<Source>()），本方法為 v1.3 相容層（T022），T026/T027 遷移時逐步移除`
- [x] 單元測試：每 Schema JSON round-trip、StockIdentity 正確性、FromMIS / FromTWSEWeb 轉換正確（含單位換算驗證）
      → domain_test.go（7 round-trip 測試含 omitempty 規則）；normalize_test.go（FromMIS 張→股 4512 張→4,512,000 股、
      FromTWSEWeb 千分位 -2,484,521/84,169,249、market/date/lineage、tlong 基準、錯誤路徑、ErrNotImplemented）

## 完成摘要
- `pkg/model/kline.go`：新增 KlineBar（v2.1 §4，盤中 tick bar / 1m K 共用）
- `pkg/model/domain/`：六大 Schema + StockIdentity + DimensionScore（欄位與 §6 一致）
- `pkg/model/normalize/`：7 個 From<Source>() 簽名統一；實作 FromMIS/FromTWSEWeb 兩條完整路徑（fixture 驅動）
- `pkg/provider`：SourceContract.Normalize 及 6 個實作標 deprecated 相容層
- 測試：12 個新測試全綠；make check（vet+gofmt+go test ./...）通過

## 備註
- 前置：T021（domain Schema 之 `_lineage` 欄位型別依賴新 Lineage）✅
- 與 T023 / T026 / T027 相依：normalize 層先立骨架，Adapter 標註（T023）與 Tool 補齊（T027）時逐步填實
- 既有 pkg/model 中 v1.3 之 Normalized Models（Candle 等）保留不動，domain Schema 為其上層聚合結構
- 後續：FromTWSEOpenAPI/FromTPEx/FromMOPS/FromTAIFEXOpenAPI/FromTAIFEXDownload 之輸出 Schema
  對應 T026 領域層與 T027 工具補齊時填實；provider deprecated 標記於遷移完成後移除

## 執行紀錄（2026-08-25 稽核）
- 驗收條目全數已有勾選；本次稽核以全域門檻複核：`go vet ./...` 通過、`go test ./...` 16 套件全綠（含契約測試/Envelope 一致性/快取一致性/壓力腳本存在性）。
- 本任務產出之模組為現行 155 註冊工具之作用中路徑（非死代碼），接線由 `cmd/mcp-server` 入口經 `App` 組裝達成；真實程序煙霧測試見 snapshots/raw/。
