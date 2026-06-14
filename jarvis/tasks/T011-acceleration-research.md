---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/746
title: T011-加速方案調研
type: Research
priority: low
status: done
assignee: 研研
created: 2026-05-13
updated: 2026-05-13
depends: T008（MNN 回應加速已立項）
---

# T011 - 加速方案調研

## 目標

系統性調研 MNN-LLM 推理加速方案，找出讓回應時間從 60-90 秒降至 < 5 秒的可行路徑。

## 背景

- **現況**：Qwen3.5-0.8B-MNN 推理耗時 60-90 秒（含思考 token）
- **目標**：< 5 秒（互動式體驗門檻）
- **瓶頸**：MNN Metal 推理速度不足

## 調研方向

### 1. 模型層面
- [ ] Qwen1.5-0.5B 實測推理速度（已部分驗證，目標 < 1 秒）
- [ ] 更小量化版本（int2 / int3）
- [ ] 移除視覺模組（VL → LLM-only）是否加速
- [ ] FlashAttention / GGML 量化替代方案

### 2. 推理引擎層面
- [ ] MNN Metal vs CPU performance profile（確認 GPU 是否真的被用上）
- [ ] llama.cpp 作為替代推理引擎（Mac GPU 支援更好）
- [ ] MLX（Apple Silicon 原生加速）

### 3. 架構層面
- [ ] Streaming output（邊推理邊輸出，不等完整 response）
- [ ] Speculative decoding（小模型預測，大模型驗證）
- [ ] KV Cache / Prompt caching

### 4. 已知有效方案
- [ ] Qwen1.5-0.5B：實測 0.09-0.32 秒 ✅（需全流程串接驗證）
- [ ] 關閉思考模式（`thinking: false`）：可減少大量 token 生成

## 調研記錄

（每次發現新線索，補記在這裡）

## 結論

（調研完成後，摘要在此）

---

## 驗收條件

- [ ] 至少找到 2 種可行加速方案
- [ ] 每種方案有初步 Benchmark 數據
- [ ] 產出 `howto/mnn-acceleration-research.md`
- [ ] 推薦最優方案，更新 T008 的描述
