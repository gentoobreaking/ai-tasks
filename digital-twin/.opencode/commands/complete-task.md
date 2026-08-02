---
description: 依 SOP 完成任務（測試→更新文件→Git commit→同步 README）
agent: my-clone
---

請依照 SOP「4.2 任務完成流程」處理當前任務：

**前置條件**：確認當前正在處理的任務編號與專案

**執行步驟**：
1. **執行完整測試**：
   - Go 專案：`go test ./...` + `make check`（若有）
   - Python 專案：`pytest` + `ruff check`
   - Node.js 專案：`pnpm test` + `pnpm lint`
   - 全綠才能繼續

2. **更新任務檔** (`~/tasks/{專案}/tasks/T{編號}-*.md`)：
   - status: done
   - 填入「完成摘要」（實作內容、修改檔案、驗收結果）
   - updated: 今日日期
   - 如有 commit hash，記錄在檔案中

3. **Git Commit**：
   - 訊息格式：`{type}(T{編號}): {簡短摘要}`
   - 類型：feat/fix/refactor/chore/docs/test
   - 內文包含完整完成摘要

4. **同步更新 README** (`~/tasks/{專案}/README.md`)：
   - 任務列表狀態改為 ✅ Done
   - 更新統計摘要（總數/完成/進行中/待處理）

5. **輸出任務狀態更新**（依 SOP 4.6 格式）

**若測試失敗，先修復再繼續；不可跳過測試**。