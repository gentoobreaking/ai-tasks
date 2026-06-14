---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/753
title: 統一模型設定系統（Multi-Backend）
type: Feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-13
updated: 2026-05-13
depends: T012
---

# T019 - 統一模型設定系統（Multi-Backend）

## 目標
建立可擴展的模型後端切換系統，支援本地 MNN 與雲端 OpenAI 相容 API，統一設定管理。

## 實作內容

### 1. 設定檔
- `~/.jarvis_config.json` — 使用者實際設定（含 API key）
- `jarvis_config-example.json` — 範本（無 key，可進版本控制）

### 2. 支援後端類型
- `type: mnn` — 本地 MNN-LLM 模型（Qwen1.5 / Qwen3.5）
- `type: openai` — OpenAI 相容 API（ZenMux / NVIDIA NIM 等）

### 3. API
- `GET /models` — 列出可用模型
- `POST /switch-model` — 切換模型（MNN 需重啟 pipeline，OpenAI 即時切換）

### 4. `models.json` 結構
```json
{
  "models": {
    "backends": {
      "{key}": {
        "type": "mnn|openai",
        "label": "顯示名稱",
        "model": "模型名稱或目錄",
        "api_base": "API 位址（openai 專用）",
        "api_key": "API key（openai 專用）"
      }
    }
  },
  "telegram": {
    "enabled": bool,
    "bot_token": "",
    "allowed_user_ids": []
  }
}
```

## 驗收標準
- [x] 設定檔外置於 `~/.jarvis_config.json`
- [x] 支援本地 MNN + 雲端 OpenAI 雙後端
- [x] 前端下拉選單即時切換模型
- [x] 無需重啟伺服器即可切換（OpenAI）
- [x] 加新模型只改 JSON，不改程式碼
- [x] 範本檔不含真實 key
