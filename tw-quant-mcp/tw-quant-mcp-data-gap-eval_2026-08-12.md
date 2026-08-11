# tw-quant-mcp 資料缺口評估（財報 / 股利）

> 日期：2026-08-12 ｜ 觸發：data-provider-fallback.md 指出 mcp 無法提供 2330/1101/2317 季報、股利深度不足
> 結論：**財報可低成本修復（code 已備，只差接線）；股利可部分修復（需補 ex_date 資料源）；ETF/指數屬架構性（T032 已規劃）**

## 一、現況實測（2026-08-12 04:28）

| 工具 | 2330 | 1101 | 2317 | 根因 |
|------|------|------|------|------|
| get_financial_statements | ❌ 無損益表摘要資料 | ❌ 同 | ❌ 同 | t187ap14_L.csv 僅 435 家，**不含此三家**（2308 對照組有） |
| get_dividend_history | ✅ 2 年（115/114 民國） | ⚠️ 僅 1 年（114） | ⚠️ 僅 1 年（114） | 官方 t187ap45 僅提供現行+前一年度 |
| get_valuation_ratios | - | ⚠️ pe=0 / roe 失敗，note「無損益表摘要」 | - | 同上，**連帶影響 PE/ROE/健康評分** |
| get_exdividend_calendar | ✅（行事曆本身正常，含 ex_date + ETF） | ✅ | ✅ | TWT48U 預告行事曆，僅未來事件 |

## 二、財報修復評估（P0，成本低）

- 現有 code 已具備：`mopsStatement[T]` 泛型 AJAX 拉取（ajax_t164sb03/04/05）+ `parseIncomeStatementHTML` / `parseBalanceSheetHTML` / `parseCashFlowHTML` 全部寫好（pkg/provider/mops_html.go）
- 實測 AJAX 端點對 2330 回傳正常 HTML：`<table class='hasBorder'>`、`營業收入合計`、`本期淨利（淨損）`、`民國115年第1季` 全數匹配現有 parser
- 缺點：`handlerGetFinancialStatements` income 分支只走 `mopsRows[IncomeStatementRow](MOPSIncomeSummary)`（t187ap14 CSV），CSV 無該代碼即報錯
- **修法**：income 分支在 CSV 無資料時 fallback 到 `mopsStatement[IncomeStatementRow](MOPSIncomeStatement)`（ajax_t164sb04 單股逐季）
- **連帶修復**：PE/ROE（valuation）、T017 財務健康評分（獲利/成長面向）、季報三表
- 成本：1 task（半天~1 天，含 fixtures + 契約測試 + 回歸）；批量 screen 場景不適用（逐股逐季 AJAX），僅限單股/小批
- 限流注意：MOPS 1/2s；WATCH_STOCKS 3 檔 × 6 季 ≈ 18 次呼叫可接受

## 三、股利修復評估（P1，成本中）

- 現況：官方 t187ap45 僅 2 年深度、無 ex_date/close_before_ex/cash_yield → 現由 yfinance fallback 補
- 可修：TWT48U 行事曆已含 ex_date + 現金/股票股利（實測正常，且含 ETF），可併入 dividend history 輸出補近期事件
- 歷史深度：需接 TWSE 歷史除權息查詢頁（ex_new / t108 等）或 TPEx 歷史除息頁（文件已註明上櫃歷史未接線），才可回溯多年 ex_date
- 成本：1 task（半天~1 天）

## 四、不可修（架構性，T032 既有規劃）

- ETF（0050）行情/融資融券：Symbol Registry 僅收上市/上櫃股票代碼，00 前綴 ETF 被排除
- 加權指數（^TWII）：同上，非 registry 成員
- 兩者現行靠 fallback（TWSE STOCK_DAY_ALL / TWT93U / MI_INDEX）已兜底，pipeline 不中斷；mcp 端支援屬 T032-etf-index-support（pending）

## 五、建議優先序

1. **P0 財報 AJAX 接線**：修 2330/1101/2317 季報 + 連帶 PE/ROE/健康評分（成本最低收益最大）
2. **P1 股利 ex_date**：TWT48U 併入 dividend history + 評估 TWSE 歷史除權息查詢
3. **P2 ETF/指數**：T032 既定待辦
4. 完成後 data-provider-fallback.md 的「必然降級/條件降級」清單可縮減（季報 yfinance fallback 可移除）

## 附：實測證據

- t187ap14.csv（/tmp）：436 行（435 家），2330/1101/2317 出現次數 = 0，2308 = 1
- t164sb04_2330.html（/tmp）：34KB，含 hasBorder table 與 parser 所需全部標籤
- mcp 工具回傳：2330/1101/2317 財報錯誤訊息一致；1101 valuation 有「ROE 計算失敗：無損益表摘要」
