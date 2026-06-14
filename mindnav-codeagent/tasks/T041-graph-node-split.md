---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/545
title: T041 - Graph.py 節點拆分重構
type: Refactor
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: refactor
---

# T041 - Graph.py 節點拆分重構

## 目標
`engine/graph.py` 已膨脹至 130+ 行，所有 Agent 節點函數與 LLM 初始化全部塞在同一檔案。需將每個 Agent 節點拆成獨立檔案，graph.py 只負責註冊與組合。

## 驗收標準
- [x] 新增 `engine/nodes/` 目錄（含 `__init__.py`）
- [x] 所有節點已搬入獨立檔案：`po_node.py`、`pm_node.py`、`architect_node.py`、`coder_node.py`、`security_node.py`、`qa_node.py`、`doc_node.py`、`researcher_node.py`、`devops_node.py` + `supervisor_node.py`
- [x] 新增 `base.py` 共用基礎（`agent_node` + `create_simple_node`）
- [x] `graph.py` 僅保留 `build_project_graph()` 與節點註冊邏輯（90 → 63 行）
- [x] 確認 `from engine.graph import build_project_graph` 可正常執行

## 備註
- 每個節點檔案應只匯出一個 factory function，接收 config + llm 參數
- 避免在全域 scope 建立 LLM 實例
