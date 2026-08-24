---
github_issue: N/A
title: oncall-gate 骨架與 proto 契約
type: chore
priority: high
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T001 - oncall-gate 骨架與 proto 契約

## 目標
Go 專案基礎：go.mod、§2.2 gate 目錄結構、config 載入（listen 位址/shared secret/
Prometheus/Loki 端點/core gRPC 位址）、structlog、Makefile。
定義 `proto/oncall.proto` 四個 RPC（ReportIncident/DeliverNotification/ActionCallback/
CollectContext）與 IncidentEvent/ContextBundle 訊息——契約先行，雙側依此開發。

## 驗收標準
- [x] proto 定義通過 buf/protoc lint；產生 Go 與 Python stub 兩份
- [x] config 載入單元測試（預設值/覆寫/缺欄位）
- [x] Makefile：build/lint/test/proto-gen

## 執行紀錄（2026-08-24 稽核）
- 已達成 3 項並打勾。
- **未竟事項**：無。
- 補充（證據）：buf lint STANDARD 通過；`make proto-gen` 同步產生 gate/gen/*.pb.go 與 core/src/oncall_core/_proto/oncall_pb2.py；gate/internal/config/config_test.go 5 測試（TestLoad_Defaults/Override/MissingRequired/BadCollectTimeout/TestValidate_BadURL）；Makefile build/lint/test/proto-gen 全目標實跑通過。
