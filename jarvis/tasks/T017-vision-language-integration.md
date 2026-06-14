---
github_issue:https://github.com/gentoobreaking/ai-tasks/issues/752
type: pending
priority: low
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-13
updated: 2026-05-13
howto:
---

# T017 - Vision-Language 模組整合

## 目標
將現有的 Vision-Language 模型權重（`models/visual.mnn` + `visual.mnn.weight`）整合進 pipeline，使 JARVIS 具備圖片辨識與多模態對話能力。

## 背景
`models/` 目錄已有 VL 模型權重（visual.mnn），但目前 pipeline 完全未使用。MNN-LLM 支援 `mllm` 配置，可在 config.json 中設定 vision 相關參數。

## 驗收標準
- [ ] 確認 models/ 中的 VL 權重對應的模型類型與 config 配置
- [ ] 在 models/config.json 加入 `"mllm"` 區塊設定 vision backend
- [ ] 實作圖片輸入端點（base64 圖 + 文字提問）
- [ ] 測試圖像理解功能（如「這是什麼？」+ 上傳圖片）
- [ ] 更新 WebSocket 訊息格式支援圖片輸入

## 備註
- VL 模型會增加記憶體佔用（目前 models/ 約 984MB），16GB Mac 需評估
- 可設計為選用功能（啟動時透過 env flag 決定是否載入 VL）
- 注意 Qwen3.5 VL 的 prompt 格式與純文字模型不同