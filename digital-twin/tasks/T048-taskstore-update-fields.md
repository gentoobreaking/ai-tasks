---
github_issue: null
title: TaskStore 重寫積木統一（update_fields/force）——retry/supersede/blocked_review/_record_failure 遷移
type: refactor
priority: high
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-11'
updated: '2026-08-11'
---
# T048 - TaskStore 重寫積木統一（update_fields）

## 目標
2026-08-11 審查發現 frontmatter 重寫塊重複 5 處：
`fm.copy→改欄位→yaml.dump(sort_keys=False)→write_text` 完整積木散落在
auto_develop.py:665（blocked_review 路徑）、:695（retry_task）、:714（supersede_task）、
:1586（_record_failure pending 回寫）與 common/tasks.py:219（save_summary）。
本任務在 TaskStore 提供單一 update 積木並全面遷移。

## 驗收標準
- [ ] common/tasks.py 增加 `update_fields(task, *, force=False, **fields)`：預設不寫 status/updated 以外的攔截？
  （設計決定：force=False 走 T037 降級防護；force=True 供 retry/supersede 繞過防護，等同現況直接寫檔）
- [ ] retry_task / supersede_task / generate_blocked_review / _record_failure 改走 TaskStore.update_fields
- [ ] `rg "yaml.dump\(fm"`：auto_develop.py 內不再有自寫 frontmatter 重寫塊（只剩 TaskStore 一處）
- [ ] T037 防護行為不變：done+commit 任務仍拒絕降級；retry 仍可直接改 pending
- [ ] pytest 全量維持 151 passed + 1 skipped；ruff 全過

## 備註
- forced 語意沿用現況：retry/supersede 是「人工決策直接寫檔」的合法降級管道（T023）
- blocked_review 寫入路徑是相對 tasks_dir（frontmatter 欄位 blocked_review），屬任意欄位更新，
  update_fields 以 **fields 承接即可
- 保留 yaml.dump(allow_unicode=True, sort_keys=False) 欄位順序語意，避免 YAML 重排破壞既有檔案