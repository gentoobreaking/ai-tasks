# md-viewer-app

**md-viewer** 是一款专为 macOS 打造的高效能 Markdown 阅读器。

## 专案组成

| 专案 | 技术栈 | 状态 |
|------|---------|------|
| `md-viewer-webview/` | Go + webview_go + Swift-markdown（CGO） | ✅ **主线** |
| `md-viewer-fyne/` | Go + Fyne | 对比保留 |

最终选定 **webview 方案**，见 [T008 对比评估](tasks/T008-專案分裂與對比評估.md)。

## 已实作功能

| 功能 | Task |
|------|-------|
| Swift-markdown 解析引擎 | T003 |
| 6 主题即时切换 | T005、T014 |
| highlight.js 语法高亮 + 复制按钮 | T017 |
| 设定面板（缩放/字型/语言/行号） | T011-C~G、T011-FIX |
| NSMenu 原生选单 | T011-A、T011-B |
| i18n（繁中/简中/英/日/韩） | T011-FIX-02、T011-FIX-03 |
| 拖拉开启 .md 档案 | T010 |
| 档案监控自动重载（含 reload flash） | T013 |
| macOS 文件关联（双击 .md 开启） | T011-L |
| 翻译功能（⌘⇧T，3 后端） | T028 |
| HTML / PDF 汇出 | T019 |
| 全萤幕（⌘F） | T011-FIX-04 |
| Zoom 持久化（跨 reload/重开保留） | T011-FIX-01、T011-FIX-05 |

## Skip 项目

| Task | 说明 |
|------|------|
| T004 | 侧边栏档案列表（产品定位为纯阅读器） |
| T015 | Quick Look 插件（需 Swift + Xcode .qlgenerator） |
| T018 | 置顶小窗模式（webview_go 未暴露 setWindowLevel） |
| T020 | 数学公式（未整合 MathJax/KaTeX） |
| T021 | Mermaid 图表（未整合 mermaid.js） |

## 新功能待实作

| Task | 名称 | 说明 |
|------|------|------|
| T022 | 搜寻文件内容 | ⌘F 搜寻 + 上一个/下一个导航 |
| T023 | 滚动位置保持 | reload 后保持当前滚动位置 |
| T024 | 视窗大小/位置记忆 | 关闭后重开自动还原视窗 frame |
| T025 | 最近开启的档案 | NSMenu → File 子选单最多 10 笔 |
| T026 | 专注模式 | ⌘\ 淡化非焦点段落 |
| T027 | 连结悬停预览 | 滑鼠悬停本地 .md 连结 500ms 显示预览 |

## Task 列表

| # | 名称 | 状态 |
|---|------|------|
| T001 | 评估 Fyne 环境 | ✅ done |
| T002 | 建立 Go 骨架与 Window | ✅ done |
| T003 | Markdown 解析与 WebView 渲染 | ✅ done |
| T004 | 侧边栏档案列表 | ⚠️ skip |
| T005 | 深色模式支援 | ✅ done |
| T006 | Build 与测试 macOS App | ✅ done |
| T007 | 自动化测试快捷键 | ✅ done |
| T008 | 专案分裂与对比评估 | ✅ done |
| T009 | Icon 设定 | ✅ done |
| T010 | 支援拖拉开启 md 档案 | ✅ done |
| T010-B1 | 研究 webview_go NSWindow | ✅ done |
| T011-A~G | NSMenu / 设定面板系列 | ✅ done |
| T011-FIX-01~05 | Zoom/i18n/menubar 修复 | ✅ done |
| T011-L | macOS 文件关联 | ✅ done |
| T011-Menubar | Touchpad 灵敏度设定 | ✅ done |
| T012 | 极速渲染引擎 | ✅ done |
| T013 | 档案变动监控 | ✅ done |
| T014 | 多主题切换 | ✅ done |
| T015 | Quick Look 插件 | ⚠️ skip |
| T016 | 自动大纲 TOC | 📋 pending |
| T028 | 翻译功能（MyMemory/DeepL/LibreTranslate） | ✅ done |
| T017 | 语法高亮 Code | ✅ done |
| T018 | 置顶小窗模式 | ⚠️ skip |
| T019 | PDF/HTML 汇出 | ✅ done |
| T020 | 数学公式 | ⚠️ skip |
| T021 | Mermaid 图表 | ⚠️ skip |
| T022 | 搜寻文件内容 | 📋 pending |
| T023 | 滚动位置保持 | 📋 pending |
| T024 | 视窗大小/位置记忆 | ✅ done |
| T025 | 最近开启的档案 | ✅ done |
| T026 | 专注模式 | 🔧 in-progress |
| T027 | 连结悬停预览 | 📋 pending |

**✅ done: 18 | ⚠️ skip: 5 | 📋 pending: 7**
