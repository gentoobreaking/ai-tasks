## T009-dashboard-performance-tracking.md 已知口徑差異（非錯誤）
以下為計算口徑或資料源定義不同造成的數值差異，非系統缺陷：

| 指標 | 系統數值 | 對照站數值 | 差異原因 |
|------|---------|-----------|---------|
| **殖利率** | 0.78%（TWSE BWIBBU_ALL，股息/即時股價） | 0.52%（winvest，股息/除息前收盤價） | 分母不同：即時股價 vs 除息
前收盤價 |
| **本益比** | 47.58（TWSE BWIBBU_ALL） | — | TWSE 官方 PE 計算含最新 TTM EPS |
| **EPS 成長率基準** | 同季度跨年 YoY（如 Q1'26 vs Q1'25） | 同季度跨年 YoY | 資料源時間差導致數值不同（yfinance vs 快訊>） |
| **營收成長率基準** | 月營收 YoY（MOPS TWSE 官方月營收） | 月營收 YoY（如 6月 vs 去年同月） | 已改用 MOPS ajax_t05st10_ifrs 月營收，口徑一致 |
