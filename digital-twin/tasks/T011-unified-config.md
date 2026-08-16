---
title: 建立統一模型與路徑設定模組 (config.py)
type: refactor
priority: high
status: done
spec_version: v3
commit: a1c28f0
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-05
updated: 2026-08-05
---

# T011 - 建立統一模型與路徑設定模組 (config.py)

## 目標
消除 `multi_ai_discuss.py`、`auto_develop.py`、`README.md` 三處模型定義互相矛盾的問題（同一個「claude」在三處是三個不同 model_id，且名稱與實際模型不符），建立單一設定來源。

現況（實測確認）：
- `multi_ai_discuss.py MODELS`：`claude` 對應 `nvidia/nemotron-3-ultra-550b-a55b:free`（名稱欺騙）
- `auto_develop.py` 預設：`nvidia/nemotron-3-ultra-550b-a55b:free`
- `README.md` 宣稱：`claude-3-5-sonnet-20241022`（已停用模型）
- `PROJECT_PATHS` 路徑表在 auto_develop.py 內硬編碼

## 驗收標準
- [x] 新增 `config.py`（或 `config/models.yaml`）為單一設定來源，包含：模型清單（name/role/model_id/api_env/provider）、專案路徑表
- [x] `multi_ai_discuss.py`、`auto_develop.py`、`consensus_eval.py` 全部改為從設定檔讀取，移除各自硬編碼
- [x] 移除已停用/不存在的模型 ID；`--list-models` 顯示的模型名稱與實際 model_id 一致（不可再自稱 claude 實為 nemotron）
- [ ] README.md 的模型表格與設定檔一致（歸 T015 文件對齊）
- [x] `python3 multi_ai_discuss.py --list-models` 與 `python3 auto_develop.py --list` 均可正常運作

## 備註
- 本任務檔放置於 `~/Projects/digital-twin/tasks/`（程式碼專案內）；`auto_develop.py` 目前讀取 `~/tasks/digital-twin/tasks/`，路徑差異需在 config.py 中一併收斂（或於 T018 處理）
- 注意 `.env` 實際已設定 GEMINI_API_KEY / DEEPSEEK_API_KEY / OPENROUTER_API_KEY 三把
