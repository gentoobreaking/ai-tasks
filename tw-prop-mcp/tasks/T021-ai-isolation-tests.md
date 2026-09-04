---
github_issue: ""
title: AI Isolation Tests
type: task
priority: high
status: done
depends_on:
  - T017
assignee: "pi with opencode"
created: 2026-09-03
updated: 2026-09-04
---

# T021 - AI Isolation Tests

## 目標
測試 AI 是否能繞過 MCP boundary 直接操作底層資源。

## 驗收標準
- [x] 測試 AI 嘗試 inject SQL → ALL DENIED
- [x] 測試 AI 嘗試 inject PostGIS expression → ALL DENIED
- [x] 測試 AI 嘗試 change valuation weights → ALL DENIED
- [x] 測試 AI 嘗試 modify snapshot → ALL DENIED
- [x] 驗證 MCP tool 參數結構化，無 raw SQL/PostGIS 欄位
- [x] 驗證 Service Layer 為唯一轉換 SQL/PostGIS 的路徑

## 備註
- P4 AI Isolation 核心要求
- LLM 不得跨越 MCP / Service boundary
- AI 只能：Request interpretation → MCP tool selection → Deterministic engine → Structured result → LLM explanation
- 禁止 MCP tool 接受：SQL, raw SQL WHERE, PostGIS expression, arbitrary code, valuation formula