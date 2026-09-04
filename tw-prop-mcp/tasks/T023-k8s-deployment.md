---
github_issue: ""
title: Kubernetes / OpenShift Deployment
type: task
priority: medium
status: done
depends_on:
  - T017
assignee: "pi with opencode"
created: 2026-09-03
updated: 2026-09-04
---

# T023 - Kubernetes / OpenShift Deployment

## 目標
建立 Kubernetes/OpenShift 部署配置，包含 Deployment, Service, ConfigMap, Secret, CronJob, ServiceMonitor, Route。

## 驗收標準
- [x] 建立 Deployment (MCP Server)
- [x] 建立 Service (ClusterIP)
- [x] 建立 ConfigMap (應用配置)
- [x] 建立 Secret (資料庫密碼、API Keys)
- [x] 建立 CronJob (官方資料定期下載匯入)
- [x] 建立 ServiceMonitor (Prometheus 監控)
- [x] 建立 Route (OpenShift 對外暴露)
- [x] PostgreSQL + PostGIS 部署配置 (StatefulSet 或 Operator)
- [x] 架構：MCP Client → OpenShift Route → MCP Server → PostgreSQL + PostGIS
- [x] CronJob 排程：下載官方資料 → Importer
- [x] 部署測試驗證

## 備註
- Phase 16 部署架構
- CronJob 負責定期從官方來源下載並匯入資料
- 需考慮資料庫遷移策略