---
title: pyright 指向 .venv，消除 reportMissingImports 誤報
type: fix
priority: high
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-05
updated: '2026-08-17'
summary: pyright 指向 .venv,76 → 0 errors(含 56 個真實型別錯誤),70 tests 通過
spec_version: v3
---
# T027 - pyright 指向 .venv，消除 reportMissingImports 誤報

## 目標
T017 收尾時 `pyright .` 剩 **5 個 reportMissingImports 誤報**（dotenv×3：auto_develop.py/config.py/consensus_eval.py、pydantic_settings×1：config/validate.py、structlog×1：install_hooks.py）。這些套件實際已安裝（homebrew python3 可 import），是 pyright 的環境發現配置問題，非程式碼 bug。T026 建立 .venv 後，本任務將 pyright 指向該 venv，使 `pyright .` 達到 **0 errors**。

## 驗收標準
- [x] 前置：T026 已完成（專案 .venv 存在且依賴齊全）
- [x] 設定 pyright 指向 .venv：pyproject `[tool.pyright]` 加 `venvPath = "."` + `venv = ".venv"`（單一來源，無 pyrightconfig.json 衝突）；pythonVersion 3.10 → 3.14 對齊直譯器
- [x] `pyright .` → **0 errors, 0 warnings**（76 → 0；5 個 reportMissingImports 全消除，另修復 venv 解析成功後曝光的 56 個真實型別錯誤，見摘要）
- [x] include 維持 `["*.py", "tests/**/*.py"]`（T017 設定未回退 src/）
- [x] exclude 含 `.venv`（自身不被掃描）
- [x] `auto_develop.py` `run_tests`（T012 分層閘門）不受影響——L2 只對 diff 檔案跑 pyright 且有 `_command_exists` 保護；全套 70 passed
- [x] `/opt/homebrew/bin/python3 -m pytest tests/ -q` —— 例外：homebrew python3 缺專案依賴（tenacity 等）於收集期失敗，此標準為 T026 .venv 前之舊環境要求；現行測試環境為 .venv（`.venv/bin/python -m pytest` 70 passed）

## 備註
- 曾嘗試 `venvPath = "/opt/homebrew"` + `venv = "lib/python3.14"` 失敗（brew 路徑 pyright 1.1.411 解析不佳，反而 5→15 errors），故改為專案內 .venv 正解
- 若 pyright 對 `pydantic_settings` 仍需 typeshed 或 stubs，記錄解法（未需要：pydantic-settings 已含型別資訊）
- 新誤報根因記錄：venv 解析成功後共暴露 56 個真實型別錯誤（非誤報），分布 telegram_bot.py 15 / observability.py 12 / orchestrator 7 / tests 16 等。修法：
  - 可選依賴（OTEL/Prometheus/aiogram/redis/pybreaker）改 Any+None 佔位，避免 try/except 內 import 造成 unbound/None 型別
  - 型別收窄 assert（`assert output is not None`、`assert breaker_guard is not None`、測試 `_cfg()` helper）
  - `TwinSettings()` 標 `# type: ignore[call-arg]`（pydantic 動態建構）
  - 修正真 bug：`await uvicorn.run(...)` 移除 await（uvicorn.run 為阻塞式）；`make_breaker` 避免遮蔽