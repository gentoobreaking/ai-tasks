---
github_issue: N/A
title: gate gRPC server 接線（DeliverNotification/CollectContext/tgtransport）
type: feat
priority: high
status: done
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
- [x] gate 實作 OncallService server：DeliverNotification→Sender.SendMessage、
      ActionCallback→轉發 core（CoreForwarder adapter）、
      CollectContext→FanOut(labels, since, until) 回傳 ContextBundle、
      ReportIncident→轉發 core client（proxy 語意）
- [x] main.go：啟動 gRPC server（--grpc-addr）＋ Router.Run；tgtransport Sender 注入 server
- [x] e2e 斷言升級：分診報告後假 Telegram 端點（Sender 注入）收到推播；
      CollectContext 觸發時 fake Prometheus/Loki 收到查詢
- [x] 容器 compose 更新：gate expose gRPC 埠、core GATE_ADDR 指向 gate
- [x] 全套 go test + core pytest 維持綠燈

## 執行紀錄（2026-08-24 稽核）
- 已達成全部驗收項並打勾。
- **未竟事項**：生產 shell adapter（EXECUTOR_MODE=shell）需經組織安全政策審視後方可啟用；預設 log-only 模式。
- 補充：實作過程中接線斷言（predictions 入庫＋LLM 端點收到請求）曾抓到 daemon 接線斷裂，驗證了步驟 2.5-D 入口級煙霧測試的有效性。
