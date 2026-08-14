---
github_issue: N/A
title: Spec v0.5 vs 實作完整度審查與差距清單產出
type: review
priority: high
status: pending
depends_on: [T024, T029, T030, T031, T032, T033, T034, T035]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: 2026-08-15
---

# T036 - Spec v0.5 vs 實作完整度審查與差距清單產出

## 目標

系統性審查 `agent-control-plane-spec-v0.5.md`（3094 行，45 章節）與目前程式碼實作的完整度對應關係，產出結構化的「差距清單」，作為後續所有任務規劃的依據。

此任務為**審查型任務**，不產出新代碼，產出**審查報告**與**差距清單**。

## 驗收標準

- [ ] 逐章節對照：逐一檢視 `agent-control-plane-spec-v0.5.md` 的 45 個章節（§0–§45），對照目前程式碼實作狀態
- [ ] 產出 **Spec vs Implementation 對照表**（Markdown 表格）：
  - 章節號、標題、Spec 要求、實作檔案、實作完整度（✅/⚠️/❌）、備註
- [ ] 產出 **差距清單**（依優先序排序）：
  - 🔴 Critical：阻礙 Phase 1–5 生產可用
  - 🟡 High：影響 Baseline 完整跑分 / 指標計算
  - 🟢 Medium：Phase 6+ 預留功能
  - ⚪ Low：文檔補完、代碼品質
- [ ] 產出 **後續任務建議清單**：每個差距對應的建議任務編號、優先序、預估工時
- [ ] 輸出審查報告：`docs/reviews/spec-impl-review-20260815.md`
- [ ] 在 `tasks/` 目錄下為每個 🔴/🟡 差距建立對應的任務檔案（若尚未存在）

## 審查範圍重點

| Spec 區塊 | 關注點 |
|-----------|--------|
| §0–§3 | 版本沿革、背景、設計原則、架構總覽 |
| §4–§6 | 系統架構、技術棧、倉庫佈局 |
| §7–§9 | Core Domain Model、Task Lifecycle、State Machine |
| §10–§11 | Policy Engine、Task Analyzer |
| §12–§14 | Research Engine、Evidence Model、Evidence Gate |
| §15–§17 | 三層協議、Pi Worker、Worker Registry |
| §18–§19 | MCP / ACP 協議層 |
| §20 | Artifact Controller（含 canonicalizeDiff） |
| §21–§23 | Verification Engine、Reflection Engine、Retry Policy |
| §24–§25 | Execution Strategy Phase 1–5 / Phase 9 |
| §26 | Memory / Project Memory |
| §27 | SQLite Schema（19 tables + FTS5） |
| §28 | Security Boundary |
| §29 | CLI |
| §30–§31 | Configuration、Local Deployment |
| §32 | Observability（SSE、Event Log、SQLite） |
| §33–§36 | Benchmark、Baseline、Metrics、CP Gain |
| §37–§38 | E2E Walkthrough、MVP Roadmap、Validation Gate |
| §39–§45 | Definition of Done、E2E Test、Non-Negotiable Rules、Product Positioning、Roadmap、Open Questions、Tauri UI |

## 輸出交付物

1. **`docs/reviews/spec-impl-review-20260815.md`** - 完整審查報告
2. **`docs/reviews/gap-analysis.csv`** - 機器可讀的差距清單
3. **`tasks/T037-*.md` ...** - 針對每個 🔴/🟡 差距建立的後續任務檔案

## 備註

- 此任務為**一次性審查**，完成後不需持續維護（除非 Spec 版本更新）
- 建議由熟悉 Spec 與代碼庫的工程師主導，耗時約 1-2 天
- 審查結果將作為 T030–T035 及後續所有任務的**權威依據**
- 若發現 Spec 本身有錯誤/過時/矛盾，需在報告中標註並建議 Spec 修訂

## 相關任務

- 已完成：T023（E2E Test）、T024（Benchmark 基礎）、T027–T029（Prompt 改進）、T030–T035（後續規劃）
- 本任務為**全局審查**，依賴所有前序任務完成或明確狀態