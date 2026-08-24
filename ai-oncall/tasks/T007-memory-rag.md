---
github_issue: N/A
title: RAG 知識庫 memory/indexer + search
type: feat
priority: high
status: done
depends_on:
- T005
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T007 - RAG 知識庫 memory/indexer + search

## 目標
`memory/`：事故/runbook 切段入庫（embedding）＋混合檢索。
**實作依據：`algs/knowledge-flywheel.md` §D.1–D.2、§D.5。**

## 驗收標準
- [x] 檢索支援 metadata 過濾：service/cluster/severity/time_range（§D.1——純文字相似度不足）
- [x] 三個入库來源（postmortem 定稿/即時 override/runbook 變更）各有介面與測試
- [x] 入库前過遮蔽層（§D.5，樣式掃描同 executor redact）
- [x] embedding provider 以 hash/local 起步（離線可測），openai 可切

## 執行紀錄（2026-08-24 稽核）
- 已達成 4 項並打勾。
- **未竟事項**：無。
- 補充（證據）：test_t007_memory.py：service/severity/cluster/time_range 過濾各自獨立測試；三來源各有介面與測試（runbook 重索引同名覆寫不累積）；test_indexing_goes_through_redaction 斷言金鑰不入向量庫；HashEmbeddingProvider 確定性測試＋OpenAIEmbeddingProvider 建構離線可切。
