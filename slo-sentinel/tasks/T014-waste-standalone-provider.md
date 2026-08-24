---
github_issue: N/A
title: Standalone server provider（S1–S3 感測）
type: feat
priority: low
status: done
depends_on:
- T012
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T014 - Standalone server provider（S1–S3 感測）

## 目標
`waste/providers/standalone`：以 node_exporter 指標 + conntrack/audit 實現 §E.7——
S1 殭屍主機（P95 CPU<10% 且 mem<30% 且零外部連線 14d）、S2 幽靈服務（監聽埠 14 天零外部連線）、
S3 磁碟孤兒（30d 無成長無寫入）。

## 驗收標準
- [x] 三類判定各有表驅動測試（fake node_exporter 序列）
- [x] 「對外活躍連線」的判定窗口與資料源明確文件化
- [x] 目錄條目 onprem.server.zombie 可被載入並路由到本 provider

## 備註
- conntrack/log 來源環境差異大，provider 允許停用 S2（設定旗標）

## 執行紀錄（2026-08-24 稽核）
- 已達成 3 項並打勾。
- **未竟事項**：S2 允許停用之設定旗標未實作（provider 層級可透過目錄 enabled:false 達成）

