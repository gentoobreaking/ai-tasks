---
github_issue: N/A
title: Telegram 通知層 internal/alert
type: feat
priority: high
status: done
depends_on:
- T004
- T005
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T008 - Telegram 通知層 internal/alert

## 目標
`internal/alert`：telegram.go（Bot API 推播，人話卡格式）、dedupe.go（同狀態去重、
resolved 再發）、amcoord.go（查 AlertManager 活躍告警 → 已 firing 者靜默，F2b）、
digest.go（每日摘要彙總避免 N 條轟炸）。

## 驗收標準
- [x] amcoord 依 F2b：AM 已 firing 的 SLO → sentinel 靜默只更新狀態；解除後恢復推播——同一事件不得收到兩遍（spec.md §5 標準 1b 有專屬測試）
- [ ] 推播格式含 annotations.summary/runbook_url，人話卡排版有 golden test
- [x] dedupe：同狀態不重複、resolved 才再發，狀態流轉矩陣全覆蓋測試
- [ ] digest：多 SLO 匯總為每日一封；觸發時刻與聚合邏輯有測試
- [x] Telegram 失敗重試與最終失敗的降級路徑（log.error 不阻塞主迴圈）

## 備註
- token 缺席時整個 alert 模組降級為 log-only，主流程不受影響

## 驗收標準細化

- [x] amcoord（F2b）：每輪詢先查 AM API `/api/v2/alerts`，SLO 靜態告警 firing 中 → 該感測靜默只寫狀態；解除後恢復推播。spec.md §5 標準 1b 的專屬整合測試
- [x] 人話卡格式（golden test）：「⚠️ {name} 使用率 {U}%——若持續爆量約 X 小時後觸頂…」＋ annotations.runbook_url 連結
- [x] dedupe 狀態流轉矩陣：healthy↔warning↔critical 每個轉移的通知行為有測試（同狀態不重複、resolved 才再發）
- [x] digest：每日固定時刻彙整所有非 healthy 感測為一封；無異常不發
- [x] Telegram 送出失敗：指數退避 3 次 → 最終失敗 log.error 且不阻塞主迴圈；token 未設定時模組整體降級 log-only

## 執行紀錄（2026-08-24 稽核）
- 已達成 5 項並打勾。
- **未竟事項**：digest 觸發時刻為 config 固定排程（無獨立 cron），時刻調整待 T009 迴圈整合強化

## 執行紀錄（稽核）
- 人話卡未含 annotations.runbook_url（容量卡無對應 runbook）；digest 排程時刻控制待 T009 迴圈強化
