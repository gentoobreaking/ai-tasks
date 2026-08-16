---
title: auto_develop 完成後輸出 PR 摘要 + 大 diff 人工確認閘門
type: feature
priority: medium
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-05
updated: '2026-08-17'
summary: PR 摘要 logs/pr-T0XX.md + confirm-threshold 閘門 + --no-confirm，10 tests 通過
spec_version: v3
---
# T019 - auto_develop 完成後輸出 PR 摘要 + 大 diff 人工確認閘門

## 目標
目前 `auto_develop.py` 完成任務後直接 `git commit`，無任何人工檢視機會（human-in-the-loop 缺失）。加入：
1. commit 前產生 PR 風格摘要（改動檔案清單 + 各檔案行數增減 + 一句話說明）
2. diff 規模超過閾值（如新增/修改 > 500 行）時，暫停等待人工確認才 commit（互動模式）；非互動/背景執行時改為不 commit、產出 `pr-summary-T0XX.md` 待人工檢視

## 驗收標準
- [x] commit 前自動產出 PR 摘要（存 `code_dir/logs/pr-T0XX.md`）— `save_pr_summary()`/`build_pr_summary()`
- [x] diff 行數超過 `--confirm-threshold`（預設 500）時：互動模式暫停詢問 y/N；`--once`/背景模式自動跳過 commit 並提示 — `check_commit_gate()`
- [x] 摘要包含：變更檔案清單、每檔 +/- 行數、主要改動說明
- [x] 閘門可被 `--no-confirm` 參數關閉（預設開啟）
- [x] 不影響 T012 閘門分層的正常通過路徑（diff 小時行為不變，測試覆蓋）

## 備註
- 與 T014（修復迴圈）互動：修復成功後同樣要過此閘門
- 摘要格式參考 GitHub PR 描述慣例，方便直接貼到 PR
- logs/ 與 .env 等檔案排除計入 diff 規模（`_should_exclude`）