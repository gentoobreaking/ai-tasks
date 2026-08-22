---
github_issue: ""
title: 前端主題切換（system/light/dark 深色模式）
type: feature
priority: medium
status: done
depends_on: ["T032-tailwind-shadcn-migration.md"]
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-22
updated: 2026-08-22
---

# T033 - 前端主題切換（system/light/dark 深色模式）

## 目標
T032 補完 Tailwind 後（`darkMode: 'class'` 已設定），補上實際的主題切換機制：
讓 Settings 頁的主題偏好真正生效，支援跟隨系統／淺色／深色三種模式，
切換立即生效並跨工作階段保存。

## 驗收標準
- [x] 新增 `src/lib/theme.ts`：偏好存 localStorage（`twquant-theme`）、`applyTheme()` 切換 `<html>.dark` class、`initTheme()` 啟動套用 + 監聽系統配色變更
- [x] `main.tsx` 啟動時呼叫 `initTheme()`（render 前套用，避免閃白/閃黑）
- [x] Settings 頁新增「主題」下拉（🖥️ 跟隨系統 / ☀️ 淺色 / 🌙 深色），切換立即生效；頁面載入時從 localStorage 回填
- [x] `theme=system` 時監聽 `prefers-color-scheme` 變更事件自動跟隨；「重置設定」一併重置回 system
- [x] `index.css` 補 `.dark` 語義變數覆寫（slate 深色色階 + 陰影加深），手寫語義類別與 Tailwind `dark:` variants 同時生效
- [x] 建置驗證：tsc -b / eslint（0 error）/ vite build 全綠；dist CSS 含 `.dark{...}` 與 `dark\:bg-gray-800` 等 variant

## 完成摘要（2026-08-22）
- 新增 `frontend/src/lib/theme.ts`：Theme 型別（system/light/dark）、getStoredTheme / setTheme / applyTheme / initTheme
- 修改 `frontend/src/main.tsx`：啟動即 `initTheme()`
- 修改 `frontend/src/pages/Settings.tsx`：settings.theme 初始化自 getStoredTheme()；新增「主題」下拉 onChange 立即 `applyThemePreference(t)`；handleReset 一併重置主題
- 修改 `frontend/src/index.css`：`.dark` 區塊覆寫 --color-bg/surface/border/text/text-muted/primary 等（slate 深色階）+ 陰影加深
- 因走 CSS 變數覆寫，手寫語義類別（.card/.btn/.table）與 Tailwind dark: variants 同時生效
- 品質閘門：tsc -b ✅、eslint 0 error ✅、vite build ✅（dist CSS 含 `.dark{}` 與 dark variants）
- 文件：docs/frontend-styling.md dark mode 章節更新為「已完整支援」
- commit：`f6053b1`（實作）+ docs 更新

## 備註
- 已知限制：部分元件使用寫死的淺色 class（如 `bg-gray-50 dark:bg-gray-800` 成對出現者正常）；後續若發現個別區塊深色下對比不足，逐處微調即可
- 未來擴充：可於 Header 加快速切換按鈕（讀取/循環 theme），或引入 next-themes 類似方案統一管理
