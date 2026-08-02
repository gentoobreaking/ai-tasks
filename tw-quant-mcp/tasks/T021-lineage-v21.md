---
github_issue: N/A
title: Lineage/SourceRole/DataGrade 通用化升級（v2.1 §4）
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-01
updated: 2026-08-02
---

# T021 - Lineage 通用化升級（v2.1 §4）

## 目標
將現有 v1.3 版 `pkg/model/lineage.go` 升級為 v2.1 §4 通用 Lineage：新增 SourceRole 型別（CANONICAL / SEMI_OFFICIAL_REALTIME / FALLBACK）與 DataGrade（AVAILABLE / PREVIEW / NOT_YET_AVAILABLE），新增 `cache_age_sec`，並支援多來源 `[]Lineage` 陣列。

> **欄位決策（已與使用者確認 2026-08-01）**：`derived_from` / `cache_ttl` / `source_url` **從正式 JSON 移除，但內部 struct 欄位保留**（`json:"-"`，僅 debug/log 模式可輸出）——兼顧 v2.1 對外介面收斂與 v1.3 附錄 A「source_url 僅 debug 模式輸出」精神，且降低 daybrain 相容風險（內部仍可讀）。

## 驗收標準
- [x] SourceRole 型別與三個常數（CANONICAL / SEMI_OFFICIAL_REALTIME / FALLBACK）取代現有字串常數（canonical/helper/fallback），JSON 序列化輸出新值
      → pkg/model/lineage.go:20-26；TestLineageMarshalFull / TestLineagesUnionMarshal 驗證 `"source_role":"CANONICAL"`；
      舊 helper 角色移除（v1.3 派生計算不再屬來源分級），tools_de.go 財報體檢聚合改標 CANONICAL
- [x] DataGrade 型別與三個常數（AVAILABLE / PREVIEW / NOT_YET_AVAILABLE），Lineage 新增 `grade` 欄位（omitempty）
      → pkg/model/lineage.go:30-36；TestLineageNewFields 驗證預設不輸出、設定後輸出；盤中引擎預設標 AVAILABLE（§8 尾註）
- [x] Lineage 新增 `cache_age_sec`（int64, omitempty）；`derived_from` / `cache_ttl` / `source_url` 欄位**保留於 struct 但標 `json:"-"`**：正式 JSON 不輸出，debug/log 模式可輸出（model_test 驗證正式 JSON 無此三欄）
      → pkg/model/lineage.go:66-80（json:"-"）；新增 Lineage.DebugJSON()（debug/log 輸出三欄）；
      TestLineageMarshalFull（正式 JSON 無三欄）/ TestLineageDebugJSON（debug 可輸出）
- [x] Freshness 值更新為 v2.1 語意：REALTIME_INTRADAY / POST_MARKET / MONTHLY / QUARTERLY，另支援 STALE_FALLBACK（供 T024 stale-if-error 使用）
      → pkg/model/lineage.go:40-46 + ValidFreshness 五值；全站舊值 POST_MARKET_TODAY / HISTORICAL 遷移完畢（TAIFEX 歷史、行事曆改 POST_MARKET）
- [x] 支援 `[]Lineage`：多來源聚合回應（如 trend composite）可輸出 `_lineage` 陣列；Envelope 之 Lineage 欄位型別調整（union：單一或陣列）並通過序列化測試
      → pkg/model/envelope.go：新增 Lineages union 型別（內嵌 Lineage 單一值 + Multi 陣列），MarshalJSON/UnmarshalJSON 依輸入輸出物件或陣列；
      TestLineagesUnionMarshal / TestLineagesUnmarshalUnion（含 round trip）
- [x] 既有 36 個 Tool 全部改用新 Lineage（`go build ./...` 通過），model_test.go 契約測試更新為新欄位
      → make check（go vet + gofmt + go test ./...）全綠；TestAllToolsEnvelopeConsistent（36 工具）以新 source_role/freshness 白名單通過
- [x] 單元測試：新欄位序列化、舊三欄不出正式 JSON（但 debug 模式可輸出）、[]Lineage marshal/unmarshal、grade 預設值
      → TestLineageNewFields / TestLineageDebugJSON / TestLineagesUnionMarshal / TestLineagesUnmarshalUnion / TestLineageOmitempty / TestValidFreshness

## 完成摘要
- `pkg/model/lineage.go`：SourceRole / DataGrade 型別化，Freshness 更新為 v2.1 五值，三欄 json:"-"，新增 cache_age_sec、grade、DebugJSON()
- `pkg/model/envelope.go`：Envelope._lineage 改為 Lineages union（單一物件 / []Lineage 陣列），附 First()/Len() 輔助方法
- `pkg/mcp/core.go`：lineageFor 合併新增 grade/cache_age_sec 覆寫；盤中預設改 SEMI_OFFICIAL_REALTIME + AVAILABLE（v2.1 §8）
- 組裝點遷移：postLineage / taifexLineage / rangeLineage / 行事曆 / 代碼表改新 Freshness；財報體檢移除 helper 角色
- 契約與文件：model_test.go 重寫 7 個 lineage 測試；app_envelope_test / app_fg_test / app_de_test / app_bc_test / app_test / cache_test / envelope_test 更新；README Envelope 範例對齊 v2.1

## 備註
- 前置：無（v1.3 T002 已完成既有 model）
- 影響面最大之任務：所有 Tool / Adapter 的 lineage 組裝點都會動到；建議先改 model + 契約測試，再跑 `go test ./...` 逐一修正
- 已確認方案：內部保留（json:"-"）可讓既有組裝點（設定 derived_from/source_url 之處）**少改動**，僅序列化輸出受影響；debug 模式仍可輸出三欄
- daybrain 專案相容性：正式 JSON 不再含三欄，若 daybrain 讀取 JSON 需確認（T031 發布前驗證）；若讀內部 struct 則不受影響
- 後續：TAIFEX DL 路徑之 source_role 分級（CANONICAL/FALLBACK 如實反映）屬 T023 範圍；各 Tool 之 grade 逐工具標註屬 T027 範圍
