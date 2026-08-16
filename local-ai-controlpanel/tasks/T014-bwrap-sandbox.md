---
github_issue: N/A
title: bwrap（bubblewrap）adapter（Phase 2，2b）— Linux 預設
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
# T014 - bwrap（bubblewrap）adapter

## 目標

依 spec §21.2：實作 bwrap adapter（Linux 預設），命令模板：`--ro-bind` 系統目錄、workspace `/tmp` 可寫 bind、`--unshare-net/ipc/pid`、`--cap-drop ALL --die-with-parent`；<10ms 啟動、~0MB 開銷（§21.2 表）。

## 驗收標準

- [x] 命令模板依 §21.2 範例實作（含 ro-bind /usr /lib /bin /opt/homebrew、bind workspace+/tmp、unshare-net/ipc/pid/user、cap-drop ALL、die-with-parent）
- [x] `isAvailable()` 正確偵測（Linux 上偵測 bwrap；macOS 一律 false）
- [x] sandbox 內可跑 pytest / go test / npm test 等 verifier（Linux-only 整合測試）
- [x] 隔離 fail 測試：sandbox 內無網路（unshare-net）
- [x] 此 adapter 在 macOS 上 isAvailable 須回 false（不誤用）

## 備註

- 目前唯一開發機是 macOS（M2），bwrap 主要在 Linux / CI（或 Phase 11+ Kubernetes）上驗證；macOS 上以「isAvailable=false 路徑正確」為驗收下限。
- 增加 `--unshare-user`（unprivileged 執行）與 `--proc /proc --dev /dev`；系統目錄僅 bind 宿主存在者。
- HOME 重導 workspace（npm 等工具需寫 $HOME/.npm）。
- 實作 commit：`15c85cb`（README `90990b5`）。