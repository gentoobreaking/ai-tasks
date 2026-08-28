---
id: T017
project: gold-analysis
source_project: gold-analysis-core
title: 機器學習模型開發
assignee: "pi with opencode/x-preview-f-free"
priority: low
type: feature
status: done
created: 2026-04-07
updated: 2026-08-28
estimate: 5天
depends_on:
  - T011
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/62
---

## 目標
開發預測模型優化決策準確率，使用歷史數據訓練模型，並將模型部署為決策 API。

## 驗收標準
- [ ] 特徵工程完成
- [ ] 模型選型完成
- [ ] 模型訓練完成
- [ ] 模型評估完成
- [ ] 模型部署完成（API 串接 FeatureEngineer → ModelTrainer.load_latest() → predict()，端點 /api/decisions/recommend 回傳 BUY/SELL/HOLD + 機率）

## 產出
| 檔案 | 路徑 | 說明 |
|------|------|------|
| 特徵工程模組 | `backend/app/ml/feature_engineering.py` | 約 40 個特徵欄位 + 1 個標籤欄位 |
| 模型訓練模組 | `backend/app/ml/model_trainer.py` | Random Forest/Gradient Boosting/Logistic Regression |
| 模型評估模組 | `backend/app/ml/model_evaluator.py` | Accuracy/F1/ROC-AUC/混淆矩陣/錯誤分析 |

## 模組說明
### 特徵工程
輸入：每天金價資料（收盤價 only） → 輸出：約 40 個特徵 + 1 個標籤
類別：價格、技術指標、動量、波動率、形態、時間
標籤：未來 5 天價格變化（漲>1%→BUY、跌>1%→SELL、其他→HOLD）

### 模型訓練
支援：Random Forest（預設）、Gradient Boosting、Logistic Regression
流程：時間序列分割(80/20) → 標準化 → 訓練 → TimeSeriesSplit 5折 CV → 特徵重要性 → 保存模型+版本管理

### 模型評估
指標：Accuracy/Precision/Recall/F1/ROC-AUC/混淆矩陣
錯誤分析：類別混淆、錯誤樣本特徵差異
自動告警：準確率<50%、R²為負、單類別預測

## 訓練結果（2026-04-28）
| 指標 | 數值 | 意義 |
|------|------|------|
| 有效樣本 | 249 筆 | 需 60 日滾動窗口 |
| 標籤分佈 | HOLD 44.2% / BUY 41.8% / SELL 14.1% | SELL 偏少 |
| 訓練準確率 | 97.99% | 虛高（過擬合）|
| 驗證準確率 | 98.00% | 假象（全驗證集皆 HOLD）|
| 交叉驗證（TSCV 5折）| **44.85% ± 22.79%** | ⚠️ **真實水平** |
| 即時預測 | HOLD（75.61%）| 保險牌 |

## 核心問題
- CV 只有 44.85%，接近隨機猜（33%），模型根本沒學到規律
- 驗證集只有 HOLD，模型全猜 HOLD 就能 98%
- SELL 完全放棄（0%）：F1=0
- 根因：42 特徵 + 249 樣本太稀疏；5 天後漲跌信號本身難預測

## 現狀（2026-08-28 更新）
三隻模組已接入決策 API（`/api/decisions/recommend` 串接 FeatureEngineer → ModelTrainer.load_latest() → predict()），並以 TestClient 做入口級測試。模型真實預測力未以實盤金價評估（本倉以合成資料驗證）。

## 產出
- `backend/app/ml/feature_engineering.py`
- `backend/app/ml/model_trainer.py`
- `backend/app/ml/model_evaluator.py`

## 備註
Phase 4 ML 層。使用 scikit-learn（Random Forest 為主）。確認目前為實驗性質，夠成熟才上 prod。原「模型沒接 API」缺口已補。