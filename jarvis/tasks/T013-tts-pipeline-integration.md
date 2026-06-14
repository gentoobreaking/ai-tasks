---
github_issue:https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/748
type: pending
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-13
updated: 2026-05-13
howto: kokoro-tts-integration.md
---

# T013 - TTS Pipeline 接入

## 目標
將已完成開發的 Kokoro-82M TTS 引擎（T005）正式接入 JarvisPipeline，使 pipeline 支援語音輸出模式。

## 背景
`voice/voice_engine.py`（TTSEngine）已完整實作，支援中文/英文 TTS、流式輸出、speak_to_array。但 `pipeline/jarvis_pipeline.py` 的 `_init_tts()` 仍為 `raise NotImplementedError("T005 完成後實作")`，`tts_enabled` 預設為 `False`。

## 驗收標準
- [ ] `_init_tts()` 改為實際初始化 TTSEngine 而非拋出 NotImplementedError
- [ ] `PipelineConfig.tts_enabled` 預設改為 `True`
- [ ] `run_text()` 和 `run_voice()` 在 `voice_output=True` 時回傳 TTS 音頻
- [ ] 測試文字輸入 → LLM 回應 → TTS 音頻輸出完整鏈路
- [ ] 現有 `tests/test_tts.py` 仍全部通過

## 備註
- TTS 初始化較慢（Kokoro 首次載入約 5-10 秒），需確保在 lifespan startup 階段完成
- TTS 失敗不影響主流程（已包在 try-except 中）
- 語音輸出模式由 `voice_output` flag 控制，預設可關閉以節省記憶體