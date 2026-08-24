---
github_issue: N/A
title: 範本庫擴充——k8s／EC2／EBS／SLB 負載平衡器資源範本
type: feat
priority: medium
status: in-progress
depends_on:
- T034-slo-defs-common-templates
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-26
updated: 2026-08-26

---

# T035 - 範本庫擴充：k8s／雲端資源（EC2/EBS/SLB）

## 背景
T034 只交付了應用服務級的 SLO 範本。基礎設施資源——k8s 叢集內的
PVC/Pod/節點容量、EC2/EBS、負載平衡器（SLB/ALB/NLB）——是使用者最先想
監控的對象，但指標來源分散在 kube-state-metrics／kubelet／yace
（cloudwatch-exporter）等多個 exporter，需要現成範本降低門檻。

## 目標
新增 `TEMPLATE.k8s-cloud.yaml.example` 範本庫（不會被 loader 載入，
啟用方式同 T034），涵蓋：

| 區塊 | 家族 | 指標來源 |
|---|---|---|
| K8s PVC 容量 | capacity | kubelet_volume_stats_* |
| K8s 叢集 Pod 容量 | capacity | kubelet_running_pods / kube_node_status_allocatable |
| K8s Deployment 可用副本 | slo | kube_deployment_status_replicas_available |
| K8s 節點 NotReady | slo | kube_node_status_condition |
| EC2 CPU 飽和度 | capacity | aws_ec2_cpuutilization_average（yace） |
| EBS Burst Balance | capacity | aws_ebs_burst_balance_average（yace） |
| ASG 執行個體數 vs 上限 | capacity | aws_autoscaling_group_in_service_instances（yace） |
| ALB 5xx 可用性 | slo | aws_alb_http_code_target_5_xx / request_count（yace） |
| ALB/NLB 活動連線數 | capacity | aws_alb_active_connection_count_average |

## 實作要點
1. 每區塊標注所需 exporter（kube-state-metrics / kubelet / yace）
   與安裝前提；dev 環境無這些 exporter，故維持 .example 不載入
2. capacity 型與 slo 型並陳，展示同一資源兩種家族的寫法差異
3. 阿里雲使用者註記：可透過阿里雲 CloudMonitor 對應指標替換 yace 系列
4. thresholds 覆寫示例至少出現一次（沿用 T023/T034 格式）

## 驗收標準
- [x] 範本檔含上表九個區塊，每塊附 exporter 依賴與調整指引註記
- [x] Load 測試釘死 .example 不被載入（沿用 T034 測試，fixture 加新檔名）
- [x] YAML 語法本身合法（去註解後可被 yaml.Unmarshal 解析——以測試驗證）
- [x] 既有測試全數通過

## 備註
- 指標名稱以 yace（yet-another-cloudwatch-exporter）社群慣例為準；
  不同 exporter 版本可能差異，使用時以自身環境實際序列為準
