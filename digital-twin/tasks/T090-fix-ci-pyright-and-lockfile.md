---
github_issue: N/A
title: 修復 CI 紅燈 — pyright 歸零與 uv.lock 同步
type: fix
priority: high
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T090 - 修復 CI 紅燈：pyright 歸零 + uv.lock 與 pyproject 同步

## 目標
main 分支最近三次 CI run（32654755032 等）全部 failure，卡在 Pyright type check
步驟。commit dfa8db5 雖稱「pyright 歸零」，但後續 push 引入新錯誤且未本地驗證。
本任務將 pyright 全專案錯誤歸零，並修復鎖檔漂移：

1. providers.py 共 9 個錯誤：
   - providers.py:479,686：`asyncio.timeout is not a known attribute` ——
     asyncio.timeout() 是 Python 3.11+ API，與 requires-python >= 3.10 宣告矛盾
     （處理方式隨 T091 決議：升版本宣告則保留、否則改回 asyncio.wait_for）
   - providers.py:401,676：proc.stderr.read() Optional member access ——
     create_subprocess_exec(stdout=PIPE, stderr=PIPE) 型別上 stderr 可為 None，
     需 assertion 窄化（實際已保證 PIPE）
   - providers.py:462,679：(await stderr_task) Optional iterable —— 回傳值需窄化
   - providers.py:703,727,754：_parse_model_output(_extract_diff_from_output(...))
     傳入 str | None 但參數簽名為 str —— 對齊 _parse_model_output 接受 None
     （內部已有 None 處理）或在呼叫端窄化
2. tests/ 共 32 個錯誤（7 檔）：test_blocked_review.py (7)、test_tasks_store.py (19)、
   test_discussion_orchestrator.py (2)、test_setup_daemon_paths.py (2)、
   test_notify.py (1)、test_run_priority_timeout_sound.py (1) —— 多為 Optional 存取
   （Task | None 未斷言）與參數型別不符，補 assert 或修正型別標注
3. uv.lock 同步：committed uv.lock 缺 lancedb / sentence-transformers
   （pyproject 已宣告），工作區已 re-lock 的 uv.lock 需一併提交；
   CI 改用鎖定安裝（uv sync --locked 或等價），避免 pip 解析出不同依賴集

## 驗收標準
- [ ] 本地 `uv run pyright` 0 errors（含 tests/）
- [ ] 本地 `uv run pytest -q` 全數通過（基準 308 passed + 2 skipped）
- [ ] `uv lock --check` 通過；uv.lock 含 lancedb / sentence-transformers 且已提交
- [ ] CI quality job 全綠（ruff + pyright + pytest）

## 備註
- 錯誤清單來自 2026-08-24 審查；gh run view 32654755032 --log-failed 可重現完整輸出
- providers.py 三個 _do_call_* 函式結構相似，修法應一致（同一 pattern 套用三份）
- 遵守專案慣例：變更檔 pyright 歸零即可，不擴大範圍重構
