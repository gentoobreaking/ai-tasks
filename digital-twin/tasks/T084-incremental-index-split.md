---
github_issue: 
title: 拆分 incremental_index.py 為 indexer.py 與 searcher.py
type: pending
priority: medium
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: 2026-08-16
---

# T084 - 拆分 incremental_index.py 為 indexer.py 與 searcher.py

## 目標
將 `incremental_index.py`（目前 746 行）拆分為索引建立與搜尋兩個獨立模組，降低單檔複雜度。

## 背景
`incremental_index.py` 目前包含：
- LanceDB 連線管理與 table 建立
- Markdown 文件解析與 chunk 切割
- Embedding 生成與向量寫入
- metadata 過濾搜尋
- 混合搜尋（向量 + FTS）
- RAG 結果格式化

過多職責集中於同一檔案，不利於獨立測試與後續擴充。

## 驗收標準
- [x] 新增 `indexer.py`：封裝 LanceDB 連線、文件解析、chunk 切割、embedding 寫入邏輯
- [x] 新增 `searcher.py`：封裝向量搜尋、metadata 過濾、混合搜尋、RAG 結果格式化
- [x] `incremental_index.py` 縮減為薄入口或合併至 `index_knowledge.py`
- [x] import 方向單向：`searcher → indexer`（搜尋依賴索引結構定義）
- [x] 現有測試全通過（含 `test_incremental_index.py` 11 個測試、`test_vector_search.py` 6 個測試）
- [x] ruff check 零錯誤
- [x] README 同步更新模組結構

## 備註
- embedding 降級契約（T069）邏輯需保持完整
- LanceDB API 呼叫（`list_tables()` / `create_index(config=FTS/BTree)`）需維持相容
- 參考 T051 的拆分模式