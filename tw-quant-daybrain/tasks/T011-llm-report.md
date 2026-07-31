---
github_issue: N/A
title: LLM 檢討報告與防幻覺規範
type: feature
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T011 - LLM 檢討報告與防幻覺

## 目標
實作 §9 LLM 使用規範與 §4 Phase 4 之檢討報告生成：以 T010 統計為輸入、Schema 驗證輸出、symbol 白名單與免責模板。

## 驗收標準
- [ ] 報告生成流程：輸入 = `JournalEntry.summary` + `events`（§7.4），LLM 僅負責敘事；統計數字由規則引擎注入，LLM 不得自行推算
- [ ] 輸出 Schema 驗證（zod）：`llm_report` 為純文字敘事；數字欄位必須為 null 或合理區間（§9.2）
- [ ] symbol 白名單：LLM 提及之個股必須存在於當日 Watchlist 或 `get_symbol_list` 回傳，否則該段捨棄（§9.3）
- [ ] 模板固定附免責聲明「僅供研究參考，不構成投資建議」（§9.5）
- [ ] LLM 不可用（API 失敗/離線）：由模板產生報告並標註 `llm_offline`（§11.3 失敗處理）
- [ ] 硬數字不經 LLM：進出場價格、停損、倉位、分數於報告中直接引用 T010 資料（§9.1）
- [ ] 單元測試：Schema 驗證拒收、白名單過濾、llm_offline fallback

## 備註
- LLM 模型可設定（§10），預設 Claude 4.x Sonnet；評分模型本身不依賴 LLM
- 報告寫入 `JournalEntry.llm_report` 欄位（T010 提供寫入介面）
