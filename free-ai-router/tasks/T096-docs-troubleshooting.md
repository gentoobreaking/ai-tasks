---
github_issue: ""
title: "Troubleshooting guide: common issues and solutions"
type: pending
priority: medium
status: pending
depends_on: ["T095"]
assignee: "OpenCode with DeepSeek V4 Flash"
created: "2026-08-22"
updated: "2026-08-22"
---

# T096 - Troubleshooting guide: common issues and solutions

## 目標
建立獨立的疑難排解文檔，涵蓋實際使用中遇到的常見問題與解決方案。

## 驗收標準
- [ ] 建立 `docs/TROUBLESHOOTING.md`（或納入 MANUAL.md 章節）
- [ ] 涵蓋類別：
  - **模型顯示 down 但瀏覽器可用**：ping timeout 設定、TLS 驗證、企業代理、IPv6 問題
  - **API key 無效/過期**：各 provider key 格式、權限範圍、輪換流程
  - **無模型可用**：coding-only filter、banned models、provider disabled、網路封鎖
  - **延遲異常高**：地理位置、provider 負載、本地 DNS、keep-alive pool
  - **TUI 啟動失敗**：終端機相容性、色彩支援、raw mode、SSH 轉發
  - **Router 回傳 503**：無 up 模型、所有模型 cooldown、請求逾時
  - **中國大陸網路**：GFW 封鎖、SiliconFlow/Baidu/Alibaba 連線、new-api relay 發現失效
  - **Docker 部署**：volume 掛載 config、network mode、healthcheck 失敗
- [ ] 每個問題包含：現象、可能原因、診斷步驟、解決方案、預防措施
- [ ] 提供 `freemodel doctor` 輸出解讀指南
- [ ] 連結相關 GitHub Issue/PR 作為參考

## 備註
- 內容來源：GitHub Issues、測試案例（`*_test.go`）、程式碼錯誤訊息、社群回饋
- 格式建議：問題導向（FAQ 風格），而非功能導向
- 定期更新：每版本發布前檢查新增錯誤代碼是否有文檔
- 可考慮建立 `freemodel troubleshoot` 互動式診斷命令（未來擴充）