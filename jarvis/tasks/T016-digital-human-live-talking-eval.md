---
github_issue:https://github.com/gentoobreaking/ai-tasks/issues/751
type: pending
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-13
updated: 2026-05-13
howto: digital-human-validation.md
---

# T016 - 評估 LiveTalking 數位人口型同步方案（Mac M2）

## 目標
調研並評估 lipku/LiveTalking 在 Mac M2 上作為 JARVIS 數位人口型驅動引擎的可行性。

## 背景
`render/render_engine.py` 目前只有 stub（`pass`），數位人口型同步完全未實作。網路上最新方案：
- **[lipku/LiveTalking](https://github.com/lipku/LiveTalking)** v2.0.1（2026-04-11，7.5K stars）— 即時互動串流數位人，2025/03/16 新增 **Mac GPU (MPS) 推理支援**
- 支援 Wav2Lip、MuseTalk、Ultralight-Digital-Human 等多種模型
- 另有 bitHuman Halo（M3+ only，但架構可參考）

## 驗收標準
- [ ] 在 M2 Mac 上嘗試執行 LiveTalking 的基本 demo（至少一種模型）
- [ ] 記錄 MPS 後端下的推理 FPS 是否達 25fps 即時標準
- [ ] 評估與現有 pipeline（ASR → LLM → TTS）的整合方式
- [ ] 產出評估報告（可行/不可行、推薦模型、整合路徑）
- [ ] 若可行，撰寫 render engine wrapper 整合進 `render/render_engine.py`

## 備註
- Wav2Lip/MuseTalk 主要最佳化在 NVIDIA GPU，Mac M2 MPS 表現需實測
- Ultralight-Digital-Human 可能最適合 Mac（輕量）
- WebRTC 輸出方案需評估瀏覽器相容性
- 記憶體：M2 16GB 同時跑 LLM + TTS + 口型推論需注意總量