---
github_issue: N/A
title: 每日摘要定時觸發接線
type: feat
priority: medium
status: done
depends_on:
- T008
- T009
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-25
updated: 2026-08-26

---

# T025 - 每日摘要定時觸發接線

## 背景（功能孤兒）
`alert.FormatDigest`／Digest 彙總已實作，但 daemon 迴圈無定時觸發——
README Limitations 已誠實記載「通知排程未自動化」。
同 session 的每週成本摘要（maybeWeeklyCost）已建立可複製的模式：
ISO 週去重、store 持久化、發送失敗不登記下輪重試。

## 目標
daemon 每日固定時間發送一封全感測狀態彙總摘要。

## 實作要點
1. 觸發時刻可設定（預設每日 09:00 本地時區；config/env 覆寫）
2. 去重：store 持久化最後發送日（同日重啟不重發）；
   發送失敗不登記、下輪重試（照抄 maybeWeeklyCost 模式）
3. 內容：各感測現況＋過去 24h 狀態變化清單（可從 store states/predictions 推導）
4. `DAILY_DIGEST=off` 可停用；billing 未啟用時照常發送（只含感測狀態）

## 驗收標準
- [x] 到達設定時刻自動發送一封彙總；同日不重發（重啟驗證）
- [x] 發送失敗不登記、恢復後補發
- [x] off 開關生效
- [x] README Limitations 的「通知排程未自動化」條目移除

## 備註
與每週成本摘要（T011 已完成部分）共用模式，可順手抽公共 helper。
