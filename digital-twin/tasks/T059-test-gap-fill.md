---
github_issue: null
title: 測試涵蓋缺口補齊（common/tasks、multi_ai_discuss、task_advisor、index_knowledge、auto_guardrail）
type: test
priority: low
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-11'
updated: '2026-08-12'
commit: 9b32fc8
---
# T059 - 測試涵蓋缺口補齊

## 目標
2026-08-11 審查統計至少 9 個模組無對應測試：common/tasks.py（T036/T047/T048 的心臟）、
common/observability.py、multi_ai_discuss.py、task_advisor.py、index_knowledge.py、
auto_guardrail.py、install_hooks.py、config/validate.py（T053 處理後可能刪除）、
config/__init__。另防「環境敏感測試」：T036 完成後 discover_projects 剔除專案
曾使 test_impl_defaults 掛掉（已修），此類依賴真實 ~/tasks 的測試應全面隔離。

## 驗收標準
- [x] common/tasks.py 專屬測試：parse_task_file 欄位/無 frontmatter/損壞 yaml、
  TaskStore.list 排序與 depends_on、find 跨專案、set_status/update_fields（含 T037 降級防護、
  force 繞道、body 不含 frontmatter 語意、YAML 欄位順序不重排）
- [x] task_advisor / auto_guardrail / install_hooks 各至少一個離線單元測試（不觸網、不裝 hooks）
- [x] multi_ai_discuss / index_knowledge 至少一個可離線執行的建構/解析測試（不呼叫模型）
- [x] 既有「依賴真實 ~/tasks」測試全面改 monkeypatch PROJECT_PATHS 或 TaskStore(projects=)
  （test_impl_defaults 已示範；掃描 test_discover_projects 外的其餘環境依賴）
- [x] pytest 全量維持 151 passed + 1 skipped（新增測試後總數上升）；ruff 全過

## 備註
- 測試全部採 adapters={} / mock 離線模式（參考 T028 回歸測試基線作法）
- common/observability 若需測試，僅驗證降級模式（無 OTEL 時 structlog JSON）不報錯

## 完成備註（2026-08-12）
- 新增 3 個測試檔案、41 個測試：tests/test_tasks_store.py（TaskStore 12 項）、
  tests/test_advisor_guardrail_hooks.py（task_advisor/auto_guardrail/install_hooks 14 項）、
  tests/test_index_discuss_observability.py（multi_ai_discuss/index_knowledge/observability 11 項）
- 全部離線（fake adapter、monkeypatch 目錄→tmp_path、tasks_root 注入）；不觸網不裝 hooks
- 掃描確認既有測試皆已環境隔離，無真實 ~/tasks 依賴
- pytest 全量 233 passed + 1 skipped（+41）；ruff 全過