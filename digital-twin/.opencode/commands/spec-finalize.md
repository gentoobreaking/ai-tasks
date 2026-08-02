---
description: 根據合併決策生成最終規格書並完成歸檔
agent: my-clone
---

請依照合併決策生成最終規格書：

**前置條件**：
- 已完成 `/spec-merge`，產生 `05-merge-review.md` 與 `merge-decision.md`
- 專案：{專案名稱}，版本：v{版本號}

**執行步驟**：

### 1. 讀取決策依據
- `~/tasks/{專案}/specs/ai-consultations/v{版本}/merge-decision.md`
- `~/tasks/{專案}/specs/ai-consultations/v{版本}/05-merge-review.md`

### 2. 生成最終規格書
輸出：`~/tasks/{專案}/specs/v{版本}/{專案}-spec-v{版本}.md`

結構參考：
```markdown
---
version: v{版本}
date: YYYY-MM-DD
status: released
consulted_models: [Claude, Gemini, Grok, DeepSeek V4 Flash]
merge_decision: ai-consultations/v{版本}/merge-decision.md
---

# {專案} 規格書 v{版本}

## 1. 版本資訊與變更摘要
...

## 2. 架構設計
...

## 3. API 契約
...

## 4. 資料模型
...

## 5. 流程與邏輯
...

## 6. 部署與運維
...

## 7. 風險與待辦
...

## 附錄：AI 諮詢記錄索引
- Claude：ai-consultations/v{版本}/01-claude.md
- Gemini：ai-consultations/v{版本}/02-gemini.md
- Grok：ai-consultations/v{版本}/03-grok.md
- DeepSeek V4 Flash：ai-consultations/v{版本}/04-deepseek-v4-flash.md
- 合併審查：ai-consultations/v{版本}/05-merge-review.md
- 合併決策：ai-consultations/v{版本}/merge-decision.md
```

### 3. 更新 changelog
`~/tasks/{專案}/specs/v{版本}/changelog.md`：
```markdown
# Changelog - v{版本} (YYYY-MM-DD)

## 新增
- ...

## 變更
- ...

## 修復
- ...

## 移除
- ...

## AI 諮詢記錄
本版本經過 4 模型諮詢合併，詳細見 ai-consultations/v{版本}/
```

### 4. 同步更新（SOP 4.3）
- 更新對應任務檔驗收標準
- 更新 `~/tasks/{專案}/README.md` 規格版本

### 5. 清理草稿（可選）
`~/tasks/{專案}/specs/drafts/` 舊草稿可歸檔或刪除

**輸出**：最終規格書路徑、changelog 路徑、同步更新清單