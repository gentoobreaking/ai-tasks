---
github_issue: N/A
title: Lineage/SourceRole/DataGrade 通用化升級（v2.1 §4）
type: feature
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-01
updated: 2026-08-01
---

# T021 - Lineage 通用化升級（v2.1 §4）

## 目標
將現有 v1.3 版 `pkg/model/lineage.go` 升級為 v2.1 §4 通用 Lineage：新增 SourceRole 型別（CANONICAL / SEMI_OFFICIAL_REALTIME / FALLBACK）與 DataGrade（AVAILABLE / PREVIEW / NOT_YET_AVAILABLE），新增 `cache_age_sec`，並支援多來源 `[]Lineage` 陣列。

> **欄位決策（已與使用者確認 2026-08-01）**：`derived_from` / `cache_ttl` / `source_url` **從正式 JSON 移除，但內部 struct 欄位保留**（`json:"-"`，僅 debug/log 模式可輸出）——兼顧 v2.1 對外介面收斂與 v1.3 附錄 A「source_url 僅 debug 模式輸出」精神，且降低 daybrain 相容風險（內部仍可讀）。

## 驗收標準
- [ ] SourceRole 型別與三個常數（CANONICAL / SEMI_OFFICIAL_REALTIME / FALLBACK）取代現有字串常數（canonical/helper/fallback），JSON 序列化輸出新值
- [ ] DataGrade 型別與三個常數（AVAILABLE / PREVIEW / NOT_YET_AVAILABLE），Lineage 新增 `grade` 欄位（omitempty）
- [ ] Lineage 新增 `cache_age_sec`（int64, omitempty）；`derived_from` / `cache_ttl` / `source_url` 欄位**保留於 struct 但標 `json:"-"`**：正式 JSON 不輸出，debug/log 模式可輸出（model_test 驗證正式 JSON 無此三欄）
- [ ] Freshness 值更新為 v2.1 語意：REALTIME_INTRADAY / POST_MARKET / MONTHLY / QUARTERLY，另支援 STALE_FALLBACK（供 T024 stale-if-error 使用）
- [ ] 支援 `[]Lineage`：多來源聚合回應（如 trend composite）可輸出 `_lineage` 陣列；Envelope 之 Lineage 欄位型別調整（union：單一或陣列）並通過序列化測試
- [ ] 既有 36 個 Tool 全部改用新 Lineage（`go build ./...` 通過），model_test.go 契約測試更新為新欄位
- [ ] 單元測試：新欄位序列化、舊三欄不出正式 JSON（但 debug 模式可輸出）、[]Lineage marshal/unmarshal、grade 預設值

## 備註
- 前置：無（v1.3 T002 已完成既有 model）
- 影響面最大之任務：所有 Tool / Adapter 的 lineage 組裝點都會動到；建議先改 model + 契約測試，再跑 `go test ./...` 逐一修正
- 已確認方案：內部保留（json:"-"）可讓既有組裝點（設定 derived_from/source_url 之處）**少改動**，僅序列化輸出受影響；debug 模式仍可輸出三欄
- daybrain 專案相容性：正式 JSON 不再含三欄，若 daybrain 讀取 JSON 需確認（T031 發布前驗證）；若讀內部 struct 則不受影響
