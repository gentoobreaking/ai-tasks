---
github_issue: N/A
title: Shuru（MicroVM）adapter（Phase 2，2e）— high-risk 可選
type: feature
priority: medium
status: pending
depends_on: [T012]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: 2026-08-13
---

# T015 - Shuru（MicroVM）adapter

## 目標

依 spec §21.1 / §21.2：實作 Shuru adapter（SuperHQ MicroVM / Virtualization.framework 後端，high-risk 任務用）。**Phase 2 只要求 interface 對接（§38 Phase 2 硬性要求）**，不需預載全部映像；快照加速（snapshot: true）等設定依 §30。

## 驗收標準

- [ ] registry 註冊 `shuru` + `isAvailable()` 實作（偵測 shuru CLI）
- [ ] `run(context)` 對接 shuru 參數（image alpine、memory 512MiB、cpus 1、network false，§30 sandbox.shuru）
- [ ] 文件記錄 high-risk 啟用條件（§44 Q6：`risk == high` 的操作型定義建議，Phase 5 前補）
- [ ] selectSandbox step 3（high risk → shuru）路徑測試（shuru 不存在時正確 fallback）

## 備註

- §21.3 的 L/M sandbox 對照組為 Phase 11（次要），此任務只做 adapter 對接。
- 啟動時間 ~2-3s / 記憶體 200-500MB 的開銷數據留待實機驗證。