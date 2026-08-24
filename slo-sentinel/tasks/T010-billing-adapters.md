---
github_issue: N/A
title: 帳務 adapter internal/billing（actual 校準模式，選配）
type: feat
priority: medium
status: done
depends_on:
- T001
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T010 - 成本帳務 adapter internal/billing

## 目標
`internal/billing`：BillingSource interface（DailySpend(service, tags, range)）+
AWS Cost Explorer adapter + AlibabaCloud BSS adapter。資料延遲特性依
algs/cost-forecast.md §D.1——所有資料點必須帶「確認日期」戳記。

> **T022 修訂後定位**：本任務屬 **actual 校準模式（選配，需 billing IAM）**。
> 主路徑為 estimate 模式（公開價目表 × 用量，見 T022）——維護人員無需
> billing 權限即可使用成本功能。本 adapter 供有權限者校準推估精度。

## 驗收標準
- [x] AWS CE：GetCostAndUse 支援 service/tag/account filter，DAILY 粒度（§D.1 表格）
- [x] Alicloud BSS：QueryInstanceBill 對等能力
- [x] 兩 adapter 以 fake HTTP server 測試（不打真 API）；分頁/限流處理有測試
- [x] 回傳資料自帶 confirmed_date 戳記——下游推估以此為基準點（§D.1 鐵律）

## 備註
- v1 只做 unblended cost；RI/SP 攤銷、分層定價、即時匯率列 v2（§D.4 誠實聲明）

## 執行紀錄（2026-08-24 稽核）
- 已達成 4 項並打勾。
- **未竟事項**：限流處理為重試退避機制涵蓋；專屬限流標頭解析未做

