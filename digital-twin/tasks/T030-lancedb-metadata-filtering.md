---
github_issue: 
title: LanceDB Metadata Filtering (標籤、專案、作者過濾)
type: feature
priority: medium
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-06
updated: '2026-08-06'
---

# T030 - LanceDB Metadata Filtering (標籤、專案、作者過濾)

## 目標
T009 僅支援版本過濾 (`search_by_version`)。實際 RAG 檢索需依 metadata 過濾：專案、標籤、作者、檔案類型、日期範圍等。需在 LanceDB schema 新增欄位、索引階段提取 metadata、搜尋 API 支援多條件 `where` 過濾。

## 驗收標準
- [ ] `incremental_index.py`：DocSection 新增 metadata 欄位（`project`、`tags`、`author`、`file_type`、`created_at`、`updated_at`）
- [ ] 索引階段自動從檔案路徑/frontmatter/git log 推導 metadata：
  - `project`：從路徑推導（如 `tw-quant-signal`、`digital-twin`）
  - `tags`：frontmatter `tags:` 或內文關鍵字
  - `author`：`git log --format='%an' -1 -- <file>`
  - `file_type`：副檔名/目錄（`spec`、`task`、`note`、`doc`）
  - `created_at`/`updated_at`：`git log --format='%ci' -- <file>`
- [ ] LanceDB schema 新增對應欄位並建立 scalar index（加速過濾）
- [ ] 搜尋 API：`search(query, filters: dict, top_k)` 支援多條件 AND/OR：
  - `filters = {"project": "digital-twin", "tags": ["docker", "ci"], "file_type": "spec"}`
- [ ] CLI `incremental_index.py search "query" --filter 'project=digital-twin,tags=docker'` 可用
- [ ] 混合檢索 `hybrid_search` 同步支援 filters
- [ ] 測試：專案過濾、多標籤 AND、日期範圍過濾

## 備註
- 依賴 T009 完成
- Metadata 欄位建議加入 `vector` 以外的 scalar index：`table.create_scalar_index("project")` 等
- `where` 子句使用 LanceDB filter 表達式（支援 `=`, `IN`, `LIKE`, `>`, `<` 等）
- 既有資料需回填 metadata（可用 `incremental_index.py reindex --full --with-meta`）
- 與 T029 向量搜尋可並行實作，互不相依