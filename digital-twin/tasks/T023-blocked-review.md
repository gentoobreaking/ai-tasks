---
title: blocked 任務自動產出 review 紀錄與拆分建議
type: feature
priority: medium
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-05
updated: 2026-08-07
commit: f88f404
summary: blocked 自動產 review(失敗歷史 JSONL+輸出摘要+規則式拆分建議/重試/人工)、twin blocked CLI 四指令、T006/T008 補產,6 tests
---

# T023 - blocked 任務自動產出 review 紀錄與拆分建議

## 目標
T006/T008 已被 auto_develop 標記 blocked（fail_count=3）後**沒有後續處理機制**，任務卡死無人接手。應在任務被標記 blocked 時自動產出 review 紀錄，含失敗歷史、可能原因分析、拆分建議，供人工快速決策（重試 / 拆分 / 棄置）。

## 驗收標準
- [x] `_record_failure` 將任務標記 blocked 時，自動生成 `<tasks_dir>/blocked-review/T0XX-review.md`，內容含：
  - 任務原始需求（標題/驗收標準）
  - 失敗歷史（每次 fail_count 的 summary——寫入 `failures.jsonl`，每次失敗累積；review 逐筆呈現）
  - 最近一次失敗的模型輸出/測試輸出摘要（`logs/repair-T0XX-*.md` / `logs/pr-T0XX.md` 節錄）
  - 建議行動（範圍過大→拆分子任務清單 `-SUB1..n`；有失敗輸出→重試；否則→需人工實作）
- [x] 產生後在任務檔 frontmatter 記錄 `blocked_review: <path>`
- [x] 提供 `./twin blocked`（清單含每任務 fail_count/review 路徑/summary）及 `--review/--retry/--supersede` 子指令
- [x] 人工決定可改回 pending（`--retry` 歸零 fail_count）或標記 `superseded_by: T0XX`（`--supersede`）
- [x] 既有 T006/T008 補產出 review 紀錄（`./twin blocked --review T006/T008` 手動觸發一次）

## 備註
- T006 失敗根因之一是「要求一次重構 telegram_bot 為 aiogram+FastAPI+Redis 規模過大，單次 diff 無法完成」→ 拆分建議規則可作為驗證案例（範圍過大 → 產出 SUB 清單）
- 與 T012/T014 互動：閘門修好 + 修復迴圈上線後，blocked 應大幅減少
- live `_record_failure` 以磁碟最新 frontmatter 為主，避免 generate_review 覆寫 blocked
- 測試：`tests/test_blocked_review.py` 6 tests；全量 **91 passed + 1 skipped**；ruff/pyright 0 errors
