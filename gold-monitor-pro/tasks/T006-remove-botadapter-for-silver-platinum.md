---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/252
title: 銀/鉑金的 BOTAdapter 移除
status: done
assignee: 寶寶
created: 2026-05-01
updated: 2026-05-01
---

## 目標

移除 silver/platinum 的 BOTAdapter 呼叫，因為台銀不提供這兩個金屬的牌價。

## 已完成

gold_intl_monitor.py 不呼叫 BOTAdapter，純用 Yahoo Finance + Alpha Vantage。
silver/platinum 的 alert 訊息不含 local_sell/local_buy 欄位。

## 驗證標準

- [x] gold_intl_monitor.py 不 import BOTAdapter
- [x] silver/platinum 只用 Yahoo Finance
- [x] silver_intl / platinum_intl alert 只顯示 USD 價格，無 NTD/公克
- [ ] silver/platinum Yahoo Finance 失敗 → Alpha Vantage fallback 成功（需模擬）