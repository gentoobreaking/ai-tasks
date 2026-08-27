---
github_issue: N/A
title: 成本 adapter 真實雲端驗證（移除 NEEDS VERIFICATION）
type: chore
priority: low
status: skeip
depends_on:
- T010
blocked_on:
- "可用的 AWS 帳號（有實際花費的 CE 資料）"
- "可用的阿里雲帳號（BSS 帳務資料）"
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-25
updated: 2026-08-25

---

# T030 - 成本 adapter 真實雲端驗證

## 背景
`internal/billing`（AWS CE SigV4／阿里雲 BSS HMAC）僅經 fake server 測試，
README Limitations 標注 `[NEEDS VERIFICATION]`。回應結構、分頁行為、
幣別/標籤欄位名等只有對真實 API 才能確證。

## 目標
以真實帳號各跑一次端到端，將結果記錄於本檔，移除 README 的
NEEDS VERIFICATION 標注（或據差異修正程式）。

## 驗收標準
- [ ] AWS CE：真實帳號拉取近 7 天 DailySpend，比對 console 金額一致（誤差 <1%）
- [ ] 阿里雲 BSS：同上；確認 Cost 欄位幣別與標籤過濾行為
- [ ] 分頁／空資料／無權限三種情境的錯誤訊息可用性確認
- [ ] 發現的欄位名或結構差異修正後補 fake server 測試案例
- [ ] README Limitations 對應條目更新（保留未支援項：攤銷、匯率）

## 備註
- servers.com OpenMetrics 經驗顯示：文件與真實回應常有出入（本次已驗證
  token 有效但帳號無主機 → 空 body），真實雲端同理必須實測
- 只讀查詢，不產生費用；唯帳號本身需已有歷史帳務資料
