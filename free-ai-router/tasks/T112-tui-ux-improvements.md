---
github_issue: 
title: TUI UX 改善：READY 隱藏提示、Settings 狀態保留、渲染效能
type: feature
priority: medium
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-23
updated: 2026-08-24
---

# T112 - TUI UX 三合一改善

## 目標
1. codingOnly 預設過濾掉 127/149 個模型，但只有小小的 READY 標籤，
   使用者以為模型遺失
2. 每次進 Settings 都重建 screen，游標位置與狀態訊息遺失
3. View() 每次 render 做三次 registry.Snapshot() 深拷貝

## 驗收標準
- [x] header 顯示「+N hidden by READY (press c)」提示
- [x] SettingsScreen 跨造訪重用（僅首次建立，SetConfig 同步最新 cfg）
- [x] 單次 snapshot 共享給 filtered list / TotalCount / 隱藏數計算
      （新增 filteredFrom(snap) helper）

## 備註
commit 775b2ea。
