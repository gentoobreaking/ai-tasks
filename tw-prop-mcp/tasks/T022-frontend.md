---
github_issue: ""
title: Frontend Implementation
type: task
priority: medium
status: done
depends_on:
  - T017
assignee: "pi with opencode"
created: 2026-09-03
updated: 2026-09-04
---

# T022 - Frontend Implementation

## 目標
實作前端視覺化介面，整合 Google Maps 顯示地籍圖、交易點位、道路、衛星圖、Street View、Comparable 交易、估值結果。

## 驗收標準
- [x] React + TypeScript 專案建立
- [x] Google Maps JavaScript API 整合 (需 API key / billing 管理)
- [x] 顯示功能：parcel polygon, transaction marker, road, satellite, Street View, comparable transactions, valuation result
- [x] NLSC GIS layer 疊加顯示
- [x] 前端不參與核心計算，僅負責視覺化
- [x] Credential 與 usage 獨立管理
- [x] 響應式設計、錯誤狀態處理

## 備註
- Frontend 不參與核心計算 (Phase 15)
- Google Maps API 需要 API key / billing，前端整合必須另外管理 credential
- 架構：MCP → parcel geometry/centroid/road geometry/transaction locations → Frontend → NLSC GIS layer + Google Satellite + Google Street View