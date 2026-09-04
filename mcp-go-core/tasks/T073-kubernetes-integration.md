---
github_issue: N/A
title: P2 - Kubernetes Integration Module (Deferred - External Condition)
type: feat
priority: low
status: pending
depends_on: []
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
blocked_on:
- "Kubernetes client libraries must not enter minimal MCP binaries"
---

> ⛔ 本任務受外部條件約束：blocked_on 全數滿足前不得開工。  
> 排程器挑到時應先逐項驗條件，未滿足則跳過並記錄原因。

# T073 - P2: Kubernetes Integration Module

## 目標

建立 `integration-kubernetes/` module，提供 K8s deployment manifest generation。

對應 feature_graph_spec F25, architecture §56 Kubernetes Integration, §66 Non-Goals, agent_tasks TASK-034。

## 驗收標準

- [ ] K8s integration is an optional module: `integration-kubernetes`
- [ ] `k8s.NewClient(...)` API 提供
- [ ] `mcp-go-core init --platform=kubernetes` can generate deploy/ manifests
- [ ] Generated manifests: deployment.yaml, service.yaml, serviceaccount.yaml, networkpolicy.yaml
- [ ] K8s client libraries must NOT enter MCP binary merely because manifests are generated
- [ ] `go test ./modules/integration/kubernetes/...` 成功

## 備註

Kubernetes support should NOT be part of Core。K8s integration is deferred for v0.1. K8s client libs must not enter minimal binary.
