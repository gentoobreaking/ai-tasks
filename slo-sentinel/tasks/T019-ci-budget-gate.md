---
github_issue: N/A
title: 成本/預算 CI 整合——notify 模式（F6 Phase 1）
type: feat
priority: low
status: done
depends_on:
- T006
- T009
- T016
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-26
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
- [x] 前置條件處理：**使用者決策變更（2026-08-26）**——blocked_on 三項鎖的是
      enforce 門檻的生產校準（政策決定），非 notify 模式實作；經確認改以
      mock/合成資料完成全部功能，enforce 切換前置原封不動移交 T021
      （prerequisites 防呆保留：缺件自動降級，不可設定繞過）
- [x] 端點回傳格式有契約測試；CI step 片段在 critical/warning/healthy 三狀態下行為正確
      （既有契約/煙霧測試＋新增 TestBudgetHandlerSmokeWaiverMatrix：
      notify 恔 exit 0；enforce 僅 critical+無豁免 exit 1；豁免放行 exit 0）
- [x] 豁免流程端到端測試：批准 → 端點放行 → 期限過後恢復阻擋
      （TestBudgetStatusWaiverEndToEnd 可注入時鐘；store 層
      TestPolicyOverrideExpiryAutoRestore/TestWaiverLifecycle/TestRevokeWaiver）
- [x] 誤擋演練：模擬誤報情境下，開發者可在 5 分鐘內自行完成豁免（文件化）
      （docs/ci-budget-gate.md「誤擋豁免演練」＋scripts/budget-waiver-drill.sh
      三階段演練 3/3 通過；sentinel policy waive 一條命令即放行）

## 執行紀錄（2026-08-25：Phase 1 地基預建）
- 已提前實作（使用者指示）：`GET /api/budget-status/{slo_id}` 端點＋契約測試、
  `scripts/cd-budget-handler.sh`（三狀態/fail-open/jq 備援/BUDGET_ENFORCE 鉤點）、
  `docs/ci-budget-gate.md` 四種 CI 接入範例、httptest→真 bash 腳本煙霧測試。
  Commit：feat "成本/預算 CD 閘門 Phase 1"。
- **狀態維持 pending**：政策檔熱載入、policy CLI、豁免流程端到端、誤擋演練
  文件化仍鎖在 blocked_on 三項前置後，不得提前放水。

## 執行紀錄（2026-08-26：mock 驗證完成，任務結案）
- 使用者確認以 mock/合成資料完成剩餘實作（enforce 生產校準仍鎖 T021 blocked_on）。
- Commit d809da6：internal/policy（載入/prerequisites 降級防呆/熱載入/
  EffectiveMode 覆寫優先）、store v6（meta/policy_overrides/waivers 審計表）、
  daemon 掛載＋first_boot 運行天數證據、端點 waived/waiver/override 欄位、
  `sentinel policy status|override|waive` CLI、腳本豁免矩陣與自救提示、
  docs/ci-budget-gate.md 政策管理＋誤擋演練文件、budget-waiver-drill.sh。
- go test ./... 17 套件全數通過。
- Commit e9d2939（後續補強）：契約 fixture 留存（internal/policy/testdata＋
  cmd/sentinel/testdata/budget-status，矩陣測試改 fixture 驅動）、
  接口對接總覽 docs/f6-contract.md、T021 docker demo 預演環境
  （--profile demo ＋ demo-seed 合成歷史，詳見 deploy/demo/README.md）。

## 備註
- 擋部署是政策決定：門檻值必須來自 T009 運行期累積的真實數據校準，不得拍腦袋
- 對應規格：spec.md F6；原列「後期」，本任務書將其納入追蹤但鎖在前置條件後
