---
title: ruff 舊債清理（100 errors → 0）
type: refactor
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-05
updated: 2026-08-05
---

# T025 - ruff 舊債清理（100 errors → 0）

## 目標
T017 已透過 ignore RUF001/002/003 消除 384 個中文全形標點誤報，但仍有 **100 個真實 lint 舊債**（E501×63、W293×8、E741×6、F841×6、F401×4、SIM102×3、B007×2、F541×2、I001×2、RUF005×2、SIM118×2、E401×1、RUF013×1）。本任務將 `ruff check .` 降至 **0 errors**。

## 驗收標準
- [ ] 先跑 `ruff check . --fix` 自動修復 fixable 項目（F401/I001/E401/F541/W293，約 15 個），確認無行為變更
- [ ] 手動處理 **E501 line-too-long（63 個）**：優先改多行；確屬無法拆分的中文長註解可加 `# noqa: E501` 並註記原因；不得直接放寬 line-length（除非評估後合理並記錄）
- [ ] 手動處理 **E741 ambiguous-variable-name（6 個）**：改名（如 `l` → `length`、`O` → `obj`）
- [ ] 手動處理 **F841 unused-variable（6 個）**：刪除或改用（注意 T012 閘門只擋 E9/F821，但全專案目標應歸零）
- [ ] 手動處理剩餘 SIM102/B007/RUF005/SIM118/RUF013
- [ ] `ruff check .` → **0 errors**
- [ ] `ruff check tests/` 維持 All checks passed
- [ ] `/opt/homebrew/bin/python3 -m pytest tests/ -q` 維持 5 passed（無回歸）
- [ ] 若某類錯誤評估後應保留（如 RUF013），改在 pyproject ignore 並於備註說明理由

## 備註
- 依賴 T012 的分層閘門設計：閘門只查 diff 檔案，本任務清理全專案舊債不影響閘門
- 修改範圍大，建議分檔提交（auto_develop.py 優先，其次 multi_ai_discuss.py），每檔驗證一次 pytest
- 避免與 T018+ 任務同時修改同一檔案造成衝突
