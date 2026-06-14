---
github_issue:https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/747
type: pending
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-13
updated: 2026-05-13
howto: build-mnn-metal.md
---

# T012 - MNN Metal 後端啟用與版本更新

## 目標
啟用 MNN Metal 後端加速 Qwen 模型推理，更新 MNN 至最新版以獲得 Metal linear attention 優化與 Sampler pipeline 重構效益。

## 背景
目前 `models_qwen1.5/config.json` 和 `models/config.json` 的 `backend_type` 為預設 `"cpu"`，未使用 M2 GPU。MNN 上游於 2026/04 合併了 Metal linear attention 重大優化（commit 2d4a17b），以及 Sampler pipeline 重構（commit a9024d9，支援 penalty/frequency_penalty）。

## 驗收標準
- [ ] 將 MNN 更新至包含 Metal linear attention 優化的最新版
- [ ] `models_qwen1.5/config.json` 的 `backend_type` 改為 `"metal"`
- [ ] `models/config.json` 的 `backend_type` 改為 `"metal"`
- [ ] 執行 `tests/test_pipeline.py` 確認 text mode 正常運作且推理速度有提升
- [ ] 記錄 Metal vs CPU 的推理速度 benchmark 數據

## 備註
- Metal 後端對 thread_num 不敏感，可維持 4
- 需確認 MNN Python binding 也需重新編譯以匹配新版 MNN
- 更新 MNN 時注意 `git pull` 後需重新執行 `setup-mnn.sh` 或手動 `ninja -j4`
- 若 Metal 後端有相容性問題，可保留 `"cpu"` 作為 fallback