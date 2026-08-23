---
github_issue: N/A
title: pi Agent 整合反饋閉環 ＋ 全專案品質優化（env 收斂/模組拆分/測試隔離）
type: feature
priority: high
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-23
updated: 2026-08-24
---

# T089 - pi Agent 整合反饋閉環 ＋ 全專案品質優化

## 目標
1. 反饋閉環支援 pi coding-agent：Agent Layer 切換至 pi（impl_providers.yaml），
   extract_feedback 新增 pi JSONL session 來源（--source opencode|pi|all）
2. 完成九項品質優化（REVIEW_REPORT 後續追蹤）：
   - 對話匯出檔移入 docs/archive/（repo root 清潔）
   - currect_status.md 瘦身並正名 current_status.md（README 為單一文件來源）
   - 環境變數存取收斂至 config.py lazy accessors（16 檔不再直接 os.getenv）
   - scheduler.py 拆出修復迴圈狀態機 repair_loop.FailureRecorder
   - 反饋補強：pi tree 走訪（捨棄分支不污染探勘）、關鍵字外置
     .opencode/feedback_rules.yaml、排程器每 7 天自動探勘推播、extract_feedback --notify
   - conftest git 環境隔離 fixture（GIT_CONFIG_GLOBAL/SYSTEM 指向測試專屬檔）
   - test_find_task_file_real 改為隔離 tasks_root（不再依賴宿主 ~/tasks 狀態）
   - 獨立工具收斂至 tools/ 子套件（sanitize_input/install_hooks/setup_daemon/
     task_advisor/gen_mermaid），pyproject packages 同步
   - digital-twin.md 凍結為歷史規劃文件；pyright 變更檔歸零

## 驗收標準
- [x] Agent Layer 啟用 pi（opencode/omp 停用），providers._do_call_pi 可呼叫
- [x] extract_feedback 支援雙來源合併（預設 all），pi tree 捨棄分支被過濾（含測試）
- [x] .pi/ 與對話匯出檔不入版控；auto_guardrail 忽略清單同步
- [x] 全套 pytest 306 passed / 0 failed（此前基準 281 passed + 16 failed）
- [x] ruff check / format 全綠；變更檔 pyright 0 errors
- [x] pre-commit hook 通過；每項優化獨立 commit（ea9baf1…8ed9546 共 9 commits）

## 備註
- 相關 commits：af8522b（pi 反饋來源）、5ab2f3e（agent 切換）、
  ea9baf1 / b3c8dfb / 39838f0 / 56a46f0 / 6a46488 / 8f17160 / 20f3f06 / 2acf80c / 8ed9546
- scheduler.py 主體仍逾 900 行，可再拆「任務挑選」與「process_task 流程」
- 根目錄尚餘約 20 個核心模組（scheduler/providers/doctor 等），
  因互相依賴深，留待後續分批套件化
