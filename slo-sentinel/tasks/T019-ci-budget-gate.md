---
github_issue: N/A
title: 預算燒穿 CI 部署閘門（F6）
type: feat
priority: low
status: pending
depends_on:
- T006
- T009
- T016
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
blocked_on:
- "T001–T018 全數完成，daemon 實際運行 ≥30 天"
- "累積真實 burn rate 數據並完成門檻校準（凍結政策經利害關係人同意）"
- "至少一個目標服務的 CI 管線確定可接入"

---

# T019 - 預算燒穿 CI 部署閘門（F6）

> ⛔ **本任務受外部條件約束**：上方 `blocked_on` 三項全數滿足前**不得開工**。
> 排程器挑到本任務時，應先逐項檢查前置條件；未滿足則跳過並記錄原因。
> 提前實作的風險：門檻未經校準就自動擋部署，誤擋會摧毀工具信譽。

## 目標
Error budget 燒穿（狀態機進入 critical）時，對目標服務的 CI/CD 管線產生實質約束：
部署步驟查詢 sentinel 的預算狀態端點，critical 時以非零 exit code 擋下並在 PR/流水線
留言說明原因與豁免途徑。

## 功能設計
1. sentinel 新增唯讀端點 `/api/budget-status/{slo_id}`：
   回傳 `{state, remaining_budget%, eta, confirmed_date}`（沿用 store 既有資料）
2. 提供 CI step 片段（bash + curl）：state=critical 時 exit 1，附人話說明與豁免申請連結
3. 豁免機制：admin 於 Telegram 批准「限期豁免」（預設 24h），期間端點回傳豁免戳記；
   豁免紀錄入時間線供 postmortem 追溯

## 驗收標準
- [ ] 前置條件三項逐一驗證通過並記錄於本檔（日期＋證據連結）後，才開始實作
- [ ] 端點回傳格式有契約測試；CI step 片段在 critical/warning/healthy 三狀態下行為正確
- [ ] 豁免流程端到端測試：批准 → 端點放行 → 期限過後恢復阻擋
- [ ] 誤擋演練：模擬誤報情境下，開發者可在 5 分鐘內自行完成豁免（文件化）

## 備註
- 擋部署是政策決定：門檻值必須來自 T009 運行期累積的真實數據校準，不得拍腦袋
- 對應規格：spec.md F6；原列「後期」，本任務書將其納入追蹤但鎖在前置條件後
