---
github_issue: N/A
title: LLM 檢討報告與防幻覺規範
type: feature
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-08-10
---

# T011 - LLM 檢討報告與防幻覺

## 目標
實作 §16 LLM 使用規範與 §4 Phase 4 之檢討報告生成：以 T010 統計為輸入、Schema 驗證輸出、symbol 白名單與免責模板。

## 驗收標準
- [x] 報告生成流程：輸入 = `JournalEntry.summary` + `events`（§14.4），LLM 僅負責敘事；統計數字由規則引擎注入，LLM 不得自行推算（buildPrompt 含「不得自行推算」指示；stats 欄位由 summary 直接注入）
- [x] 輸出 Schema 驗證（zod）：`llm_report` 為純文字敘事；數字欄位必須為 null 或合理區間（§16.2；LLMReportSchema：hit_rate 0–1、trade 數 ≥0、disclaimer literal）
- [x] symbol 白名單：LLM 提及之個股必須存在於當日 Watchlist 或 `get_symbol_list` 回傳，否則該段捨棄（§16.3；filterSymbols + events 內 symbol 自動納入）
- [x] 模板固定附免責聲明「僅供研究參考，不構成投資建議」（§16.5）
- [x] LLM 不可用（API 失敗/離線）：由模板產生報告並標註 `llm_offline`（§18.3；無 Client / 拋錯 / 逾時皆 fallback）
- [x] 硬數字不經 LLM：進出場價格、停損、倉位、分數於報告中直接引用 T010 資料（§16.1；stats 注入 summary）
- [x] 單元測試：Schema 驗證拒收、白名單過濾、llm_offline fallback（12 個測試）
- [x] v2.0：Bias 鎖定結果（`bias_locked` 事件）納入檢討敘事輸入，作為當日方向判斷正確性之對照（report.bias 欄位）

## 備註
- LLM 模型可設定（§17），預設 Claude 4.x Sonnet；評分模型本身不依賴 LLM
- 報告寫入 `JournalEntry.llm_report` 欄位（T010 提供寫入介面）
- v2.0：Bias 鎖定結果（`bias_locked` 事件）納入檢討敘事輸入，作為當日方向判斷正確性之對照
