---
github_issue: ""
title: 監控器 CLI 進入點與排程器接線
type: bugfix
priority: low
status: done
depends_on:
  - T002
  - T003
  - T009
  - T016
assignee: "pi with opencode"
created: 2026-08-30
updated: 2026-08-30
---

## 目標

**已取消**：稽核發現的「缺少 __main__ 進入點」「排程器指向錯誤模組入口」均為誤判。

實際情況：
- `src/gold_local_monitor.py` 第 695 行已有 `if __name__ == "__main__": main()` 並支援 `--check` 參數
- `src/gold_intl_monitor.py` 第 545 行已有 `if __name__ == "__main__": main()` 並支援 `--check` 參數
- `scripts/install_scheduler.sh` 生成的 plist 已正確使用直接腳本路徑 `python3 $PROJECT_DIR/src/gold_local_monitor.py --check`
- Makefile `check-local`、`check-intl` 目標亦直接呼叫腳本檔

**真正缺口**：缺少從真實 CLI 入口啟動、走完完整鏈路並斷言副作用的 e2e 測試。此需求已併入 T021（擴充為涵蓋所有三個入口）。

## 驗收標準
- [ ] **已取消** - 無需執行

## 執行紀錄
- 2025-08-07 稽核發現原判定錯誤，CLI 入口與排程器接線均已正確
- 入口級 e2e 測試需求轉移至 T021