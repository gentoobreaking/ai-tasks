---
github_issue:https://github.com/gentoobreaking/ai-tasks/issues/787
type: Feature
priority: high
status: done
assignee: OpenCode MinniMax-M2.7
created: 2026-05-13
updated: 2026-05-13
howto: ~/howto
---

# T040 - Hugging Face 圖像生成技能

## 目標
建立 `hf_image_gen` skill，透過 Hugging Face API 生成超寫實真人全身圖像。

## 功能
1. **FLUX.1 text-to-image**：使用 FLUX.1-schnell 或 FLUX.1-dev 生成寫實圖像
2. **InstantID 臉部參考**：給定人臉範例圖，保持同樣人臉生成新全身圖
3. **Outpainting 影像延伸**：對現有圖像進行外擴延伸

## 實作內容

### 檔案
- `skills/hf_image_gen/SKILL.md`
- `skills/hf_image_gen/execute.py`

### 設定
在 `~/.jarvis_config.json` 加入：
```json
{
  "hf_image_gen": {
    "api_token": "你的_HF_TOKEN",
    "default_model": "schnell"
  }
}
```

## 驗收標準
- [ ] `pip install gradio_client pillow` 安裝依賴
- [ ] 設定 `HF_TOKEN` 在 `~/.jarvis_config.json`
- [ ] `FLUX: A photorealistic full-body shot of a young woman...` 生成圖像
- [ ] `InstantID: ... | face: /path/to/face.jpg` 以臉部參考生成
- [ ] `Outpaint: ... | image: /path/to/halfbody.jpg` 延伸圖像
- [ ] 確認輸出為 base64 PNG 格式

## 使用範例
```
使用者：FLUX: A photorealistic full-body shot of a 25-year-old Taiwanese woman standing on a Taipei street, head-to-toe view, 35mm lens
JARVIS：[IMAGE_DATA]:iVBORw0...

使用者：InstantID: A professional business portrait | face: /Users/claw/photo.jpg
JARVIS：[IMAGE_DATA]:iVBORw0...
```

## 備註
- InstantID 和 Outpainting 需要 Hugging Face 帳號（token）
- 若無法取得 HF 帳號，可使用 pollinations_gen 作為替代方案
- 純文字生成可直接使用 pollinations_gen（已實作）