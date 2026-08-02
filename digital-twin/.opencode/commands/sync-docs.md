---
description: 依 SOP 同步更新規格書/架構文件對應的任務檔、ADR、README
agent: my-clone
---

請依照 SOP「4.3 跨文件同步流程」執行同步檢查與更新：

**觸發條件**：剛修改了規格書、API 定義、資料模型、架構決策

**檢查清單**：
1. **對應任務檔**：`~/tasks/{專案}/tasks/T{編號}-*.md`
   - 驗收標準是否需同步更新
   - 內容是否與最新規格一致

2. **ADR 紀錄**：`~/notes/adr/`
   - 是否有新的架構決策需記錄
   - 格式：標題、背景、決策、後果、日期、相關檔案

3. **Patterns 知識庫**：`~/notes/patterns/`
   - data-models.md（資料模型變更）
   - api-contracts.md（API 變更）
   - docker-patterns.md（Docker 規範變更）

4. **README / 專案文件**：
   - `~/tasks/{專案}/README.md`
   - `~/Projects/{專案}/README.md`（如適用）

**執行方式**：逐項檢查，有差異即更新，最後輸出同步摘要。