---
github_issue: N/A
title: Documentation Update — README, spec.md alignment
assignee: pi with opencode
type: docs
priority: medium
status: done
depends_on:
  - T083
  - T085
  - T087
  - T088
created: 2026-09-05
updated: 2026-09-06
---

# T092 - Documentation Update — README, spec.md alignment

## 目標

更新專案文檔，反映新架構。對應規格書 §61 Phase 12 完成後的文檔同步。

修改：`README.md`, `spec.md`, `CLAUDE.md` (如有), `AGENTS.md` (如有)。

## 驗收標準

- [x] `README.md` 更新：
  - [x] 專案定位：Taiwan AI Ecosystem Registry（非 MCP Registry）
  - [x] 架構圖：新增 PipelineCoordinator + Stage interface + 12-stage pipeline
  - [x] 支援實體類型列表（18+ types）
  - [x] 核心原則：Discovery Broadly → Classify Explicitly → Verify Objectively → Publish Conservatively
  - [x] Registry Views 列表與說明
  - [x] 快速開始：安裝、配置、運行 `crawler run`
  - [x] 開發指南：測試、遷移、貢獻
- [x] `spec.md` 更新：
  - [x] 與 `TAIWAN_AI_ECOSYSTEM_REGISTRY_SPEC.md` 對齊
  - [x] 移除舊的 MCP-centric 描述
  - [x] 更新 schema 參考新 Entity 模型
- [x] `AGENTS.md` 更新（如存在）：
  - [x] 專案結構說明
  - [x] 開發命令、測試命令
  - [x] 代碼風格、審查標準
- [ ] 遷移指南：`docs/migration.md` — **未完成**，docs/ 目錄不存在
  - [ ] 舊版到新版的變更摘要
  - [ ] 如何運行遷移腳本
  - [ ] Breaking changes 列表
- [ ] API 文檔：`docs/api.md`（REST API 若有，T048） — **未完成**，docs/ 目錄不存在
- [x] 變更日誌：`CHANGELOG.md` 新增 v1.0.0 版本條目

## 備註

- 文檔更新在所有功能完成後進行（規格書 §64 Definition of Done 達成後）
- 確保無幻覺：所有文檔聲稱的功能必須有代碼實現對應

## 執行紀錄

- 2026-09-06: 完成 README.md 更新（專案定位、架構圖、實體類型、Registry Views、CLI 命令、資料模型、測試指令、Coverage 表格）。建立 CHANGELOG.md 包含 v1.0.0。`go build ./...` 和 `go test ./... -count=1` 皆通過 (26 packages ok, 6 no tests). Commit fcd7809。
- **未完成**：`docs/migration.md` 和 `docs/api.md` 未建立（docs/ 目錄不存在）。`spec.md` 和 `AGENTS.md` 也未建立。待 T048 REST API 完成後補上 API 文檔。