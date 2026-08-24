---
github_issue: N/A
title: waste 浪費金額接 pricing——候選清單顯示每月可省金額
type: feat
priority: medium
status: done
depends_on:
- T022
- T015
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-25
updated: 2026-08-26

---

# T027 - waste 浪費金額估算（接 internal/pricing）

## 背景
瘦身影候選的浪費金額恆為 0（`SuggestedSaving` 需要單價，一直沒接）。
T022 已實作 `internal/pricing` 價目表目錄（estimate 模式主路徑），
正好補上這塊——讓瘦身影清單有實際經濟誘因數字。

## 目標
waste 候選與 resolve 累積報表顯示「每月可省 $X」（原幣），單價查 pricing。

## 實作要點
1. rules.d 的 waste 規則新增選配 labels：
   - `sentinel_price_family`: ec2 / ebs / rds / alicloud module code
   - `sentinel_price_attrs`: JSON 編碼 {region, instance_type...}
   （或改用 SELECTED 式的 sidecar 對照檔，擇一，避免 label 過長）
2. Scanner 產出 Candidate 時查價：節省量 = expr 數值差 × 單價
   （依 family 語意換算：Hrs×24×30、GB-Mo 直接乘）
3. Tracker resolve 時累積至 ResolvedSaving；/api/waste 與 UI 顯示
4. 查價失敗 → 金額欄留空＋標注原因（不阻擋候選成立）

## 驗收標準
- [x] 有 price 對照的候選顯示每月可省金額與幣別；無對照者顯示「—」不誤導
- [x] 查價走 Catalog.Quote（享受 TTL 快取與 stale fallback）
- [x] resolve 後的累積節省在 CLI/API 可查
- [x] 全套測試離線可跑（fake pricer）

## 備註
- §D.4：幣別如實標注，混合幣別標 "mixed"，不做匯率換算
