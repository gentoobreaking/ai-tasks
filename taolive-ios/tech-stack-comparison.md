# TaoLive-iOS 技術棧評比

## 專案目標
將 MNN TaoAvatar（Android 數位人）移植到 iOS，實現本地即時數位人。

---

## 一、主要技術棧（已選擇）

| 功能 | 技術 | 版本 | 選擇原因 |
|------|------|------|---------|
| AI 推理框架 | MNN | 3.9+ | 與 TaoAvatar 一致，支援 iOS/Android，效能優異 |
| ASR 語音辨識 | Sherpa-ONNX | latest | 完全離線、支援多語言、iOS 支援好 |
| TTS 語音合成 | Kokoro-ONNX | latest | 高品質離線 TTS、模型小 |
| 影片處理 | AVFoundation | iOS 15+ | Apple 原生框架，整合簡單 |
| 3D 渲染 | SceneKit + Metal | iOS 15+ | Apple 原生，PBR 支援，硬體加速 |
| 臉部追蹤 | ARKit Face Tracking | iOS 11+ | Apple 原生，52 BlendShapes |
| 身體追蹤 | Vision Body Pose | iOS 14+ | Apple 原生，無須額外模型 |
| 手勢追蹤 | Vision Hand Pose | iOS 14+ | Apple 原生，21 個關鍵點 |

### 為何選擇 MNN？
- 與 TaoAvatar Android 同一框架，模型可直接复用
- 支援 iOS/Android/HarmonyOS 多平台
- 推理效能優於 ONNX Runtime
- 內建模型轉換工具 (MNNConvert)

### 為何選擇 Sherpa-ONNX？
- 完全離線運行，隱私安全
- 支援 Whisper 模型（多語言）
- 有 MNN 後端版本
- 模型可量化壓縮 (INT8)

### 為何選擇 Kokoro-ONNX？
- 比 GPT-SoVITS 更輕量
- 完全離線，延遲低
- 支援 19 種聲音風格

### 為何選擇 SceneKit + Metal？
- Apple 原生，效能最佳
- SceneKit 適合快速開發
- Metal 可自訂著色器（PBR/皮膚）
- 與 ARKit/Vision 整合無縫

---

## 二、替代技術棧

### 1. AI 推理框架

| 技術 | 優點 | 缺點 | 適用場景 |
|------|------|------|---------|
| MNN (選擇) | 效能最佳、與 Android 一致 | 生態較小 | 需要與 Android 共享模型 |
| ONNX Runtime | 生態大、模型多 | 效能略差 | 快速原型、模型多 |
| CoreML | Apple 原生、效能好 | 模型轉換麻煩 | 純 iOS 開發 |
| TensorFlow Lite | 生態大、工具成熟 | 推理較慢 | Android 兼容性 |
| MediaPipe (iOS) | 功能完整、Google 維護 | 封裝重 | Google 生態專案 |

### 2. ASR 語音辨識

| 技術 | 優點 | 缺點 | 適用場景 |
|------|------|------|---------|
| Sherpa-ONNX (選擇) | 完全離線、多語言 | 模型较大 (75MB+) | 離線優先 |
| Whisper.cpp | 模型小、快速 | 準確率較低 | 資源受限設備 |
| Vosk | 輕量、快速 | 準確率一般 | 快速原型 |
| Coqui STT | 开源、模型多 | iOS 整合複雜 | 研究用途 |
| Google Speech-to-Text | 準確率高 | 需要網路 | 雲端方案 |

### 3. TTS 語音合成

| 技術 | 優點 | 缺點 | 適用場景 |
|------|------|------|---------|
| Kokoro-ONNX (選擇) | 高品質、離線、模型小 | 聲音風格有限 | 離線優先 |
| GPT-SoVITS | 聲音複製能力強 | 資源需求高 | 聲音複製 |
| Coqui TTS | 开源、多語言 | 整合複雜 | 研究用途 |
| Azure TTS | 高品質、自然 | 需要網路 | 雲端方案 |
| AVSpeechSynthesizer | Apple 原生、完全離線 | 品質一般 | 快速原型 |

### 4. 3D 渲染引擎

| 技術 | 優點 | 缺點 | 適用場景 |
|------|------|------|---------|
| SceneKit + Metal (選擇) | Apple 原生、效能好 | 自訂著色器複雜 | 快速開發 |
| RealityKit | Apple 原生、AR 強 | 功能較封閉 | AR 應用 |
| Unity | 生態完整、工具多 | 打包大、授權 | 跨平台 |
| Godot | 开源、輕量 | iOS 支援一般 | 开源專案 |

---

## 三、技術棧組合評比

### 方案 A：完全離線（當前選擇）

```
MNN + Sherpa-ONNX + Kokoro-ONNX + SceneKit/Metal
```

| 項目 | 評估 |
|------|------|
| 隱私 | ⭐⭐⭐⭐⭐ 完全離線 |
| 延遲 | ⭐⭐⭐⭐ 本地推理 |
| 模型大小 | ⭐⭐⭐ 150-500MB |
| 開發難度 | ⭐⭐⭐ 中等 |
| iOS 相容性 | ⭐⭐⭐⭐⭐ 原生支援 |

### 方案 B：雲端混合

```
ONNX Runtime + Whisper API + Azure TTS + SceneKit
```

| 項目 | 評估 |
|------|------|
| 隱私 | ⭐⭐ 數據上雲 |
| 延遲 | ⭐⭐⭐ 依賴網路 |
| 模型大小 | ⭐⭐⭐⭐ 較小 |
| 開發難度 | ⭐⭐⭐⭐ 簡單 |
| 費用 | ⭐⭐ API 收費 |

### 方案 C：CoreML 純 iOS

```
CoreML + Whisper CoreML + AVSpeech + RealityKit
```

| 項目 | 評估 |
|------|------|
| 隱私 | ⭐⭐⭐⭐⭐ 完全離線 |
| 延遲 | ⭐⭐⭐⭐ 本地推理 |
| 模型大小 | ⭐⭐⭐ 需轉換 |
| 開發難度 | ⭐⭐ 模型轉換複雜 |
| iOS 相容性 | ⭐⭐⭐⭐⭐ 最佳 |

### 方案 D：預製影片（最簡單）

```
AVFoundation + 預製 MP4 + 簡單動畫
```

| 項目 | 評估 |
|------|------|
| 隱私 | ⭐⭐⭐⭐⭐ 本地 |
| 延遲 | ⭐⭐⭐⭐⭐ 即時播放 |
| 模型大小 | ⭐⭐⭐⭐⭐ 無 ML 模型 |
| 開發難度 | ⭐ 最簡單 |
| 功能限制 | ⭐⭐ 無法客製化回應 |

---

## 四、技術選型決策樹

```
是否需要完全離線？
├─ 是 → 是否有 MNN 模型？
│   ├─ 是 → 方案 A (MNN + Sherpa + Kokoro)
│   └─ 否 → 方案 C (CoreML)
└─ 否 → 是否在乎費用？
    ├─ 否 → 方案 B (雲端 API)
    └─ 是 → 方案 A (離線) 或 D (影片)
```

---

## 五、開發設備相容性

### 當前設備
- **晶片**: Apple M2 (arm64)
- **系統**: macOS 26.4
- **開發工具**: Xcode (安裝中)

### 技術棧相容性

| 技術 | M2 Mac 開發 | 模擬器 | 真機 iOS |
|------|-------------|--------|----------|
| MNN | ✅ | ✅ | ✅ |
| Sherpa-ONNX | ✅ | ✅ | ✅ |
| Kokoro-ONNX | ✅ | ✅ | ✅ |
| AVFoundation | ⚠️ 需要 Xcode | ✅ 影片/音訊 | ✅ 完全 |
| SceneKit | ⚠️ 需要 Xcode | ✅ | ✅ |
| Metal | ⚠️ 需要 Xcode | ⚠️ 部分 | ✅ |
| ARKit | ❌ | ⚠️ 部分 | ✅ |
| Vision | ✅ | ✅ | ✅ |

### 功能開發環境

| 功能 | 模擬器 | 真機 |
|------|--------|------|
| 麥克風錄音 | ❌ | ✅ |
| 相機擷取 | ❌ | ✅ |
| 臉部追蹤 (ARFaceTracking) | ❌ | ✅ |
| 手勢追蹤 (Vision Hand Pose) | ✅ | ✅ |
| 身體追蹤 (Vision Body Pose) | ⚠️ 部分 | ✅ |
| 臉部表情 (ARKit BlendShapes) | ❌ | ✅ |
| 揚聲器播放 | ✅ | ✅ |

### 任務環境需求

| 任務 | 環境需求 |
|------|---------|
| T01-T09 研究階段 | CommandLineTools |
| T11-T15 環境建置 | 需要 Xcode |
| T14, T16, T17 音影片 | 模擬器/真機 |
| T24 手勢追蹤 | 模擬器 ✅ |
| T25 臉部追蹤 | 真機必要 ❌ |
| T26 身體追蹤 | 模擬器 ⚠️ |
| T30-T41 渲染開發 | 需要 Xcode |
| T55 Beta 發布 | 真機或 Firebase |

### 開發建議

1. **初期 (T01-T15)**：安裝 Xcode 後可在模擬器開發大部分功能
2. **中期 (T16-T29)**：需要真機測試相機/麥克風/臉部追蹤
3. **真機測試替代方案**：Firebase App Distribution (不需要 Developer 帳號)

---

## 六、相關任務對應

| 技術 | 任務 |
|------|------|
| MNN | T12, T13, T21 |
| Sherpa-ONNX | T19, T21 |
| Kokoro-ONNX | T20, T23 |
| AVFoundation | T14, T16, T17 |
| SceneKit/Metal | T30, T31, T32 |
| ARKit | T25 |
| Vision | T24, T26 |

---

## 七、總結

**當前選擇：方案 A（完全離線）**

原因：
1. 與 TaoAvatar 技術一致，模型可直接复用
2. 完全離線，保護隱私，無網路依賴
3. Apple 原生框架效能最佳
4. 可延續 JARVIS 專案經驗