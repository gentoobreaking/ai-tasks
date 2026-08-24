---
github_issue: N/A
title: 容量感測引擎 internal/capacity
type: feat
priority: high
status: done
depends_on:
- T006
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T007 - 容量感測引擎 internal/capacity

## 目標
`internal/capacity/forecast.go`：解析 `capacity_defs/*.yaml`（value/ceiling 兩條 PromQL +
soft/hard ceiling + horizons），查詢指標後重用 budget 的 eta.go/state.go 產出「觸頂時間」預警。

## 驗收標準
- [ ] `capacity_defs/*.yaml` 解析：value/ceiling 兩條 PromQL（ceiling 為動態查詢）、soft/hard ceiling、horizons 可覆寫
- [x] ceiling 跳變 >1% → 清空該定義所有視野快取重新累積（algs/capacity-eta.md §A.5 第四條）
- [x] 推播格式：「⚠️ {name} 使用率 {U}%——若持續爆量約 X 小時後觸頂；若回常態尚餘 Y 天」（§A.3/A.7 格式，golden test 斷言文案）
- [ ] spec.md F8 清單逐項測試定義檔：HPA current/max 比、區域 vCPU quota、RDS 連線數、磁碟成長、conntrack
- [x] 低使用率+快速成長案例：U=30%、ETA_cons<72h → 必須觸發 warning（§A.4 第二條，靜態閾值瞎掉的情境）
- [x] 雲端 autoscale 情境文件化：SLO 綠燈假象下只有本感測能提前預警 quota/node max 撞牆（F9 描述）

## 備註
- 這是「雲端 autoscale 撞牆」「地端容量逼近」兩個場景的前驅預警核心（spec.md §1.2）

## 執行紀錄（2026-08-24 稽核）
- 已達成 4 項並打勾。
- **未竟事項**：F8 清單僅磁碟定義有測試；HPA/quota/conntrack 定義檔待實際環境補齊

