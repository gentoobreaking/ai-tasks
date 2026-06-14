---
github_issue:https://github.com/gentoobreaking/ai-tasks/issues/749
type: pending
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-13
updated: 2026-05-13
howto: whisper-cpp-integration.md
---

# T014 - Whisper.cpp 升級與 Flash Attention 啟用

## 目標
升級 whisper.cpp 至最新 stable 版（v1.8.4+），啟用 Metal GPU + Flash Attention 加速語音辨識。

## 背景
目前 whisper.cpp 的版本不明。最新 stable v1.8.4（2026-03-19）支援 Metal 全 GPU 推理與 Flash Attention（`-fa` flag），可顯著加速 Encoder 推論。根據上游 benchmark，Flash Attention 在 M2 Ultra 上對 base model Encoder 可加快約 15-30%。

## 驗收標準
- [ ] 確認目前 whisper.cpp 版本，必要時升級至 v1.8.4+
- [ ] `asr_engine.py` 的 `transcribe()` 方法加入 `-fa` 參數
- [ ] 執行 `tests/test_asr.py` 確認轉寫功能正常
- [ ] 記錄升級前後的轉寫速度 benchmark 數據
- [ ] 確認 whisper-cli 編譯時有啟用 Metal（`-DGGML_METAL=ON`）

## 備註
- `-fa` 在 Metal 後端需要 M1+ 晶片（M2 沒問題）
- 若 `-fa` 導致準確率下降，可保留不加
- 升級後注意 ggml 模型檔案格式是否相容（v1.8.4 向後相容）