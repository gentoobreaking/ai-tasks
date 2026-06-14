---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/651
title: Implement react-i18next for multi-language support
type: enhancement
priority: medium
status: done
assignee: gemini-3-flash-preview
created: 2026-05-23
updated: 2026-05-23
howto: Use react-i18next to refactor the hardcoded translation objects in the pages directory.
---

# T142 - Implement react-i18next for multi-language support

## 目標
將目前 `pages` 目錄中硬編碼（Hardcoded）在組件內的巨大翻譯物件（如 `Features.jsx` 中的 `L` 物件）重構為使用 `react-i18next` 框架。這將有助於簡化代碼邏輯、提升維護性並支援延遲加載翻譯資源。

## 驗收標準
- [x] 安裝 `i18next`、`react-i18next` 及相關插件（如 `i18next-browser-languagedetector`）。
- [x] 將各語言的翻譯內容從 `.jsx` 檔案中抽離至獨立的 JSON 檔案（例如 `src/locales/zh.json`, `src/locales/en.json`）。
- [x] 在專案中配置 `i18n` 實例，整合語言偵測與切換功能。
- [x] 使用 `useTranslation` Hook 取代原有的 `L[lang]` 硬編碼調用方式。
- [x] 確保現有的所有 13 種語言翻譯在重構後均能正確顯示且無功能缺失。
- [x] 通過專案的 lint 檢查與生產環境構建（build）。

## 備註
- **風險**：搬運大量翻譯內容時需注意不要漏掉任何鍵值（Keys）。
- **效能**：導入後應觀察是否能有效減少單一 `.jsx` 檔案的大小。
- **維護**：未來新增功能時，應強制要求在 JSON 中添加翻譯，而非直接寫在組件內。

