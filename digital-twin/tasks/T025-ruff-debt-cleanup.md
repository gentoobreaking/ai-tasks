---
title: ruff 舊債清理（100 errors → 0）
type: refactor
priority: medium
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-05
updated: 2026-08-07
commit: 492dada
summary: ruff 舊債 100 → 0 errors（配合 T018/T019/T027 分批清理），70 tests 通過
---

# T025 - ruff 舊債清理（100 errors → 0）

## 目標
T017 已透過 ignore RUF001/002/003 消除 384 個中文全形標點誤報，但仍有 **100 個真實 lint 舊債**（E501×63、W293×8、E741×6、F841×6、F401×4、SIM102×3、B007×2、F541×2、I001×2、RUF005×2、SIM118×2、E401×1、RUF013×1）。本任務將 `ruff check .` 降至 **0 errors**。

## 驗收標準
- [x] 先跑 `ruff check . --fix` 自動修復 fixable 項目（F401/I001/E401/F541/W293，約 15 個），確認無行為變更
- [x] 手動處理 **E501 line-too-long**：優先改多行拆列；無需 `# noqa: E501`
- [x] 手動處理 **E741 ambiguous-variable-name（6 個）**：改名（部分於 T018/T019/T027 清理中一併處理）
- [x] 手動處理 **F841 unused-variable（6 個）**：刪除或改用（T018/T019 期間 auto_develop 舊債已 35→0）
- [x] 手動處理剩餘 SIM102/B007/SIM118/RUF013（auto_guardrail 合併巢狀 if + any()）
- [x] `ruff check .` → **0 errors**
- [x] `ruff check tests/` 維持 All checks passed
- [x] python3 -m pytest tests/ → 例外：homebrew python 缺依賴為 T026 前舊標準；.venv 全量 **70 passed + 1 skipped**
- [ ] 若某類錯誤評估後應保留（如 RUF013），改在 pyproject ignore 並於備註說明理由

## 備註
- 依賴 T012 的分層閘門設計：閘門只查 diff 檔案，本任務清理全專案舊債不影響閘門
- 修改範圍大，建議分檔提交（auto_develop.py 優先、其次 multi_ai_discuss.py），每檔驗證一次 pytest
- 避免與 T018+ 任務同時修改同一檔案造成衝突
- 分階段提交累計：T018/T019(commit 3f9f126)、T027(commit 7d0edc0) 已清理 auto_develop.py/observability/worker 等；本 commit 492dada 完成剩餘 4 檔（auto_guardrail/consensus_eval/extract_feedback/task_advisor）
