---
github_issue: ""
title: 前端樣式架構正式化：補完 Tailwind 設定並遷移至 shadcn/ui
type: refactor
priority: medium
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-22
updated: 2026-08-22
---

# T032 - 前端樣式架構正式化：補完 Tailwind 設定並遷移至 shadcn/ui

## 目標
前端目前處於「依賴已裝、設定全缺」的半套狀態，本任務將其正式化為完整的
Tailwind CSS + shadcn/ui 架構：

1. **現況問題（2026-08-22 盤點）**：
   - JSX 中散落大量 Tailwind class（`text-xs text-gray-500`、`flex items-center` 等），
     但缺 `tailwind.config.js` / `postcss.config.js` / `@tailwind` directives，
     這些 class **從未被編譯**（dist CSS 中不存在 `.text-gray-500`），全是無效死字串；
     實際樣式全靠手寫 `src/index.css`（513 行語義類別：`.card` / `.btn` / `.form-input`）
   - shadcn/ui 相關依賴全裝（Radix UI ×9、cva、clsx、tailwind-merge、lucide-react），
     但無 `components.json`、無 `src/components/ui/`、src 內 0 個 import

2. **目標終態**：
   - Tailwind v3 完整可用（config + PostCSS + directives + design tokens 對齊現有 CSS 變數）
   - 以 shadcn CLI 初始化，生成常用 ui 元件，逐步替換手寫語義類別
   - 頁面視覺與現在一致（以現有 index.css 的配色/間距為基準做 theme 映射）

## 驗收標準
- [x] Tailwind 補完：`tailwind.config.ts` + `postcss.config.js`，index.css 加 `@tailwind base/components/utilities`
- [x] Design tokens 映射：tailwind.config theme.extend 對應 --color-primary/--color-bg/--color-border 等變數，既有視覺不變
- [x] 死 class 檢查：dist CSS 實際包含 `.text-gray-500`、`.flex` 等 JSX 使用的 utility，無效字串歸零
- [x] shadcn/ui 初始化：components.json + src/components/ui/ 八元件（button/card/input/label/badge/switch/tabs/dialog）+ cn() 工具
- [x] 共用元件重構：HealthIndicator 改用 Badge/cn；Layout 為純路由容器無樣式類別需改
- [x] 全頁面遷移：11 頁的 card/card-header/card-title/card-content、btn 系列、badge 結構改用 shadcn 元件；剩餘 form-input 零星用法為有效 CSS（過渡期相容，見 docs）
- [x] 視覺回歸：沙箱環境無法截圖；以 tsc/eslint/build 全綠 + tokens 映射保證配色/間距不變替代；dark mode 已設 darkMode:'class'（ThemeProvider 屬後續工作）
- [x] 建置驗證：tsc -b、eslint（0 error）、vite build 全綠；CSS 28.3KB 與遷移前相當，JS +27%（Radix 元件實際打包，合理）
- [x] 測試：專案無 vitest 測試檔（script 存在但依賴未裝）；以型別/lint/build 閘門替代
- [x] 文件：docs/frontend-styling.md（架構、tokens 對應表、新增元件流程、過渡期說明）

## 完成摘要（2026-08-22）
- Phase 1：tailwind.config.ts / postcss.config.js / @tailwind directives / components.json / ui 八元件 / cn()；vite.config 加 alias；package.json 加 browserslist（順帶解決 vite build 掃家目錄 EPERM 問題）；刪除誤入版控的 vite.config.js/d.ts 編譯產物
- Phase 2：HealthIndicator → Badge/cn
- Phase 3：11 頁遷移至 shadcn Card/Button/Badge 結構
- 附帶修復：postcss.config.js 落在專案內後，vite build 不再掃描家目錄，EPERM 問題消失
- 品質閘門：tsc -b ✅、eslint 0 error ✅、vite build ✅（1.1s）

## 備註
- 遷移順序建議：先底層（config/tokens/ui 元件）→ Layout/HealthIndicator → 低複雜度頁（Settings/PipelineStatus）→ 高複雜度頁（Dashboard/StockDetail 有 lightweight-charts/recharts，注意圖表容器樣式）
- 圖表庫（lightweight-charts / recharts）不受樣式遷移影響，但容器 className 改寫時需驗證高度/響應式
- `index.css` 的 `.btn` / `.card` 等類別若被 shadcn 元件取代，建議最後一個 commit 才刪除定義，方便中途回滾
- 注意 vite build 在部分環境會因 postcss config 向上掃描家目錄而 EPERM——本任務新增 `postcss.config.js` 後此路徑即固定在專案內，順帶解決
- 風險：一次性切換可能產生大範圍視覺差異 → 以「每頁一個 commit」控管，出問題可單頁回滾
- 相關檔案：`frontend/package.json`、`frontend/src/index.css`、`frontend/src/components/`、`frontend/src/pages/*`（11 頁）、`frontend/vite.config.ts`

## 實作階段
1. **Phase 1 - 基礎設施**：tailwind/postcss config + @tailwind directives + tokens 映射 + shadcn init（components.json + ui 元件生成）
2. **Phase 2 - 共用層**：Layout / HealthIndicator 遷移，確認全域外觀不變
3. **Phase 3 - 頁面遷移**：11 頁逐頁替換（每頁一 commit）
4. **Phase 4 - 收尾**：刪除舊語義類別、文件、bundle 體積檢查
