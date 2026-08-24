---
github_issue: N/A
title: cluster 感知收集器——多叢集 Prometheus 端點分流
type: feat
priority: medium
status: done
depends_on:
- T003
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-26
updated: 2026-08-26
---

# T022 - cluster 感知收集器（多叢集 Prometheus 端點分流）

## 背景
slo-sentinel T020（容量預警接分診閉環）的標籤慣例盤點發現：gate 的四路
collector 只認 `service` label，alert 帶 `cluster` 也只是躺在報告裡的字串。
多叢集部署下（每個 cluster 各有自己的 Prometheus），gate 需要依警報的
cluster label 把指標/擴縮容查詢導向正確的端點，分診 context 才不會抓錯現場。

## 目標
prometheus 與 scaling 兩路 collector 支援依 `labels["cluster"]` 選擇
Prometheus 端點；未帶 cluster 或查無此叢集時退回既有預設端點（單叢集
部署行為完全不變）。

## 實作要點
1. config 新增 `PROMETHEUS_CLUSTERS` 環境變數：格式 `name=url[,name=url…]`
   （如 `aws-prod=http://prom-aws:9090,gcp-prod=http://prom-gcp:9090`）；
   現有 `PROMETHEUS_URL` 維持為預設/fallback 端點
2. `collect.PrometheusClient` / `collect.ScalingClient` 新增
   `ClusterURLs map[string]string`；Collect 時以共用的
   `promEndpoint()` helper 解析實際端點
3. ingest 對 labels 是全量透傳——sentinel 帶什麼 cluster 就收什麼，
   本任務不需要動 ingest/proto
4. 文件同步：docs/deploy.md 環境變數表補 PROMETHEUS_CLUSTERS

## 驗收標準
- [x] PROMETHEUS_CLUSTERS 解析測試（含空值、壞格式容錯）
- [x] alert 帶已知 cluster → 查詢打到對應端點；未知 cluster／無 cluster → 打到預設端點（單元測試以 httptest 雙伺服器驗證）
- [x] scaling 收集器同樣分流（replicas 軌跡查詢打到對應端點）
- [x] 不設 PROMETHEUS_CLUSTERS 時全部行為與現狀一致（回歸測試）
- [x] docs/deploy.md 同步

## 備註
- ingest 層 labels 全量透傳已存在（normalizeOne 直接 `Labels: a.Labels`），
  故本任務範圍僅 collect 層＋config
- slo-sentinel 端將在 T020 以選配欄位攜帶 cluster label（全域環境變數 +
  per-def 覆寫）
