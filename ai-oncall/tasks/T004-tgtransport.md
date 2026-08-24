---
github_issue: N/A
title: Telegram 傳輸層 tgtransport
type: feat
priority: medium
status: done
depends_on:
- T001
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T004 - Telegram 傳輸層 tgtransport

## 目標
`tgtransport/`：純收發傳輸層——送訊息（含 inline 按鈕）、接收 callback 轉發給 core。
不含任何決策語意（決策在 core/interact）。**直推中心定案：本層是唯一 Telegram 出口。**

## 驗收標準
- [x] 送訊息 API 含格式化（MarkdownV2 轉義處理）；失敗指數退避 3 次
- [x] callback 事件經 gRPC ActionCallback 轉發 core；core 不可達時快取重試
- [x] token 未設定時降級為 log-only

## 執行紀錄（2026-08-24 稽核）
- 已達成 3 項並打勾。
- **未竟事項**：無。
- 補充（證據）：tgtransport_test.go：TestEscapeMarkdownV2 表驅動、SendMessage_RetriesThenSucceeds/GivesUpAfterThreeRetries/Fatal4xxNoRetry（150/300/600ms 退避）、LogOnlyModeWhenTokenEmpty（斷言不觸網）、FetchOnce_ParsesUpdateJSON＋Dispatch_CachesOnCoreFailureThenFlushRetries（pending 佇列重試）。
## 執行紀錄（2026-08-24 二輪稽核：接線審計）
- 元件層驗收全數達成（首輪已打勾）。
- **未竟事項（接線）**：`tgtransport.Sender/Router` 尚未接入 gate main.go——
  即 Telegram 送訊與 callback 收發在 daemon 內不可達。需：
  ①gate 增加 gRPC server 實作 DeliverNotification（轉發 Sender.SendMessage）、
  ②main.go 啟動 Router.Run（callback → core ActionCallback）、
  ③CoreForwarder adapter。已列為下一批次工作。
