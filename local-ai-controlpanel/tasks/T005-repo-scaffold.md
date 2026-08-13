---
github_issue: N/A
title: Repo scaffold（Phase 1）：monorepo 結構 + Control Plane 骨架
type: chore
priority: high
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: 2026-08-13

commit: 9f4f1f2
---

# T005 - Repo scaffold（Phase 1）

## 目標

依 spec §7 Repository Layout：在 `~/Projects/local-ai-controlpanel` 建立 monorepo 基礎——`apps/control-plane`（Fastify + Zod）、`apps/cli`、`packages/*`、`policies/`、`schemas/`、`sandbox-profiles/`、`tests/{unit,integration,e2e}`；root `pnpm-workspace.yaml` + `package.json`，TypeScript strict 設定。

> 桌面 UI（T001–T004）目前已為專案 root（spec §7 實際路徑決策）；Control Plane 以 `apps/control-plane` 加入同一 repo。

## 驗收標準

- [x] 目錄結構符合 §7（apps / packages / policies / schemas / sandbox-profiles / tests / benchmark）
- [x] `pnpm install` 在 root 成功（含 workspace 連結）
- [x] `apps/control-plane` 能啟動 Fastify 於 `127.0.0.1:3001` 回 health check
- [x] root `tsc --noEmit` 全 repo 通過（strict: true）
- [x] `policies/default.yaml` 等預設 policy 檔建立（§10 schema 範例）

## 備註

- 沿用現有版本管理（git init 於專案 root，含 .gitignore）。
- SQLite driver 選擇（node:sqlite 內建 vs better-sqlite3）於 T006 決定，scaffold 不綁死。
- Phase 1–5 硬性禁止 Cloud（§24）：`execution.allow_cloud: false` 的型別/設定預留。