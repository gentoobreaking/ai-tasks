---
github_issue: N/A
title: UI-5：sandbox 整合顯示 + approve 流程（§45.6）
type: feature
priority: medium
status: done
depends_on: [T008, T016]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: 2026-08-15
---

# T025 - UI-5：sandbox 整合顯示 + approve 流程

## 目標

依 spec §45.4 / §45.6（UI-5）：TopBar 顯示 sandbox mode badge（bwrap / seatbelt / shuru）；`GET /api/v1/sandbox` 的 sandbox check 畫面；approve 流程（artifact / degraded override / escalation，§45.5 `POST /:id/approve`）；verification 事件顯示 sandbox 欄位（§45.5 schema 已有）。

## 驗收標準

- [x] TopBar sandbox mode badge（來自 task 的 sandboxMode）
- [x] `sandbox check` 指令顯示各後端可用狀態（配合 T016）
- [x] approve dialog：BLOCK/ASK_USER/覆寫時跳出，送出後呼叫 approve API
- [x] verification 事件 render 含 sandbox 名稱（§45.5）
- [x] 指令面板補齊 `sandbox-check` 實作（T004 僅 UI 骨架）

## 備註

- 依 §45.3 安全規則：UI 顯示的一切 sandbox 資訊來自 Control Plane API，UI 無判斷權。
- `/` 指令前綴與方向鍵歷史（§45.4）可在本任務一併補上。