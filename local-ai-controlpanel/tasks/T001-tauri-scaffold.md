---
github_issue: N/A
title: Tauri scaffold（UI-1）：Tauri v2 + 薄 Rust commands + capabilities whitelist
type: feature
priority: high
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: 2026-08-13
---

# T001 - Tauri scaffold（UI-1）

## 目標

依 spec §45.2 / §45.3 / §45.6（UI-1）：建立 Tauri v2 Desktop App scaffold（React + TypeScript + Vite），Rust 側只有三個薄 commands（window / copy / open-external-link），capabilities whitelist 只開本機 HTTP、clipboard、window——**WebView 不得直接存取 filesystem / shell / secrets**。

## 驗收標準

- [x] Tauri v2 + React + TypeScript scaffold 完成（`pnpm tauri dev` 可跑）
- [x] Rust 薄 commands 實作：`open_external`（僅 http/https scheme，經 `tauri-plugin-opener`）
- [x] capabilities whitelist：只有 opener open-url（https/http scope）、core default；無 filesystem/shell/secrets
- [x] `pnpm tauri build` 通過（tsc + vite + Rust release compile 零錯誤零警告）

## 備註

- `tauri-plugin-shell::open` 在 2.3.x 已棄用，改用 `tauri-plugin-opener`（2026-08-13 已遷移）。
- 程式碼位於 `~/Projects/local-ai-controlpanel`（spec §7 實際路徑決策：apps/desktop 內容即專案 root）。
- Bundle 驗證：`Agent Control Plane.app` + `.dmg` 產出成功，啟動驗證通過（§45.6 UI-6 的自動 spawn 部分另見 T026）。
