# T040 - Artifact Controller (canonicalizeDiff) 實作

## 目標
實作 Artifact Controller，支援差異正規化（canonicalizeDiff）與artifact 管理。

## 目標
- [ ] 實作 canonicalizeDiff 函數（統一 diff 格式）
- [ ] 實作 artifact 儲存與檢索 API
- [ ] 實作 diff 比對與三元化
- [ ] 連接 Artifact Controller 以支援 E2E Walkthrough
- [ ] 單元測試：diff 正規化 100% 正確率

## 規格對應
- Spec §20：Artifact Controller 章節（含 canonicalizeDiff）
- 相依：T024 (Benchmark), T037 (Research Engine)

## 驗收標準
- 輸入任意 diff 格式，輸出統一格式
- 正規化後的 diff 可用於三元圖構建
- 響應時間 ≤ 500ms（標準 diff）

## 優先序
🔴 Critical（阻礙 Phase 1–5 生產可用）

## 預估工時
1–2 天

## 受影響檔案
- `src/api/client.ts` - 新增 canonicalizeDiff 函數
- `src/components/ArtifactController.tsx` - 新增元件
- `tests/**/*.test.ts` - 新增 artifact 測試