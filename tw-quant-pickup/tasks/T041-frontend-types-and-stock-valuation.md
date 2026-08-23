---
github_issue: 
title: 前端型別強化與個股詳情估值補全
type: refactor
priority: medium
status: done
depends_on: [T038]
assignee: pi with opencode/x-preview-f-free
created: 2026-08-23
updated: 2026-08-23
---

# T41 - 前端型別強化與個股詳情估值補全

## 目標
清除前端所有 any 型別改用 types/api.ts 介面（新增 ServiceHealth / ServicesResponse / Report* 型別與 HealthResponse.mcp_addr）；發現並修復 /stocks/{symbol} 未回傳價格/買區欄位的潛在 bug——後端併入最新 FROZEN snapshot 的估值欄位。

## 驗收標準
- [x] src 內 any 歸零（tsc strict 通過）
- [x] Stock 型別含選填估值欄位
- [x] 後端 get_stock JOIN 最新 valuations
- [x] FakeDB 支援新查詢形態

## 備註
無
