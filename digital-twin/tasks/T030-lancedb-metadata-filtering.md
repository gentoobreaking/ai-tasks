---
github_issue: 
title: LanceDB Metadata Filtering (標籤、專案、作者過濾)
type: feature
priority: medium
status: completed
depends_on: [T009, T029]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-06
updated: '2026-08-08'
---

# T030 - LanceDB Metadata Filtering (標籤、專案、作者過濾)

## 目標
T009 僅支援版本過濾 (`search_by_version`)。實際 RAG 檢索需依 metadata 過濾：專案、標籤、作者、檔案類型、日期範圍等。需在 LanceDB schema 新增欄位、索引階段提取 metadata、搜尋 API 支援多條件 `where` 過濾。

## 驗收標準
- [x] `incremental_index.py`：DocSection 新增 metadata 欄位（`project`、`tags`、`author`、`file_type`、`created_at`、`updated_at`）
- [x] 索引階段自動從檔案路徑/frontmatter/git log 推導 metadata：
  - `project`：從路徑推導（如 `tw-quant-signal`、`digital-twin`）
  - `tags`：frontmatter `tags:` 或內文關鍵字
  - `author`：`git log --format='%an' -1 -- <file>`
  - `file_type`：副檔名/目錄（`spec`、`task`、`note`、`doc`）
  - `created_at`/`updated_at`：`git log --format='%ci' -- <file>`
- [x] LanceDB schema 新增對應欄位並建立 scalar index（加速過濾）
- [x] 搜尋 API：`search(query, filters: dict, top_k)` 支援多條件 AND 過濾：
  - `filters = {"project": "digital-twin", "tags": ["docker", "ci"], "file_type": "spec"}`
- [x] CLI `incremental_index.py search "query" --filter 'project=digital-twin,tags=docker'` 可用
- [x] 混合檢索 `hybrid_search` 同步支援 filters
- [x] 測試：專案過濾、多標籤 AND、日期範圍過濾

## 備註
- 依賴 T009 完成
- Metadata 欄位建議加入 `vector` 以外的 scalar index：`table.create_scalar_index("project")` 等
- `where` 子句使用 LanceDB filter 表達式（支援 `=`, `IN`, `LIKE`, `>`, `<` 等）
- 既有資料需回填 metadata（可用 `incremental_index.py reindex --full --with-meta`）
- 與 T029 向量搜尋可並行實作，互不相依

## 執行記錄（2026-08-08）
- 新增 `extract_file_metadata()` / `_frontmatter_tags()` / `_infer_project()` / `_infer_file_type()` / `_git_meta()` / `_git_log_value()`
  - project 由路徑推導（`~/tasks/<project>/`、`~/notes/`、本專案）
  - tags 讀 frontmatter，無則以檔名關鍵字兜底
  - author / created_at / updated_at 由 `git log` 提取，失敗退回檔案 mtime
- 新增 `build_where(filters)`：AND 合併；tags 用 `ARRAY_CONTAINS`；支援 `>= <= > < =` 前置運算子
- 新增 `parse_filter_spec()`：CLI `--filter 'k=v,k2=v2'` 解析（`|` 分隔多值、運算子保留）
- `DocSection` 新增 metadata 欄位並由 `index_files()` 套用（每檔案提取一次）
- 既有表自動遷移：缺 metadata column → `add_columns` 補欄；並建立 `project`/`file_type`/`author` scalar index
- `bm25_search` / `vector_search` / `hybrid_search` 都支援 `filters` 參數；CLI `search`/`rag` 新增 `--filter`
- 測試：`test_parse_filter_spec` / `test_build_where` / `test_extract_file_metadata` / `test_search_with_filter`
- 驗證：`search --filter 'project=digital-twin'`（KS）、`tags=docker`、`created_at>=2026-08-01`、`file_type=task` 均正確
- 全量 reindex（--embed）完成：8205 段落，114 個標籤值，555 個 digital-twin 段落