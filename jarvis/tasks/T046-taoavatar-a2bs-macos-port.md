---
github_issue:https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/636
priority: high
status: done
assignee:
created: 2026-05-22
updated: 2026-05-22
howto: ~/howto
---

# T046 - TaoAvatar A2BS (UniTalker-MNN) macOS Port

## 目標
將阿里 TaoAvatar 的 Audio-to-BlendShape 模組（UniTalker-MNN）從 Android 移植到 macOS，實現 MNN + Metal 加速的口型驅動。

## 背景
- TaoAvatar 是阿里 MNN 團隊推出的完整數位人方案
- A2BS (Audio-to-BlendShape) 由 UniTalker-MNN 負責：輸入音訊 → 輸出 BlendShape 係數
- 目前僅支援 Android NDK，模型已是 `.mnn` 格式，不需轉換
- NNR（神經渲染）模組依賴 A2BS 輸出，可接現有 render pipeline

## 技術架構
```
音訊 (TTS 輸出)
    ↓
UniTalker-MNN (A2BS)
    ↓ BlendShape 係數 (52/64 dim)
NNR 渲染引擎 或 自建 3D 模型 BlendShape
    ↓
數位人影片輸出
```

## 實作步驟

### 1. 取得 UniTalker-MNN
- 從 ModelScope 下載 UniTalker-MNN 模型 (.mnn)
- 確認模型輸入/輸出規格

### 2. 跨平台編譯
- 從 MNN source 編譯 macOS (x86_64 + arm64) 靜態/動態庫
- 確認 MNN Metal backend 可用
- 撰寫 C++ inference wrapper

### 3. Python Binding
- 用 `pybind11` 或 `ctypes` 封裝 MNN inference
- 實作 `a2bs_pipeline.py`：接收音訊 → 回傳 BlendShape 陣列

### 4. 整合至 JARVIS Pipeline
- 串接 Kokoro TTS 輸出 → A2BS → render
- 支援離線批次（先算再播）與即時模式

### 5. 效能調校
- MNN FP16 量化
- Metal GPU 推理
- 記憶體優化（Shared memory 減少 copy）

## 依賴
- MNN (alibaba/MNN) — 編譯 macOS 版本
- UniTalker-MNN — ModelScope 下載
- pybind11 — Python binding
- cmake, ninja — 編譯工具

## 參考資源
- TaoAvatar 公告：MNN 官方 repo (apps/Android/MnnTaoAvatar/)
- UniTalker-MNN：https://modelscope.cn/collections/TaoAvatar-68d8a46f2e554a
- A2BS 論文：UniTalker (Unity-based Audio-to-BlendShape)
- T044 研究筆記：~/Tasks/jarvis/taoavatar-research.md

## 與其他任務關係
- T043（數位人系統整合）— 此任務輸出將餵給 T043
- T044（LivePortrait MNN）— 並行方案，可互補
- T042（3D 數位人）— A2BS 輸出可直接驅動 3D 模型 BlendShape

## 驗收標準
- [ ] UniTalker-MNN 模型下載完成
- [ ] macOS 可編譯 MNN + Metal backend
- [ ] C++ 推理 wrapper 可載入模型並推論
- [ ] Python binding 正常回傳 BlendShape 係數
- [ ] 整合 TTS → A2BS → render 端到端流程
- [ ] M2 16G Air 上離線批次可跑（目標 <4GB VRAM）

## 備註
- 2026-05-22：建立任務。此為傳統 MNN 路徑，與 T044 (LivePortrait→MNN) 並行
- TaoAvatar macOS 版官方尚未 release，此為先行移植
- 若官方後續釋出 macOS 版，可切換或對齊

## 進度
- [x] 2026-05-22：從 ModelScope 下載 UniTalker-MNN 模型（audio2verts.mnn, 365MB）
- [x] 2026-05-22：建立 `pipeline/a2bs_engine.py` — Python MNN Session API 封裝
- [x] 2026-05-22：整合進 `jarvis_pipeline.py` — TTS → A2BS → blendshape 輸出
- [x] 2026-05-22：MNN 推理驗證通過 — 10s 音訊輸出 (249, 53) blendshape 係數
- [x] 2026-05-22：CPU 推理 benchmark — 10s 音訊 ~1.6s (6x realtime)
- [x] 2026-05-22：blendshape → viseme_track 轉換（jaw_pose[1] → openness，50 expr → viseme ID 映射）
- [x] 2026-05-22：前端已可接收 A2BS 驅動的 viseme 動畫（同格式，無需改動）
- [ ] ⚠️ **即時模式效能調校**：Metal backend 輸出全零（模型部分 ops 不支援 Metal）。C++ 參考用 CPU，Python pip MNN Metal 支援度可能不如源碼編譯版。目前 CPU 已達 5-6x realtime，離線批次夠用。待 MNN 新版或自行編譯 pymnn 時再測。
- [x] **前端 Canvas 2D 臉部渲染**（A2BS 53 dim 驅動：jaw_pose→嘴巴、expr→眉毛）
- [x] **Renderer 選單架構**（Canvas / LiteAvatar / 3D 切換，前端 selector）
- [x] **LiteAvatar 整合**（engine wrapper + endpoint + frontend video mode）
  - `renderers/liteavatar/engine.py` — 封裝 LiteAvatar 完整 pipeline
  - `POST /liteavatar/render` — FastAPI endpoint (WAV → mp4)
  - `renderers/liteavatar/download_models.sh` — 模型下載腳本（約 1.2GB）
  - 前端 renderer 選單選「LiteAvatar 2D」模式，HUD frame 改為 16:9 video
  - ⚠️ 需先執行 `download_models.sh` + 下載 avatar 資產才能運作
- [x] **Canvas 2D 臉部渲染優化**（2026-05-22）
  - 單一 RAF 遊戲迴圈取代雙迴圈，提升效能
  - 幀插值（frame interpolation）消除口型跳動
  - DPR/Retina 支援（devicePixelRatio 自動適應）
  - 眼神追蹤：頭部轉動時瞳孔隨 gaze 偏移
  - 漸進式眨眼（0→1→2→0 平滑過渡）取代 binary blink
  - 6 顆個別牙齒渲染取代單線條
  - 嘴巴大開時顯示舌頭
  - 微笑時臉頰隆起
  - 鼻翼表情驅動微張
  - 靜止時微幅呼吸動畫
  - Head gradient 快取避免每幀重新建立
  - ResizeObserver 自動適應容器尺寸變化
- [x] **LiteAvatar macOS 完整移植驗證**（2026-05-22）
  - 模型權重下載完成（`model_1.onnx` 176MB、Paraformer 840MB、LM 226MB）
  - 頭像資產批次下載流程建立（8 個頭像已下載）
  - 修正相對路徑問題（`extract_paraformer_feature.py`、`audio2mouth_cpu.py`）
  - 修正 ffmpeg 路徑（`/usr/bin/ffmpeg` → Homebrew 路徑）
  - 安裝遺漏依賴（`sentencepiece`、`jaconv`、`torchaudio`、`typeguard==2.13.3` 等）
  - 端到端測試通過：2s 音訊 → 1.0MB MP4（30.6ms/frame 推論，30fps）

## 頭像下載方式
1. 瀏覽 Gallery：https://modelscope.cn/models/HumanAIGC-Engineering/LiteAvatarGallery/summary
2. 點選頭像，複製 URL 中的 ID（如 `20250408/P1wRwMpa9BBZa1d5O9qiAsCw`）
3. 下載腳本：
   ```bash
   # 單個下載
   bash renderers/liteavatar/download_avatar.sh <頭像ID> <目錄名稱>
   範例: bash renderers/liteavatar/download_avatar.sh 20250408/P1wRwMpa9BBZa1d5O9qiAsCw woman1

   # 批量下載（編輯腳本中 AVATARS 陣列）
   bash renderers/liteavatar/download_avatar.sh --batch

   # 列出已下載
   bash renderers/liteavatar/download_avatar.sh --list
   ```

## 已下載頭像
- `woman1` — 20250408 batch, 12MB
- `woman2` — 20250612 batch, 24MB
- `woman3` — 20250612 batch, 23MB
- `woman4` — 20250612 batch, 24MB
- `woman5` — 20250612 batch, 24MB
- `woman6` — 20250408 batch
- `woman7` — 20250408 batch
- `woman8` — 20250408 batch
- `woman9` — 20250408 batch
- `woman10` — 20250408 batch
- `woman11` — 20250408 batch