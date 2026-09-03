---
github_issue: ""
title: Kubernetes / OpenShift Deployment
type: task
priority: medium
status: pending
depends_on: ["T017"]
assignee: pi
created: 2026-09-03
updated: 2026-09-03
---

# T023 - Kubernetes / OpenShift Deployment

## 目標
建立 Kubernetes/OpenShift 部署配置，包含 Deployment, Service, ConfigMap, Secret, CronJob, ServiceMonitor, Route。

## 驗收標準
- [ ] 建立 Deployment (MCP Server)
- [ ] 建立 Service (ClusterIP)
- [ ] 建立 ConfigMap (應用配置)
- [ ] 建立 Secret (資料庫密碼、API Keys)
- [ ] 建立 CronJob (官方資料定期下載匯入)
- [ ] 建立 ServiceMonitor (Prometheus 監控)
- [ ] 建立 Route (OpenShift 對外暴露)
- [ ] PostgreSQL + PostGIS 部署配置 (StatefulSet 或 Operator)
- [ ] 架構：MCP Client → OpenShift Route → MCP Server → PostgreSQL + PostGIS
- [ ] CronJob 排程：下載官方資料 → Importer
- [ ] 部署測試驗證

## 備註
- Phase 16 部署架構
- CronJob 負責定期從官方來源下載並匯入資料
- 需考慮資料庫遷移策略