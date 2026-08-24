---
github_issue: N/A
title: ★ executor 頂層套件（runner + redaction）
type: feat
priority: high
status: done
depends_on:
- T010
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T011 - ★ executor 頂層套件（runner + redaction）

## 目標
頂層 `executor/` 套件——全系統唯一碰生產環境者。runner（冪等執行/逐步回報/
逾時/併發鎖）+ redaction（輸出遮蔽）。**實作依據：`algs/approval-executor.md`
§B.3 安全規則表全部、§B.4 全部。**

## 驗收標準
- [ ] §B.3 五條規則逐一落實：冪等、已緩解再檢查、逐步回報失敗即停、schema 契約硬拒絕、lint 禁止他模組 import（CI 斷言）
- [ ] redaction 依 §B.4：金鑰樣式清單（Bearer/connection string/私鑰/AWS·GCP·阿里雲憑證）打碼測試 ≥8 案例
- [ ] 原始輸出存本地加密檔，保留期可調（預設 90 天）
- [ ] k8s 動作 --dry-run=server 先行；shell 動作標注「無法預演」並要求更高批准等級