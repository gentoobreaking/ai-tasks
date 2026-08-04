---
github_issue:
title: Add Chinese mainland free model aggregation automation
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T062 - Add Chinese mainland free model aggregation automation

## 目標
擴充 free-ai-router 為「大中華區 + 國際」完整 AI 免費模型收集器，自動抓取大陸特有的免費模型管道。

## 驗收標準
- [x] 抓取大陸專屬開源導航與論壇（V2EX、吾愛破解、Linux.do、Gitee）
  - [x] 編寫 Python 爬蟲定時爬取 linux.do AI 科技板塊
  - [x] 編寫 Python 爬蟲定時爬取 v2ex.com go/ai 節點
  - [x] 用關鍵字（公益 API、免費轉發）過濾私有聚合
- [x] 直接串接大陸大廠 API 免費層
  - [x] 矽基流動 (SiliconFlow)：DeepSeek、Qwen、Yi、Flux 免費额度
  - [x] 百度千帆、阿里百煉、騰訊混元：新註冊用戶免費 Token
- [x] 追蹤大陸公益 One-API / New-API 專案
  - [x] 定期抓取公共 New-API 的 /v1/models 端點
  - [x] 支援大陸雲端伺服器（騰訊雲、阿里雲）執行腳本
- [x] 聚合結果與現有國際模型列表合併顯示
- [x] 單元測試驗證各抓取管道
- [x] 整合測試驗證 TUI 顯示大陸 + 國際模型

## 備註
- 大陸開發者不常在 GitHub 提交公共 API 專案，集中在 V2EX、吾愛破解、Linux.do、Gitee
- 需搭配大陸雲端伺服器執行爬腳本以避免存取被拒
- 需與現有的 sources.json + DiscoverModels 機制整合