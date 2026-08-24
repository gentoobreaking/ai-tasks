---
github_issue: N/A
title: 成本/預算 CI 整合——notify 模式（F6 Phase 1）
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

## 目標
freeze_policy.yaml `mode: notify` 下的軟性整合：
- sentinel 提供唯讀端點 `/api/budget-status/{slo_id}`，回傳
  `{mode, state, remaining_budget%, eta, confirmed_date}`
- 提供 CI step 片段（bash + curl）：warning 時在 PR/流水線**留言警告**，
  critical 亦僅留言＋exit code 為 0（不阻擋），全程寫入紀錄供日後校準

> 本任務為 notify 模式；enforce（暫停部署）見 T021，其 blocked_on 含政策檔切換與數據校準前置。

## 功能設計
1. **政策檔熱載入**：freeze_policy.yaml 變更（fsnotify）→ 立即生效免重啟；
   啟動時驗證 prerequisites，缺件自動降級 notify
2. **政策 CLI**：
   - `sentinel policy status`（現行模式/門檻/豁免者）
   - `sentinel policy override --mode <notify|enforce> --duration 24h --reason "..."`
     （臨時覆寫存 SQLite 帶到期自動還原；審計欄位記 reason 與操作者）
3. sentinel 提供唯讀端點 `/api/budget-status/{slo_id}`，回傳
   `{mode, state, remaining_budget%, eta, confirmed_date}`
4. CI step 片段（bash + curl）：依當下 mode 反應——notify 只留言；enforce 見 T021

> 生產實務：平時用 notify；需要收緊時改檔案或下臨時 override，
> 不必重新部署。所有切換都有審計紀錄。
## 驗收標準
- [ ] 前置條件三項逐一驗證通過並記錄於本檔（日期＋證據連結）後，才開始實作
- [ ] 端點回傳格式有契約測試；CI step 片段在 critical/warning/healthy 三狀態下行為正確
- [ ] 豁免流程端到端測試：批准 → 端點放行 → 期限過後恢復阻擋
- [ ] 誤擋演練：模擬誤報情境下，開發者可在 5 分鐘內自行完成豁免（文件化）

## 備註
- 擋部署是政策決定：門檻值必須來自 T009 運行期累積的真實數據校準，不得拍腦袋
- 對應規格：spec.md F6；原列「後期」，本任務書將其納入追蹤但鎖在前置條件後
