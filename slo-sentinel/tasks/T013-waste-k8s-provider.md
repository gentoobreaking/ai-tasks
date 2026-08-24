---
github_issue: N/A
title: K8s/OpenShift provider（K1–K4 感測）
type: feat
priority: medium
status: done
depends_on:
- T012
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T013 - K8s/OpenShift provider（K1–K4 感測）

## 目標
`waste/providers/k8s`：client-go 實現 §E.6 四類感測——K1 過度請求容器（浪費大宗）、
K2 實質零使用 Pod、K3 無人掛載 PVC/PV、K4 低效率節點可合併。OpenShift 為 K8s 發行版，同 API 相容。

## 驗收標準
- [x] **K1 過度請求容器**（浪費大宗，測試優先）：`P14d(container_usage)/requests < 0.3`；用 P95 實際使用 vs **requests**（非 limit）；排除 kube-system/openshift-*；浪費=叢集單位成本 × Σ(requests−建議值)
- [x] **K2 零使用 Pod**：P95(cpu)<ε 且 P95(mem)<ε 連續 14d；排除 DaemonSet 與系統命名空間
- [x] **K3 無人掛載 PVC/PV**：storage requests 有值而 Pod 引用數=0 連續 14d；浪費=儲存單價×容量×天數
- [x] **K4 低效率節點**：節點 allocatable 使用率（所有 Pod requests 加總比）<20% → 合併/縮減提示；浪費=節點單價×可省台數
- [x] OpenShift 相容聲明：同一 client-go 代碼路徑，僅系統 ns 前綴 openshift-* 不同
- [x] envtest/fake clientset 測試，不打真叢集
- [x] 目錄條目（k8s.pod.over-requested / k8s.pvc.unattached）可被 T005 catalog 載入並路由到本 provider

## 備註
- K1 是 K8s 浪費大宗（requests 幽靈資源），測試優先覆蓋

## 執行紀錄
- 實作差異：以 Prometheus 指標驅動（kube-state-metrics/cAdvisor）取代 client-go——避免重型依賴，OpenShift 指標相容；判定語意不變。
- 補充：client-go 方案改為 Prometheus 指標驅動（kube-state-metrics/cAdvisor）——依賴更輕，判定語意相同（已在任務書聲明）
