# T011 任務完成摘要

## 目標
實作 §16 LLM 使用規範與 §4 Phase 4 之檢討報告生成：以 T010 統計為輸入、Schema 驗證輸出、symbol 白名單與免責模板。

## 完成內容
- `src/llm/report.ts`（8256 bytes）+ `report.test.ts`（6144 bytes）
- `LlmReportGenerator.generate(journal, events)`：
  - 輸入 = JournalEntry.summary + events（§14.4）；LLM 僅負責敘事
  - 統計數字由規則引擎注入 stats 欄位（§16.1/§16.4），prompt 明示「不得自行推算」
- `LLMReportSchema`（zod，§16.2）：narrative 純文字、stats 數字合理區間（hit_rate 0–1、trades ≥0）、disclaimer literal 固定
- `filterSymbols`（§16.3）：LLM 提及之 symbol 必須在當日 Watchlist 或 get_symbol_list 回傳，否則段落捨棄；白名單 = symbolList() ∪ 當日 events symbol
- 免責聲明「僅供研究參考，不構成投資建議」模板固定附上（§16.5）
- LLM 不可用（無 Client / 拋錯 / 逾時 15s）→ `llm_offline=true` 模板報告（§18.3）
- v2.0：`bias_locked` 事件納入 report.bias 欄位（當日方向判斷對照）
- `attachReport`：寫入 JournalEntry.llm_report（T010 寫入介面）

## 驗收
- 187 tests pass（+12）、build ✅、lint ✅
- 測試：Schema 通過/拒收（hit_rate 超範圍、disclaimer 不符、缺 stats）、llm_offline（無 Client/拋錯）、LLM 正常路徑、白名單過濾、全捨棄 fallback、bias_locked、attachReport
- commit `f3bcc15`

## 備註
- 評分模型本身不依賴 LLM（§16）；LLM 模型可設定（§17，預設 Claude 4.x Sonnet）
- 修正歷程：sanitize 為 async 需 await（`[object Promise]` bug）；bias score 型別 number|null
