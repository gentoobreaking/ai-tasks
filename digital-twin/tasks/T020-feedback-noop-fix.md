---
title: apply_feedback mark_as_done no-op bug 修復
type: fix
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-05
updated: 2026-08-05
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
- [ ] 移除 no-op 替換行；改為以 `### Feedback #{fb_id}` 區塊為單位，精準重寫該區塊內的狀態行
- [ ] 狀態行解析與更新共用同一正規表示式（`- \*\*狀態\*\*: \[(.*?)\]`），避免格式漂移
- [ ] 處理 `feedback_template.md` 內狀態格式不匹配時：印出警告並略過（不靜默失敗）
- [ ] 單元測試：`tests/test_apply_feedback.py` 覆蓋「pending → 標記 done」的檔案寫入（可用 tmp 檔）

## 備註
- 先確認 `feedback_template.md` 現有狀態行的確切格式再改
- 與 T017（tests 目錄建立）相依，測試檔需放在 T017 建立的 tests/ 內
