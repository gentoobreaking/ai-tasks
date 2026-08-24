---
github_issue: N/A
title: 感測通知發送失敗保護——先發送成功才登記狀態
type: fix
priority: high
status: pending
depends_on:
- T009
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-25
updated: 2026-08-25

---

# T026 - 感測通知發送失敗保護

## 背景（可靠性缺陷）
`runOnePoll` 的順序是 `dedupe.ShouldNotify()`（先登記新狀態）→ `Send()`。
若 Telegram 瞬斷：狀態已登記、下輪同狀態不再推——**該則 critical 通知
永久丟失**。每週成本摘要已實作「失敗不登記、下輪重試」（maybeWeeklyCost），
感測通知路徑沒有同等保護。

## 目標
通知發送失敗時不推進去重狀態，下一輪自動重試，直到成功。

## 實作要點
1. 調整順序：Send 成功後才 `dedupe.ShouldNotify` 登記／或改為
   Send 失敗時回滾 dedupe 狀態（擇一，注意併發與語意）
2. 重試間隔即輪詢間隔（既有 ticker）；連續失敗 N 次後降級為
   每 M 輪重試一次（避免每輪打掛掉的 API）
3. 降級/恢復寫入 log；metrics 可選暴露 notify_failures_total
4. 驗證邊界：critical→warning 降級路徑、resolved 路徑同樣受保護

## 驗收標準
- [ ] fake notifier 先失敗後成功：第二次輪詢補送同一狀態轉移
- [ ] Send 永遠失敗：dedupe 狀態不被推進（不吞掉未來的轉移通知）
- [ ] 既有 e2e 測試全數通過（行為僅在失敗情境有別）
- [ ] 連續失敗退避生效（單元測試覆蓋）

## 備註
- critical 通知丟失是值班場景的一等事故——本任務優先級 high
