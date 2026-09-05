---
github_issue: N/A
title: Documentation Update — README, spec.md alignment
assignee: pi
type: docs
priority: medium
status: pending
depends_on: ["T083", "T085", "T087", "T088"]
created: 2026-09-05
updated: 2026-09-05
---

# T092 - Documentation Update — README, spec.md alignment

## 目標

更新專案文檔，反映新架構。對應規格書 §61 Phase 12 完成後的文檔同步。

修改：`README.md`, `spec.md`, `CLAUDE.md` (如有), `AGENTS.md` (如有)。

## 驗收標準

- [ ] `README.md` 更新：
  - [ ] 專案定位：Taiwan AI Ecosystem Registry（非 MCP Registry）
  - [ ] 架構圖：規格書 §1 新架構流程圖
  - [ ] 支援實體類型列表（規格書 §2）
  - [ ] 核心原則：Discovery Broadly → Classify Explicitly → Verify Objectively → Publish Conservatively
  - [ ] Registry Views 列表與說明
  - [ ] 快速開始：安裝、配置、運行 `crawler run`
  - [ ] 開發指南：測試、遷移、貢獻
- [ ] `spec.md` 更新：
  - [ ] 與 `TAIWAN_AI_ECOSYSTEM_REGISTRY_SPEC.md` 對齊
  - [ ] 移除舊的 MCP-centric 描述
  - [ ] 更新 schema 參考新 Entity 模型
- [ ] `AGENTS.md` 更新（如存在）：
  - [ ] 專案結構說明
  - [ ] 開發命令、測試命令
  - [ ] 代碼風格、審查標準
- [ ] 遷移指南：`docs/migration.md`
  - [ ] 舊版到新版的變更摘要
  - [ ] 如何運行遷移腳本
  - [ ] Breaking changes 列表
- [ ] API 文檔：`docs/api.md`（REST API 若有，T048）
- [ ] 變更日誌：`CHANGELOG.md` 新增 v1.0.0 版本條目

## 備註

- 文檔更新在所有功能完成後進行（規格書 §64 Definition of Done 達成後）
- 確保無幻覺：所有文檔聲稱的功能必須有代碼實現對應

## 執行紀錄

- 待執行