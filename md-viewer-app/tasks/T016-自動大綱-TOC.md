---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/364
title: "[T016] 自動大綱 TOC"
status: done
type: Feature
assignee: —
created: 2026-04-24
updated: 2026-05-07
---

## 目標（原始）

解析 H1-H6 標題層級，生成遞迴大綱列表，點擊項目後平滑捲動到對應位置。

## ✅ 完成（2026-05-07）

**實現方式**：Plan B - Go 端後處理正則解析（無需修改 Swift）

### 修改的檔案

| 檔案 | 修改內容 |
|------|---------|
| `config.go` | 新增 `ShowTOC bool` 欄位 + `SetShowTOC()` + `ConfigToJS()` |
| `core/renderer.go` | 新增 `processHeadings()` - 正則匹配標題 + 生成 TOC JSON + 添加 id 屬性 |
| `main.go` | Go綁定 `saveTOC` + CSS/HTML/JS 完整實現 |

### 待辦清單

- [x] 修改 renderer.go 给标题加上 id 属性（正則替換）
- [x] Go 端解析标题生成 TOC JSON
- [x] WebView JS 渲染侧边栏 TOC 面板  
- [x] 点击标题滚动到对应位置（scrollIntoView）

### 使用方式

1. 打開 Markdown 檔案
2. 按 `⌘+T` 或點擊右側 ☰ 按鈕
3. 側邊大綱面板彈出，顯示所有 H1-H6 標題
4. 點擊項目平滑捲動到對應位置
5. 設定面板可開關「顯示大綱」選項

### 🔧 技術細節

- **ID 生成演算法**：`slugify(text)` + 遞進編號（避免重複）
- **TOC JSON 格式**：`[{"level":1,"id":"introduction","text":"Introduction"},...]`
- **注入方式**：`window._tocJSON` 全局變數（通過 script 注入）
- **快捷鍵**：⌘+T toggle 大綱面板