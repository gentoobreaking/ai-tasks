---
github_issue: N/A
title: SLO 定義解析模組 internal/spec
type: feat
priority: medium
status: pending
depends_on:
- T001
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T002 - SLO 定義解析模組 internal/spec

## 目標
實作 `internal/spec`：解析使用者 SLO YAML（SLI 查詢、目標、時間窗、標籤），
相容 OpenSLO 子集；欄位驗證與錯誤彙總（一次回報所有問題而非第一個）。

## 驗收標準
- [ ] 有效定義 → struct；缺欄位/型別錯誤 → 彙總錯誤清單
- [ ] OpenSLO 子集欄位映射有表格化測試（≥5 案例）
- [ ] 無效檔案不影響其他檔案載入（隔離語意，同 catalog 慣例）

## 備註
- 本模組為純函式，禁止 import I/O 套件
