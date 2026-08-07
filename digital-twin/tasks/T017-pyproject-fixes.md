---
title: pyproject 修正（pyright 路徑、structlog 依賴、tests 目錄）
type: fix
priority: high
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-05
updated: 2026-08-06
commit: fbc975c
---

# T017 - pyproject 修正（pyright 路徑、structlog 依賴、tests 目錄）

## 目標
修復專案基礎設定錯誤（實測確認）：
1. `pyproject.toml` 的 pyright `include = ["src/**/*.py", "tests/**/*.py"]`，但專案程式碼在**根目錄**、無 `src/` 結構 → pyright 掃描 0 個檔案，型別檢查形同虛設
2. `install_hooks.py` 頂部 `import structlog`，但 dependencies 無此套件 → 直接執行會 ImportError
3. 無 `tests/` 目錄 → pytest 永遠 rc=5（被誤當通過）

## 驗收標準
- [x] pyright include 改為實際程式碼位置（根目錄 `*.py`，保守方案：維持根目錄、只改 pyright include）→ include = ["*.py", "tests/**/*.py"]，實際掃描到 auto_develop/config/config/validate/consensus_eval/install_hooks 等
- [x] pyproject 補上 `structlog` 依賴（dependencies + prod + dev 三處），`import structlog` 實測可成功
- [x] 建立 `tests/` 目錄 + tests/test_task_parser.py（5 個真實單元測試：完整 frontmatter / 中文+emoji 內容 / 無 frontmatter 相容 / 非法檔名 / 缺 status 欄位），pytest 不再回傳 rc=5 → `5 passed`
- [x] `python3 -m pytest tests/ -q` 通過（5 passed）
- [x] `pyright` 能實際掃描到檔案並輸出結果（修復前掃描 0 檔案；修復後掃描到 5+ 檔案，9 個真實型別錯誤全數修復：multi_ai_discuss.py template_path/system_prompt 未初始化、auto_develop.py `model: str = None` 型別註記、OpenRouter content 可能為 None；剩餘 5 個 reportMissingImports 為環境套件解析誤報，非程式碼問題）
- [x] `ruff check .` 錯誤數由 333 → 100（-70%），新增 RUF001/002/003 ignore（中文全形標點誤報，384 個）；tests/ 全部通過

## 附註（額外修復，皆 pyright 掃描後發現的真實 bug）
- **P0**：`multi_ai_discuss.py` DiscussionOrchestrator 的 `template_path`/`system_prompt` 從未初始化（僅在 `_load_system_prompt` 讀取）→ 任何 `twin discuss` 執行必崩 AttributeError；已於 `__init__` 初始化
- **P1**：`auto_develop.py` `_do_call_ollama(prompt, model: str = None)` 型別註記錯誤（pyright 在 py3.10 下禁止）→ 改 `str | None = None`
- **P1**：OpenRouter API 回傳 `content` 可能為 None → 改 `.get("content") or ""` 防禦式處理

## 備註
- 若選擇建立 `src/` 套件結構，需同步調整所有模組的相對 import（`from index_knowledge import ...`），改動面大，建議保守方案：維持根目錄、只改 pyright include
- `tests/` 目錄位置與 `[tool.pytest.ini_options] testpaths = ["tests"]` 一致
