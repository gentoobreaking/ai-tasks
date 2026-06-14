---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/741
title: T006-口型同步測試與記憶體優化驗證
type: Verification
priority: high
status: done
assignee: 樂樂
created: 2026-05-13
updated: 2026-05-13
depends: T003, T004
howto: [howto/qwen-model-switch.md](../../howto/qwen-model-switch.md)
---

# T006 - 口型同步測試與記憶體優化驗證

## Description

驗證數位人 口型同步（Audio-to-BlendShape）的流暢度與正確性，
並在 MacBook Air M2 記憶體限制下做效能優化。

## Acceptance Criteria

- [ ] 數位人影片幀 ≥ 25 FPS（M2 需維持）
- [ ] 口型同步延遲 < 200ms（音訊到嘴型變化的時間差）
- [ ] 記憶體峰值 < 12GB（MacBook Air M2 限制）
- [ ] 口型驅動結果：說話時嘴巴自然開合，停止時嘴巴靜止
- [ ] 記憶體監控脚本每 5 秒輸出 RSS（`scripts/monitor_mem.sh`）
- [ ] 記憶體超過 12GB 自動降頻或降解析度（Fallback 機制）
- [ ] 多人測試（3 人以上）無崩潰

## 離線方案約束（2026-05-13，David 確認）

**原則**：完全本地推理，不依賴任何外部服務（KlingAI 等全部排除）。

### 優先實作順序

#### Phase 1：UniTalker-MNN ✅（首選）
- 位置：`alibaba/MNN/internal/UniTalker/`
- 優勢：MNN 量化，端到端，Mac M2 Metal 加速
- 缺點：需確認 Mac M2 支援度

#### Phase 2：Wav2Lip（本地位移）
- 技術：音頻 → 嘴型 bounding box → 唇形替換
- 優勢：完全離線，效果穩定
- 缺點：需要 Python + PyTorch + 預訓練模型

#### Phase 3：簡單 2D 疊加（最快上線）
- 技術：音頻強度 → 嘴巴圖層 CSS scale/opacity 動畫
- 優勢：零模型，JS/CSS 即可，延遲極低
- 缺點：無真實口型，只是簡單動畫
- 用途：早期原型驗證，快速確認流水線連通

### 驗收重點
- Phase 1/2 需實際模型權重（磁碟空間評估）
- Phase 3 可先行（前端 HUD 可同步開發）
- 口型同步延遲 < 200ms（Phase 1/2 挑戰，Phase 3 無此問題）

## Notes

- 數位人來源：TaoAvatar 的 A2BS（Audio-to-BlendShape）模組
  位置：`alibaba/MNN/apps/Android/MnnTaoAvatar/`
- 備選方案：FasterLivePortrait（ONNX）或 Wav2Lip
- 參考 `monitor_mem.sh` 模板在 T006 任務檔中已記錄
