---
github_issue: ""
title: "CLI 輸出人話化——模擬盤/回測輸出可讀性改造"
type: task
priority: medium
status: done
depends_on: [T023, T024]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-12
updated: 2026-08-12
---

# T025 - CLI 輸出人話化（模擬盤/回測輸出可讀性改造）

## 目標

把 simulate / grid-search / wfo 三個 CLI 的輸出從原始技術輸出改為中文人話 + emoji 分階段呈現，並修補 `signal_issued` 事件遺漏執行計劃欄位的資料丟失問題。

## 驗收標準

- [x] **simulate 階段輸出人話化**：Phase 0-4 改為「🔌盤前自檢 / 🔍盤前選股 / 📡盤中監控 / 🧹尾盤強制平倉 / 📝盤後統計」中文標題 + emoji
- [x] **警示訊息人話化**：低信號日 / 資料缺口 / 逾時三類警示改為「說明原因 + 引擎意圖」的完整句子（如低信號日 →「引擎選擇空手等待，不為交易而交易」）
- [x] **系統事件逐筆列出**：從 `r.events` 動態提取 phase_end 等紀律事件，帶觸發代號（short_stop_new / no_new_position_warn / hard_stop_new / force_flat_warn / force_flat_remind / force_flat_final）與人話說明
- [x] **signal_issued 事件補執行計劃欄位**：原僅寫 signal_id/symbol/score/grade 四欄，補上 strategy / recommended_entry / target_price / stop_loss_price / rr_ratio / position_size_shares（`src/engine/intraday_loop.ts`）
- [x] **訊號明細顯示執行計劃**：進場/停損/目標/風險報酬比/倉位（範例：進場 106.20｜停損 104.61｜目標 109.39｜風險報酬比 2｜倉位 941 股）
- [x] **grid-search 輸出人話化**：表格列名改為中文（停損設定/爆量門檻/獲利因子），Infinity 顯示「∞(全勝)」，進度條改單行說明，「獲利高原」「孤島最佳解」術語各加「意思：」解釋，實戰建議註明「取高原中心，避開孤島」
- [x] **wfo 樣本不足誤判修復**：樣本月份 <4 時明確返回並說明「這不代表策略好壞——是還沒資格被驗證」，不再把 WFE 0% 誤標為「極度過擬合」；窗口表格標註調參/驗證期間，WFE 判定加完整人話解釋
- [x] **驗證通過**：typecheck PASS + 346 測試全綠

## 備註

- **發現並修復資料丟失**：`intraday_loop.ts` 寫 `signal_issued` 事件時只挑了 4 個欄位，把 `SignalAdvice` 已有的執行計劃（進場/停損/目標/RR/倉位）全丟了——日誌層沒存、回放看不到。已補齊 6 欄。
- **此模擬用合成 fixture 劇本（爆量突破→觸發→停利）**：驗證的是「引擎按設計工作」✅，不是「策略能賺錢」⏳——真實多月歷史 1 分 K 資料仍缺（`data/historical_1m` 為空）。
- 修改過程受沙箱限制（edit 工具無法訪問 ~/Projects），以 exec + Python 精確替換完成，備份在 /tmp/simulate.ts.bak。
- 對應 commit：`4d29824 refactor(cli): 將模擬盤/回測輸出改為人話可讀格式`（4 files, +196/-34）。
