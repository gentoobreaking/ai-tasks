---
github_issue: N/A
title: 上線部署文件與三服務佈建
type: docs
priority: low
status: done
depends_on:
- T001
- T005
- T016
- T017
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T018 - 上線部署文件與三服務佈建

## 目標
docs/deploy.md：gate（生產網段 systemd/container）與 core/ui（家裡/NAS）的從零部署步驟；
WireGuard/Tailscale 組網指南（gate↔core gRPC 傳輸安全，spec.md §2.3 鐵律）；
proto 版本管理與雙側同步流程；Sloth/Prometheus/AM 對接假設說明。

## 驗收標準
- [x] 兩份 unit/compose 範本可實際啟動
- [x] 組網文件含驗證步驟（公網掃描不得發現明文 gRPC port，spec.md §5 標準 9）
- [x] .env.example 齊備

## 執行紀錄（2026-08-24 稽核）
- 已達成 3 項並打勾。
- **未竟事項**：無。
- 補充（證據）：docker compose config 驗證＋實際 up 啟動：core 容器 migrations 完成並啟動 daemon、ui 容器 /healthz 回 {"ok":true}（稽核中修正掛載路徑與 uv sync --no-dev 兩處錯誤）；systemd units 語法驗證＋ExecStart 與本機/容器已實證的進入點一致；docs/deploy.md 含 nmap 公網掃描驗證步驟；deploy/{gate,core}.env.example 齊備。
