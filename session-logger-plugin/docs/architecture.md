# OpenClaw Plugin Architecture - 研究报告

> **任務**: T001 - Plugin 架構研究與規格設計
> **負責人**: 碼農1號
> **日期**: 2026-04-09
> **狀態**: ✅ Completed

---

## 1. OpenClaw Plugin 架構總覽

### 1.1 Plugin 目錄結構

OpenClaw Plugin 存放於兩個位置：
- **Config Extensions**: `~/Library/Application Support/QClaw/openclaw/config/extensions/`
- **Workspace Plugins**: `~/.qclaw/plugins/`

### 1.2 Plugin 核心文件組成

每個 Plugin 必須包含以下核心文件：

| 文件 | 用途 | 必要性 |
|------|------|--------|
| `package.json` | Node.js 包定義，含 `openclaw.extensions` 入口 | ✅ 必須 |
| `openclaw.plugin.json` | Plugin 元數據、配置 Schema、UI Hints | ✅ 必須 |
| `index.ts` / `dist/index.js` | Plugin 入口，實作 `register()` 函數 | ✅ 必須 |

### 1.3 package.json 格式

```json
{
  "name": "@org/plugin-name",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "exports": { ".": "./dist/index.js" },
  "peerDependencies": {
    "openclaw": ">=2026.3.7"
  },
  "openclaw": {
    "extensions": ["./dist/index.js"]
  }
}
```

關鍵欄位：
- `openclaw.extensions`: 指定 Plugin 入口文件路徑（相對於 package root）
- `peerDependencies.openclaw`: 指定最低 OpenClaw 版本

### 1.4 openclaw.plugin.json 格式

```json
{
  "id": "plugin-id",
  "name": "Plugin Name",
  "description": "Plugin description",
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "enabled": { "type": "boolean" },
      "outputPath": { "type": "string" }
    }
  },
  "uiHints": {
    "outputPath": {
      "label": "Output Path",
      "help": "Path to save session logs",
      "placeholder": "~/sessions/"
    }
  }
}
```

關鍵欄位：
- `id`: Plugin 唯一識別碼
- `configSchema`: JSON Schema 定義配置項
- `uiHints`: UI 配置提示（label、help、placeholder 等）

---

## 2. Plugin SDK 核心 API

### 2.1 OpenClawPluginApi 類型

```typescript
interface OpenClawPluginApi {
  id: string;
  name: string;
  version?: string;
  description?: string;
  source: string;
  config: OpenClawConfig;
  pluginConfig?: Record<string, unknown>;
  runtime: PluginRuntime;
  logger: PluginLogger;
  
  // 工具註冊
  registerTool: (tool: AnyAgentTool | OpenClawPluginToolFactory, opts?: OpenClawPluginToolOptions) => void;
  
  // Hook 註冊
  registerHook: (events: string | string[], handler: InternalHookHandler, opts?: OpenClawPluginHookOptions) => void;
  
  // 生命週期 Hook（推薦使用）
  on: <K extends PluginHookName>(hookName: K, handler: PluginHookHandlerMap[K], opts?: { priority?: number }) => void;
  
  // HTTP 路由註冊
  registerHttpRoute: (params: OpenClawPluginHttpRouteParams) => void;
  
  // CLI 命令註冊
  registerCommand: (command: OpenClawPluginCommandDefinition) => void;
  
  // Service 註冊（長期運行的服務）
  registerService: (service: OpenClawPluginService) => void;
  
  // Provider 註冊（LLM Provider）
  registerProvider: (provider: ProviderPlugin) => void;
  
  // Context Engine 註冊
  registerContextEngine: (id: string, factory: ContextEngineFactory) => void;
  
  // 路徑解析
  resolvePath: (input: string) => string;
}
```

### 2.2 Plugin 入口函數

```typescript
// 方式 1: 對象形式（推薦）
export default {
  id: "session-logger",
  name: "Session Logger",
  description: "Auto-save complete session logs",
  configSchema: { ... },
  register: (api: OpenClawPluginApi) => {
    // 註冊 hooks、tools 等
  },
  activate?: (api: OpenClawPluginApi) => {
    // 可選的啟動邏輯
  }
};

// 方式 2: 函數形式
export default function register(api: OpenClawPluginApi) {
  // 註冊 hooks、tools 等
}
```

---

## 3. Plugin Hook 系統

### 3.1 可用 Hook 點列表

| Hook 名稱 | 觸發時機 | 用途 |
|-----------|----------|------|
| `before_model_resolve` | 模型解析前 | 覆寫模型/Provider |
| `before_prompt_build` | Prompt 建構前 | 注入 Context |
| `before_agent_start` | Agent 啟動前 | Prompt 注入 + 模型覆寫 |
| `llm_input` | LLM 輸入時 | 記錄 LLM 輸入 |
| `llm_output` | LLM 輸出時 | 記錄 LLM 輸出 |
| `agent_end` | Agent 結束時 | **Session 記錄（關鍵 Hook）** |
| `before_compaction` | Context 壓縮前 | 壓縮前處理 |
| `after_compaction` | Context 壓縮後 | 壓縮後處理 |
| `before_reset` | Session 重置前 | 重置前處理 |
| `message_received` | 收到消息時 | 記錄接收消息 |
| `message_sending` | 發送消息前 | 記錄/修改發送消息 |
| `message_sent` | 消息發送後 | 記錄已發送消息 |
| `before_tool_call` | Tool 呼叫前 | Tool 呼叫前處理 |
| `after_tool_call` | Tool 呼叫後 | Tool 呼叫後記錄 |
| `tool_result_persist` | Tool 結果持久化前 | Tool 結果處理 |
| `before_message_write` | 消息寫入前 | 消息寫入前處理 |
| `session_start` | Session 啟動時 | Session 啟動記錄 |
| `session_end` | Session 結束時 | Session 結束記錄 |
| `subagent_spawning` | Subagent 啟動前 | Subagent 啟動處理 |
| `subagent_spawned` | Subagent 啟動後 | Subagent 啟動記錄 |
| `subagent_ended` | Subagent 結束時 | Subagent 結束記錄 |
| `gateway_start` | Gateway 啟動時 | Gateway 啟動處理 |
| `gateway_stop` | Gateway 停止時 | Gateway 停止處理 |

### 3.2 agent_end Hook 詳細定義

```typescript
interface PluginHookAgentEndEvent {
  messages: unknown[];      // Session 所有消息
  success: boolean;         // Agent 是否成功
  error?: string;           // 錯誤信息
  durationMs?: number;      // 執行時間
}

interface PluginHookAgentContext {
  agentId?: string;         // Agent ID
  sessionKey?: string;      // Session Key（如 "telegram:12345"）
  sessionId?: string;       // Session UUID
  workspaceDir?: string;    // Workspace 目錄
  messageProvider?: string; // 消息 Provider
  trigger?: string;         // 觸發源（"user", "heartbeat", "cron", "memory"）
  channelId?: string;       // Channel ID（如 "telegram", "discord"）
  runId?: string;           // Run ID
}

// Handler 簽名
type AgentEndHandler = (
  event: PluginHookAgentEndEvent,
  ctx: PluginHookAgentContext
) => Promise<void> | void;
```

### 3.3 Hook 註冊範例

```typescript
// 推薦：使用 api.on()
api.on("agent_end", async (event, ctx) => {
  const { messages, success, durationMs } = event;
  const { sessionKey, sessionId, agentId } = ctx;
  
  // 處理 session 日誌
  await saveSessionLog(sessionKey, messages, durationMs);
});

// 傳統：使用 api.registerHook()
api.registerHook("agent_end", async (event, ctx) => {
  // ...
}, { name: "session-logger-hook" });
```

---

## 4. 現有 Plugin 參考分析

### 4.1 memory-tencentdb Plugin

**功能**: 四層記憶系統（L0→L1→L2→L3）

**Hook 使用**:
- `before_prompt_build`: 自動召回記憶
- `agent_end`: 自動捕獲對話、觸發 L1/L2/L3 處理

**關鍵設計點**:
1. 使用 `api.on()` 註冊 Hook（推薦方式）
2. `pluginDataDir` 通過 `api.runtime.state.resolveStateDir()` 取得
3. Lazy initialization（延遲啟動直到首次對話）
4. Checkpoint 管理防止重複捕獲
5. Background embedding（非阻塞）

**配置 Schema**:
```json
{
  "configSchema": {
    "properties": {
      "capture": { "type": "object", "properties": { "enabled": { "type": "boolean" } } },
      "extraction": { "type": "object" },
      "pipeline": { "type": "object" },
      "recall": { "type": "object" }
    }
  }
}
```

### 4.2 lossless-claw Plugin

**功能**: Lossless Context Management（DAG-based conversation summarization）

**Hook 使用**:
- `before_compaction`: Context 壓縮前處理
- `after_compaction`: Context 壓縮後處理

**關鍵設計點**:
1. Context Engine 註冊（`registerContextEngine`）
2. 自定義 Tools（`lcm_describe`, `lcm_expand` 等）
3. JSON Schema 配置（`contextThreshold`, `incrementalMaxDepth` 等）
4. SQLite DB 存儲（`~/.openclaw/lcm.db`）

---

## 5. Session Logger Plugin 設計決策

### 5.1 Hook 選擇

**主 Hook**: `agent_end`
- 理由：此時 Session 所有消息已完整（含思考過程、Tool calls）
- 可取得完整 `messages` array
- 可取得 `durationMs`、`success`、`error` 等元數據

**輔助 Hook**: `llm_input` + `llm_output`
- 理由：記錄完整 LLM 輸入/輸出（含 raw thinking）
- 用於捕獲原始 thinking block（可能被處理過）

### 5.2 輸出格式設計

**檔案格式**: JSONL（每行一個 JSON object）
- 理由：易於增量寫入、易於解析、支持流式處理

**檔名格式**: `{timestamp}_{sessionKey}.jsonl`
- 例：`2026-04-09_07-30_telegram_12345.jsonl`

**每條記錄格式**:
```json
{
  "timestamp": "2026-04-09T07:30:00Z",
  "sessionKey": "telegram:12345",
  "sessionId": "uuid-xxx",
  "runId": "run-xxx",
  "agentId": "main",
  "role": "user|assistant|tool",
  "content": "...",
  "thinking": "...",
  "toolCalls": [...],
  "durationMs": 1500
}
```

### 5.3 滾動策略

**按時間滾動**:
- 每日一個檔案（`YYYY-MM-DD_*.jsonl`）
- 可配置保留天數（`retentionDays`）

**按大小滾動**:
- 單檔上限（如 10MB）
- 超過時自動分割

### 5.4 Plugin 配置項

```json
{
  "configSchema": {
    "properties": {
      "enabled": { "type": "boolean", "default": true },
      "outputDir": { "type": "string", "default": "~/sessions" },
      "filenameFormat": { "type": "string", "default": "{date}_{sessionKey}.jsonl" },
      "retentionDays": { "type": "number", "default": 30 },
      "maxFileSizeMB": { "type": "number", "default": 10 },
      "includeThinking": { "type": "boolean", "default": true },
      "includeToolCalls": { "type": "boolean", "default": true },
      "excludeAgents": { "type": "array", "items": { "type": "string" }, "default": [] }
    }
  }
}
```

---

## 6. Plugin 目錄結構建議

```
session-logger-plugin/
├── package.json           # Node.js 包定義
├── openclaw.plugin.json   # Plugin 元數據
├── index.ts               # Plugin 入口
├── src/
│   ├── config.ts          # 配置解析
│   ├── hooks/
│   │   ├── agent-end.ts   # agent_end Hook
│   │   └── llm-io.ts      # llm_input/output Hooks
│   ├── writer/
│   │   ├── jsonl-writer.ts    # JSONL 寫入器
│   │   ├── rolling-manager.ts # 檔案滾動管理
│   ├── utils/
│   │   ├── session-filter.ts  # Session 過濾
│   │   ├── formatter.ts       # 消息格式化
│   ├── types.ts           # 類型定義
├── dist/                  # 編譯輸出
├── docs/
│   ├── architecture.md    # 本文件
│   ├── spec.md            # 詳細規格
└── test/
    └── hooks.test.ts      # 單元測試
```

---

## 7. 編譯流程（重要）

### 7.1 編譯環境

- **Node.js**: `/opt/homebrew/bin/node` (v25.9.0)
- **npm**: 系統自帶
- **TypeScript**: 透過 `npm install typescript` 安裝
- **工作目錄**: `~/Library/Application Support/QClaw/openclaw/config/extensions/session-logger/`

### 7.2 tsconfig.json 設定

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": ".",
    "declaration": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["index.ts", "src/**/*.ts"],
  "exclude": ["node_modules", "dist", "test"]
}
```

### 7.3 編譯命令

```bash
cd ~/Library/Application\ Support/QClaw/openclaw/config/extensions/session-logger/
npm install
npx tsc
```

### 7.4 編譯後的目錄結構

```
session-logger/
├── index.ts          # 源碼
├── dist/
│   ├── index.js      # 編譯後的入口
│   ├── index.d.ts    # TypeScript 聲明
│   └── index.js.map  # Source Map
└── package.json      # 指向 ./dist/index.js
```

### 7.5 重要：package.json 入口

```json
{
  "openclaw": {
    "extensions": ["./dist/index.js"]
  }
}
```

⚠️ **不要**指向 `.ts` 檔案！必須使用編譯後的 `.js`。

---

## 8. 實際可用的 Hook API（重要！）

### 8.1 OpenClaw 實際的 Hook 系統

經過源碼分析，OpenClaw 的 InternalHookEvent 有以下類型：

```typescript
type InternalHookEventType = "command" | "session" | "agent" | "gateway" | "message";
```

### 8.2 實際存在的 Hook 事件

| type | action | 說明 |
|------|--------|------|
| `"agent"` | `"bootstrap"` | Agent 啟動時 |
| `"message"` | `"received"` | 收到用戶消息 |
| `"message"` | `"sent"` | 發送消息給用戶 |
| `"message"` | `"transcribed"` | 消息轉錄完成 |
| `"message"` | `"preprocessed"` | 消息預處理完成 |
| `"session"` | `"compact:before"` | Session 壓縮前 |
| `"session"` | `"compact:after"` | Session 壓縮後 |
| `"command"` | `"stop"` | 命令停止 |

### 8.3 ❌ 不存在的 Hook（原始設計有誤）

以下 Hook 在架構文件中有描述，但**實際不存在於 OpenClaw**：
- `agent_end`
- `session_start`
- `session_end`
- `llm_input`
- `llm_output`
- `before_tool_call`
- `after_tool_call`

### 8.4 registerHook API 正確用法

```typescript
// 正確：事件字串 + handler 函數
api.registerHook("message", async (event: InternalHookEvent) => {
  if (event.action === "received") {
    // 處理收到的消息
  }
});

// 錯誤：物件形式（不支援）
api.registerHook({ name: "session_created", handler: async () => {} });
```

### 8.5 logger API 正確用法

```typescript
// 正確：只有一個字串參數
api.logger.info("Session Logger plugin starting");

// 錯誤：兩個參數（不支援）
api.logger.info("Starting", { config: ... });
```

---

## 9. 參考資源

### 7.1 Plugin SDK 源碼位置

- `~/Library/Application Support/QClaw/openclaw/node_modules/openclaw/dist/plugin-sdk/plugins/types.d.ts`

### 7.2 現有 Plugin 源碼

- memory-tencentdb: `~/Library/Application Support/QClaw/openclaw/config/extensions/memory-tencentdb/`
- lossless-claw: `~/Library/Application Support/QClaw/openclaw/config/extensions/lossless-claw/`

### 7.3 相關文件

- 需求分析: `/Users/claw/howto/session-logging-analysis.md`

---

## 11. 總結

### 重要發現

OpenClaw Plugin 系統的 Hook API 與原始設計有**重大差異**：

1. ❌ `agent_end`、`session_start`、`session_end` 等 Hook **不存在**
2. ✅ 實際可用的 Hook：`message:received`、`message:sent`、`agent:bootstrap`、`session:compact:before/after`
3. ⚠️ 需要重新設計 Plugin 以適配真實的 OpenClaw API

### Plugin 設計調整

由於 `agent_end` Hook 不存在，Session Logger 必須：
1. 使用 `message:received` / `message:sent` 捕捉個別消息
2. 使用 `session:compact:before/after` 捕捉 Session 狀態變化
3. 無法獲得完整的 `messages[]` 陣列和 `durationMs`

### 下一步

1. 修改 index.ts 以使用真實存在的 Hook
2. 測試 Plugin 載入是否正常
3. 驗證消息捕捉功能