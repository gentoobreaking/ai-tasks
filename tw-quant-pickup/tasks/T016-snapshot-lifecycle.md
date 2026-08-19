---
github_issue: N/A
title: Snapshot Lifecycle（§70 / §45 / §45.1：create → freeze → hash → archive）
type: task
priority: P0
status: done
depends_on: [T002, T014]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-19
---

# T016 - Snapshot Lifecycle（§70 / §45 / §45.1：create → freeze → hash → archive）

## 目標

實作 `snapshot.py`：Daily Snapshot 生命週期（create / freeze / hash / archive，§45.1），snapshot_id 格式 `YYYYMMDD-HHMMSS-xxxx`，quant_result.json 落盤，analysis_snapshot 為版本唯一擁有者（§84 #1）。此為全系統「可重現」的錨點（§83 ①）。

## 驗收標準

- [x] snapshot_id 格式：`20260818-210000-a82f`（§53 meta 範例）
- [x] analysis_snapshot 記錄：model / parameter / data version、輸入資料 lineage 摘要、hash
- [x] FREEZE：資料源（universe / factor / valuation / ranking / alert）於 freeze 後不得變更；freeze 後計算結果以 snapshot_id 關聯、永遠不覆蓋（§45）
- [x] HASH：量化結果 hash 保證 bit-identical 重現；重建（重新跑同一 date）hash 必須一致（§45）
- [x] quant_result.json 每 snapshot 一份存檔（§53: /api/v1/snapshots/{date} 原樣回傳）
- [x] Archive / retention：歷史 snapshot 保留策略（§45.1），刪除需稽核紀錄
- [x] §70 Daily Snapshot 內容欄位（universe 數、排名、warnings）與 spec 一致
- [x] unit test：重跑同日 pipeline hash 一致；改任何輸入 → hash 改變

## 備註

- AI 只能讀 frozen snapshot（T017 依賴本任務的只讀介面）
- snapshot 是 search 與前端「當天為什麼排這樣」唯一溯源入口（§53.1 第 6 點）

## 完成摘要（2026-08-19）

- 新增 `snapshot/` 套件（`snapshot/lifecycle.py`）：
  - `create_snapshot_id`（`YYYYMMDD-HHMMSS-<hex6>`，§5.12）、
    `create_snapshot_draft`（CREATE 階段 PENDING 草稿列，供結果表 FK，
    §77.0 依賴圖）、`freeze_snapshot`（VALIDATE → content-sha256 →
    analysis_snapshot 升級 FROZEN → quant_result.json 落盤）
  - HASH 只覆蓋內容核心（排除 snapshot_id / hash 自身 + canonical_json
    確定性序列化）：重跑同日同內容 → 同 hash（§45 bit-identical）；
    改任何輸入 → hash 改變——unit test 全數覆蓋
  - 永不覆蓋（§45 / §84 #1）：FROZEN 且 hash 不符 → SnapshotConflictError；
    SnapshotStore 檔案同內容冪等、不同內容拒絕覆寫
  - `lineage_summary()`（PIT as-of 守門，§8.1）+ `derive_source_status()`
    作為「輸入資料 lineage 摘要」存入 quant_result.json
  - quant_result.json 含 §70 欄位：universe 數 / rankings（stock+ETF）/
    warnings / alerts；`load_quant_result` / `list_snapshots` 為 §53
    `/api/v1/snapshots/{date}` 與 /ranking/dates 的唯讀介面（T019）
  - ARCHIVE / retention（§45.1）：`config/snapshot.yaml` 保留策略
    （archive_after_days=90、delete_after_days=0 永不自動刪除）；
    `archive_snapshots` / `delete_snapshot` 與 snapshot_audit_log
    （migration 003）同 transaction——刪除不可能未留稽核紀錄
- 測試：`tests/unit/test_snapshot_lifecycle.py`（33，含重跑 hash 一致 /
  改輸入 hash 變 / 衝突拒絕 / store 冪等）+ `tests/integration/
  test_snapshot_e2e.py`（4，live-PG：FREEZE → 重跑 hash 一致 → 改輸入
  hash 變 → archive+delete 稽核、lineage query）；完整套件 598 passed