---
github_issue: ""
title: "模組說明文件（盤前/簡報/評分/Priority Ranking）+ Apache-2.0 License 宣告"
type: task
priority: medium
status: done
depends_on: [T027]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-12
updated: 2026-08-12
---

# T028 - 模組說明文件 + License 宣告

## 目標

把 README 功能總覽中四個核心模組的「說明」補成獨立文件（內容全部實讀源碼核對），
並在 README 末尾加上 Apache-2.0 License 宣告與連結。README 相關文字掛上對應文件連結。

## 驗收標準

- [x] `docs/pre-market.md`：盤前選股邏輯（Phase 0 就緒檢查 5 工具 / Phase 1 三路徑選股去重 / 低訊號日降門檻 20→30 / 風控過濾 / 觸發價=昨日高點、停損=min(-1.5%,VWAP) / watchlist ≤15 / PreMarketReport 結構）
- [x] `docs/briefing.md`：策略簡報（08:55 鎖定 / Bias 對應規則表 / 動態時間窗 / key_levels / 三種查看方式：直接看 briefings/、jq 查詢、事件日誌回放 / 盤中找不到簡報→拒絕交易）
- [x] `docs/scoring.md`：四條件評分（4×25 權重表 / Veto -50 扣分 vs -100 否決 / 門檻 75/60/NEUTRAL 85 / ScoreInput/ScoreResult / 訊號生命週期含 5 分鐘過期）
- [x] `docs/priority-ranking.md`：Priority Ranking + 風控審核（三層流程 / evaluateSignal 8 道關卡表 / Rank Score 公式 0.4×盤前+0.5×爆量−0.1×偏離 / Tier 資金表 33/20/10/拒 / 族群 40% 上限 / 搶單機制）
- [x] README 加連結：功能總覽 4 行（盤前選股/盤中監控/優先權派單/戰術簡報）+ 情境 A 排程表 3 行 + 目錄結構 docs/ 補 4 個文件
- [x] README 末尾 `## License`：Apache License 2.0 宣告 + 連結 [`LICENSE`](LICENSE) + Apache 官方條款 URL
- [x] `package.json` license 欄位 `UNLICENSED` → `Apache-2.0`（與既有 LICENSE 檔案一致，修不一致）
- [x] 文件間互鏈 8 處驗證有效；typecheck PASS

## 備註

- 對應 commit：`docs: 模組說明文件` + `license: Apache-2.0`
- 4 份文件內容全部實讀源碼核對（phase0/phase1.ts、briefing/generator.ts、scoring.ts、priority_engine.ts），非憑 README 轉寫
- 發現並修正既有不一致：LICENSE 檔案為 Apache 2.0 全文，但 package.json 標 `UNLICENSED`
