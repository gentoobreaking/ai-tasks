# Digital Twin Review + 任務建立（2026-08-05）

## 目標
Review `~/Projects/digital-twin` 全部程式碼（程式設計邏輯/模組化/流程/使用簡易度），提出建議，經使用者確認後以任務檔形式建立於 `~/Projects/digital-twin/tasks/`。

## 執行內容
1. 讀取全部 14 個 Python 模組（auto_develop 1125 行、multi_ai_discuss 581 行等）+ `twin` CLI + 任務體系（T001-T010、README、模板）
2. 實測驗證：ruff 333 errors、無 tests/、pyright 路徑錯誤、telegram_bot.py 不存在、.env 三把 Key 已設定、T006/T008 已 blocked
3. 產出完整 review 報告：`~/tasks/digital-twin/review-2026-08-05.md`
4. 使用者確認建立全部建議任務 → 依 task-template.md 範本建立 13 個任務檔

## 關鍵發現
- 🔴 P0：auto_develop 品質閘門失真（pytest 無測試 rc=5 當通過、pyright 掃空、ruff 333 舊債）→ T012
- 🔴 P0：模型設定三處矛盾且名稱欺騙（claude 實為 nemotron）→ T011
- 🟠 P1：文件與實際脫節（telegram_bot.py 已刪除但文件宣稱有）→ T015
- 🟠 P1：spec_auto_merge 硬編碼假對照表 → T016
- 🟠 P1：pyproject pyright include 指向不存在的 src/、install_hooks import 無依賴的 structlog、無 tests/ → T017
- 🟡 P2/P3：apply_feedback no-op bug、gen_mermaid 假生成、consensus 中文分詞失真、失敗不還原工作目錄等

## 產出
| 檔案 | 說明 |
|------|------|
| `~/tasks/digital-twin/review-2026-08-05.md` | 完整 review 報告（評分、實測事實、13 建議） |
| `~/Projects/digital-twin/tasks/T011-unified-config.md` | 統一模型/路徑設定模組（P0, high） |
| `~/Projects/digital-twin/tasks/T012-quality-gate-layering.md` | 品質閘門分層只查 diff（P0, high） |
| `~/Projects/digital-twin/tasks/T013-revert-on-failure.md` | 失敗路徑還原工作目錄（P1, high） |
| `~/Projects/digital-twin/tasks/T014-auto-repair-loop.md` | 測試失敗自動修復迴圈（P1, high） |
| `~/Projects/digital-twin/tasks/T015-docs-align-reality.md` | 文件與現況對齊（P1, high） |
| `~/Projects/digital-twin/tasks/T016-spec-merge-no-fake-data.md` | 移除 spec_auto_merge 假資料（P1, high） |
| `~/Projects/digital-twin/tasks/T017-pyproject-fixes.md` | pyproject/pyright/tests 修正（P1, high） |
| `~/Projects/digital-twin/tasks/T018-task-dependencies.md` | depends_on 依賴欄位 + 路徑收斂（P2, medium） |
| `~/Projects/digital-twin/tasks/T019-pr-summary-gate.md` | PR 摘要 + 大 diff 人工確認閘門（P2, medium） |
| `~/Projects/digital-twin/tasks/T020-feedback-noop-fix.md` | apply_feedback no-op bug（P2, medium） |
| `~/Projects/digital-twin/tasks/T021-mermaid-consensus-fix.md` | gen_mermaid 掃描化 + 中文分詞（P3, low） |
| `~/Projects/digital-twin/tasks/T022-daemon-db-path.md` | daemon 路徑驗證 + DB 路徑可設定（P3, low） |
| `~/Projects/digital-twin/tasks/T023-blocked-review.md` | blocked 任務 review 機制（P2, medium） |

## 建議執行順序
T011 → T012 → T013/T014 → T015 → T017 → 其餘

## 備註
- 任務檔 frontmatter 全數含：title/type/priority/status=pending/assignee=OpenCode with DeepSeek V4 Flash/created/updated（符合規範）
- 任務檔放於 `~/Projects/digital-twin/tasks/`（使用者指示），與現有 `~/tasks/digital-twin/tasks/`（T001-T010）路徑分歧，已列入 T018 收斂
