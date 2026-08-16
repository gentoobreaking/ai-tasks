---
github_issue: null
title: auto_develop 拆分模組（scheduler/providers/diff）——消除 1925 行單一檔案
type: refactor
priority: high
status: done
depends_on:
- 50
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-11'
updated: '2026-08-17'
spec_version: v3
---
# T051 - auto_develop 拆分模組（scheduler/providers/diff）

## 目標
auto_develop.py 目前 1925 行、11+ 職責（Task 模型、prompt 建構、diff 套用/修剪、
測試執行、blocked review、git commit、4 種模型呼叫、排程器、CLI）——
前次 design-review §二.2 的 P1 建議一直未做。本任務不做行為改變，只做職責拆分
（T036 已事先移出 Task 模型與 frontmatter；T050 已先移出 git 操作）。

## 驗收標準
- [x] 拆分出至少：
  - providers.py：模型呼叫（call_model_for_implementation、impl_providers 鏈、failover 邏輯）
  - diff.py：diff 解析/套用/修剪（strip_markdown、apply 相關、hunk 統計）
  - scheduler.py：AutoDevelopScheduler 與 task 挑選（get_next_pending_task 等）核心迴圈
  - auto_develop.py 保留 CLI 入口（main/argparse）與薄轉發
- [x] 行為不變：​`run_pytest/ruff/pyright` 檢查鏈、T014 repair、T019 閘門、T023 blocked 流程與先前一致
- [x] `twin auto`、`twin blocked`、`--list` 輸出與先前一致（以 test_auto_develop_deps /
  test_blocked_review / test_impl_defaults / test_impl_providers 驗證）
- [x] pytest 全量維持 151 passed + 1 skipped；ruff 全過；pyright 不劣化

## 備註
- 只拆不重構：行為等價重排，禁止順帶改邏輯（改邏輯開新任務）
- 拆分後 auto_develop.py 目標 < 400 行
- 注意 import 循環：scheduler 吃 providers/diff/tasks，providers 不得 import scheduler
## 完成備註（2026-08-11）
- auto_develop.py 1796→190 行（<400 達標）；diff.py 452 / providers.py 326 / scheduler.py 919
- import 方向單向無循環：scheduler 吃 providers/diff/common.tasks；providers 吃 diff；
  providers/diff 不 import scheduler
- 測試 monkeypatch 目標隨模組歸位（PROJECT_PATHS/_provider_cache/IMPL_PROVIDER_YAML/
  _do_call_*/load_tasks → 所屬模組），語意不變
- 驗證：pytest 164 passed + 1 skipped（同 T050 基線）；ruff check/format 全過；
  pyright 12 errors（基線持平）；auto_develop --list/--blocked/--sync-readme 冒煙一致
- commit: cc40d81（refactor）