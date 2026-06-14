---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/759
title: 設定檔重構（debug/enabled/fix）
type: Refactor
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-13
updated: 2026-05-13
depends: T019
---

# T027 - 設定檔重構（debug/enabled/fix）

## 目標
統整 ~/.jarvis_config.json 結構，加入開關與修正路徑匹配問題。

## 實作內容
- 加入 `debug: bool` 開關（控制 agent loop 思考歷程輸出）
- 每個 model backend 加入 `enabled: bool` 欄位（控制顯示）
- 修正 lifespan 中 BRAIN_MODEL 設為目錄路徑導致 handle_text 無法匹配 config key 的問題
- 合併 models.json 進 unified config
- 修正檔案命名統一為 jarvis（原 javis typo）
- 清除 PyTorch/Kokoro warnings

## 驗收標準
- [x] debug 開關可控制 agent loop log 輸出
- [x] enabled 開關可隱藏模型不下拉選單顯示
- [x] 重啟後模型選擇正確恢復
- [x] log 乾淨無 warning 洗版
