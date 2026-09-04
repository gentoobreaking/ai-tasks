---
github_issue: ""
title: Official Data Downloader
type: task
priority: high
status: done
depends_on:
  - T003
assignee: "pi with opencode"
created: 2026-09-03
updated: 2026-09-03
---

# T004 - Official Data Downloader

## 目標
實作官方實價登錄資料下載器，包含 checksum 驗證、原始檔案歸檔、snapshot 建立流程。

## 驗收標準
- [x] 實作 Downloader (支援內政部實價登錄批次下載)
- [x] 實作 SHA256 checksum 計算與驗證
- [x] 實作 Raw Archive 存儲結構 (raw/source_snapshot/{manifest,original_file,checksum,downloaded_at,source_metadata})
- [x] 實作 Snapshot 建立流程 (download → sha256 → store raw → create snapshot)
- [x] 同一來源、同一 checksum 必須產生同一 snapshot (冪等性)
- [x] 錯誤處理：下載失敗、checksum 不符、網路錯誤
- [x] 單元測試與整合測試

## 備註
- 官方資料包含：MANIFEST.CSV, schema-main.csv, schema-build.csv, schema-land.csv 等
- 資料週期性發布，系統必須把每次下載視為一個 immutable snapshot
- 遵循 P2 Raw Data Immutable 原則：原始下載檔不得修改