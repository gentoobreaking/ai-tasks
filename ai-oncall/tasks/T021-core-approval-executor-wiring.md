---
github_issue: N/A
title: core 批准→執行編排接線（ActionCallback → ApprovalGate → ExecutorRunner）
type: feat
priority: high
status: done
depends_on:
- T010
- T011
- T012
- T020
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T021 - core 批准→執行編排接線

## 目標
把「批准閘門 → executor」接進 daemon 生產路徑。目前 ActionCallback 在 servicer
中僅記時間線，ApprovalGate／ExecutorRunner 無 production caller——使用者按
「✅批准」不會觸發 runbook 執行。

**來源**：T016 二輪稽核接線審計發現（2026-08-24），詳見 T012 執行紀錄。

## 驗收標準
- [x] 分診報告產出時註冊 pending approval：mutating 動作建立 ApprovalGate 請求，
      callback_id ↔ request_id ↔ incident_id 對映射表入 store（重啟可回復）
- [x] ActionCallback handler 路由：approve/reject/snooze → ApprovalGate 對應方法
      （經 InteractionRouter RBAC 檢查）；拒絕原因即時入 RAG（§B.5 已有元件，接線驗證）
- [x] 批准後呼叫 ExecutorRunner.execute(report)：執行結果逐步寫時間線並推播
- [x] 逾時升級鏈運作：ApprovalGate timeout 由 daemon 排程驅動（非僅測試手動呼叫）
- [x] e2e：警報→分診報告→按✅批准→executor dry-run+執行→時間線完整軌跡
      （fake LLM/command runner，離線）；拒絕路徑含 RAG 入库驗證

## 執行紀錄（2026-08-24 稽核）
- 已達成全部驗收項並打勾。
- **未竟事項**：生產 shell adapter（EXECUTOR_MODE=shell）需經組織安全政策審視後方可啟用；預設 log-only 模式。
- 補充：實作過程中接線斷言（predictions 入庫＋LLM 端點收到請求）曾抓到 daemon 接線斷裂，驗證了步驟 2.5-D 入口級煙霧測試的有效性。
