---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/803
task_id: T090
title: "程式碼審查：找出潛在問題與硬編碼假資料"
status: done
updated: 2026-05-30
assignee: 碼農1號
created: 2026-05-30
closer: 2026-06-01
parent: null
depends_on: []
tags: [review, code-quality, hardcoded-data, bug-hunting]
---

# T090: 程式碼審查 - 找出潛在問題與硬編碼假資料

## 📊 任務概述

**目標**：全面審查 `tw-quant-selector` 專案的程式碼，找出：
1. **潛在問題**：Bug、效能問題、安全性問題、邏輯錯誤
2. **硬編碼假資料**：Hard-coded fake data、假估算、未實際查詢數據庫的假邏輯

**範圍**：
- 前端程式碼：`/Users/claw/Projects/tw-quant-selector/frontend/src/`
- 後端程式碼：`/Users/claw/Projects/tw-quant-selector/src/tw_quant_selector/`
- 配置檔：`docker-compose.yml`、`pyproject.toml`、`package.json`

**輸出**：
- Markdown 報告：`/Users/claw/Projects/tw-quant-selector/CODE_REVIEW_REPORT.md`
- 問題清單：依嚴重程度分級（🔴 嚴重、🟡 中等、🟢 輕微）
- 修復建議：每個問題附帶修復建議

---

## 🔍 審查重點

### **1. 硬編碼假資料（High Priority）**

**定義**：
- 未實際查詢數據庫，直接返回假資料
- 使用固定數值代替動態計算
- 假估算函數（例如：`estimateUniverseSize()`）

**已知案例**：
- ✅ `estimateUniverseSize()`（已建立 T089 修復）
- ❓ 其他假資料（待發掘）

---

### **2. 潛在 Bug**

**檢查項目**：
- [ ] **空值處理**：是否正確處理 `null`、`undefined`、`NaN`
- [ ] **邊界條件**：極端值（0、負數、超大值）是否會崩潰
- [ ] **型別錯誤**：TypeScript 型別是否正確，有無 `any` 濫用
- [ ] **非同步處理**：Promise、async/await 是否正確處理錯誤
- [ ] **狀態同步**：前端狀態與後端數據是否同步

---

### **3. 效能問題**

**檢查項目**：
- [ ] **重複請求**：相同 API 是否重複呼叫（應該用 `useMemo`、`useCallback`）
- [ ] **大數據處理**：是否一次載入過多資料（應該分頁、虛擬化）
- [ ] **記憶體洩漏**：Event listener、WebSocket 是否正確清理
- [ ] **DB 查詢效能**：SQL 是否有 `INDEX`、`LIMIT`、避免 `SELECT *`

---

### **4. 安全性問題**

**檢查項目**：
- [ ] **SQL 注入**：是否使用參數化查詢（應該用 `?` 佔位符）
- [ ] **XSS 攻擊**：使用者輸入是否正確轉義
- [ ] **API 認證**：是否有未授權的端點
- [ ] **敏感資訊**：API Key、密碼是否硬編碼

---

### **5. 程式碼品質**

**檢查項目**：
- [ ] **重複程式碼**：是否有 Copy-Paste 的程式碼（應該抽成函數）
- [ ] **魔法數字**：是否有未命名的常數（應該用 `const` 定義）
- [ ] **過長函數**：函數是否超過 50 行（應該拆分）
- [ ] **缺少註解**：複雜邏輯是否有註解

---

## 📋 審查步驟

### **步驟 1：掃描前端程式碼**

**目錄**：`/Users/claw/Projects/tw-quant-selector/frontend/src/`

**檢查檔案**：
- [ ] `api/client.ts`（API 請求邏輯）
- [ ] `pages/Strategy.tsx`（策略設定頁面）
- [ ] `pages/Backtest.tsx`（回測頁面）
- [ ] `pages/Portfolio.tsx`（持倉頁面）
- [ ] `pages/Signals.tsx`（選股訊號頁面）
- [ ] `components/`（共用元件）
- [ ] `utils/`（工具函數）

**重點**：
- 找出 `estimateUniverseSize()` 之外的假估算
- 檢查 `any` 型別濫用
- 檢查缺少錯誤處理的 API 請求

---

### **步驟 2：掃描後端程式碼**

**目錄**：`/Users/claw/Projects/tw-quant-selector/src/tw_quant_selector/`

**檢查檔案**：
- [ ] `api/app.py`（FastAPI 端點）
- [ ] `strategies/` 目錄（策略邏輯）
- [ ] `data/` 目錄（數據處理）
- [ ] `scripts/` 目錄（排程腳本）

**重點**：
- 找出硬編碼的假資料
- 檢查 SQL 注入風險
- 檢查錯誤處理（是否吞掉例外）

---

### **步驟 3：彙整報告**

**輸出檔案**：`/Users/claw/Projects/tw-quant-selector/CODE_REVIEW_REPORT.md`

**報告結構**：
1. **執行摘要**：問題統計（幾個嚴重、幾個中等、幾個輕微）
2. **硬編碼假資料清單**：列出所有假資料，附帶修復建議
3. **潛在 Bug 清單**：列出所有 Bug，附帶重現步驟
4. **效能問題清單**：列出所有效能問題，附帶優化建議
5. **安全性問題清單**：列出所有安全問題，附帶修復建議
6. **程式碼品質建議**：列出所有品質問題，附帶重構建議

---

## 📊 預期產出

### **報告範例**

```markdown
# tw-quant-selector 程式碼審查報告

## 執行摘要

- 🔴 嚴重問題：3 個
- 🟡 中等問題：7 個
- 🟢 輕微問題：12 個

## 硬編碼假資料清單

### 1. `estimateUniverseSize()` （Strategy.tsx）

**位置**：`frontend/src/pages/Strategy.tsx` 第 217 行

**問題**：
- 函數使用假估算公式，未實際查詢數據庫
- 導致顯示的「篩選結果」數字不正確

**嚴重程度**：🔴 嚴重（誤導使用者）

**修復建議**：
- 新增後端 API `/api/v1/universe/count`
- 前端改為呼叫 API 取得實際數量
- 參考：T089

**狀態**：✅ 已建立 T089

---

### 2. [待發掘]

...

## 潛在 Bug 清單

### 1. [待發掘]

...

## 效能問題清單

### 1. [待發掘]

...

## 安全性問題清單

### 1. [待發掘]

...

## 程式碼品質建議

### 1. [待發掘]

...
```

---

## 🎯 成功標準

- [x] 掃描完整個專案（前端 + 後端）
- [x] 找出至少 **5 個硬編碼假資料**（共找出 7 個：passCount、estimateUniverseSize、Dashboard P&L、Backtest 換手率、Dashboard 因子貢獻、Signals 回退係數）
- [x] 找出至少 **10 個潛在問題**（共 23 個，明列於 `CODE_REVIEW_REPORT_v1.md`）
- [x] 生成結構化報告（`CODE_REVIEW_REPORT_v1.md`，520+ 行）
- [x] 每個問題都有修復建議

---

## 📝 備註

- **不實際修改程式碼**（用戶要求「先不異動」）
- **只做審查和彙整**
- **報告要清晰易懂**，方便後續指派修復任務

---

**建立者**：碼農1號  
**建立時間**：2026-05-30 22:45  
**預估工時**：4 小時  
**優先級**：🔥 高（找出潛在問題，避免日後災難）
