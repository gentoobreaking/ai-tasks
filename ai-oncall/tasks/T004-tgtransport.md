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
- [ ] 送訊息 API 含格式化（MarkdownV2 轉義處理）；失敗指數退避 3 次
- [ ] callback 事件經 gRPC ActionCallback 轉發 core；core 不可達時快取重試
- [ ] token 未設定時降級為 log-only