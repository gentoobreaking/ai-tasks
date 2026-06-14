---
github_issue:https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/788
type: pending
priority: high
status: done
assignee: OpenCode MinniMax-M2.7
created: 2026-05-13
updated: 2026-05-13
howto: ~/howto
---

# T041 - Pollinations 免費圖像生成技能

## 目標
建立 `pollinations_gen` skill，透過 pollinations.ai 完全免費生成超寫實真人全身圖像，**不需要 API token**。

## 功能
- 文字生成圖像（Text-to-Image）
- 支援多种开源模型（FLUX, SDXL, Turbo）
- 完全免費、無限使用、不需要設定

## 實作內容

### 檔案
- `skills/pollinations_gen/SKILL.md`
- `skills/pollinations_gen/execute.py`

### API
使用 `https://image.pollinations.ai/prompt/{encoded_prompt}`

## 驗收標準
- [ ] `python3 skills/pollinations_gen/execute.py` 直接測試
- [ ] `pip install pillow requests` 安裝依賴（通常已安裝）
- [ ] `pollinations_gen` 能被 JARVIS skill 系統自動發現
- [ ] 生成的圖像為有效 PNG 格式

## 使用範例
```
使用者：生成一張寫實全身照，年輕女性在台北街頭
JARVIS：[IMAGE_DATA]:iVBORw0...

使用者：FLUX 風格，穿著休閒時尚 | model: flux
JARVIS：[IMAGE_DATA]:iVBORw0...
```

## 與 hf_image_gen 的差異
| | pollinations_gen | hf_image_gen |
|---|---|---|
| 費用 | 完全免費 | 需要 HF token |
| 設定 | 不需要 | 需要設定 api_token |
| 模型 | FLUX, SDXL, Turbo 等 | FLUX.1-schnell/dev, InstantID, Outpainting |
| 穩定性 | 依賴公共服務 | 官方 Inference API |
| 人臉維持 | 差（純文字） | 好（InstantID） |

## 備註
- pollinations.ai 是社群維護的免費服務，可能有頻寬限制
- 不需要任何設定即可使用