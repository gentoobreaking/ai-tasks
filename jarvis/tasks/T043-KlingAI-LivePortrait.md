---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/775
type: Feature
priority: high
status: in-progress
assignee: OpenCode MinniMax-M2.7
created: 2026-05-13
updated: 2026-05-23
howto: ~/howto
---

# T043 - 數位人系統整合

## 目標
將數位人整合到 JARVIS，實現完整的數位人對話系統。同時支援**臉部模式**（T044）和**全身模式**（T042）兩種驅動方式。

## 系統架構
```
音訊輸入 (Whisper ASR)
    ↓
本地 LLM (MNN-Qwen)
    ↓
TTS 輸出 (Kokoro)
    ↓
數位人唇形同步
    ↓
數位人視頻輸出
```

## 兩種模式

### 模式一：局部臉部（T044 - MNN-LivePortrait）
- **範圍**：僅臉部 + 頭部 + 頸部（1:1 裁剪區域）
- **技術**：MNN-LivePortrait
- **用途**：輕量、快速、說話頭像

### 模式二：全身數位人（T042 - TANGO/EchoMimic）
- **範圍**：臉部 + 身體 + 手臂 + 道具（甜甜圈泳圈）
- **技術**：TANGO / EchoMimic
- **用途**：完整半身/全身律動

## 實作內容
1. 確認 T042 / T044 推論 pipeline
2. 串接 TTS → 數位人輸入
3. 前端顯示數位人視頻流
4. 整合進 JARVIS pipeline

## 實作紀錄 (2026-05-23)

### 新增模組
- `digital_human/__init__.py` — 模組入口
- `digital_human/dh_config.py` — `DigitalHumanMode` 列舉 (NONE/BODY/FACE/HYBRID)、`DHConfig` 資料類別、`MODE_DEPENDENCIES` 依賴表
- `digital_human/dh_controller.py` — `DigitalHumanController` 控制器
  - `process_tts_result()` 統一處理 TTS → (audio base64 + viseme + blendshape + command)
  - BODY mode 支援 LLM 動作指令 (`cmd:xxx`) 解析
  - FACE mode 預留接入點（待 T044）

### 修改檔案
- `pipeline/jarvis_pipeline.py`
  - `PipelineConfig` 新增 `dh_mode` / `dh_auto_command` 欄位
  - `initialize()` 呼叫 `_init_dh()` 建立 DH 控制器
  - `_tts_step()` 在 DH 啟用時路由至 `DigitalHumanController.process_tts_result()`
  - `run_text()` / `run_voice()` 支援 DH command 覆蓋
  - `health_check()` 回傳 DH 狀態
  - `close()` 清理 DH 資源
- `assets/hud.html` — 頂部工具列新增 DH 模式徽章 (`#dhBadge`, `DH:BODY`)

### 系統架構（更新）
```
TTS 輸出 (Kokoro)
    ↓
DigitalHumanController
    ├── BODY mode (T042) → viseme_track + command + audio WAV
    └── FACE mode (T044) → 預留 (process_tts_result 已設計好擴充點)
                            ↓
                    WebSocket → hud.html (VRM / LiteAvatar / 視訊)
```

## 驗收標準
- [x] T042 推論正常 → Three.js VRM 全身模式已完工 (T042 done)
- [ ] T044 推論正常 → 待 T044 完成後驗證
- [x] TTS 音訊正確驅動唇形 → viseme_track 經由 DH controller 統一生成
- [x] 前端顯示數位人 → 3D VRM / LiteAvatar 切換正常
- [x] 端到端對話測試 → BODY mode (text → LLM → TTS → command → WS → VRM)

## 備註
- 已處理依賴：T042（全身，已完成 ✅）
- 待補依賴：T044（臉部，需 MNN-LivePortrait）
- BODY mode 可獨立運作，不阻塞
- FACE mode 接入點：`DigitalHumanController.process_tts_result()` 中擴充 FACE 分支
- 啟動方式：`python app.py` → HUD 選 `renderer = 3D VRM`
- 參考：T006-口型同步測試與記憶體優化驗證
