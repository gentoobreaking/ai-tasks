---
github_issue: N/A
title: SLO 感測門檻可調整——slo_defs 支援 thresholds 區塊
type: feat
priority: medium
status: pending
depends_on:
- T002
- T009
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-25
updated: 2026-08-25

---

# T023 - SLO 感測門檻可調整（slo_defs thresholds）

## 背景
capacity 家族已支援 per-sensor 門檻覆寫（`ThresholdsOverlay` 四欄位皆可選，
未寫用預設）；budget 家族的 SLO 感測在 `cmd/sentinel/daemon.go` 組裝處寫死
`Th: budget.DefaultThresholds()`，且 `slo_defs/*.yaml` schema 無 thresholds
欄位——所有 SLO 感測被迫共用 72h/6h/0.80/0.95。

## 目標
讓每個 SLO 感測可比照 capacity 家族，獨立覆寫四個門檻。

## 實作要點
1. `internal/spec` 的 `SLO` struct 新增選配欄位：
   ```yaml
   slos:
     - id: api-availability
       ...
       thresholds:
         warn_eta: 48h      # 可選；以下四者皆為指標型，未寫用預設
         crit_eta: 4h
         soft_ratio: 0.70
         crit_ratio: 0.90
   ```
2. daemon SLO 感測組裝處改為 resolve 後傳入引擎（取代寫死的 DefaultThresholds）
3. 驗證沿用既有約束：soft_ratio < crit_ratio、warn_eta > crit_eta
   （對應 budget.Thresholds.validate）

## 驗收標準
- [ ] `slo_defs` schema 解析 thresholds 四個可選欄位（缺省不影響既有檔案）
- [ ] 未設定時行為與現狀完全一致（回歸測試）
- [ ] 設定後引擎收到覆寫值（單元測試斷言 Th 內容）
- [ ] 非法組合（soft ≥ crit、warn_eta ≤ crit_eta）啟動時報錯明確
- [ ] 文件同步：`docs/engine-budget-capacity.md` §6 門檻調整速查表
      移除「budget 家族不可調」的現狀描述；README Configuration 表補充

## 備註
- 發現脈絡：dev profile 實測時比對兩家族可調性，發現 budget 家族鎖死預設
  （見 docs/engine-budget-capacity.md §6）
- 另一個被否決的替代方案：維持統一預設值以簡化 schema——若未來多數使用者
  不需要調整，本任務可降級或關閉
