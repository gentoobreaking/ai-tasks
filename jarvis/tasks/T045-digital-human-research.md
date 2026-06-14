---
github_issue:https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/776
type: completed
priority: medium
status: done
assignee: OpenCode MinniMax-M2.7
created: 2026-05-14
updated: 2026-05-22
howto: ~/howto/digital-human-research.md
---

# T045 - 數位人方案研究

## 目標
研究並評估「好看 + 動作 + 對口型」的全身數位人解決方案，提出 JARVIS 整合建議。

## 研究背景
現有方案問題：
- MP4 模式：外觀好看但無對口型
- 3D + Mixamo：需要付費模型、動作整合複雜
- LivePortrait：只有臉部，無全身動作
- Canvas 2D：卡通風格，非真實人像

## 研究結果

### 付費 API 方案

#### HeyGen API
| 項目 | 說明 |
|------|------|
| **API 定價** | $0.40/min（Avatar III 1080p）~ $5.00/min（Avatar IV 4K） |
| **Web 方案** | Free（3 支/月）→ Creator $29/mo → Pro $99/mo → Business $149/mo |
| **畫質** | 業界最佳（Avatar V 臉部相似度 0.840），支援 4K |
| **對口型** | 精準，支援音訊上傳自動對嘴 |
| **全身** | ✅ 支援全身/半身 Avatar |
| **語言** | 175+ 語言 |
| **即時串流** | ❌ 非同步生成（每分鐘影片約需數分鐘生成） |
| **API 成熟度** | 完整 REST API，Webhook 支援，Python SDK |
| **評價** | 品質最佳但成本最高，適合預錄內容產出 |

#### D-ID API
| 項目 | 說明 |
|------|------|
| **API 定價** | $0.05/sec（$3/min） |
| **Web 方案** | Lite $5.90/mo → Pro $29.99/mo → Advanced $108/mo |
| **畫質** | 1080p（Pro 以上），512px（Lite） |
| **對口型** | 精準，30+ 語言 |
| **全身** | ❌ 僅 Talking Head，無全身 |
| **即時串流** | ✅ 支援 Streaming Avatar（即時對話） |
| **API 成熟度** | 完整 REST API，OpenAI 相容 |
| **評價** | 最便宜入門方案，Streaming Avatar 適合即時互動，但僅頭部 |

#### Synthesia API
| 項目 | 說明 |
|------|------|
| **API 定價** | 僅 Creator 以上方案提供 API，無公開 per-minute 定價 |
| **Web 方案** | Free（3 min/mo）→ Starter $29/mo → Creator $89/mo |
| **畫質** | 1080p，180+ Avatar |
| **對口型** | 精準，140+ 語言 |
| **全身** | ✅ 支援半身/全身 |
| **即時串流** | ❌ |
| **API 成熟度** | 有限，企業方案為主 |
| **評價** | 適合企業訓練內容，不適合即時場景 |

### 開源方案

#### SadTalker ⭐13.8k
| 項目 | 說明 |
|------|------|
| **原理** | 3DMM + Audio2Coeff + Face Renderer（基於 Generator） |
| **輸入** | 靜態圖片 + 音訊 |
| **輸出** | Talking head 影片（256x256） |
| **對口型** | ✅ 含頭部動作 |
| **全身** | ❌ 僅頭部 |
| **M2 Mac 效能** | ❌ Conv3D 不支援 MPS → CPU 推理約 4-8s/frame（10s 音訊需數分鐘） |
| **VRAM** | 需要 CUDA GPU，MPS 模式 Conv3D 錯誤 |
| **授權** | MIT |
| **整合難度** | 中（需下載多個模型 checkpoint, ~5GB） |
| **結論** | M2 Mac 上不可行，需 NVIDIA GPU |

#### Wav2Lip ⭐13k+
| 項目 | 說明 |
|------|------|
| **原理** | Generator + SyncNet discriminator（Encoder-Decoder） |
| **輸入** | 影片 + 音訊 |
| **輸出** | Lip-sync 影片（覆寫嘴部區域） |
| **對口型** | ✅ 精準（SyncNet 監督），無頭部動作 |
| **全身** | ❌ 僅修改嘴部區域 |
| **M2 Mac 效能** | ⚠️ 可跑 CPU，速度約 0.5-1x realtime |
| **VRAM** | 無特殊需求，可跑 CPU |
| **授權** | MIT |
| **整合難度** | 低（Python 3.6+，依賴少） |
| **注意** | Python 3.6-3.8 相容性問題；嘴部邊界模糊 |
| **結論** | 最輕量，但老舊且品質有限 |

#### MuseTalk ⭐5.5k（騰訊音樂）
| 項目 | 說明 |
|------|------|
| **原理** | Stable Diffusion + 時序 U-Net + Whisper |
| **輸入** | 人物影片（半身/全身）+ 音訊 |
| **輸出** | 半身 lip-sync 影片 |
| **對口型** | ✅ 含上半身 |
| **全身** | ⚠️ 半身，非全身動態 |
| **M2 Mac 效能** | ❌ CUDA-only（需要 mmcv/mmpose，無 MPS 支援） |
| **VRAM** | 最低 4GB（RTX 3050 Ti），建議 8GB+ |
| **授權** | MIT |
| **整合難度** | 高（mmcv 編譯複雜，Windows/Linux only） |
| **結論** | macOS 無法直接部署 |

#### LatentSync ⭐5.7k（字節跳動）
| 項目 | 說明 |
|------|------|
| **原理** | Whisper + Stable Diffusion VAE + 3D UNet（Latent Diffusion） |
| **輸入** | 影片 + 音訊 |
| **輸出** | Lip-sync 影片 |
| **對口型** | ✅ 最佳開源品質（SyncNet 94% 準確率） |
| **全身** | ❌ 僅嘴部區域 |
| **M2 Mac 效能** | ⚠️ 透過 HuggingFace Diffusers 可能支援 MPS（v1.5 需 8GB VRAM） |
| **VRAM** | v1.5 ~8GB, v1.6 (512px) ~12GB |
| **授權** | Apache 2.0 |
| **整合難度** | 中（HuggingFace Diffusers 整合，相對現代） |
| **版本** | v1.5（256px）, v1.6（512px 更高畫質） |
| **結論** | 最有潛力的開源方案，MPS 支援待驗證 |

## 成本效益分析

### 每分鐘影片成本比較

| 方案 | 每分鐘成本 | 即時性 | 畫質 | M2 Mac 相容 |
|------|-----------|--------|------|-------------|
| HeyGen API | $0.40~$5.00 | ❌ | ⭐⭐⭐⭐⭐ | ✅（雲端） |
| D-ID API | ~$3.00 | ✅ Streaming | ⭐⭐⭐⭐ | ✅（雲端） |
| Synthesia | ~$2.90~$8.90 | ❌ | ⭐⭐⭐⭐ | ✅（雲端） |
| SadTalker | 免費（但極慢） | ❌ | ⭐⭐⭐ | ❌ |
| Wav2Lip | 免費（CPU 可跑） | ❌ | ⭐⭐ | ⚠️ |
| MuseTalk | 免費 | ❌ | ⭐⭐⭐⭐ | ❌ |
| LatentSync | 免費 | ❌ | ⭐⭐⭐⭐⭐ | ⚠️（待驗證） |

### 月費預估（50 min 影片產出）

| 方案 | 月費 |
|------|------|
| HeyGen API Avatar III | ~$20 |
| HeyGen API Avatar IV | ~$250 |
| D-ID API | ~$150 |
| Synthesia Creator | $89（僅 30 min） |
| 開源方案 | $0（硬體成本） |

## 技術可行性評估

### JARVIS 的獨特需求
1. **即時性**：使用者語音輸入 → TTS → A2BS blendshape → 即時嘴型同步
2. **高畫質**：希望數位人「好看」
3. **動作**：不僅對嘴，還有自然頭部/身體動作
4. **本地優先**：M2 MacBook Air 16GB（無 NVIDIA GPU）

### 架構瓶頸
- 目前即時路徑：**語音 → TTS (Kokoro) → A2BS (MNN CPU) → Canvas 2D（卡通臉）**
- **真實人臉即時渲染**需要 GPU 加速，M2 Mac 缺乏 CUDA
- 所有開源影片級方案（SadTalker/MuseTalk/LatentSync）都非即時

## 整合建議

### 短線方案（現在 ~ 1 個月）
| 方案 | 說明 |
|------|------|
| **MP4 模式維持主要** | 預錄高畫質影片作為主要顯示，無對口型需求時使用 |
| **Canvas 2D 持續優化** | 即時對口型場景使用，A2BS blendshape 驅動 |
| **LiteAvatar 試跑** | 下載模型後評估本地端對端品質 |

### 中線方案（1 ~ 3 個月）
| 方案 | 說明 |
|------|------|
| **D-ID Streaming API 整合** | 即時對話場景：JARVIS 回應文字 → D-ID Streaming Avatar 生成即時 talking head（$0.05/sec） |
| **HeyGen API 預錄場景** | 高品質內容：腳本 → HeyGen 生成高畫質影片（$0.40/min） |
| **LatentSync MPS 測試** | 驗證是否可在 M2 Mac 上跑 diffusion-based lip sync |

### 長線方案（3 ~ 6 個月）
| 方案 | 說明 |
|------|------|
| **全本機 3D VRM 整合** | VRM 模型 + A2BS blendshape → 3D 即時渲染（最符合本地優先精神） |
| **本地 diffusion 模型** | 若 Apple 強化 MPS/ANE，LatentSync 可能成為本地方案 |

### 最終推薦評比

```
                     即時性  畫質   本地  成本  整合難度
Canvas 2D + A2BS     ⭐⭐⭐⭐⭐ ⭐⭐  ⭐⭐⭐⭐⭐ ⭐⭐⭐⭐⭐ ⭐⭐⭐⭐⭐
MP4 預錄             ⭐⭐     ⭐⭐⭐⭐⭐ ⭐⭐⭐⭐⭐ ⭐⭐⭐⭐⭐ ⭐⭐⭐⭐⭐
D-ID Streaming API   ⭐⭐⭐⭐  ⭐⭐⭐⭐ ⭐⭐    ⭐⭐⭐   ⭐⭐⭐⭐
HeyGen API           ⭐⭐     ⭐⭐⭐⭐⭐ ⭐⭐    ⭐⭐     ⭐⭐⭐⭐
LatentSync (if MPS)  ⭐⭐     ⭐⭐⭐⭐⭐ ⭐⭐⭐⭐⭐ ⭐⭐⭐⭐⭐ ⭐⭐⭐
LiteAvatar (local)   ⭐⭐⭐    ⭐⭐⭐   ⭐⭐⭐⭐⭐ ⭐⭐⭐⭐⭐ ⭐⭐⭐
```

**結論**：
1. **即時場景**維持 **Canvas 2D + A2BS**（零成本、即時、夠用）
2. **高品質場景**導入 **HeyGen API**（單次產出，$0.40/min）
3. **即時高品質場景**評估 **D-ID Streaming API**（$3/min，但 Streaming Avatar 低延遲）
4. **全本地願景**仍是 **3D VRM + A2BS blendshape**，這是最終理想方案

## 驗收標準
- [x] 完成付費 API 評估報告
- [x] 完成開源方案評估報告
- [x] 給出整合建議

## 備註
- 2026-05-14：創建任務，研究數位人最佳實作方式
- 2026-05-22：完成完整研究評估，詳見上方報告
- MP4 模式現階段作為主要方案
- Canvas 2D + A2BS 為即時對口型預設方案
- **推薦下一步**：T047 - 研究 D-ID Streaming API 整合可行性
- **推薦中期目標**：T048 - 3D VRM renderer 實作（A2BS blendshape 可共用）