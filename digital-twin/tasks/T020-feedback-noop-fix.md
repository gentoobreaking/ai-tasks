---
title: apply_feedback mark_as_done no-op bug 修復
type: fix
priority: medium
status: done
spec_version: v3
commit: a1c28f0
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-05
updated: 2026-08-07
commit: 7c6aae6
summary: mark_as_done 改區塊精準重寫,移除 no-op replace,4 tests 通過
---

# T020 - apply_feedback mark_as_done no-op bug 修復

## 目標
`apply_feedback.py` 的 `mark_as_done()` 存在 no-op bug（實測確認）：

```python
text = text.replace(
    f"### Feedback #{fb['id']}",
    f"### Feedback #{fb['id']}"   # ← 替換前後一模一樣，無任何作用
).replace(
    "- **狀態**: [ ] 未處理",
    "- **狀態**: [x] 已完成 (已融入 System Prompt / patterns)"
)
```
第一行替換是無效操作；第二行依賴模板文字恰好為「- **狀態**: [ ] 未處理」，若模板格式不同則無法正確標記完成。

## 驗收標準
- [x] 移除 no-op 替換行；改為以 `### Feedback #{fb_id}` 區塊為單位，精準重寫該區塊內的狀態行（區塊 regex 切到下一 `### Feedback #` 或檔尾；僅重寫區塊內第一條匹配狀態列）
- [x] 狀態行解析與更新共用同一正規表示式 `STATUS_RE = r"- \*\*狀態\*\*: \[(.*?)\]"`（parse_feedbacks 與 mark_as_done 共用，`DONE_STATUS_LINE` 統一標記文字）
- [x] 處理 `feedback_template.md` 內狀態格式不匹配時：印出「⚠️ Feedback #N 狀態行格式不匹配，略過（未修改）。」並略過
- [x] 單元測試：`tests/test_apply_feedback.py` 4 tests 覆蓋「pending → 標記 done」檔案寫入（tmp 檔、monkeypatch FEEDBACK_FILE）：精準標記 / 同文本不誤改他區塊 / 格式不匹配警告 / 共享 regex

## 備註
- 已確認 `feedback_template.md` 實際狀態行為 `- **狀態**: [x] 已完成 (已融入 System Prompt / patterns)`（9 筆全數已完成；格式區塊頂部的 `[ ] 未處理 [ ] 已更新 Prompt` 為範本說明）
- 與 T017（tests 目錄建立）相依：測試檔已放 tests/
- 驗證：`apply_feedback.py --list` 正常列出 9 筆（1-9 全 ✅ 已套用）；74 passed + 1 skipped
