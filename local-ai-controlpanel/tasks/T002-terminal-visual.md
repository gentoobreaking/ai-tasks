---
github_issue: N/A
title: Terminal 視覺基底（UI-2）：暗色主題 + monospace + layout
type: feature
priority: high
status: done
depends_on: [T001]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: 2026-08-13
---

# T002 - Terminal 視覺基底（UI-2）

## 目標

依 spec §45.1 / §45.4（UI-2）：opencode 風格終端視覺——暗色主題（背景 `#0d1117` 等級、前景 `#c9d1d9`、Accent `#3fb950`）、全部 `font-mono`、布局為 TopBar / 左側 TaskList / 主區域 TaskStream / 底部 InputBar。

## 驗收標準

- [x] 暗色 terminal 主題（`src/styles/terminal.css`）含狀態彩色 badge
- [x] 四區布局（TopBar / TaskList / TaskStream / InputBar）完成
- [x] `font-mono` 全介面套用
- [x] 可摺疊/自動滾動的串流主區域基礎

## 備註

- spec §45.2 表列 Tailwind CSS，目前以手寫 CSS（terminal.css）實作，視覺規範一致（§45.4）；若後續需要可按 T022+ 的 UI 增長再評估是否引入 Tailwind。
