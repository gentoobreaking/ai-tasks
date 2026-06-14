---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/523
title: T021 - 全系統功能驗證框架 (System Verification Framework)
type: Feature
priority: high
status: done
assignee: gemini-cli
created: 2026-05-15
updated: 2026-05-18
---

# T021 - 全系統功能驗證框架

## Description
建立自動化測試套件，針對 Agent 協作、RAG 檢索、安全性、與持久化機制進行系統級驗證。

## 驗證矩陣 (Verification Matrix)

| 功能模組 | 驗證事項 (Verification Item) | 驗證方法 (How to Verify) |
| :--- | :--- | :--- |
| **LLM 工廠** | 引擎後端切換 (Ollama vs vLLM) | 透過 `.env` 切換 URL 並驗證模型回應 |
| **Supervisor** | 工作流路徑規則驗證 (Workflow Routing) | 運行 `test_supervisor.py` 檢查節點流轉合法性 |
| **知識庫 RAG** | AST 切分正確性 (Python/JS) | 檢索特定函數定義，驗證片段是否完整 |
| **知識庫 RAG** | 增量同步與過濾機制 | 修改 `src/` 檔案後，檢查 Chroma 更新狀況 |
| **記憶管理** | Thread 隔離 (Thread ID 驗證) | 同時在兩群組對話，確保記憶不混淆 |
| **記憶管理** | 自動化摘要修剪 (Pruning) | 對話超過 15 條，檢查 Redis 狀態是否壓縮 |
| **安全沙盒** | 指令白名單檢查 | 呼叫 `SafeShell` 執行 `rm -rf` 應被攔截 |
| **Git 審查** | Pre-commit 攔截邏輯 | 提交含有 Bug 的代碼，驗證 commit 被中止 |
| **部署架構** | Docker 多進程健康監控 | 驗證 `start_all.sh` 能正確清理子進程 |
| **分散式 Coder** | Worker 佇列接收 | 推送任務到 `coding_task_queue`，驗證 worker 能 blpop 接收 |
| **分散式 Coder** | 結果發布與監聽 | Worker 發布到 `result_channel`，Bot 能及時收到 |
| **分散式 Coder** | Workflow 中斷/恢復 | Bot 在 Coder 前 interrupt，Worker 執行後 Bot 能恢復 |
| **分散式 Coder** | Worker 水平擴展 | `docker-compose --scale coder-worker=4` 多實例同時運行 |

## 驗收標準
- [x] 撰寫整合測試劇本，涵蓋所有 Agent 協作流程。
- [x] 實作效能基準測試 (Benchmark)，記錄各 Agent 推理與檢索延遲。
- [x] 導入沙盒邊界測試，確保 `SafeShell` 能攔截惡意指令。
- [x] 驗證多專案切換時，Redis Checkpointer 的隔離性與一致性。
- [x] 實作 `tests/test_distributed_coder.py`，涵蓋分散式 Coder Worker 完整流程。

## Notes
- 驗證應包含「成功路徑」與「失敗路徑」的測試。
- 提供測試報告產生腳本，確保系統穩定度量化。
- 驗證結果應自動輸出至 `projects/<project>/logs/verification_report.md`。
- 分散式測試需先啟動 Redis：`docker-compose up -d redis` 或本機 redis-server

## 測試腳本

### 本地測試
```bash
# 確保 Redis 運行
redis-server --daemonize yes

# 執行分散式 Worker 測試
python tests/test_distributed_coder.py

# 執行全部測試
python -m pytest tests/ -v
```

### Docker Compose 內測試
```bash
# 啟動完整系統
docker-compose up -d

# 在 bot-service 內執行測試
docker-compose exec bot-service python tests/test_distributed_coder.py

# 查看 worker 日誌
docker-compose logs -f coder-worker
```
