---
github_issue: N/A
title: 成本/預算 CI 部署閘門——enforce 模式（F6 Phase 2）
type: feat
priority: low
status: skip
depends_on:
- T019
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
blocked_on:
- "daemon 實際運行 ≥30 天，burn rate 分佈已用於門檻校準"
- "evalkit/accuracy 命中率報告達標（誤報可控）"
- "freeze_policy.yaml 已切換 mode=enforce 且 approved_by 至少一人（git 審查即為明文同意憑證）"

---

# T021 - 成本/預算 CI 部署閘門——enforce 模式（F6 Phase 2）

> ⛔ **本任務受外部條件約束**：上方 `blocked_on` 全數滿足前不得開工。
> 排程器挑到時應逐項驗證；未滿足則跳過並記錄原因。
>
> **否決權歸屬聲明**：本系統不自動否決任何行動——enforce 模式執行的是
> freeze_policy.yaml 中經人工審查同意的條件政策，且永遠保留豁免通道；
> 「何時可擋、誰能豁免」全部由該檔案定義，變更須走 git 審查。

## 目標
freeze_policy.yaml `mode: enforce` 下：CI step 查詢 `/api/budget-status/{slo_id}`，
state=critical 且無有效豁免 → exit 1 暫停部署，並在 PR/流水線留言說明原因與豁免途徑。
豁免由 approvers 於 Telegram 批准（限期），期間端點回傳豁免戳記放行。

## 功能設計
1. sentinel 載入 freeze_policy.yaml；啟動驗證 prerequisites——
   未滿足則強制降級 notify 模式並 log.warning（防呆，不可設定繞過）
2. `/api/budget-status/{slo_id}` 依 policy.mode 回傳不同行為欄位
3. 豁免機制：approvers 於 Telegram 批准限期豁免 → 紀錄入時間線 → 期限後自動恢復
4. **運行時雙向切換（生產必需）**：
   - 永久切換：編輯 freeze_policy.yaml 的 mode → 熱載入即時生效（走 git 審查）
   - 臨時覆寫：`sentinel policy override`（存 SQLite、帶到期與 reason，
     到期自動還原基準 mode）——事故期間降級、活動期間收緊，皆不需重新部署
   - 切換事件一律寫入時間線與 /metrics（誰/何時/為何）

## 驗收標準
- [ ] 前置條件三項逐一驗證通過並記錄於本檔（日期＋證據連結）後才開始實作
- [ ] 政策檔載入與防呆：mode=enforce 但 prerequisites 缺件 → 啟動時降級 notify + log.warning
- [ ] CI step 片段在 notify/enforce×healthy/warning/critical 的行為矩陣測試
      （notify 一律 exit 0；enforce 僅 critical+無豁免 exit 1）
- [ ] 豁免端到端：批准 → 放行 → 期限過後恢復阻擋；豁免原因入時間線
- [ ] 誤擋演練文件化：開發者可在 5 分鐘內自行完成豁免

## 執行紀錄（2026-08-26：demo 預演環境預建，狀態仍 pending）
- T019 mock 驗證時已預建 enforce 預演環境（commit e9d2939）：
  `docker compose --profile demo up -d sentinel-demo` ＋
  `sentinel demo-seed`（合成 35 天歷史滿足 prerequisites）——
  可完整演練熱載入/阻擋/豁免/逾期恢復；資料存 sentinel-demo-data 卷。
- ⚠️ 合成資料不得作為本任務生產切換的校準證據；blocked_on 三項不變。

## 執行紀錄（2026-08-26：技術面補完，mock 驗證；狀態仍 pending）
- Commit cd5ece9（使用者決策：技術面提前完成）：
  - Telegram 豁免批准 bot——/waive（僅 approvers；超上限鉗位至 max_duration）、
    /waivers；越權拒絕並記 warning（waiver_bot.go）
  - 政策切換時間線 store v7 policy_events＋policy.OnSwitch 回呼；
    CLI override/waive 同步入庫
  - /metrics：sentinel_policy_mode / switch_events_total /
    waivers_active / overrides_active（refreshPolicyMetrics）
- 全 mock 端到端測試：fake Telegram server（批准+鉗位/越權拒絕/清單）＋metrics 斷言；
  go vet/test ./... 17 套件通過。
- demo 環境可完整預演：docker compose --profile demo ＋ deploy/demo/README.md。
- **剩餘＝blocked_on 三項生產前提**（真實 burn rate ≥30 天校準、accuracy 報告達標、
  freeze_policy.yaml git 審查切換 enforce），mock 無法替代，故狀態維持 pending。

## 執行紀錄（2026-08-26 續：命中率量測工具補齊，commit 2395a77）
- 使用者指出「無法使用 fake 累積數據」——確認：三項 blocked_on 均不可由合成資料替代。
- 排查發現缺口：/api/accuracy 原本只有預測筆數，**無命中率計算**——
  即使 30 天數據到位也產不出第 2 項要求的報告。
- 已補齊 internal/accuracy 回測引擎（預估燒穿 vs 實際燒穿內插比對、
  hit/miss/false_alarm/pending、Pass(target) 含誤報控制）＋
  `sentinel accuracy-report [-record]` CLI（達標寫 meta.accuracy_report_ok=1，
  即 prerequisites 證據）。演算法以合成時間序列驗證（7 測試案例）。
- 時鐘語意：30 天自 daemon 對真實 Prometheus 運行起算；demo 環境不計入。

## 備註
- 對應規格：spec.md F6；政策檔格式：docs/freeze-policy.example.yaml
- 變更模式/門檻/豁免者 = 修改 freeze_policy.yaml 走 git 審查——「同意」有跡可循
