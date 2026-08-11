---
github_issue: null
title: knowledge indexer 重複實作收斂（index_knowledge / incremental_index）
type: refactor
priority: medium
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-12'
---
# T072 - knowledge index 收集/解析邏輯收斂

## 目標
Markdown 收集與章節解析實作存在兩份、回傳型別不同：
- `index_knowledge.py:29` `collect_markdown_files`、`:42` `parse_doc_sections`（回傳 dict）
- `incremental_index.py:149` `collect_markdown_files`、`:338` `parse_doc_sections`（回傳 `DocSection`）

修正只會落在其中一份，另一份靜默失效。收斂為單一來源。

## 驗收標準
- [ ] 兩模組共用同一收集/解析實作（例如移入 common/ 或 index_knowledge→incremental_index 相用），回傳型別統一
- [ ] `Collector`/解析行為（frontmatter、章節 split 規則）與現有測試預期一致
- [ ] `search_knowledge_base`（worker RAG、task_advisor 使用）行為無回歸
- [ ] test_incremental_index / test_index_discuss_observability 等相關測試全過
- [ ] pytest 全量通過、ruff / pyright 通過

## 備註
- 兩處的消耗端（incremental_index 的 DocSection 欄位、index_knowledge 的 dict 欄位）需逐一對齊，確認無遺漏欄位
- 屬重構，不應改變索引結果語意