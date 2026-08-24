---
github_issue: N/A
title: Telegram 決策層互動與排班升級鏈
type: feat
priority: medium
status: done
depends_on:
- T010
- T004
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T012 - Telegram 決策層互動與排班升級鏈

## 目標
`interact/`（callback → 批准/拒絕/忽略語意，串 tracker 與 approval）+
`schedule/`（ICS/API 排班匯入，升級鏈 primary→secondary→manager）。
**實作依據：`algs/approval-executor.md` §B.2。**

## 驗收標準
- [x] inline 按鈕三分支（批准/拒絕+原因/逾時）行為有測試
- [x] 排班未設定時固定 admin（v1 降級），設定後依序升級
- [x] 權限：僅 admin 角色可批准 mutating 動作（RBAC 沿數位分身三級模式）

## 執行紀錄（2026-08-24 稽核）
- 已達成 3 項並打勾。
- **未竟事項**：無。
- 補充（證據）：test_t012_interact.py：approve/reject+原因（入 RAG）/snooze 三分支；Roster 未設定 chain()==[admin]、靜態三級依序升級測試（primary→secondary→manager 後棄單）；ICS 解析當值者為 primary；RBAC 非 admin approve 拋 RBACError、primary/manager/明列 admins 可批准、任何角色可附原因拒絕。
## 執行紀錄（2026-08-24 二輪稽核：接線審計）
- 元件層驗收全數達成（首輪已打勾）。
- **未竟事項（接線）**：ApprovalGate/InteractionRouter 無 production caller——
  gate 轉發來的 ActionCallback 在 core servicer 中僅記時間線，不會觸發
  批准閘門狀態機；executor 也因此尚無生產路徑。需「互動編排」接線：
  分診報告附帶 callback_id → ActionCallback 路由至 ApprovalGate →
  批准後呼叫 ExecutorRunner。已列為下一批次工作。
