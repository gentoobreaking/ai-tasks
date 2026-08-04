---
title: blocked 任務自動產出 review 紀錄與拆分建議
type: feature
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-05
updated: 2026-08-05
---

# T023 - blocked 任務自動產出 review 紀錄與拆分建議

## 目標
T006/T008 已被 auto_develop 標記 blocked（fail_count=3）後**沒有後續處理機制**，任務卡死無人接手。應在任務被標記 blocked 時自動產出 review 紀錄，含失敗歷史、可能原因分析、拆分建議，供人工快速決策（重試 / 拆分 / 棄置）。

## 驗收標準
- [ ] `_record_failure` 將任務標記 blocked 時，自動生成 `<tasks_dir>/blocked-review/T0XX-review.md`，內容含：
  - 任務原始需求（標題/驗收標準）
  - 失敗歷史（每次 fail_count 的 summary）
  - 最近一次失敗的模型輸出/測試輸出摘要（若可取得）
  - 建議行動（重試 / 拆分為子任務 / 需人工實作），拆分時產出建議的子任務清單
- [ ] 產生後在任務檔 frontmatter 記錄 `blocked_review: <path>`
- [ ] 提供 `./twin blocked`（或 auto_develop --blocked）指令列出所有 blocked 任務與其 review 紀錄
- [ ] 人工決定後可將任務改回 pending（fail_count 歸零）或標記 `superseded_by: T0XX`
- [ ] 既有 T006/T008 補產出 review 紀錄（可手動觸發一次）

## 備註
- T006 失敗根因之一可能是「要求一次重構 telegram_bot 為 aiogram+FastAPI+Redis 規模過大，單次 diff 無法完成」→ 正是拆分建議的典型案例，可作為驗證案例
- 與 T012/T014 互動：閘門修好 + 修復迴圈上線後，blocked 應大幅減少
