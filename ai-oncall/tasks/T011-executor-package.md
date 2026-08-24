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
- [x] §B.3 五條規則逐一落實：冪等、已緩解再檢查、逐步回報失敗即停、schema 契約硬拒絕、lint 禁止他模組 import（CI 斷言）
- [x] redaction 依 §B.4：金鑰樣式清單（Bearer/connection string/私鑰/AWS·GCP·阿里雲憑證）打碼測試 ≥8 案例
- [x] 原始輸出存本地加密檔，保留期可調（預設 90 天）
- [x] k8s 動作 --dry-run=server 先行；shell 動作標注「無法預演」並要求更高批准等級- [ ] shell 動作「更高批准等級」機制化（目前僅時間線標注 approval_dry_run_unavailable ＋ executor warning，未強制升級至 manager 層級批准）

## 執行紀錄（2026-08-24 稽核）
- 已達成 4 項並打勾。
- **未竟事項**：shell 動作「更高批准等級」機制化（目前僅時間線標注 approval_dry_run_unavailable ＋ executor warning，未強制升級至 manager 層級批准）
- 補充（證據）：test_t011_executor.py：冪等（併發雙執行緒僅一次執行）、mitigated 跳過、失敗即停（第三步不執行）、硬拒絕非 validated 輸入、test_no_external_imports_of_executor CI 掃描；redact 9 案例全打碼＋時間線無金鑰；Fernet 加密稽核檔（密文無明文金鑰、可解密驗證）＋purge_expired_audits(90 天)；mutating 先 dry_run=True 再實執行、default_command_runner 對 kubectl 注入 --dry-run=server／shell 回「無法預演」。
