# 規格書多 AI 諮詢流程 — 人工操作指南

> 適用場景：尚未申請 API Key、Grok 無 API、或偏好人工把關品質時的完整手動流程
> 位置：`~/tasks/digital-twin/SPEC_AI_CONSULTATION_MANUAL.md`

---

## 概覽

```
┌─────────────────────────────────────────────────────────────────┐
│                    規格書多 AI 諮詢標準流程                       │
├─────────────────────────────────────────────────────────────────┤
│  1. 初始化目錄與模板      → /spec-init                           │
│  2. 四模型諮詢（核心）     → 自動/手動並行                        │
│  3. 合併審查與決策        → /spec-merge (人工)                   │
│  4. 產出最終規格書        → /spec-finalize                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 步驟 1：初始化環境

### 在 OpenCode 中執行
```
/spec-init 專案=tw-quant-signal 版本=v1.2 需求="新增即時訊號推送" 限制條件="Go 1.22, 向後相容" 自動討論=false
```

### 產出結構
```
~/tasks/tw-quant-signal/specs/
├── v1.2/                          # 最終版輸出目錄（稍後產生）
├── drafts/                        # 草稿區
└── ai-consultations/
    └── v1.2/
        ├── template-ai-consultation.md   ← **已填好專案資訊，直接拿去用**
        ├── 01-claude.md                  ← 待填入
        ├── 02-gemini.md                  ← 待填入
        ├── 03-grok.md                    ← 待填入
        ├── 04-deepseek-v4-flash.md       ← 待填入
        ├── 05-merge-review.md            ← 步驟 3 產生
        └── merge-decision.md             ← 步驟 3 產生
```

---

## 步驟 2：四模型諮詢（人工模式）

### 2.1 開啟 template-ai-consultation.md
```bash
cat ~/tasks/tw-quant-signal/specs/ai-consultations/v1.2/template-ai-consultation.md
```
> 此檔已包含：角色定義、專案背景、參考資料路徑、輸出要求

### 2.2 依序對四個模型提問

| 順序 | 模型 | 角色 | 網頁版網址 | 輸出檔案 |
|------|------|------|------------|----------|
| 1 | **Claude** (Sonnet/Opus) | 架構設計師 | https://claude.ai/new | `01-claude.md` |
| 2 | **Gemini** (Pro/Ultra) | 細節工程師 | https://gemini.google.com/ | `02-gemini.md` |
| 3 | **Grok** | 批判性思考者 | https://grok.x.ai/ | `03-grok.md` |
| 4 | **DeepSeek V4 Flash** | 實作導向 | https://chat.deepseek.com/ | `04-deepseek-v4-flash.md` |

### 2.3 每輪操作步驟（重複 4 次）

```bash
# 1. 複製 template-ai-consultation.md 內容
# 2. 在瀏覽器開新對話，貼上
# 3. 等待模型完整輸出
# 4. 全選複製回覆
# 5. 存入對應檔案
cat > ~/tasks/tw-quant-signal/specs/ai-consultations/v1.2/01-claude.md << 'EOF'
[在此貼上 Claude 完整回覆]
EOF
```

> **重要**：每個模型**開新對話**，不要延續上一個模型的對話（避免群體迷思）

### 2.4 可選：多輪討論（手動版）

若想要模型之間互相評論（模擬自動討論的效果）：

```bash
# 第 2 輪：把第 1 輪 4 份輸出整理成 context，再給每個模型
# 建立第 2 輪提示詞
cat > ~/tasks/tw-quant-signal/specs/ai-consultations/v1.2/round2-prompt.md << 'EOF'
以下是第 1 輪四模型輸出，請以你的角色評論、補充或反駁：

## Claude (架構設計師)
[貼上 01-claude.md 內容]

## Gemini (細節工程師)
[貼上 02-gemini.md 內容]

## Grok (批判性思考者)
[貼上 03-grok.md 內容]

## DeepSeek (實作導向)
[貼上 04-deepseek-v4-flash.md 內容]

---
請輸出：
1. 同意/不同意的觀點及理由
2. 遺漏的風險或盲點
3. 具體可落地的補充建議
EOF
```

然後對每個模型開**新對話**，貼上 `round2-prompt.md`，輸出存為 `01-claude-round2.md` 等。

> 建議輪數：2-3 輪即可，過多反而稀釋重點

---

## 步驟 3：合併審查與決策（核心人工環節）

### 3.1 閱讀四份輸出
```bash
# 建議用編輯器分欄或多視窗對照
code ~/tasks/tw-quant-signal/specs/ai-consultations/v1.2/
```

### 3.2 填寫合併審查對照表（05-merge-review.md）

參考模板：`~/tasks/digital-twin/.opencode/templates/spec-template-merge-review.md`

```markdown
# 合併審查對照表 - tw-quant-signal v1.2

## 章節：整體架構

| 內容項目 | Claude | Gemini | Grok | DeepSeek | 決策 | 備註 |
|---------|--------|--------|------|----------|------|------|
| 分層架構 | ✅ | ✅ | ⚠️ | ✅ | 🔀融合 | Grok 提醒過度設計，採用簡化版 |
| 模組邊界 | ❌ | ✅ | 💡 | ✅ | ✅採用 Gemini | Claude 邊界偏技術分層 |
| 錯誤處理 | ✅ | ⚠️ | ✅ | ✅ | 🔀融合 | DeepSeek 方案最工程化 |
```

**決策符號**：
- ✅ 直接採用
- ⚠️ 需修改
- 🔀 融合多家
- ❌ 捨棄
- 💡 靈感啟發

### 3.3 填寫合併決策記錄（merge-decision.md）

參考模板：`~/tasks/digital-twin/.opencode/templates/spec-template-merge-decision.md`

```markdown
# 合併決策記錄 - tw-quant-signal v1.2

## 核心架構決策
| 決策項目 | 採用來源 | 決策理由 | 替代方案 |
|----------|----------|----------|----------|
| 整體架構 | Claude + DeepSeek | 符合團隊 DDD 慣例、可測試 | Grok 極簡版(功能不足) |
| API 設計 | Gemini + DeepSeek | 契約完整+錯誤碼工程化 | Claude GraphQL(無經驗) |

## 風險項目處理
| 風險 | 來源模型 | 最終版處理 |
|------|----------|------------|
| 分散式事務 | Grok | 採用 Saga 模式，§5.2 記錄補償邏輯 |
```

---

## 步驟 4：產出最終規格書

### 在 OpenCode 中執行
```
/spec-finalize 專案=tw-quant-signal 版本=v1.2
```

或手動依據 `merge-decision.md` 整合為：
```
~/tasks/tw-quant-signal/specs/v1.2/tw-quant-signal-spec-v1.2.md
```

### 同步更新（必做）
- 更新對應任務檔驗收標準
- 更新 `~/tasks/tw-quant-signal/README.md` 規格版本欄位
- 如有架構決策，新增 `~/notes/adr/ADR-xxx.md`

---

## 快速參考：檔案清單

```
~/tasks/{專案}/specs/ai-consultations/v{版本}/
├── template-ai-consultation.md      ← 步驟 1 產生，步驟 2 使用
├── 01-claude.md                     ← 步驟 2 填入
├── 02-gemini.md                     ← 步驟 2 填入
├── 03-grok.md                       ← 步驟 2 填入
├── 04-deepseek-v4-flash.md          ← 步驟 2 填入
├── (可選) *-round2.md               ← 步驟 2 多輪時
├── 05-merge-review.md               ← 步驟 3 填入（對照表）
├── merge-decision.md                ← 步驟 3 填入（決策理由）
├── discussion-summary.md            ← 自動/手動彙總
└── merge-decision-template.md       ← 參考用
```

---

## 常見問題

### Q: 模型輸出太長/太短怎麼辦？
**A**: 在 template 中加入「輸出長度建議：每章節 200-500 行」，或第 2 輪提示詞要求「針對具體細節展開」

### Q: 四個模型觀點衝突很大？
**A**: 這是預期的價值。在 `merge-decision.md` 明確記錄：「捨棄 X 方案，因為 Y 原因」，未來追溯才有依據

### Q: 想要保留中間草稿？
**A**: 存入 `~/tasks/{專案}/specs/drafts/{日期}-{主題}.md`，最終版確定後可清理

### Q: 如何判斷幾輪夠了？
**A**: 當第 N 輪輸出不再有新觀點、只剩細節用詞差異時停止。通常 2-3 輪

### Q: 以後有 API Key 了怎麼切換？
**A**: 
1. 設定 `.env`（參考 `.env.example`）
2. `/spec-init ... 自動討論=true`
3. 其他流程完全相同，輸出格式相容

---

## 版本歷程

| 日期 | 版本 | 變更 |
|------|------|------|
| 2026-08-02 | 1.0 | 初版：完整人工流程文件化 |