# {專案} 規格書 v{版本} 諮詢提示詞

> **使用方式**：複製此檔案，填入下方資訊，貼給各 AI 模型（每個模型開新對話）
> **儲存位置**：`~/tasks/{專案}/specs/ai-consultations/v{版本}/template-ai-consultation.md`

---

## 角色定義（根據模型自動套用）

| 模型 | 角色 | 重點關注 |
|------|------|----------|
| **Claude (Sonnet/Opus)** | 架構設計師 | 整體架構、模組劃分、擴展性、ADR 風格、長期演進 |
| **Gemini (Pro/Ultra)** | 細節工程師 | API 契約、資料模型、邊界條件、測試策略、資料流 |
| **Grok** | 批判性思考者 | 反向思考、潛在風險、過度設計檢查、簡化建議、替代方案 |
| **DeepSeek V4 Flash** | 實作導向 | 程式碼結構、效能優化、工程落地細節、Go/Python 最佳實踐、部署考量 |

---

## 專案背景（必填）

- **專案名稱**：{專案名稱}
- **當前版本**：v{上一版本，如 v1.0 / 無}
- **目標版本**：v{新版本，如 v1.1}
- **核心需求**：
  1. {需求 1}
  2. {需求 2}
  3. {需求 3}
- **限制條件**：
  - 技術棧：{Go 1.22 / Python 3.11 / TypeScript 5...}
  - 效能要求：{QPS、延遲、吞吐...}
  - 相容性：{API 向後相容、資料遷移...}
  - 團隊慣例：{DDD / Clean Architecture / 模組命名...}

---

## 現有參考資料（請先閱讀）

- **上版規格書**：`~/tasks/{專案}/specs/v{上一版本}/{專案}-spec-v{上一版本}.md`
- **相關 ADR**：`~/notes/adr/{相關決策}.md`
- **現有 Codebase**：`~/Projects/{專案}/`（重點模組：{列出關鍵套件/模組}）
- **任務追蹤**：`~/tasks/{專案}/tasks/*.md`
- **Patterns 知識庫**：`~/notes/patterns/`（data-models.md, api-contracts.md, docker-patterns.md）

---

## 請輸出內容

### 1. 角色專屬視角分析
依你的角色（架構設計師/細節工程師/批判性思考者/實作導向），給出 3-5 點核心觀察或建議。

### 2. 具體規格內容（可直接納入規格書）
輸出結構化 Markdown，建議包含：
- 章節標題與編號
- 介面定義（Go interface / TypeScript interface / OpenAPI）
- 資料結構（struct / Pydantic model / Zod schema）
- 流程圖（Mermaid）
- 設定範例（YAML / JSON）
- 錯誤碼與處理策略

### 3. 風險與待決事項
- 技術風險：
- 架構決策待確認：
- 相容性疑慮：
- 效能瓶頸預測：

### 4. 給下一輪模型的提示（可選）
「建議下一輪 {模型} 重點關注：{具體方向}」

---

## 輸出格式要求

- 完整 Markdown，標題層級清晰（##, ###）
- 程式碼區塊標註語言：`go`, `python`, `typescript`, `yaml`, `json`, `mermaid`
- 表格對齊、列表縮排一致
- 關鍵決策點用 `> **決策**：` 標記
- 引用現有代碼用相對路徑：`pkg/model/...`

---

## 儲存指引

請將完整輸出複製存入對應檔案：
- `~/tasks/{專案}/specs/ai-consultations/v{版本}/01-claude.md`
- `~/tasks/{專案}/specs/ai-consultations/v{版本}/02-gemini.md`
- `~/tasks/{專案}/specs/ai-consultations/v{版本}/03-grok.md`
- `~/tasks/{專案}/specs/ai-consultations/v{版本}/04-deepseek-v4-flash.md`

---

## 記錄資訊（由人工填入）

- 諮詢日期：
- 提示詞版本：v1.0
- 模型版本：{Claude 3.5 Sonnet / Gemini 1.5 Pro / Grok-2 / DeepSeek V4 Flash}
- 對話連結：{如有}