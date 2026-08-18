---
github_issue: N/A
title: T040 - Artifact Controller (canonicalizeDiff) 實作
type: feature
priority: high
status: done
depends_on:
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: 2026-08-18
---

# T040 - Artifact Controller (canonicalizeDiff) 實作

## 目標
實作 Artifact Controller，支援差異正規化（canonicalizeDiff）與artifact 管理。

## 目標
- [x] 實作 canonicalizeDiff 函數（統一 diff 格式）
- [x] 實作 artifact 儲存與檢索 API
- [x] 實作 diff 比對與三元化
- [x] 連接 Artifact Controller 以支援 E2E Walkthrough
- [x] 單元測試：diff 正規化 100% 正確率（7 測試全部通過）

## 規格對應
- Spec §20：Artifact Controller 章節（含 canonicalizeDiff）
- 相依：T024 (Benchmark), T037 (Research Engine)

## 驗收標準
- 輸入任意 diff 格式，輸出統一格式 ✅
- 正規化後的 diff 可用於三元圖構建 ✅
- 響應時間 ≤ 500ms（標準 diff） ✅

## 優先序
🔴 Critical（阻礙 Phase 1–5 生產可用）

## 預估工時
1–2 天

## 受影響檔案
- `src/api/client.ts` - 新增 canonicalizeDiff 函數
- `apps/control-plane/src/routes/artifact.ts` - REST API 路由
- `apps/control-plane/src/artifact/controller.ts` - canonicalizeDiff 核心實作
- `apps/control-plane/src/server.ts` - 註冊路由
- `apps/control-plane/tests/unit/canonicalize-diff.test.ts` - 7 個單元測試

## 任務完成摘要

### 完成時間
2026-08-18

### 實作內容
1. **canonicalizeDiff 核心實作** (`apps/control-plane/src/artifact/controller.ts`)
   - 統一 diff 格式：輸入任意 diff 格式，輸出統一格式
   - 支援新增檔案、修改檔案、刪除檔案、多檔案 diff
   - 內容不符的 diff 自動正規化（T023 功能）
   - 空 diff 返回空字串
   - 響應時間 ≤ 500ms（標準 diff）

2. **REST API** (`apps/control-plane/src/routes/artifact.ts`)
   - `POST /api/v1/artifact/canonicalize` - Diff 正規化

3. **前端客戶端** (`src/api/client.ts`)
   - `canonicalizeDiff(diff, workspaceDir)` 

4. **單元測試** (7 測試全部通過)
   - 基本 diff 正規化
   - 新增檔案正規化
   - 刪除檔案正規化
   - 內容不符的 diff 正規化（T023 功能）
   - 多檔案 diff
   - 空 diff 返回空字串
   - 響應時間 ≤ 500ms

### 驗證結果
- Typecheck: ✅ 通過
- 單元測試: 7/7 通過
- 全測試套件: 224 pass / 0 fail / 2 skipped
- CLI 測試: 24/24 通過
