---
github_issue: N/A
title: slo_defs 常用範本——基礎設施存活率＋HTTP/gRPC 服務 SLO 範本庫
type: feat
priority: medium
status: in-progress
depends_on:
- T023-slo-thresholds
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-26
updated: 2026-08-26

---

# T034 - slo_defs 常用 SLO 範本

## 背景
capacity_defs 已有六顆基本範本（T033），但 slo_defs 只有單一示例
（node-exporter-up）。SLO 是 sentinel 對服務擁有者最有感的家族——
需要「抄了就能用」的起點。

## 目標
兩層交付：
1. **可直接運行的基礎設施存活率 SLO**（dev 環境現有資料即可驅動）
2. **服務級 SLO 範本庫**（HTTP 可用性／延遲／gRPC，以註解形式提供，
   使用者複製後換上自己的 service 名）

## 實作要點
1. 新增 `slo_defs/infra-slos.yaml`（可運行）：
   - `infra-prometheus-self-up`：`1 - avg(up{job="prometheus-self"})`
     objective 99.9——監控 Prometheus 自身的抓取存活
2. 新增 `slo_defs/TEMPLATE.http-service.yaml.example`（不會被載入）：
   - 可用性：`sum(rate(http_requests_total{service="…",code!~"5.."}[5m]))
     / sum(rate(http_requests_total{service="…"}[5m]))`，objective 99.9
   - 延遲：`histogram_quantile(0.99, …)` 型 p99 錯誤比，objective 99
   - 每個範本附 thresholds 示例（T023 的四欄覆寫）
   - 註明 label 慣例對齊 ai-oncall collector（`service` label）
3. loader 的副檔名過濾（僅 .yaml/.yml）保證 .example 不被載入——加測試釘死此行為
4. README 或檔案頭部說明「啟用方式：改名去掉 .example、換 service 名」

## 驗收標準
- [x] Load 解析後 SLO 數 = 既有 1 + 新增 1（infra-prometheus-self-up）；.example 未被載入（測試釘死）
- [x] infra-prometheus-self-up 在 dev compose 輪詢成功且狀態可於 /api/status.json 查看
- [x] TEMPLATE.http-service.yaml.example 內含可用性＋延遲兩種範本與 thresholds 覆寫示例
- [x] 既有測試全數通過

## 備註
- HTTP 範本的 metric 慣例刻意對齊 ai-oncall gate collector
  （http_requests_total{service=…}）——同一套 label 同時餵分診 context
- 不做「SLO 從 Sloth rules 自動生成」——那是 rules.d 家族的既有路徑
