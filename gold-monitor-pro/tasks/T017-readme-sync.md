---
github_issue: ""
title: README 同步到現狀
type: docs
priority: medium
status: done
depends_on:
  - T015
  - T016
  - T018
  - T019
assignee: "pi with opencode"
created: 2026-08-28
updated: 2026-08-30
---

## 目標
將 README.md 修正為與程式碼完全一致：配置檔路徑、通知通道、Makefile、serve 模式、History API、儀表板與排程，消除過時資訊（如 `~/.qclaw/`、只有 Telegram、無 Makefile）。

## 驗收標準

- [x] 全文不再出現 `~/.qclaw/`；統一為 `~/.gold_monitor_pro_config.json`
- [x] 配置章節涵蓋 telegram / discord / email 三個通道，欄位與 `config.example.json` 一致
- [x] 新增「指令一覽（Makefile）」章節，列出的 target 皆經 `make <target>` 實測存在
- [x] 新增「即時儀表板」章節（對應 T015）與「自動排程」章節（對應 T016）
- [x] 架構圖補上 `history_api.py` 與儀表板；資料流說明與實作一致
- [x] 每條出現在 README 的命令都實際執行過且結果符合描述（不臆造）

## 執行紀錄
- README.md 全文更新完成
- 所有 make target 實測通過