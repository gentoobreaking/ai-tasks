## `~/tasks/digital-twin` 現況總覽

### 目錄結構
```
digital-twin/
├── digital-twin.md                    # 專案規劃文件（v1.1，含 Changelog）
├── SPEC_AI_CONSULTATION_MANUAL.md     # 規格書多 AI 諮詢人工流程手冊
├── .env.example                       # API Key 範例（需複製為 .env 填入）
├── multi_ai_discuss.py                # 多 AI 協作討論腳本（支援 3 家 API + 1 人工）
├── extract_feedback.py                # 從 opencode.db 提取修正回饋
├── feedback_raw.md                    # 最新提取的原始修正點
├── feedback_template.md               # 9 筆結構化回饋模板（待處理）
├── full_sessions.md                   # 近 7 天完整 session 匯出
│
├── .opencode/
│   ├── agents/
│   │   └── my-clone.md                # System Prompt（含 SOP 4.1-4.6、專案路徑表、互動原則）
│   ├── commands/
│   │   ├── auto-review.md             # Code Review 指令
│   │   ├── start-task.md              # 依 SOP 建立任務
│   │   ├── complete-task.md           # 依 SOP 完成任務（測試→文件→commit）
│   │   ├── sync-docs.md               # 跨文件同步
│   │   ├── spec-init.md               # 初始化規格書諮詢環境（可選自動討論）
│   │   ├── spec-merge.md              # 合併審查→產生對照表與決策模板
│   │   └── spec-finalize.md           # 依決策生成最終規格書
│   └── templates/
│       ├── spec-template-ai-consultation.md   # 給 4 家 AI 的統一提示詞
│       ├── spec-template-merge-review.md      # 合併審查對照表
│       ├── spec-template-merge-decision.md    # 合併決策記錄
│       └── spec-template-final.md             # 最終規格書結構
```

---

### 核心能力矩陣

| 領域 | 狀態 | 說明 |
|------|------|------|
| **AI 分身人設** | ✅ 完成 | `.opencode/agents/my-clone.md` 含完整 SOP、專案路徑表、互動原則 |
| **任務管理 SOP** | ✅ 完成 | `/start-task`、`/complete-task`、`/sync-docs` 三指令串聯 |
| **規格書多 AI 諮詢** | ✅ 完成 | `/spec-init|merge|finalize` + 4 模板 + `multi_ai_discuss.py` 自動化 |
| **人工流程文件化** | ✅ 完成 | `SPEC_AI_CONSULTATION_MANUAL.md` 可直接照著做 |
| **回饋循環** | 🟡 半完成 | `extract_feedback.py` 可跑、`feedback_template.md` 9 筆待處理 |
| **API Key 設定** | ❌ 待完成 | 需申請 3 家 Key（Gemini/Claude/DeepSeek）填入 `.env` |

---

### 下一步建議優先序

1. **申請 API Keys**（10 分鐘）
   ```bash
   cp .env.example .env  # 編輯填入
   python multi_ai_discuss.py --list-models  # 驗證顯示 ✅
   ```

2. **跑一次完整規格書流程測試**
   ```bash
   # 在 OpenCode 中
   > /spec-init 專案=tw-quant-signal 版本=v1.2 需求="測試流程" 自動討論=true 輪數=2
   > /spec-merge 專案=tw-quant-signal 版本=v1.2
   > /spec-finalize 專案=tw-quant-signal 版本=v1.2
   ```

3. **處理 9 筆回饋**（`feedback_template.md`）
   - 更新 `.opencode/agents/my-clone.md` 對應段落
   - 或建立對應 patterns/ 檔案

4. **建立第一個 patterns/ 知識庫檔案**
   - `~/notes/patterns/workflows.md`（SOP 固化）
   - `~/notes/patterns/task-template.md`（任務模板）

---

### 關鍵指令速查

| 指令 | 用途 |
|------|------|
| `/start-task` | 新需求→讀規格→產任務檔→更新 README |
| `/complete-task` | 實作完→測試→更新任務檔→Git commit→同步 README |
| `/sync-docs` | 規格書改動→同步任務檔/ADR/Patterns |
| `/spec-init` | 建諮詢目錄、填模板、可選啟動自動多輪討論 |
| `/spec-merge` | 讀 4 模型輸出→寫對照表→寫決策模板 |
| `/spec-finalize` | 依決策生成最終版→更新 changelog→同步文件 |
| `python multi_ai_discuss.py --project X --version vY --rounds 3` | 獨立跑多 AI 討論 |
| `python extract_feedback.py --days 7 --only-corrections` | 提取近期修正回饋 |
