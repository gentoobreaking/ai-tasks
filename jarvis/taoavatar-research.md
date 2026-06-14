# TaoAvatar 核查研究報告（2026-05-13）

## 核查結果

### ✅ TaoAvatar 確實存在
- **Repo**：`alibaba/MNN`（正確路徑，非 `tencent/MNN`）
- **位置**：`alibaba/MNN/apps/Android/MnnTaoAvatar/`
- **新聞公告**：[2025/06/11] MNN TaoAvatar released

### TaoAvatar 技術棧
| 模組 | 說明 |
|------|------|
| LLM | Qwen2.5 本地推理 |
| ASR | 語音轉文字（sherpa-mnn） |
| TTS | bert-vits2-MNN 語音合成 |
| A2BS | Audio-to-BlendShape 口型驅動 |
| NNR | Neural Neural Rendering 神經渲染 |

### 硬體需求
- Snapdragon 8 Gen 3 等級（等於 Mac M2 級別）
- 8GB+ RAM
- 5GB 磁碟空間

### ⚠️ 重大限制
**目前僅支援 Android**。iOS/Mac 版本「coming later, stay tuned」。

## 正確 Repo 確認
- `alibaba/MNN` ✅（正確）
- `tencent/MNN` ❌（不存在）

## 模型下載（ModelScope）
- https://modelscope.cn/collections/TaoAvatar-68d8a46f2e554a
- UniTalker-MNN（A2BS）、TaoAvatar-NNR-MNN（NNR）、bert-vits2-MNN（TTS）