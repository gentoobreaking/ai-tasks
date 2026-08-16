---
github_issue: null
title: knowledge indexer 重複實作收斂（index_knowledge / incremental_index）
type: refactor
priority: medium
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-17'
spec_version: v3
---
# T072 - knowledge index 收集/解析邏輯收斂

## 目標
Markdown 收集與章節解析實作存在兩份、回傳型別不同：
- `index_knowledge.py:29` `collect_markdown_files`、`:42` `parse_doc_sections`（回傳 dict）
- `incremental_index.py:149` `collect_markdown_files`、`:338` `parse_doc_sections`（回傳 `DocSection`）

修正只會落在其中一份，另一份靜默失效。收斂為單一來源。

## 驗收標準
- [x] 兩模組共用同一收集/解析實作（例如移入 common/ 或 index_knowledge→incremental_index 相用），回傳型別統一
- [x] `Collector`/解析行為（frontmatter、章節 split 規則）與現有測試預期一致
- [x] `search_knowledge_base`（worker RAG、task_advisor 使用）行為無回歸
- [x] `test_incremental_index` / `test_index_discuss_observability` 等相關測試全過
- [x] pytest 全量通過、ruff / pyright 通過

## 實作摘要

### 設計
建立 `common/markdown.py` 作為唯一知識索引共用來源：
- `NOTES_DIR` / `TASKS_DIR` / `CURRENT_DIR` 常數
- `DocSection` dataclass（含 `text_hash` / `to_dict` / metadata 欄位）
- `collect_markdown_files()`：掃集 ~/notes/ ~/tasks/ 與專案根目錄 *.md
- `parse_doc_sections(filepath, version="HEAD")`：Markdown → `DocSection` list
- `doc_section_to_dict(sec)`：`DocSection` → 純資料 dict（供 `index_knowledge` 後向相容）

### 變更
- **新增** `common/markdown.py`：單一分享模組（T072）
- `incremental_index.py`：刪除本地 `DocSection` / `collect_markdown_files` / `parse_doc_sections`，改由 `common.markdown` 導入（`DocSection` 仍 re-export 供 `test_incremental_index` 匯入）
- `index_knowledge.py`：刪除本地 `collect_markdown_files` / `parse_doc_sections`，改由 `common.markdown` 導入；`parse_doc_sections` 保留為 wrapper（`_parse_doc_sections` → `doc_section_to_dict`），維持 dict 回傳給 `search_knowledge_base` / `format_rag_context`
- `tests/test_index_discuss_observability.py`：monkeypatch 目標由 `index_knowledge.*` 改為 `common.markdown.*`（因 `collect_markdown_files` 現定義於 `common.markdown`）

### 驗證
- pytest 全量：262 passed + 1 skipped
- ruff：本次檔案 All checks passed
- pyright：本次檔案 0 errors（修正 incremental_index.py 預存 1 個 reportArgumentType：`_git_meta` 回傳型別 `dict[str, str]` → `dict[str, Any]`）

## 備註
- 兩處的消耗端（incremental_index 的 DocSection 欄位、index_knowledge 的 dict 欄位）需逐一對齊，確認無遺漏欄位 — 已對齊：index_knowledge 僅使用 `file/file_name/title/start_line/end_line/text`，皆來自 `doc_section_to_dict`
- 屬重構，不應改變索引結果語意 — 驗證無回歸