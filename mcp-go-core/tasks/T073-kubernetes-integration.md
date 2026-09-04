---
github_issue: N/A
title: P2 - Kubernetes Integration Module (Deferred - External Condition)
type: feat
priority: medium
status: done
updated: 2026-09-04
depends_on: []
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04

---

> ⛔ 本任務受外部條件約束：blocked_on 全數滿足前不得開工。  
> 排程器挑到時應先逐項驗條件，未滿足則跳過並記錄原因。

# T073 - P2: Kubernetes Integration Module

## 目標

建立 `integration-kubernetes/` module，提供 K8s deployment manifest generation。

對應 feature_graph_spec F25, architecture §56 Kubernetes Integration, §66 Non-Goals, agent_tasks TASK-034。

## 驗收標準

- [x] K8s integration is an optional module: `integration-kubernetes`
- [x] `k8s.NewClient(...)` API 提供
- [x] `mcp-go-core init --platform=kubernetes` can generate deploy/ manifests
- [x] Generated manifests: deployment.yaml, service.yaml, serviceaccount.yaml, networkpolicy.yaml
- [x] K8s client libraries must NOT enter MCP binary merely because manifests are generated
- [x] `go test ./modules/integration/kubernetes/...` 成功

## 備註

Kubernetes support should NOT be part of Core。K8s integration is deferred for v0.1. K8s client libs must not enter minimal binary.

## 執行紀錄 (2026-09-04 稽核)
- 已達成 6 項並打勾。
- **未竟事項**: 無
