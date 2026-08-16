---
title: gen_mermaid 真實掃描化 + consensus 中文分詞改善
type: refactor
priority: low
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-05
updated: '2026-08-17'
summary: gen_mermaid 真實掃描(--project/--flow)+ consensus bigram 分詞、去 magic，7 tests
spec_version: v3
---
# T021 - gen_mermaid 真實掃描化 + consensus 中文分詞改善

## 目標
兩個體驗問題：
1. `gen_mermaid.py` 是「假生成器」：`generate_architecture_mermaid()` 回傳**寫死的圖**（內容是 tw-quant-signal 的假想架構），`--project` 參數完全沒被使用。宣稱「自動掃描專案結構」但實際無掃描。
2. `consensus_eval.py` 的 `calculate_consensus_index()`：Jaccard 以空白切分 token，中文整句會被當成 1 個 token → 中文回答的共識度計算失真；且 `normalized_score = base * 3.5 + 0.35` 是無依據的魔法數字。

## 驗收標準
- [x] gen_mermaid：`--project` 真實生效——經 `PROJECT_PATHS`/`~/Projects/<name>` 解析 code_dir，掃描 *.py（排除 `__pycache__`/`.git`/`node_modules`/`.venv`/`logs` 等）產出模組/檔案層級架構圖（頂層目錄 subgraph + import 關係 group 層級邊，MAX_NODES=60 防爆）
- [x] gen_mermaid：`--flow` 產出基於實際流程的時序圖（任務→實作→驗證→commit 閉環，對應 auto_develop 實際行為）
- [x] consensus：中文分詞改善（`_tokenize()` 中文字符級 bigram + 英文單字，不依賴 jieba）
- [x] consensus：移除 `base * 3.5 + 0.35` magic，改為直接回傳平均 Jaccard（含註釋說明）
- [x] `./twin draw digital-twin` 與 `./twin consensus "問題"` 可正常執行（前者 real scan；後者 3 模型實跑算出 0.14 → 低共識，比舊式放大後誤判高共識更合理）
- [x] 掃描不到時明確提示（`FileNotFoundError` → 「僅輸出真實掃描結果，不產生假圖」）

## 備註
- jieba 屬純 Python 依賴，加入前確認是否值得：採取折衷——中文字元級 bigram，不新增重依賴
- gen_mermaid 掃描排除：`__pycache__`、`.git`、`node_modules`、`.venv`、`.pytest_cache`、`.ruff_cache`、`logs`、`.opencode`
- 額外順帶修正：`./twin` 的 `_resolve_python()` 優先專案 `.venv`（原 homebrew python 缺 tenacity 等使 `twin consensus` import 失敗）
- 測試：`tests/test_gen_mermaid_consensus.py` 7 tests；全量 **81 passed + 1 skipped**