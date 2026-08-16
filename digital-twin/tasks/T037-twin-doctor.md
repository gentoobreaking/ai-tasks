---
github_issue: null
title: twin doctor 全端自檢命令
type: feature
priority: high
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-09'
updated: '2026-08-17'
spec_version: v3
---
# T037 - `./twin doctor` 全端自檢

## 目標
設計審查（docs/design-review.md 四.2）：目前環境異常分散在各命令出錯時才暴露。
新增一鍵自檢，讓「為什麼跑不動」能一次查完。

## 驗收標準
- [x] 新增（可在 twin 內或獨立 `doctor.py`）`./twin doctor`：依序檢查並色碼輸出
  - Git：專案目錄存在 / .git 存在 / 工作目錄乾淨（有未 commit 變更警告）
  - Python：`pytest`/`ruff`/`pyright`/`opencode` 指令可用（:white_check_mark:/:x:）
  - 環境：必須的 env Key（OPENROUTER_API_KEY 等）是否設定（依 config.MODELS api_env 掃）
  - Redis/Worker：`./twin bot status` 的 redis 連線與 worker 進程
  - LanceDB：`.lancedb/` 存在與段落數（若有 embed 記錄）
  - Git Hooks：pre-commit hook（install_hooks）是否安裝
  - 測試基線：可選 `--run-tests`（跑 pytest 全量摘要）
- [x] doctor 結束給「總體狀態」一行（OK / 有警告 WARN / 有錯誤 FAIL，exit 0/1/2）
- [x] 相依既有能力：不新增直接依賴，全部透過現有指令/env 讀取
- [x] 文件：README 快速開始 §7 補 `./twin doctor` 使用說明
- [x] pytest 全量 151 passed, 1 skipped；ruff 全過（新增 doctor 測試 7：缺 key 離線情境、全綠情境、done 降級 WARN、update_task_status 防護、summary 不算完成證據、retry summary 任務可降、config.MODELS 可達）

## 備註
- 不要發網路請求；純本機檢查
- 參考已有 stable 模板：`validate_environment`（auto_develop.py:1445）、`status` 命令（twin:144）
- 若 `--run-tests` 太久，預設不跑，僅提示指令