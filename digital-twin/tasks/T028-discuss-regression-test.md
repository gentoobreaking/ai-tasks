---
title: DiscussionOrchestrator 回歸測試（T017 P0 防護）
type: test
priority: medium
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-05
updated: '2026-08-17'
spec_version: v3
---
# T028 - DiscussionOrchestrator 回歸測試（T017 P0 防護）

## 目標
T017 修復了 P0 bug：`multi_ai_discuss.py` 的 `DiscussionOrchestrator.template_path` / `system_prompt` 從未在 `__init__` 初始化（僅在 `_load_system_prompt` 讀取），導致任何 `twin discuss` 執行必崩 AttributeError。本任務為此加**回歸單元測試**，確保未來改動不會讓該 bug 復發。

## 驗收標準
- [x] 新增 `tests/test_discussion_orchestrator.py`：
  - 測試 `__init__` 後 `system_prompt` 為非空字串（template_path 不存在時使用內建預設提示詞）
  - 測試 `template_path` 存在時優先讀取模板內容
  - 測試 `_build_messages(round_num=0, model_name=..., previous_outputs={})` 回傳的 messages 含 system message（content 為 system_prompt）與 user message（含角色與第 1 輪指示）
  - 測試 `_build_messages` 後續輪（round_num>0）含增量價值指示（「聚焦增量價值」）與最終收斂指示（最後一輪時）
- [x] **全程離線**：不發任何網路請求（不實際呼叫 AIClient / 模型 API；可用 monkeypatch 或只測建構與訊息組裝）
- [x] `/opt/homebrew/bin/python3 -m pytest tests/ -q` → 全部通過（原 5 + 新增 ≥ 4）
- [x] `ruff check tests/` 維持 All checks passed
- [x] 手動驗證：`./twin discuss --help` 或等效 dry-run 路徑不再 AttributeError（若 CLI 無 dry-run，以單元測試覆蓋為準，並在備註記錄）

## 備註
- 此為 T017 P0 修復的**回歸防護**，非新增功能
- `DiscussionOrchestrator.__init__(project, version, rounds=3, only=None)` 會建立 `specs/ai-consultations/v{version}` 目錄——測試用 `tmp_path` 或 monkeypatch base_dir 避免污染真實 specs/
- 測試資料需避免依賴真實 API Key（.env 存在與否都不影響建構）
- 若發現 `_build_messages` 依賴 `get_model()`（config.py），測試中確認 config 已可 import（T011 已統一）

---

## 驗證結果（2026-08-09）
- 新增 `tests/test_discussion_orchestrator.py` 5 項回歸測試，全部離線（adapters={}，不觸網）：
  ① __init__ 後 system_prompt 非空 ② 模板缺 → 內建預設 ③ 模板在 → 優先讀取
  ④ _build_messages(round0) system+user 結構 ⑤ 後續輪增量價值＋最終收斂
- `/opt/homebrew/bin/python3 -m pytest tests/ -q` → 124 passed + 1 skipped（原 119 + 新 5）
- `ruff check tests/ discussion_orchestrator/` → All checks passed（順手修正 UP037/I001 兩項既有問題）
- 手動驗證：`./twin discuss --help` exit 0 無 AttributeError；CLI 無 dry-run 路徑，
  建構/訊息組裝以單元測試覆蓋（依任務書備註第 3 點）
- 備註：`_build_messages` 已於 T021 重構改名為 `_build_prompt`（無 messages 參數版），
  本次重建 `_build_messages(round_num, model_name, previous_outputs)` 作為回歸 API，
  `_build_prompt` 增 previous_outputs 參數（預設 None→all_outputs，run() 行為不變）