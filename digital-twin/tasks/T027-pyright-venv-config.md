---
title: pyright 指向 .venv，消除 reportMissingImports 誤報
type: fix
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-05
updated: 2026-08-05
---

# T027 - pyright 指向 .venv，消除 reportMissingImports 誤報

## 目標
T017 收尾時 `pyright .` 剩 **5 個 reportMissingImports 誤報**（dotenv×3：auto_develop.py/config.py/consensus_eval.py、pydantic_settings×1：config/validate.py、structlog×1：install_hooks.py）。這些套件實際已安裝（homebrew python3 可 import），是 pyright 的環境發現配置問題，非程式碼 bug。T026 建立 .venv 後，本任務將 pyright 指向該 venv，使 `pyright .` 達到 **0 errors**。

## 驗收標準
- [ ] 前置：T026 已完成（專案 .venv 存在且依賴齊全）
- [ ] 設定 pyright 指向 .venv：pyproject `[tool.pyright]` 加 `venvPath`/`venv`（如 `venvPath = "."`、`venv = ".venv"`），或改用專案根目錄 pyrightconfig.json（兩者擇一，不得重複設定造成衝突）
- [ ] `pyright .` → **0 errors, 0 warnings**（5 個 reportMissingImports 全消除）
- [ ] 確認仍掃描到根目錄 `*.py` 與 `tests/**/*.py`（include 維持 T017 設定，不得回退到 src/）
- [ ] 確認 `.venv` 本身不被 pyright 掃描（exclude 含 `.venv`）
- [ ] `auto_develop.py` 的 `run_tests`（T012 分層閘門）呼叫 pyright 的行為不受影響——閘門只檢查 diff 檔案，且使用系統 pyright 時不因新設定報錯
- [ ] `/opt/homebrew/bin/python3 -m pytest tests/ -q` 維持 5 passed

## 備註
- 曾嘗試 `venvPath = "/opt/homebrew"` + `venv = "lib/python3.14"` 失敗（brew 路徑 pyright 1.1.411 解析不佳，反而 5→15 errors），故改為專案內 .venv 正解
- 若 pyright 對 `pydantic_settings` 仍需 typeshed 或 stubs，記錄解法（pip install pydantic-settings 已含型別資訊，理論上不需 stubs）
- 驗證時若出現新的誤報（如 httpx），一併在備註記錄根因
