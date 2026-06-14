---
github_issue:https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/647
type: completed
priority: medium
status: done
assignee: OpenCode MinniMax-M2.7
created: 2026-05-22
updated: 2026-05-22
---

# T047 - D-ID Streaming API 整合可行性研究

## 目標
評估 D-ID Streaming API（Agent/Visual Agent）與 JARVIS 的整合可行性、架構設計與成本。

## D-ID 平台概覽

### 產品線
| 產品 | 說明 |
|------|------|
| **Creative Reality Studio** | Web 版影片編輯器（腳本 → Avatar 影片） |
| **Agents API** | 即時串流 Avatar Agent（WebRTC / LiveKit） |
| **Talks API** | 非同步/串流 Talking Head 生成（Talks Streams 已 deprecated） |
| **Video Translate** | 影片翻譯 + 對嘴 |
| **V4 Expressive Agents** | 2026.03 最新：diffusion 渲染、sub-500ms、4K |

### Agent 架構（核心整合目標）

```
┌─────────────────────────────────────────────────────┐
│                  D-ID Cloud                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Avatar   │  │   TTS    │  │  LLM (or custom) │  │
│  │  Engine   │  │  Engine  │  │  / Conversation  │  │
│  │  (V2/V3/  │  │(MS/AWS/  │  │  Manager         │  │
│  │   V4)     │  │ Eleven)  │  │                  │  │
│  └────┬─────┘  └────┬─────┘  └──────────────────┘  │
│       └─────────────┴────────────────┘              │
│                         ▼                           │
│              WebRTC / LiveKit Stream                │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   Browser (HUD)     │
              │  <video> element    │
              │  @d-id/client-sdk   │
              └─────────────────────┘
```

### SDK 整合流程
```javascript
import * as did from '@d-id/client-sdk';

// 1. 初始化 Agent Manager
const agent = await did.createAgentManager(agentId, {
  auth: { type: 'key', clientKey },
  callbacks: {
    onSrcObjectReady: (stream) => { video.srcObject = stream; },
    onConnectionStateChange: (state) => { /* connected/disconnected */ },
  }
});

// 2. 建立 WebRTC 連線
await agent.connect();

// 3. 讓 Avatar 說話（JARVIS 控制台詞）
await agent.speak("今天天氣真好，有什麼我能幫忙的嗎？");

// 4. 或開啟對話模式（D-ID 管理 LLM 對話）
await agent.chat("你好！");

// 5. 結束
await agent.disconnect();
```

## 整合方案

### 方案 A：Custom LLM（JARVIS 作為 LLM Backend）
```
User → ASR → JARVIS NLU → 自訂 OpenAI-compatible API endpoint
                                    ↑
D-ID Agent → 傳送對話歷史 → 打到 JARVIS endpoint → 取得回應文字
     ↓
D-ID 內部 TTS + Avatar Engine → WebRTC streaming → Browser <video>
```

| 項目 | 評估 |
|------|------|
| **延遲** | JARVIS NLU + D-ID rendering ~500-1500ms |
| **優點** | 最簡整合，D-ID 處理 TTS 時序與對嘴；JARVIS 可控制語氣/內容 |
| **缺點** | 無法使用 Kokoro TTS；需對外暴露 API endpoint |
| **實作** | JARVIS 開 `/v1/chat/completions` 符合 OpenAI streaming format |
| **成本** | D-ID TTS + Video streaming $0.05/sec |

### 方案 B：Renderer Only（JARVIS 控制完整 Pipeline）
```
User → ASR → JARVIS NLU → JARVIS 決定回應文字
     ↓
可選路徑 1：文字直接送 D-ID(`speak()`) → D-ID 做 TTS + Avatar
可選路徑 2：Kokoro TTS → 音訊送 D-ID Talks API → Avatar
     ↓
WebRTC streaming → Browser <video>
```

| 項目 | 評估 |
|------|------|
| **延遲** | JARVIS NLU + Kokoro(~300ms) + D-ID rendering(~500ms) = ~800-1500ms |
| **優點** | 保留 Kokoro TTS 品質；可同時輸出 A2BS blendshape |
| **缺點** | Talks Streams deprecated；`speak()` 強制用 D-ID TTS |
| **實作** | 前端 SDK `agent.speak(text)` 最簡單 |
| **成本** | $0.05/sec（D-ID 仍需 rendering） |

### 方案 C：Hybrid（選擇性替代 Canvas 2D）
```
場景判斷：
  - 需即時對口型 + 低延遲 → Canvas 2D + A2BS（現有方案）
  - 需高畫質真人 → D-ID Agent（speak mode）
  - 預錄內容 → HeyGen API（離線高品質）
```

| 項目 | 評估 |
|------|------|
| **優點** | 靈活切換，不犧牲即時場景 |
| **缺點** | 需維護兩套 renderer |
| **實作** | Renderer Selector 增加 "D-ID Streaming" 選項 |

## 技術可行性

### 系統需求
- **網路**: 需穩定網際網路連線（WebRTC 約 1-5 Mbps）
- **前端**: 瀏覽器支援 WebRTC，需安裝 `@d-id/client-sdk`
- **後端**: 需要 D-ID API Key + Agent 建立
- **Avatar**: 使用 D-ID 提供的 Presenter 或上傳自訂照片

### 與 JARVIS 現有系統的相容性

| 元件 | 影響 |
|------|------|
| **Kokoro TTS** | 方案 A 淘汰；方案 B 保留但在 D-ID rendering 階段不使用 |
| **A2BS blendshape** | 無法共用（D-ID 自帶對嘴，不接受 blendshape 輸入） |
| **Canvas 2D** | 可共存作為備用 renderer |
| **HUD HTML** | 新增 D-ID Agent video element（取代或並存） |
| **Renderer Selector** | 新增 "D-ID Streaming" 選項 |
| **WS Server** | 不需要變更（D-ID Client SDK 直接連接 D-ID 伺服器） |
| **app.py** | 可能需新增 Agent 管理 API（create/list/delete agents） |

### 限制與風險

| 風險 | 說明 | 緩解方式 |
|------|------|---------|
| **網路依賴** | 無網路時無法使用 | 保留 Canvas 2D 作為 fallback |
| **延遲波動** | 亞洲節點延遲可能 >500ms | 選擇 Pro 以上方案取得 priority |
| **成本不可預測** | $0.05/sec，長時間對話可能昂貴 | 設定每 session 上限 |
| **僅頭部** | 無全身/半身動作 | 只能取代 Talking Head 場景 |
| **隱私** | 音訊/文字送至 D-ID 雲端 | 避免處理敏感資料 |
| **V4 相容性** | V4 使用 LiveKit 而非標準 WebRTC | SDK 已封裝差異 |
| **TTS 品質** | D-ID 的 TTS 品質可能不如 Kokoro | 方案 A 無法選擇；方案 B 可以比較 |
| **Custom LLM 安全性** | 需暴露 API endpoint | 使用 API Key + IP whitelist |

## 成本分析

### D-ID API Pricing（2026.05）
| Plan | 月費 | 影片分鐘 | Avatar 解析度 | API Access |
|------|------|---------|--------------|-----------|
| Trial | $0 | 3 min (14天) | Standard | 有限 |
| Lite | $5.90/mo | 10 min | Standard (512p) | 部分 |
| Pro | $29.99/mo | 30 min | HD (1080p) | ✅ |
| Advanced | $108/mo | 100 min | HD (1080p) | ✅ + Custom Presenter |
| Enterprise | 客製 | 無限 | 4K | ✅ 完整 |

### 使用情境模擬（JARVIS 日常使用）

| 使用量 | 每月費用（Pro 方案） |
|--------|-------------------|
| 輕度（5 min/天 = 150 min/月） | $29.99 + $120 overage ≈ $150/mo |
| 中度（15 min/天 = 450 min/月） | $29.99 + $420 overage ≈ $450/mo |
| 重度（30 min/天 = 900 min/月） | Enterprise custom |

**結論**：長期重度使用成本高。建議作為**選擇性功能**使用。

## 實作路線圖

### Phase 1：PoC（1-2 天）
1. 註冊 D-ID 帳號（Trial 即可）
2. 在 D-ID Studio 建立一個 Agent
3. 在前端 HUD 整合 `@d-id/client-sdk`
4. 測試 `agent.speak()` 串流播放
5. 評估實際延遲與畫質

### Phase 2：JARVIS 整合（3-5 天）
1. HUD 增加 "D-ID Streaming" Renderer 選項
2. 實作 Renderer 切換邏輯（Canvas / D-ID / MP4）
3. JARVIS 對話完成後自動呼叫 `agent.speak()`
4. 測試中文語音效果

### Phase 3：Custom LLM 整合（如果需要，2-3 天）
1. JARVIS 後端暴露 OpenAI-compatible API
2. 設定 D-ID Agent 指向 JARVIS endpoint
3. 測試對話流程與延遲

## 與其他方案比較

| 面向 | D-ID Streaming | Canvas 2D + A2BS | HeyGen API |
|------|---------------|-----------------|-----------|
| **即時性** | ✅ <500ms | ✅ 即時 | ❌ 非同步 |
| **畫質** | ⭐⭐⭐⭐ 1080p | ⭐⭐ 卡通 | ⭐⭐⭐⭐⭐ 4K |
| **對口型** | ✅ 內建 | ✅ A2BS | ✅ 內建 |
| **全身** | ❌ 僅頭部 | ✅ Canvas 可自訂 | ✅ 全身 |
| **本機執行** | ❌ 需雲端 | ✅ 全本機 | ❌ 需雲端 |
| **月費** | $30~$150+ | $0 | $29~$149 |
| **網路需求** | 必要 | 無 | 必要 |
| **隱私** | 資料上雲端 | 完全本地 | 資料上雲端 |

## 結論與建議

### ✅ 可行，但僅作為選擇性方案

D-ID Streaming API 技術上**可以整合到 JARVIS**，而且 SDK 設計簡潔（5 行程式碼即可串流 Avatar）。但由於以下原因，**不建議作為主要 renderer**：

1. **成本**：重度使用月費 $150+，而 Canvas 2D 免費
2. **網路依賴**：離線無法使用
3. **僅頭部**：無法解決全身數位人需求
4. **A2BS blendshape 不相容**：無法共用既有的臉部動畫數據

### 推薦整合策略

```
主要 Renderer：Canvas 2D + A2BS（即時、免費、本機）
高品質場景：HeyGen API（預錄、4K、$0.40/min）
即時高品質（選擇性）：D-ID Streaming（$0.05/sec）
未來目標：3D VRM + A2BS blendshape（全本機、高品質）
```

### 下一步建議

| 優先級 | 行動 | 預估時間 |
|--------|------|---------|
| **P0** | 完成 Canvas 2D 優化（已接近完成） | 現有 |
| **P1** | 3D VRM renderer 研究（解決全身 + 即時 + 本機） | 下一任務 |
| **P2** | HeyGen API 測試（高品質預錄場景） | 可並行 |
| **P3** | D-ID PoC（驗證 streaming 品質與延遲） | 低優先級 |

## 參考資源
- D-ID Agent Quickstart: https://docs.d-id.com/docs/agent-quickstart
- D-ID Agent Session SDK: https://docs.d-id.com/docs/agent-session-quickstart
- D-ID Custom LLM: https://docs.d-id.com/docs/custom-llms
- D-ID SDK GitHub: https://github.com/de-id/agents-sdk
- Custom LLM Example: https://github.com/de-id/example-custom-llm
- D-ID API Pricing: https://www.d-id.com/pricing/api/
- V4 Announcement: https://www.d-id.com/blog/v4-expressive-visual-agents