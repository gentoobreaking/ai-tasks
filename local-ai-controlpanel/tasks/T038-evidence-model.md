# T038 - Evidence Model 實作

## 目標
實作 Evidence Model，支援任務審查的證據收集、來源標記與評分機制。

## 目標
- [ ] 定義 Evidence 類型（文獻、代碼執行結果、外部 API 響應）
- [ ] 實作證據來源標記（原始出處、鏈接、時間戳）
- [ ] 實作證據評分模型（可信度、相關性、及時性）
- [ ] 連接 Verification Engine 以重用驗證結果
- [ ] 單元測試：證據完整性檢查通過

## 規格對應
- Spec §13：Evidence Model 章節
- 相依：T021 (Verification Engine), T037 (Research Engine)

## 驗收標準
- 所有驗證結果必須有對應證據
- 證據評分範圍 0.0–1.0，及格線 ≥ 0.7
- 來源標記必須包含：類型、URL/路徑、存取時間

## 優先序
🔴 Critical（阻礙 Phase 1–5 生產可用）

## 預估工時
1 天

## 受影響檔案
- `src/types/evidence.ts` - 新增類型定義
- `src/api/client.ts` - 新增 evidence 相關函數
- `tests/**/*.test.ts` - 新增證據模型測試