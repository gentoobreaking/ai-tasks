---
status: done
priority: medium
assignee: OpenCode
created: 2026-08-03
updated: '2026-08-06'
commit: e6ade3f
fail_count: 1
summary: '第 1 次失敗: 應用 diff 失敗'
---
# T009: index_knowledge.py 引入 LanceDB 替換純 Python 向量搜尋

## 背景
現有 RAG 為單機純 Python 向量化，**無版本控制、無增量更新、無租戶隔離**（v3 討論 2.3, DEC-01, SPEC-10）。

## 需求
1. 新增 `incremental_index.py`：
   - Git pre-commit hook 觸發：`git diff --name-only` → 增量索引
   - 使用 LanceDB (embedded) 作為向量庫，支援版本欄位
   - 保留 Git-backed 增量索引流程：pre-commit hook 觸發
   - 支援 `rag_query --version <tag>` 歷史回溯
   - 新增 BM25 + Vector 混合檢索（Gemini 第 2 輪建議）

## 驗收標準
- [x] `git commit` 觸發增量索引（pre-commit hook 執行 `incremental_index.py index`）
- [x] `rag_query --version v20241201` 可查詢歷史版本（`incremental_index.py search --version` / `search_by_version`）
- [x] 混合檢索（BM25 + Vector）精準定位程式碼片段（`hybrid_search` RRF）

## 參考
- v3 討論 DEC-01 / SPEC-10 / DeepSeek 第 1 輪建議 3, Gemini 第 2 輪建議 1
- 摘要：`2026-08-06-T009-summary.md`

## 執行記錄
- 新增 `incremental_index.py`：LanceDB 索引、搜尋、版本控制、混合檢索
- 更新 `index_knowledge.py`：LanceDB 後端 + fallback，保持 CLI 相容
- 更新 `install_hooks.py`：pre-commit hook 整合 `incremental_index.py index`
- 新增 `tests/test_incremental_index.py`：7 測試（索引/搜尋/版本/混合檢索）
- `pytest: 50 passed`、`ruff check` 通過