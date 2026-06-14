---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/737
title: T003-後端流水線整合
type: Feature
priority: high
status: done
assignee: 寶寶
created: 2026-05-13
updated: 2026-05-13
depends: T001, T002, T004
howto: [javis-pipeline.md](../howto/javis-pipeline.md)
---

# T003 - 後端流水線整合

## Description

將語音辨識（ASR）+ 大腦推理（LLM）+ 語音合成（TTS）+ 數位人渲染（Render）
串成完整流水線，以 WebSocket + FastAPI 方式對外提供服務。

## Acceptance Criteria

- [x] `app.py` 具備 WebSocket endpoint（`/ws/chat`）
- [x] 收到文字 → BrainEngine.chat() → 回應文字
- [x] 收到語音（WAV/PCM）→ ASR → BrainEngine → 回應
- [x] pipeline 可選模式：text-only / voice-in-voice-out
- [ ] 數位人影片幀（口型同步）可從 RenderEngine 獲取（T006）
- [x] 所有模組異常均有 fallback 機制（防止單一模組失敗導致整體崩潰）
- [x] `tests/test_pipeline.py` 覆蓋主要流程

## 執行日誌（2026-05-13）

### Step 1：建立 Pipeline 協調器 ✅
`pipeline/jarvis_pipeline.py`：
- `JarvisPipeline` 類：整合 ASR + Brain + TTS
- `PipelineConfig`：可配置參數
- `PipelineResult`：標準化回應格式
- `initialize()`：非同步初始化（避免阻塞）
- `run_text()`：文字模式流水線
- `run_voice()`：語音模式流水線
- Fallback 機制：每個模組单独 try/except

### Step 2：實作 FastAPI + WebSocket ✅
`app.py`：
- WebSocket endpoint：`/ws/chat`
- HTTP 端點：`/`（歡迎頁）、`/health`（健康檢查）
- CORS 中間件
- 生命週期管理（lifespan）
- 支援 text frame + binary frame（WAV）
- 客戶端訊息格式：`{"type": "text", "content": "..."}` 或直接發 binary

### Step 3：實作測試套件 ✅
`tests/test_pipeline.py`：
- `test_pipeline_import()` ✅
- `test_config()` ✅
- `test_result_to_ws_message()` ✅
- `test_result_error()` ✅
- `test_wav_generation()` ✅
- `test_pipeline_health()` ✅
- `test_pipeline_text_mode()` ✅（實際串聯測試）

### Step 4：端對端驗證 ✅
```
[直接測試] Text mode
- BrainEngine 載入：✅
- 問題："你好"
- 回應："你好！很高興見到你～..." ✅
- 耗時：~30秒（含模型載入）
```

### 訊息格式（WebSocket）

**輸入（客戶端 → 伺服器）：**
```json
{"type": "text", "content": "台灣最高的山是什麼？"}
```

**輸出（伺服器 → 客戶端）：**
```json
{
  "type": "response",
  "transcription": null,
  "response": "台灣最高的山是玉山...",
  "error": null
}
```

## 數位人方案約束（2026-05-13）

**原則**：必須完全離線，MacBook Air M2 本地推理，不依賴外部服務。

**排除方案**：
- ❌ KlingAI（雲端服務，需 API Key）
- ❌ 基於雲端口型同步的任何方案

**候選離線方案**：
| 方案 | 技術 | 離線可行性 | Mac M2 支援 |
|------|------|-----------|------------|
| Wav2Lip | 音頻驅動口型 | ✅ 完全離線 | ⚠️ PyTorch，需確認 Metal 支援 |
| LivePortrait | 單圖+驅動訊號 | ✅ 完全離線 | ⚠️ 需要 MNN 量化版 |
| UniTalker-MNN | 端到端數位人 | ✅ 完全離線 | ✅ MNN 版本已有 |
| 簡單嘴型動畫 | 語音驅動2D疊加 | ✅ 完全離線 | ✅ 純 JS/CSS 可實現 |

**優先順序**：
1. **Phase 1**：UniTalker-MNN（已列入 README，有 MNN 版本）
2. **Phase 2**：Wav2Lip（需 Python 環境 + PyTorch）
3. **Phase 3**：簡單 2D 疊加嘴型（最低成本，先上線）

## 已知限制

1. **TTS 未實作**：voice-output mode 回傳 `audio: null`，T005 完成後填補
2. **Render 未整合**：T006 完成後接入口型同步（離線方案已確認）
3. **模型載入慢**：BrainEngine 首次載入需 ~30 秒（可考慮模型預熱）

## 下一步
- [ ] T005（TTS/Kokoro）實作
- [ ] T006（Render 口型同步）實作
- [ ] 加入流式輸出（stream chunks）
- [ ] 加入 session 管理（多輪對話）
