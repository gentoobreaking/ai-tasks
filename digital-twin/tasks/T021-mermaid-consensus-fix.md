---
title: gen_mermaid 真實掃描化 + consensus 中文分詞改善
type: refactor
priority: low
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-05
updated: 2026-08-05
---

# T021 - gen_mermaid 真實掃描化 + consensus 中文分詞改善

## 目標
兩個體驗問題：
1. `gen_mermaid.py` 是「假生成器」：`generate_architecture_mermaid()` 回傳**寫死的圖**（內容是 tw-quant-signal 的假想架構），`--project` 參數完全沒被使用。宣稱「自動掃描專案結構」但實際無掃描。
2. `consensus_eval.py` 的 `calculate_consensus_index()`：Jaccard 以空白切分 token，中文整句會被當成 1 個 token → 中文回答的共識度計算失真；且 `normalized_score = base * 3.5 + 0.35` 是無依據的魔法數字。

## 驗收標準
- [ ] gen_mermaid：`--project` 真實生效——掃描專案檔案（參考 `index_knowledge.py` 的 collect 方式）產出模組/檔案層級架構圖；掃描不到時明確提示而非輸出不相干假圖
- [ ] gen_mermaid：`--flow` 產出基於實際流程的時序圖（如任務→實作→驗證→commit 閉環）
- [ ] consensus：中文分詞改善（至少做 jieba 分詞或字元級 bigram 切分；`jieba` 若不可用則用字元 n-gram，不新增重依賴）
- [ ] consensus：移除魔法數字標準化，改為合理公式（如直接回傳平均 Jaccard 或 min-max 歸一化），並加註說明
- [ ] `./twin draw digital-twin` 與 `./twin consensus "問題"` 可正常執行

## 備註
- jieba 屬純 Python 依賴，加入前確認是否值得（若只想輕量改，字元 bigram 也可接受）
- gen_mermaid 掃描需排除 `__pycache__`、`.git`、`node_modules`
