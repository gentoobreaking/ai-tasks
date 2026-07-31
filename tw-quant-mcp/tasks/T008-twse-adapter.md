---
github_issue: N/A
title: TWSE Adapter（OpenAPI + Web API 盤後）
type: feature
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T008 - TWSE Adapter

## 目標
實作 `pkg/provider/twse.go`：TWSE OpenAPI（`openapi.twse.com.tw`）與 Web API（`www.twse.com.tw/exchangeReport/*`）之盤後資料 Adapter，涵蓋 §2 登錄表 TWSE-API / TWSE-WEB 全部內容。

## 驗收標準
- [ ] 個股日 K（日/週/月）、月均價、還原價格（`adjust` 參數）
- [ ] 融資融券、三大法人買賣超（上市，金額+股數）、外資持股歷史、全市場收盤行情、加權指數歷史
- [ ] 鉅額交易、權證交易統計、異常成交量、ESG/公司治理（OpenAPI）
- [ ] 每資料集實作 Validate + Normalize；TWSE 原生單位（仟元/張）於 Adapter 內依 §5.1 換算（有測試）
- [ ] 契約測試：以錄製 raw response fixtures 驗證 Normalize 後欄位型別、單位、日期格式
- [ ] 回傳原始 raw 僅入 internal 暫存，不直接外洩（§3.1）

## 備註
- 各資料集 Rate Limit 依 T003 §4.4 表（TWSE-WEB 1/2s、TWSE-API 1/1s）
- 全市場行情為大型 payload，建議支援欄位修剪（§12.7）以節省記憶體
- 此 Adapter 供應 §10.B 之大部分工具（T011）
