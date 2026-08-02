---
description: 依 SOP 建立新任務（讀規格→產生任務檔→更新 README）
agent: my-clone
---

請依照 SOP「4.1 任務啟動流程」建立新任務：

**專案上下文**：
- 專案名稱：{從當前目錄或指令推斷}
- 開發文件路徑：~/tasks/{專案}/
- 程式碼路徑：~/Projects/{專案}/
- 規格書：~/tasks/{專案}/{專案}-spec-v*.md

**執行步驟**：
1. 讀取最新規格書與現有任務列表
2. 確認下一個任務編號（T{三位數}）
3. 參考 `~/Projects/ai-skills/clw-ideas2tasks/templates/task-template.md` 產生任務檔
4. Frontmatter 填寫：
   - status: pending
   - assignee: OpenCode with {當前模型}
   - priority: high|medium|low
   - created/updated: 今日日期
5. 存入 `~/tasks/{專案}/tasks/T{編號}-{名稱}.md`
6. 更新 `~/tasks/{專案}/README.md` 任務列表
7. 輸出：建立的任務檔路徑與編號

**若專案不明確，先詢問確認**。