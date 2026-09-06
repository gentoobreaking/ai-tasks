---
github_issue: N/A
title: Database Schema Migration — SQLite schema for new entity model
assignee: pi with opencode
type: feat
priority: high
status: done
depends_on:
  - T065
  - T066
  - T067
  - T079
  - T081
created: 2026-09-05
updated: 2026-09-05
---

# T084 - Database Schema Migration — SQLite schema for new entity model

## 目標

設計並實作新的 SQLite schema，支援完整的 Entity 模型與所有獨立維度。對應規格書 §61 Phase 10。

現有 storage 在 `internal/storage/` (T004, T027)，需遷移。

## 驗收標準

- [x] `internal/storage/schema_v2.sql` 新建：
  - [x] `entities` 表：核心欄位（id, name, slug, description, entity_status, primary_classification, classification_confidence, classification_evidence_json, mcp_role, mcp_identity_status, mcp_identity_evidence_json, mcp_identity_confidence, taiwan_score, taiwan_level, taiwan_evidence_json, taiwan_confidence, ai_score, ai_level, ai_evidence_json, ai_confidence, quality_score, quality_grade, quality_components_json, security_status, security_findings_json, security_scanned_at, repository_json, endpoints_json, tools_json, resources_json, data_sources_json, sources_json, first_seen, last_seen, last_verified, created_at, updated_at）
  - [x] 索引：entity_status, primary_classification, mcp_identity_status, taiwan_level, security_status, slug
  - [x] `entity_evidence` 表：entity_id, dimension (classification/taiwan/ai/mcp_identity/security/quality), rule, source, location, matched_text, content_hash, score, confidence, timestamp
  - [x] `entity_endpoints` 表：entity_id, url, transport, type, protocol_version, auth_json, tls, status, evidence_json, confidence
  - [x] `migration_log` 表：舊 ID 映射、遷移狀態、錯誤
- [x] `internal/storage/migration.go`：
  - [x] `MigrateV1ToV2(db *sql.DB) error` — 從舊 schema 遷移
  - [x] 讀舊 `mcp_servers` 表，轉換為新 `entities`
  - [x] 保留舊表作備份（`mcp_servers_v1_backup`）
- [x] `internal/storage/entity_store.go` 新建：
  - [x] `Save(entity *Entity) error`
  - [x] `Get(id string) (*Entity, error)`
  - [x] `List(filter EntityFilter) ([]*Entity, error)`
  - [x] `Update(entity *Entity) error`
  - [x] `Delete(id string) error`
  - [x] `Count(filter EntityFilter) (int, error)`
- [x] `EntityFilter` 支援：entity_status, primary_classification, mcp_identity_status, taiwan_level_min, security_status, limit, offset
- [x] 事務支援：批次寫入
- [x] 單元測試：CRUD、過濾、遷移腳本
- [x] 整合測試：完整遷移現有資料

## 備註

- JSON 欄位存儲複雜結構（evidence, endpoints 等），查詢時用 JSON1 extension
- 遷移腳本需冪等、可重跑
- 現有 `internal/storage/sqlite.go` (T004, T027) 重構為新 store

## 執行紀錄

- 2026-09-06: 完成實作成果，代碼與規格書對齊。
- `internal/storage/schema_v2.sql` 新建：entities 表（所有核心欄位）、entity_evidence 表、entity_endpoints 表、migration_log 表
- 索引：entity_status, primary_classification, mcp_identity_status, taiwan_level, security_status, slug
- `internal/storage/migration.go`：`MigrateV1ToV2()` 實現從舊 schema 遷移，保留 `mcp_servers_v1_backup`
- `internal/storage/entity_store.go`：`Save()`, `Get()`, `List()`, `Update()`, `Delete()`, `Count()` 全部實現
- `EntityFilter` 支援：EntityStatus, PrimaryClassification, MCPIdentityStatus, TaiwanLevel, SecurityStatus, QualityMin, Limit, Offset
- 事態支援：批次寫入（batch commit）
- `go test ./internal/storage/... -v -count=1` — PASS