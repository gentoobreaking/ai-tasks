---
github_issue: N/A
title: RAG 核心測試補齊（indexer.py / searcher.py）
type: test
priority: medium
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T094 - RAG 核心測試補齊

## 目標
indexer.py（482 行）與 searcher.py（243 行）是本機 RAG 的核心，但 tests/ 中沒有
任何檔案直接 import 測試 —— 目前僅 e2e 或手動驗證摸得到。 LanceDB 與 embedding
皆有離線路徑（hash provider、本地表），可完全離線測試：

1. **indexer.py**：
   - 段落切分邏輯：markdown 標題/段落邊界、極長段落處理、空檔/非 UTF-8 檔容錯
   - 增量索引：新增/修改/刪除檔案後重跑，索引內容同步（mtime/hash 判斷正確）
   - 索引寫入 tmp_path 的 LanceDB 表，不碰實際資料目錄
2. **searcher.py**：
   - FTS 搜尋路徑與 fallback 關鍵字比對路徑（searcher.py:95-105 的 except 後退回）
   - where_clause 過濾、top_k 上限、空查詢/純符號查詢
   - semantic_vector_search 與 hash embedding 端到端小樣本（3-5 段落）召回驗證

沿用 conftest 既有隔離慣例（git env、SOUND_NOTIFY off）；embedding 一律用
hash provider（EMBEDDING_PROVIDER=hash）避免下載模型。

## 驗收標準
- [ ] 新增 tests/test_indexer.py 與 tests/test_searcher.py（或合併為
      tests/test_rag_core.py），全離線可跑
- [ ] 涵蓋段落切分、增量索引三態（增/改/刪）、FTS fallback、top_k/過濾
- [ ] 全套 pytest 通過且執行時間增加 < 30 秒（LanceDB tmp 表很小）

## 備註
- blocked_flow.py、repair_loop.py 也缺直接測試，但已有 e2e 間接涵蓋；
  本任務先補「零直接測試」的 RAG 核心，兩者若順手可加最小 smoke
