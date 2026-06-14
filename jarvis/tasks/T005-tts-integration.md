---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/740
title: T005-TTS 整合
type: Feature
priority: high
status: done
assignee: 寶寶 代碼農1號執行）
created: 2026-05-13
updated: 2026-05-13
depends: T003（Brain Engine）
howto: [kokoro-tts-integration.md](../howto/kokoro-tts-integration.md)
---

# T005 - TTS 整合（Kokoro-82M）

## 目標

整合 Kokoro-82M TTS 文字轉語音引擎，支援中文語音輸出（zf_xiaoxiao），為數位人口型驅動提供音頻輸入。

## 實作內容（2026-05-13 完成）

### 環境建置
- ✅ Python 3.11 安裝（Homebrew）
- ✅ Kokoro 0.9.4 + soundfile + pypinyin + cn2an + jieba
- ✅ Kokoro-82M 模型下載（72 個檔案，349MB）
- ✅ Mac M2 MPS（Metal GPU）加速正常

### 語音引擎實作
- ✅ `voice/voice_engine.py` — TTSEngine 類別
  - `speak(text)` → WAV 檔案
  - `speak_to_array(text)` → numpy float32
  - `speak_streaming(text, callback)` → 流式回呼
  - `list_voices()` → 發音人列表
- ✅ `voice/requirements.txt` — 相依套件清單
- ✅ `tests/test_tts.py` — 單元測試（7 個測試，全數通過）

### 發音人
| 語言 | 發音人 | 備註 |
|------|--------|------|
| 中文 | zf_xiaoxiao | 標準普通話女聲（預設）|
| 中文 | zm_yunjian / zm_yunxi | 男聲 |
| 英文 | af_heart / af_bella | 女聲 |
| 英文 | am_adam / am_puck | 男聲 |

### 效能實測（Mac M2，MPS GPU）
| 文字長度 | 生成時間 | 音頻長度 |
|---------|---------|---------|
| ~20 字 | 2.2 秒 | 3.4 秒 |
| ~30 字 | 3.0 秒 | 3.6 秒 |

## 與後端流水線整合

PipelineResult 結構更新（`pipeline/jarvis_pipeline.py`）：
```python
@dataclass
class PipelineResult:
    transcription: Optional[str]  # ASR 結果
    response: str                 # LLM 回應文字
    audio: Optional[Path]        # TTS 音頻檔案（新增）
    error: Optional[str]
```

WebSocket 回應格式（已更新）：
```json
{
  "type": "response",
  "response": "回應文字...",
  "audio": "/assets/audio/tts_xxxxxxxx.wav",
  "audio_duration": 3.5,
  "error": null
}
```

## 待完成
- [ ] T003 後端流水線接入 PipelineResult.audio（Phase 1）
- [ ] 前端 HUD 播放 TTS 音頻
- [ ] 評估 ONNX 量化版本
