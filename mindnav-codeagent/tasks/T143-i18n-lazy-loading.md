---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/652
title: Implement lazy loading for translations using i18next-http-backend
type: enhancement
priority: low
status: done
assignee: gemini-3-flash-preview
created: 2026-05-23
updated: 2026-05-23
howto: Move translations to the public directory and use i18next-http-backend for on-demand loading.
---

# T143 - Implement lazy loading for translations using i18next-http-backend

## 目標
解決 Vite 打包時因翻譯資源過大導致的 chunk size 警告。透過 `i18next-http-backend` 將 13 國語言的 JSON 檔案從主程式包中分離，實現「按需加載（Lazy Loading）」，優化首屏載入速度。

## 驗收標準
- [x] 安裝 `i18next-http-backend` 插件。
- [x] 將 `src/locales/` 下的所有 JSON 檔案移動至 `public/locales/`。
- [x] 修改 `src/i18n.js`，移除靜態 `import` 翻譯檔，改為使用 `Backend` 配置 `loadPath`。
- [x] 確保語系切換功能依然正常運作。
- [x] 執行 `npm run build` 驗證主程式包（JS chunk）體積顯著下降且不再出現 500KB 警告。
- [x] 驗證開發環境與生產環境的 JSON 路徑正確（需考慮 `base: '/mindnav-codeagent/'` 配置）。

## 備註
- [x] **路徑注意**：由於專案部署在 `github-pages` 的子路徑下，`loadPath` 必須正確處理 `/mindnav-codeagent/` 前綴。
- [x] **異步處理**：Lazy loading 會導致初次載入時有一小段時間處於 `loading` 狀態，需確保 UI 不會因此崩潰（React-i18next 預設會處理 Suspense）。
