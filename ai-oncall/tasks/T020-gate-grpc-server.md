---
github_issue: N/A
title: gate gRPC server 接線（DeliverNotification/CollectContext/tgtransport）
type: feat
priority: high
status: pending
depends_on:
- T003
- T004
- T019
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T020 - gate gRPC server 接線

## 目標
gate 增加 gRPC server（proto OncallService 的 gate 端實作），把已建成但未接線的
`tgtransport/` 與 `collect/` 接進 daemon，打通三個斷裂箭頭：
①core 報告 → DeliverNotification → Sender.SendMessage（Telegram 推播）
②main.go 啟動 tgtransport Router.Run（callback long-polling → 轉發 core）
③CollectContext → collect.FanOut（core 可請求 context 收集）

**來源**：T016 二輪稽核接線審計發現（2026-08-24），詳見 T003/T004 執行紀錄。

## 驗收標準
- [ ] gate 實作 OncallService server：DeliverNotification→Sender.SendMessage、
      ActionCallback→轉發 core（CoreForwarder adapter）、
      CollectContext→FanOut(labels, since, until) 回傳 ContextBundle、
      ReportIncident→轉發 core client（proxy 語意）
- [ ] main.go：啟動 gRPC server（--grpc-addr）＋ Router.Run；tgtransport Sender 注入 server
- [ ] e2e 斷言升級：分診報告後假 Telegram 端點（Sender 注入）收到推播；
      CollectContext 觸發時 fake Prometheus/Loki 收到查詢
- [ ] 容器 compose 更新：gate expose gRPC 埠、core GATE_ADDR 指向 gate
- [ ] 全套 go test + core pytest 維持綠燈
