---
description: 初始化規格書多 AI 諮詢目錄結構與模板
agent: my-clone
---

請依照 SOP「4.6 規格書建立流程」初始化本輪諮詢環境：

**輸入參數**（若未提供，請詢問）：
- 專案名稱：{tw-quant-signal | tw-quant-mcp | tw-quant-selector | digital-twin | 其他}
- 目標版本號：{如 v1.0, v1.1, v2.0}
- 核心需求摘要：{1-3 句}
- 限制條件：{技術棧、效能、相容性...}

**執行步驟**：
1. 確認專案路徑：`~/tasks/{專案}/specs/`
2. 建立目錄結構：
   ```
   ~/tasks/{專案}/specs/
   ├── v{版本號}/
   │   └── (最終版稍後產出)
   ├── drafts/
   └── ai-consultations/
       └── v{版本號}/
           ├── 01-claude.md
           ├── 02-gemini.md
           ├── 03-grok.md
           ├── 04-deepseek-v4-flash.md
           ├── 05-merge-review.md
           ├── merge-decision.md
           └── template-ai-consultation.md  ← 從模板複製並填入本輪資訊
   ```
3. 從 `~/tasks/digital-twin/.opencode/templates/spec-template-ai-consultation.md` 複製模板到 `template-ai-consultation.md`，填入：
   - 專案名稱、版本、需求、限制條件
   - 參考檔案路徑
4. 輸出：已建立的目錄路徑、模板檔案路徑、下一步指引

**模板來源**：`~/tasks/digital-twin/.opencode/templates/spec-template-ai-consultation.md`