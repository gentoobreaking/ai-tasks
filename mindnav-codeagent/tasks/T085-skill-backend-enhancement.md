---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/575
title: Skill Backend 強化
type: Feature
priority: medium
assignee: OpenCode DeepSeek V4 Flash
status: done
created: 2026-05-18
updated: 2026-05-21
howto: null
---

# T085 - Skill Backend 強化

## 目標
強化現有的 Skill backend，提供完整的 API 支持給 Dashboard UI。

## 驗收標準
- [x] 將 `auto_skill_extractor.py` 封裝為 API：
  - [x] `POST /api/v1/skills/auto-extract` - 從 context 自動抽取 skill
  - [x] `GET /api/v1/skills/auto-extract/status` - 查看抽取狀態
- [x] 將 `skill_optimizer.py` 封裝為 API：
  - [x] `POST /api/v1/skills/optimize` - 觸發優化（可指定單個 skill 或全部）
  - [x] `GET /api/v1/skills/optimize/status` - 查看優化狀態
- [x] 將 `skill_regression` 封裝為 API：
  - [x] `GET /api/v1/skills/regression` - 獲取回歸檢測結果
  - [x] `POST /api/v1/skills/regression/trigger` - 手動觸發
- [x] Skill usage tracking API：
  - [x] `GET /api/v1/skills/usage` - 獲取使用統計
  - [x] `POST /api/v1/skills/feedback` - 記錄用戶反饋
- [x] 長期運行任務使用 FastAPI BackgroundTasks（非同步處理）

## 備註
- 現有 `skill_tracker.py` / `skill_optimizer.py` / `auto_skill_extractor.py` 已有實現
- 祇需添加 API 封裝層
- 長期運行的任务应使用后台任务队列

## T085 完成。以下是交付摘要：

**新增文件**

| 檔案 | 說明 |
|------|------|
| `frontend_api/routers/__init__.py` | package marker |
| `frontend_api/routers/skills_router.py` | 8 個 API endpoint + BackgroundTasks 背景佇列 |

**8 個 Endpoint**

| Method | Path | 功能 |
|--------|------|------|
| `POST` | `/api/v1/skills/auto-extract` | 背景抽取 skill（傳入 context/thread_id/source_task） |
| `GET` | `/api/v1/skills/auto-extract/status` | 查看抽取狀態（idle/running/completed/failed） |
| `POST` | `/api/v1/skills/optimize` | 觸發優化（body 可帶 `skill_name` 選定單個） |
| `GET` | `/api/v1/skills/optimize/status` | 查看優化狀態 |
| `GET` | `/api/v1/skills/regression` | 列出所有 degrading/quarantined 技能 |
| `POST` | `/api/v1/skills/regression/trigger` | 手動觸發所有技能回歸檢測 |
| `GET` | `/api/v1/skills/usage` | 所有技能使用統計（usage_count/success_rate/version 等） |
| `POST` | `/api/v1/skills/feedback` | 記錄用戶反饋（approve/reject/revise） |

**修改檔案**

| 檔案 | 變更 |
|------|------|
| `engine/skills/skill_tracker.py` | 修復 `degradation_report()` — 原本回傳空 list，現可正確掃描 active + quarantine 目錄回傳真實資料 |
| `frontend_api/app.py` | 註冊 `skills_router` |
