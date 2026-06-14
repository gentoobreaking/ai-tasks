---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/743
title: T008-MNN 模型回應加速
type: Performance
priority: high
status: done
assignee: 寶寶
created: 2026-05-13
updated: 2026-05-13
depends: T002
howto: 
---

# T008 - MNN 模型回應加速（M2 Metal 優化）

## Description

目前 JARVIS 回應延遲約 60-90 秒（M2 MacBook Air），需要優化至 < 5 秒。

## Root Cause Analysis

- 目前使用 Apple Silicon CPU SIMD（i8sdot, fp16, i8mm 指令集）
- Neural Engine（ANE）未被 MNN MLLM 使用（`is_visual: true` 模型）
- 原因：VL 模型架構複雜，MNN 對 ANE 加速支援有限

## Acceptance Criteria

- [ ] 確認 MNN.llm 是否支援 ANE 後端（`set_config(backend="ane")`）
- [ ] 或改用純文字 MNN 模型（移除視覺模組），降低推論複雜度
- [ ] 回應延遲 < 5 秒（M2 本機 bench test）
- [ ] benchmark 腳本完成：`scripts/benchmark.py`

## Solutions

1. **方案A**：純文字模型替換（推薦）
   - 將 Qwen3.5-0.8B-VL 換成 Qwen3.5-0.8B-Text-MNN
   - 純文字推論更輕量，ANE 支援更好

2. **方案B**：ANE 後端啟用
   - `llm.set_config(backend="ane")`
   - 需要 MNN 編譯時開啟 ANE 支援

3. **方案C**：Streaming 输出
   - 即時 streaming 回應（typewriter 效果）
   - 降低感知延遲

## Notes

- 測試指令：`time python3 brain/brain_engine.py`
- bench 目標：< 5 秒 for 100 tokens（M2）
