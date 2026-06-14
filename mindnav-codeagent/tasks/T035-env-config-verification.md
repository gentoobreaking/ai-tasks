---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/539
title: T035 - 環境變數配置與本地 LLM 端點驗證
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: verify
---

# T035 - 環境變數配置與本地 LLM 端點驗證

## 目標
Review 發現 `.env` 存在但多為 placeholder 值，且 T001 的推理伺服器尚未實際啟動驗證。需完成以下：

1. 補全 `.env` 配置（LOCAL_LLM_URL、TELEGRAM_BOT_TOKEN、TAVILY_API_KEY 等）
2. 驗證推理伺服器（llama-cpp-python）能正常啟動並回應
3. 確認所有 Agent 角色能透過 LLMFactory 正確連接到推理後端

## 驗收標準
- [x] `.env` 中所有必要變數已填寫而非預設值
- [x] `LOCAL_LLM_URL=http://localhost:8000/v1` 端點可回應 `/v1/models`
- [x] `scripts/start_all.sh` 可成功啟動推理伺服器
- [x] 多個 Agent 角色（PM/Coder/Doc）共用同一推理端點時不互相阻塞
- [x] 更新 `.env.example` 確保與實際 `.env` 變數一致

## 備註
- 推理伺服器啟動命令參考：`python3 -m llama_cpp.server --model models/qwen2.5-coder-7b-instruct.Q4_K_M.gguf --n_gpu_layers -1 --host 0.0.0.0 --port 8000 --n_slots 4`
- 需確保 GPU/MPS 加速正常
