---
github_issue: N/A
title: Taiwan Signal Dictionary — Configurable Taiwan keywords/domains (YAML)
assignee: pi
type: feat
priority: high
status: done
depends_on: ["T068"]
created: 2026-09-05
updated: 2026-09-05
---

# T069 - Taiwan Signal Dictionary — Configurable Taiwan keywords/domains (YAML)

## 目標

建立可配置的台灣信號字典，供 Taiwan Relevance Engine 使用。對應規格書 §6.1, §50, §61 Phase 2。

檔案：`config/taiwan_signals.yaml`。

## 驗收標準

- [ ] `config/taiwan_signals.yaml` 建立，結構：
  ```yaml
  official_domains:
    - twse.com.tw
    - tpex.org.tw
    - taifex.com.tw
    - cwa.gov.tw
    - moi.gov.tw
    - moea.gov.tw
    - moj.gov.tw
    - ly.gov.tw
    - judicial.gov.tw
    - data.gov.tw
    - gov.tw
  
  government_agencies:
    - CWA
    - MOI
    - MOEA
    - MOL
    - MOF
    - PCC
    - LY
    - "Judicial Yuan"
    - "data.gov.tw"
    - "gov.tw"
  
  financial_keywords:
    - TWSE
    - TPEx
    - TAIFEX
    - TDCC
    - FinMind
    - Fugle
    - "台股"
    - "上市"
    - "上櫃"
  
  dataset_keywords:
    - "實價登錄"
    - LVR
    - "land.moi.gov.tw"
    - "房價"
    - "房地產"
    - "土地"
    - "預售屋"
  
  payment_keywords:
    - ECPay
    - NewebPay
    - "綠界"
    - "藍新"
  
  taiwan_keywords:
    - Taiwan
    - Taiwanese
    - 台灣
    - 臺灣
    - TW
    - Taipei
  
  language_keywords:
    - "zh-TW"
    - "繁體中文"
    - "繁體"
    - "Traditional Chinese"
    - "Taiwan Mandarin"
    - "注音"
    - TOCFL
  
  company_keywords:
    - SHOPLINE
  ```
- [ ] `internal/config/taiwan_signals.go` 載入器：
  - [ ] `LoadTaiwanSignals(path string) (*TaiwanSignals, error)`
  - [ ] 結構體 `TaiwanSignals` 對應 YAML
  - [ ] 預設值內建（檔案不存在時使用）
- [ ] Taiwan Relevance Engine (T068) 整合配置載入
- [ ] 單元測試：載入 YAML、預設值 fallback、空檔案處理

## 備註

- 這讓非開發人員可調整關鍵字而不需改代碼
- 官方域名列表需定期更新
- 關鍵字匹配應支援大小寫不敏感

## 執行紀錄

- 待執行