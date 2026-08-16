---
github_issue: null
title: providers build_implementation_prompt 改用實際任務參數（移除硬編碼）
type: fix
priority: high
status: done
spec_version: v3
commit: a1c28f0
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-12'
---
# T065 - providers build_implementation_prompt 改用實際任務參數

## 目標
`providers.py:38-54` 的 `build_implementation_prompt(task, spec, codebase, project)` 忽略了 `spec`/`codebase`/`project` 三個參數，prompt 硬編碼 `Project: digital-twin` 與 `Code path: ~/Projects/digital-twin/`（providers.py:48-49）。任何其他專案的 auto-dev 任務都會收到錯誤的專案資訊。改用實際參數產生 prompt。

## 驗收標準
- [x] `build_implementation_prompt` 的 prompt 內 Project / Code path 由 `project` / `codebase` 參數實際值產生，無 `digital-twin` 硬編碼
- [x] 檢查 `scheduler.py:749-751` 呼叫點，確認 spec/codebase/project 三參數皆正確建構並傳入
- [x] 新增測試：以非 digital-twin 的專案名/路徑呼叫，驗證 prompt 內容包含該專案名與路徑
- [x] 既有測試（test_impl_providers.py / test_impl_defaults.py 等）與 pytest 全量通過
- [x] ruff / pyright 通過

## 備註
- 現有測試因 monkeypatch `call_model_for_implementation` 而未抓到此問題，需補 prompt 內容層級測試
- 改動範圍限 providers.py（含測試），不動 scheduler 對外行為
- spec/codebase 兩參數原先完全未用，本次一併納入 prompt（Codebase context / Spec 章節）