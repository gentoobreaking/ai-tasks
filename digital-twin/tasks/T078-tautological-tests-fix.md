---
github_issue: null
title: 收緊寬鬆/謬誤斷言測試（test_telegram_bot 等）
type: test
priority: medium
status: pending
depends_on: [70, 74]
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-12'
---
# T078 - 收緊寬鬆斷言測試

## 目標
以下測試斷言過寬鬆，給出假信心：
- `test_metrics_endpoint`（tests/test_telegram_bot.py:147-150）：第二個 assert `"prometheus" in resp.text.lower() or resp.status_code == 200` 因第一個 assert 已要求 200 而恆真，從未驗證 metric 內容
- `test_webhook_accepts_update`（:152-155）：接受 200 **或 500**，伺服器錯誤也算過
- `test_unknown_task_type_not_crash`（:122-126）：名稱誤導，呼叫 `run_rag_task({"query": ""})`，從未真實驗證未知 task type
- `test_discuss_rounds_capped`（:168-173）：只 assert 常數，未跑任何 handler

## 驗收標準
- [ ] `test_metrics_endpoint` 驗證實際 metric 內容（如存在 `rag_query_latency_seconds` 或 `tg_command_duration_seconds`，配合 T074）
- [ ] `test_webhook_accepts_update` 只接受 2xx（500 即失敗），補 header/權限情境（配合 T070）
- [ ] `test_unknown_task_type_not_crash` 改成真實驗證未知 task type 處理（或改名並修正測試目標）
- [ ] `test_discuss_rounds_capped` 實際執行受限的討論 loop 驗證回合上限
- [ ] pytest 全量通過、ruff / pyright 通過

## 備註
- 依賴 T070（webhook 驗證）與 T074（metrics registry），故設定 depends_on
- 修測試時不得為了「過關」弱化行為；測試與實作不匹配處以實作為準