---
github_issue: 
title: 前端測試基礎建設
type: test
priority: medium
status: done
depends_on: []
assignee: pi with opencode/x-preview-f-free
created: 2026-08-23
updated: 2026-08-24
---

# T38 - 前端測試基礎建設

## 目標
npm registry 受網路政策阻擋無法安裝 vitest，改用 Node 內建 test runner（Node 26 原生 TS 型別剝離）；錯誤訊息解析抽成純函式 utils/errors 便於測試。

## 驗收標準
- [x] package.json test script 改 `node --test 'src/**/*.test.ts'`
- [x] tsconfig 排除 *.test.ts（無 @types/node）
- [x] utils/errors.ts：getApiErrorMessage 鴨子型別解析 envelope 錯誤
- [x] 測試擴充至 15 個（格式化、型別判定、幣別、API 錯誤解析）

## 備註
若日後可安裝 vitest，測試遷移成本低（node:test API 相近）。
