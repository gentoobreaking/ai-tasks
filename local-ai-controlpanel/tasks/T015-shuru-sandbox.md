---
github_issue: N/A
title: Shuru（MicroVM）adapter（Phase 2，2e）— high-risk 可選
type: feature
priority: medium
status: done
depends_on:
- T012
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: '2026-08-17'
spec_version: v3
---
# T015 - Shuru（MicroVM）adapter

## 目標

依 spec §21.1 / §21.2：實作 Shuru adapter（SuperHQ MicroVM / Virtualization.framework 後端，high-risk 任務用）。**Phase 2 只要求 interface 對接（§38 Phase 2 硬性要求）**，不需預載全部映像；快照加速（snapshot: true）等設定依 §30。

## 驗收標準

- [x] registry 註冊 `shuru` + `isAvailable()` 實作（偵測 shuru CLI）
- [x] `run(context)` 對接 shuru 參數（image shuru/alpine:3.20、memory 512MiB、cpus 1、network false、snapshot，§30）
- [x] 文件記錄 high-risk 啟用條件（README §44 Q6：`risk == high` 啟用 Shuru）
- [x] selectSandbox step 3（high risk → shuru）路徑測試（shuru 不存在時正確 fallback）

## 備註

- §21.3 的 L/M sandbox 對照組為 Phase 11（次要），此任務只做 adapter 對接。
- 啟動時間 ~2-3s / 記憆體 200-500MB 的開銷數據留待實機驗證。
- HOME 重導 workspace（MicroVM 內 HOME 指工作目錄）。
- 實作 commit：`c57e24f`（README `f46761f`）。