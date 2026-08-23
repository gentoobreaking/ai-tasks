---
github_issue: N/A
title: 上線部署文件與 systemd/container 佈建
type: docs
priority: low
status: pending
depends_on:
- T009
- T016
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T017 - 上線部署文件與 systemd/container 佈建

## 目標
部署產物與文件：兩個 binary 的 systemd unit / container 定義、rules.d 目錄佈建指南
（Sloth 安裝與生成、awesome-prometheus-alerts patch 流程、sentinel 註解慣例）、
.capacity_defs 與 .env 範本。

## 驗收標準
- [ ] docs/deploy.md：從零到 daemon 運行的完整步驟（含 Sloth 整合與 rules.d 佈建）
- [ ] systemd unit 附 graceful shutdown 驗證說明；container 版 ≤20MB（spec.md §5 標準 3）
- [ ] .env.example / rules.d 種子檔（T005 產出的 sentinel-baseline.yaml + community/ 拉取腳本）佈建步驟齊備，cp 即用
- [ ] Prometheus 端加入對 sentinel `/metrics` 的 scrape job 說明（**僅供 Grafana 觀測**——直推中心定案，非告警輸入）

## 備註
- 文件需含「UI 為何綁 localhost／信任邊界在代理層」的安全說明（spec.md §2.5）
