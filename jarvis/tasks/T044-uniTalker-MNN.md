---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/791
type: Feature
priority: high
status: pending
assignee: OpenCode MinniMax-M2.7
created: 2026-05-13
updated: 2026-05-23
howto: ~/howto
---

# T044 - 數位人口型驅動方案評估

## 目標
讓 JARVIS 的 VRM 3D 數位人（T042）具備**語音驅動的口型同步**能力。
取代目前僅有的「程序化頭部擺動」，升級為真正的音訊 → 臉部表情驅動。

## 輸出型態分類

所有方案的輸出可以分為兩大類：

```
                  輸出型態
          2D 影片/影像              3D blendshape 係數
  ┌────────────────────────┬────────────────────────────┐
  │ LiteAvatar             │                            │
  │ (完整 talking head)    │                            │
  │ ★★ CPU 30fps           │                            │
  │ 但綁 bg_video, 不支援 3D │                            │
  ├────────────────────────┤  UniTalker                 │
  │ Ultralight-Digital-Human│  (53維 blendshape)         │
  │ (完整臉生成)            │  ★★ ECCV2024               │
  │ ★ 需為每人訓練          │  依賴: CUDA (訓練)          │
  ├────────────────────────┤                            │
  │ LivePortrait            │                            │
  │ (diffusion 影片生成)    │                            │
  │ ★★★★★ 最重, Mac難跑     │                            │
  └────────────────────────┴────────────────────────────┘
```

**關鍵**：3D blendshape 可以直接餵給 T042 的 VRM 模型做 facial rigging，
完全不需要 2D 渲染。這是跟 JARVIS 現有架構最契合的路徑。

## 方案完整評估

### 方案 A：UniTalker (X-niper) — 推薦路徑

| 項目 | 內容 |
|------|------|
| **GitHub** | https://github.com/X-niper/UniTalker |
| **Stars** | 237 |
| **論文** | ECCV 2024 |
| **功能** | 音訊 → 53維 FLAME blendshape 係數（jaw pose + 50 expression） |
| **輸出** | `.npz` blendshape 參數（非影片） |

```
  音訊 → wav2vec 特徵 → UniTalker Transformer → 53 blendshape
                                                      ↓
                                             套用到 VRM 骨架
                                                      ↓
                                           真正的口型同步 (T042)
```

**為什麼最適合 JARVIS：**

```
  ┌────────────────────────────────────────────────┐
  │ 我們已經有的：                                   │
  │  pipeline/a2bs_engine.py → 已接 UniTalker-MNN   │
  │  pipeline/jarvis_pipeline.py → _blendshape_to_viseme()  │
  │  前端 hud.html → 已接收 blendshape 訊息           │
  └────────────────────────────────────────────────┘
```

**而且** Alibaba MNN 專案已提供**預轉換好的 UniTalker-MNN 模型**：
  - ModelScope: `MNN/UniTalker-MNN`
  - 直接 `.mnn` 格式，無需自己轉換
  - 可用 MNN Metal backend 在 Mac 上加速

**實作步驟：**
1. 下載 UniTalker-MNN 模型
2. 透過現有 MNN runtime 載入
3. 將 TTS 音訊餵入 → 取得 53-dim blendshape
4. 套用到 VRM 模型 jaw bone / blendshape
5. 升級 `a2bs_engine.py` 為完整 pipeline

**難度：★★★☆☆**

---

### 方案 B：LiteAvatar (HumanAIGC) — 已部分整合

| 項目 | 內容 |
|------|------|
| **GitHub** | https://github.com/HumanAIGC/lite-avatar |
| **Stars** | 454 |
| **功能** | Audio→2D talking head 影片，30fps on CPU |
| **輸出** | **完整臉部影片**（嘴部神經渲染後疊合到背景影片） |

```
音訊 → Paraformer → 32-dim mouth param → net_decode 渲染嘴部
                                              ↓
                                   GaussianBlur 遮罩疊合到 bg_video
                                              ↓
                                          完整 HD 幀
```

**現狀**：JARVIS 已整合 (`renderers/liteavatar/`)，`app.py` 有 `/liteavatar/render` API。

**缺點**：
- 輸出為整段 MP4，無 streaming
- 32 維參數**只控制嘴部**，眉毛/眼神/頭部姿勢固定
- 需預製 avatar 包（`neutral_pose.npy` + `net_encode/decode.pt` + `bg_video.mp4`）
- TorchScript runtime，非 MNN Metal 優化
- 無法與 T042 3D VRM 整合（綁定在 2D 背景影片上）

**難度：★★☆☆☆**（但本質上與 3D VRM 路線不同）

---

### 方案 C：Ultralight-Digital-Human (anliyuan)

| 項目 | 內容 |
|------|------|
| **GitHub** | https://github.com/anliyuan/Ultralight-Digital-Human |
| **Stars** | 2.5k |
| **功能** | 超輕量 UNet 臉生成，可 mobile realtime |
| **限制** | **需為每個人訓練專屬模型**（3-5 min video per person） |

```
訓練：每人拍 3-5 分鐘影片 → wenet/hubert 特徵 → train UNet
推理：音訊 → wenet → UNet → 完整臉部影像
```

**優點**：真的很輕（作者說新版 audio+UNet < 1M params）。
**致命缺點**：需要訓練資料。換一張照片就要重新 train。

不適合 JARVIS 這種通用型助理。

**難度：★☆☆☆☆**（如果有訓練資料）/ **無法通用**

---

### 方案 D：OpenAvatarChat (HumanAIGC-Engineering)

| 項目 | 內容 |
|------|------|
| **GitHub** | https://github.com/HumanAIGC-Engineering/OpenAvatarChat |
| **Stars** | 3.5k |
| **功能** | 完整數位人對話框架（非單一模型） |
| **後端支援** | LiteAvatar / LAM / MuseTalk / FlashHead |

```
OpenAvatarChat 不是「一個模型」，而是整套對話系統：
  ┌─────────────────────────────────────────────┐
  │  VAD → ASR → LLM → TTS → Avatar → WebUI    │
  │  │         │        │     │                 │
  │  silero  SenseVoice API   LiteAvatar       │
  │          /Qwen-Omni     /MuseTalk          │
  │                         /FlashHead          │
  └─────────────────────────────────────────────┘
```

**有趣發現**：專案內有 `extensions/openclaw/oac-bridge/` — 表示已經有 OpenClaw 整合。

**不適合的原因：**
- 太大太重（整套框架）
- 要拆出 Avatar 部分不如直接用原 repo
- 設計給 gradio WebUI，非 JARVIS HUD

**難度：★★★☆☆**（要拆的話）

---

### 方案 E：TaoAvatar-MNN (alibaba/MNN)

| 項目 | 內容 |
|------|------|
| **GitHub** | https://github.com/alibaba/MNN (apps/Android/MnnTaoAvatar) |
| **論文** | arXiv:2503.17032v1 |
| **功能** | Android 全端本地數位人：LLM + ASR + TTS + A2BS + NNR |

```
Android App 內部管線：
  LLM (Qwen2.5-1.5B-MNN)
  ASR (sherpa-mnn-streaming-zipformer)
  TTS (bert-vits2-MNN)
  A2BS (UniTalker-MNN)    ← 我們要的部分
  NNR (TaoAvatar-NNR-MNN)  ← 3D 神經渲染器
```

**重要資源** — 這個專案提供了**所有已轉換好的 MNN 模型**：
- ModelScope: `MNN/UniTalker-MNN` — A2BS blendshape
- ModelScope: `MNN/TaoAvatar-NNR-MNN` — 神經渲染器

**限制**：Android only（需要 Snapdragon 8 Gen 3+），NNR 部分無法直接在 macOS 用。
但 UniTalker-MNN 部分是純 MNN inference，macOS 可用。

**難度：★★★★☆**（NNR porting）/ **★★★☆☆**（僅取 UniTalker）

---

### 方案 F：LivePortrait (原方案，保留做參考)

| 項目 | 內容 |
|------|------|
| **GitHub** | https://github.com/KlingAIResearch/LivePortrait |
| **Stars** | 15k+ |
| **功能** | 照片→音訊驅動說話影片，diffusion-based |
| **平台** | CUDA (NVIDIA)，Mac MPS 相容性差 |

```
原有路線（已擱置）：
  PyTorch LivePortrait → ONNX → MNNConvert → MNN + Metal
  ├─ 路徑一：原生 PyTorch MPS（較簡單但慢，首幀~30s）
  └─ 路徑二：MNN 全轉換（最硬，ONNX op 相容性問題多）
    └─ 路徑三：ComfyUI MPS 版（最快能動但 latency 高）
```

**不推薦原因**：
1. 太重（diffusion model > 1GB），M1/M2 推不動即時
2. 輸出是 2D 影片，我們已經有 3D VRM 模型（T042）
3. 不如直接用 blendshape 驅動 VRM

**難度：★★★★★**

---

## 推薦路線

```
方案 A (UniTalker-MNN) ──── 優先
  ├─ 直接對接 a2bs_engine.py
  ├─ 53 blendshape → VRM facial rig
  ├─ MNN 模型已預轉換好（ModelScope）
  └─ 難度最低, 架構最乾淨

方案 B (LiteAvatar) ──── 已可用
  └─ 現有 fallback（純 2D 嘴部）

方案 F (LivePortrait) ──── 擱置
  └─ 除非需要 diffusion 品質的 2D 影片
```

## 實作步驟（方案 A）

1. 下載 `MNN/UniTalker-MNN` 模型（ModelScope）
2. 升級 `pipeline/a2bs_engine.py`：
   - 載入 UniTalker-MNN 模型
   - 將 TTS 音訊（16kHz mono）轉為 wav2vec 特徵
   - 推理取得 53-dim blendshape
3. 修改前端 hud.html：
   - 接收 blendshape 係數
   - 套用到 VRM 模型的 jaw / eye / brow bones
4. 測試口型同步品質

## 驗收標準
- [x] 方案評估完成（2026-05-23）：6 方案比較
- [ ] 下載 UniTalker-MNN 模型
- [ ] A2BS engine 升級，輸出 53 blendshape
- [ ] blendshape 成功驅動 VRM 模型臉部
- [ ] TTS → 口型同步端到端驗證
- [ ] 與 LiteAvatar 方案品質對比

## 備註
- 目標平台：macOS (Apple Silicon M1/M2/M3/M4)
- 依賴：T042 (VRM 3D，已完成)、T005 (TTS，已完成)
- JARVIS 現有 `a2bs_engine.py` 是此方案的基礎
- MNN Metal backend 已編譯（見 `MNN/build/`）

## 參考連結
- UniTalker: https://github.com/X-niper/UniTalker
- LiteAvatar: https://github.com/HumanAIGC/lite-avatar
- Ultralight-DH: https://github.com/anliyuan/Ultralight-Digital-Human
- OpenAvatarChat: https://github.com/HumanAIGC-Engineering/OpenAvatarChat
- TaoAvatar (MNN): https://github.com/alibaba/MNN/tree/master/apps/Android/MnnTaoAvatar
- LivePortrait: https://github.com/KlingAIResearch/LivePortrait
