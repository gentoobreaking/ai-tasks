---
github_issue: N/A
title: dev profile 基本容量感測範本集——memory/cpu/disk io/network/processes
type: feat
priority: medium
status: done
depends_on:
- T028-defs-hot-reload
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-26
updated: 2026-08-26

---

# T033 - 基本容量感測範本集（node_exporter 全家餐）

## 背景
node-exporter 暴露 ~310 個指標家族，但 dev 環境目前只有一顆磁碟用量感測
（node-disk.yaml）——範例只示範了「怎麼寫」，沒有提供常見資源的基本範本。
使用者每次都要自己從零寫。

## 目標
`capacity_defs/` 新增五個基本感測定義檔（宣告式：任何 PromQL 皆可成為感測），
搭配既有 node-disk.yaml 構成基本範本集。全部走同一顆 ETA 引擎與門檻機制。

## 範本清單

| 檔案 | 感測 id | value | ceiling |
|---|---|---|---|
| memory.yaml | dev-mem-used | `node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes` | `node_memory_MemTotal_bytes` |
| cpu.yaml | dev-cpu-busy | `1 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m]))` | `vector(1)` |
| diskio.yaml | dev-disk-io-busy | `avg(rate(node_disk_io_time_seconds_total[5m]))` | `vector(1)` |
| network.yaml | dev-net-throughput | `sum(rate(node_network_{receive,transmit}_bytes_total{device!~"lo\|veth.*"}[5m]))` | `sum(node_network_speed_bytes{...})*8` |
| processes.yaml | dev-process-count | `node_procs_running` | `vector(300)`（註明依主機調整） |

## 實作要點
1. 每檔頭部註記：需要 node_exporter 資料；Prometheus 無此序列時輪詢記錯誤
   日誌但不影響其他感測（best-effort 既有行為）
2. network 的 ceiling 依網卡 speed——VM/雲端常缺 `speed` 序列，註明替代做法
   （改固定頻寬 vector）
3. processes 的天花板是人工配額語意，註明「依主機定位調整」
4. 波動型資源（memory/cpu/io）說明：ETA 引擎對斜率≈0 自動判定無成長，
   解除遲滯（連續 2 輪）防抖動

## 驗收標準
- [x] LoadDefs 成功解析後容量感測數 ≥ 6（含既有 dev-root-disk）；id 無重複
- [x] 六顆感測在 dev compose 環境輪詢成功（/api/status.json 可見且非 error）
- [x] 其中至少一顆能以合成資料驗證 warning/critical 觸發路徑與人話卡一致（dev-root-disk 於 T020 端到端演練已實證，見 docs/e2e-triage-drill-report.md）
- [x] 各檔頭部含 node_exporter 依賴與調整指引註記

## 備註
- 範本即文件——每個檔案的 expr 就是教學；更進階的請看社群規則庫同步
