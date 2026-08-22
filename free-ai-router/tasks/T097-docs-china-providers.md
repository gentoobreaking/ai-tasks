---
github_issue: ""
title: "Document China mainland providers setup (SiliconFlow, Baidu, Alibaba, Tencent)"
type: pending
priority: medium
status: pending
depends_on: ["T095"]
assignee: "OpenCode with DeepSeek V4 Flash"
created: "2026-08-22"
updated: "2026-08-22"
---

# T097 - Document China mainland providers setup (SiliconFlow, Baidu, Alibaba, Tencent)

## 目標
專門針對中國大陸用戶的提供商配置指南，解決網路環境特殊性帶來的問題。

## 驗收標準
- [ ] 建立 `docs/CHINA_PROVIDERS.md`
- [ ] 涵蓋提供商：
  - **SiliconFlow (矽基流動)**：API key 申請、模型列表、免費額度、端點
  - **Baidu QianFan (百度千帆/文心一言)**：AK/SK 申請、服務開通、模型選擇
  - **Alibaba DashScope (阿里雲百煉)**：API key、模型服務啟用、計費說明
  - **Tencent Cloud (騰訊雲)**：SecretId/SecretKey、服務授權、地區選擇
  - **Kuaipao (筷跑)**：邀請碼、API 申請、模型支援
  - **New-API / One-API 閘道**：自架/公益閘道接入、統一 key 管理
- [ ] 每個提供商包含：
  - 註冊/申請流程截圖（或文字步驟）
  - 環境變數設定範例（`SILICONFLOW_API_KEY` 等）
  - `freemodel config add-provider <name> --from-env` 一鍵配置
  - 常見錯誤代碼對照表（401/403/429/500 含義）
  - 網路測試命令（`curl` 驗證連通性）
- [ ] 整體架構說明：一個 `NEW_API_API_KEY` 串接多家提供商的原理
- [ ] 免費額度對比表、適用場景建議
- [ ] 故障排查：DNS 汙染、TLS 攔截、IP 封鎖、配額耗盡

## 備註
- 現有程式碼已支援這些提供商（`data/sources.json`、`EnvOverrides`），缺乏文檔
- 需諮詢中國大陸用戶實測驗證，確保步驟準確
- 考慮雙語（中英對照）或純中文文檔
- 連結官方文檔、開發者控制台網址
- 法律合規提醒：遵守當地法規、資料不出境要求