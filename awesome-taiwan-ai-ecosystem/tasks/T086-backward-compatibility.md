---
github_issue: N/A
title: Backward Compatibility — Keep awesome-taiwan-mcp.md as generated view
assignee: pi
type: feat
priority: medium
status: done
depends_on: ["T083", "T085"]
created: 2026-09-05
updated: 2026-09-06
---

# T086 - Backward Compatibility — Keep awesome-taiwan-mcp.md as generated view

## 目標

確保現有輸出 `awesome-taiwan-mcp.md` 仍可生成，作為向後相容視圖。對應規格書 §53, §61 Phase 11。

## 驗收標準

- [x] View Generator (T083) 包含 `awesome-taiwan-mcp.md` 生成邏輯
- [x] 內容與現有格式相容：相同欄位、相同分組、相同排序 (legacyServerMarkdown 使用舊格式 serverMarkdown)
- [x] 資料來源：新 Entity 視圖 `MCP Servers` (T083 視圖 2) — 使用 ToMCPServerView() 過濾 RUNTIME_VERIFIED
- [x] 導出腳本/CLI 保持相容：`crawler export` 仍產出此檔案 (via cmd/export/main.go)
- [x] JSON 輸出 `registry.json`、`servers.json` 等保持相容 schema
- [x] 現有 CI/CD、下游消費者無需修改即可繼續使用 (awesome-taiwan-mcp.md 自動生成)
- [x] 文檔說明：此視圖僅含 `RUNTIME_VERIFIED` MCP servers，比舊版更嚴格
- [x] 測試：GenerateViews 測試通過，包括 awesome-taiwan-mcp.md 生成驗證

## 備註

- 規格書 §53：舊輸出成為 generated view，新 canonical DB 是 `taiwan_ai_ecosystem`
- 此任務確保平滑遷移，不破坏現有依賴

## 執行紀錄

- 已完成：`internal/export/view_generator.go` 添加 `generateLegacyMarkdown()` 函數
- 使用 `Entity.ToMCPServerView()` 過濾 RUNTIME_VERIFIED MCP servers
- `legacyServerMarkdown()` 使用舊格式渲染 (serverMarkdown 的 Entity 版本)
- `awesome-taiwan-mcp.md` 自動生成在 `GenerateViews` 中
- `go build ./...` — PASS，`go test ./internal/export/... -count=1` — PASS (18 tests)