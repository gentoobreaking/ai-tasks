---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/600
title: Supervisor Workflow transitions 流程圖編輯器
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-18
updated: 2026-05-18
howto: null
---

# T092 - Supervisor Workflow 流程圖編輯器

## 目標
將 Supervisor Workflow → transitions 從純文字 dict 改為可視化流程圖編輯器。

## 驗收標準
- [x] 新元件 `TransitionsEditor`（SVG 流程圖 + 管理面板）
- [x] 節點以彩色方塊顯示角色（user/PO/PM/Architect 等）
- [x] 垂直分層佈局（根據 DAG 計算），不再擠在一排
- [x] 從 → 到 以 curved arrow 繪製
- [x] 下拉選單新增 transition（來源角色 → 目標角色）
- [x] 標籤式移除 transition（點 ✕）
- [x] 支援移除整個角色的所有 transition
- [x] DictField array 補上 ▲▼ 排序、✕ 刪除、+ 新增
- [x] `frontend_api` service 補上 `./config:/app/config:rw` mount 使 config 修改能寫回 host
- [x] Agent Definitions 預設展開
- [x] Schema type 修正為 `dict` + ConfigSection 內偵測 `transitions` 子 key 才用 TransitionsEditor
- [x] Persist 機制與其他欄位一致（PUT /api/v1/config）

## 備註
- docker-compose.yml frontend_api 需要 `./config:/app/config:rw` 才能寫入 config/agents.yaml
- 角色顏色對應：user=indigo, PO=purple, PM=pink, architect=amber, coder=emerald, doc=blue, researcher=cyan, QA=red, devops=teal
- 無需安裝第三方套件，SVG + React state 即可
