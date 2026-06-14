---
github_issue:https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/750
type: pending
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-13
updated: 2026-05-13
howto: build-mnn-metal.md
---

# T015 - MNN 記憶體與推理效能優化

## 目標
透過 MNN config.json 進階參數調整，在 16GB M2 Mac 上最佳化記憶體使用與推理效能。

## 背景
- MNN Metal 後端記憶體佔用比 MLX 高（Qwen3-4B 約 3.8GB vs 2.3GB），16GB Mac 需謹慎管理
- 上游文件提供多項記憶體優化參數：`use_mmap`、`attention_mode`、`chunk`、`quant_qkv`
- Flash Attention（`attention_mode: 8/16`）可降低 KV cache 記憶體佔用
- `reuse_kv` 可避免多輪對話重複計算

## 驗收標準
- [ ] `models_qwen1.5/config.json` 加入 `"reuse_kv": true`
- [ ] `models_qwen1.5/config.json` 加入 `"attention_mode": 8`（Metal Flash Attention）
- [ ] 兩個模型的 config.json 加入 `"use_mmap": true`
- [ ] 測試長對話（10+ 輪）確認記憶體不會持續增長
- [ ] 記錄優化前後的峰值記憶體使用量

## 備註
- `attention_mode: 16` 記憶體最小但速度稍慢，可先試 `8`
- `use_mmap: true` 在手機上標準建議，Mac 上也可受益
- 若 `"memory": "low"` 導致 Qwen 輸出亂碼（已知 issue #4346），可改回 `"normal"`
- Qwen3.5 系列在 low memory 下表現較好（上游建議）