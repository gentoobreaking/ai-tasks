---
github_issue: ""
title: "[Phase 3] 研究/實戰環境分離與操作治理"
type: feature
priority: low
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-30
updated: 2026-07-30
closed: 2026-07-30
---

# T013 - 研究/實戰分離與操作治理

## 目標
建立研究（自由回測與實驗）與實戰（僅使用通過驗證穩定規則）兩套環境，並納入操作日誌、責任紀錄與法規邊界檢查。

對應規格：`§3.3.2 研究與實戰分離`、`§3.3.2 合規與操作邊界`、`§6 法規邊界`

## 驗收標準
- [x] 研究環境：自由調整參數、測試新規則、獨立回測 — `env_manager.py` (research/production 模式切換)
- [x] 實戰環境：僅使用通過驗證的穩定規則，鎖定版本 — `production_rule_ids` 白名單 + `filter_rules_for_production()`
- [x] 規則從研究晉升至實戰須通過審核流程（手動） — `check_promotion_eligibility()` (交易數/勝率/Sharpe 門檻, approval_required=true)
- [x] 操作日誌：記錄每次訊號產出、規則版本、觸發條件 — `operation_log.py` (5 類日誌)
- [x] 決策責任紀錄：訊號僅供參考，人為最終決定 — 免責聲明自動附加於每日報告
- [x] 法規邊界文件化：定位為個人使用工具，不涉及投顧業務 — `GOVERNANCE.md`
- [x] 若未來考慮對外提供訊號，提示需法規評估 — 合規報告第 5 點

## 已交付檔案
```
configs/environments.yaml                 ← 研究/實戰模式設定 + 白名單
src/tw_quant_signal/env_manager.py        ← 環境管理核心 (模式判斷/規則過濾/晉升審核)
src/tw_quant_signal/operation_log.py      ← 操作日誌 (5 類紀錄 + 合規報告)
src/tw_quant_signal/db.py                 ← + operation_log 表
src/tw_quant_signal/pipeline.py           ← + production 規則過濾 + 操作日誌 + 免責聲明
src/tw_quant_signal/api/app.py            ← + GET /api/environment, /api/compliance-*, /api/operation-log
GOVERNANCE.md                             ← 完整治理文件
```

## 功能實現

| 需求 | 實現方式 |
|------|---------|
| 研究環境自由調整 | `research: true` (YAML) 或 `TW_QUANT_MODE=research` (env) |
| 實戰白名單鎖定 | `filter_rules_for_production()` 過濾規則引擎產出 |
| 規則晉升審核 | `check_promotion_eligibility()` — 交易數30+/勝率55%+/Sharpe 1.0+ |
| 操作日誌 | 5 類：管線執行/訊號產出/規則變更/設定變更/模式切換 |
| 免責聲明 | 自動附加於每日 Telegram/Discord 報告 |
| 法規文件 | `GOVERNANCE.md` 完整說明個人定位、非投顧業務、對外服務風險提示 |
| API | `/api/environment`, `/api/compliance-statement`, `/api/compliance-report`, `/api/operation-log` |

## 使用方式

```bash
# 研究模式（預設）
export TW_QUANT_MODE=research   # 或 configs/environments.yaml research: true

# 實戰模式
export TW_QUANT_MODE=production  # 或 configs/environments.yaml research: false
```

## 備註
- 此為長期治理架構，初期可先以文件規範为主
- 操作日誌同時可作為結構變化偵測（T012）的輸入
