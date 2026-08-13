---
github_issue: N/A
title: UI-6：打包 + Control Plane 自動啟動/附著（§45.6）
type: feature
priority: medium
status: pending
depends_on: [T008, T025]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: 2026-08-13
---

# T026 - UI-6：打包 + Control Plane 自動啟動/附著

## 目標

依 spec §45.6（UI-6）：.app/.dmg 打包（基線已通過，2026-08-13 v0.5.0 驗證完成）+ **Control Plane 自動啟動/附著**——app 啟動時 spawn Fastify server（或偵測 127.0.0.1:3001 已存在則附著）；斷線時顯示重連狀態。

## 驗收標準

- [ ] app 啟動：若 Control Plane 未執行 → spawn；已執行 → 附著
- [ ] 斷線顯示（SSE onerror 既有機制）＋ 重連成功恢復
- [ ] `pnpm tauri build` 產出 .app + .dmg 成功（含新功能後重新驗證）
- [ ] 打包後 app 在無 dev 環境下可獨立運作（含 spawn 的 Control Plane）

## 備註

- spawn 的 Control Plane 為本 repo `apps/control-plane` 產物（T005+），路徑與環境變數設定化。
- 打包基線：`Agent Control Plane.app`（9.6M, arm64）+ `Agent Control Plane_0.5.0_aarch64.dmg`（2.6M），spctl 警告為未公證本地 build 的正常現象。