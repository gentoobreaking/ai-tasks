---
github_issue: null
title: 任務檔 frontmatter 解析全面收斂至 TaskStore（消除 agent_versioning/doctor/incremental_index 平行實作）
type: refactor
priority: high
status: done
spec_version: v3
commit: a1c28f0
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-11'
updated: '2026-08-11'
commit: b8255a6
---
# T047 - 任務檔 frontmatter 解析全面收斂 TaskStore

## 目標
2026-08-11 審查發現 frontmatter 解析仍存 4 套平行實作，T036 只收斂了一半：
`common/tasks.py:101`（TaskStore）、`agent_versioning.py:91/103`（parse_frontmatter/dump_frontmatter，
被 12+ 處使用）、`incremental_index.py:166`（_frontmatter_tags）、`doctor.py:291`（第三種 split 寫法）。
本任務把除 TaskStore 外的實作全部收斂，讓「任務檔 frontmatter 常識」只剩單一來源。

## 驗收標準
- [x] agent_versioning 的 parse_frontmatter/dump_frontmatter 改為委派 common.tasks 共用函式
  （版本欄位 version/source 屬通用 frontmatter dict，不需改 Task 欄位定義即可承接）
- [x] doctor.py 任務檔 status/commit 檢查改用 common.tasks.parse_task_file（刪除 :291 的 split 手寫解析）
- [x] incremental_index._frontmatter_tags 改用 TaskStore 共用解析
- [x] `rg "split\(\"---\"|FM_RE"` 證據：任務檔解析只剩 common/tasks.py 一處
- [x] pytest 全量維持 151 passed + 1 skipped；ruff 全過
- [x] 不引入新依賴

## 備註
- agent_versioning 有完整測試（test_agent_versioning.py），遷移後以該測試確認版本推進行為不變
- Task.frontmatter 為通用 dict，含任意欄位（含 version/source/commit），故不需擴充 dataclass
- T036 後 doctor 當時未遷移（T037 早於 T036 完成），本任務補上
- 實作註記：doctor 以 `common.tasks.parse_frontmatter` 達成（須處理非 T### 命名檔案，parse_task_file
  對非規範檔名回傳 None，改用較精確的 frontmatter 層 API；行為與原 split 解析等價）
- 留待 T048：auto_develop.py 4 處與 TaskStore.rewrite 的 yaml.dump 重寫積木統一（重寫不在本任務範圍）