---
github_issue: N/A
title: MOPS Adapter（財報 / 月營收 / 重大訊息）
type: feature
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T012 - MOPS Adapter

## 目標
實作 `pkg/provider/mops.go`：公開資訊觀測站之月營收、財報三表、重大訊息、公司基本資料 Adapter（§2 MOPS 登錄）。

## 驗收標準
- [ ] 月營收（含 YoY/MoM 成長率 helper 計算）、財報三表（損益/資產負債/現金流量，支援年度與季度期間參數）
- [ ] 重大訊息（可依日期/symbol/關鍵字過濾）、公司基本資料
- [ ] Validate + Normalize + 單位換算；營收/金額欄位與 §5.1 一致
- [ ] TTL 政策：營收/財報 12h（§4.2）；重大訊息 5min
- [ ] 契約測試（fixtures 回放）：財報期間解析、欄位完整性、缺值為 null
- [ ] 供應 §10.C `get_major_announcements` 與 §10.D 基本面工具（T014）

## 備註
- MOPS 頁面結構較多變，fixtures 需保留歷史版本以偵測官方改版
- Rate Limit 1/2s（§4.4）；財報為大型 payload，留意記憶體與 gzip
