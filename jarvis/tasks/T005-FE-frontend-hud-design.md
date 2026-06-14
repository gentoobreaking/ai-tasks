---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/739
title: 前端 HUD 設計
type: Feature
priority: high
status: done
assignee: a lot
created: 2026-05-13
updated: 2026-05-13
depends: T005, T013
howto: frontend-hud-design.md
---

# T005-FE - 前端 HUD 設計

## 目標
開發 JARVIS 的對話前端，以鋼鐵人 HUD 風格呈現，支援文字/語音輸入、數位人頭像顯示與即時對話。

## 背景
目前僅有 FastAPI 歡迎頁（無前端），需補上使用者可見的對話介面。

## 實作內容

### 1. 核心對話介面
- WebSocket 連線到 `ws://localhost:8000/ws/chat`
- 文字輸入框 + 送出按鈕
- 對話歷史顯示（使用者發言 / JARVIS 回應）
- 支援 Enter 送出

### 2. 語音輸入
- 麥克風錄音按鈕
- 錄音 → WAV → WebSocket binary 送出
- 顯示 ASR 辨識中的狀態

### 3. HUD 視覺風格
- 半透明暗色背景 + 發光邊框（鋼鐵人風格）
- 字體使用等寬/科技感字型
- JARVIS 狀態指示燈（聆聽中/思考中/說話中）

### 4. 數位人頭像顯示
- 顯示 MetaHuman PNG 頭像
- 接收 Viseme ID 序列，切換對應嘴型圖層
- 音頻播放同步

### 5. 整合方式
- 方案 A：FastAPI 靜態檔案服務（`/` 路由回傳 HTML）
- 方案 B：獨立前端（Vite/Vue/React）

## 驗收標準
- [ ] 網頁開啟後可看到 HUD 風格介面
- [ ] 輸入文字 → WebSocket → 顯示 JARVIS 回應
- [ ] 麥克風錄音 → ASR → 顯示辨識文字 → JARVIS 回應
- [ ] 數位人頭像顯示 + 嘴型動畫（Viseme-driven）
- [ ] TTS 音檔自動播放
- [ ] 手機/桌面瀏覽器皆可用（響應式）

## 備註
- T018（MetaHuman 頭像）完成後才需要整合頭像顯示
- Viseme 動畫可用 CSS sprite sheet 或 Canvas 實作
- 建議先完成純文字對話，再陸續加入語音/頭像
