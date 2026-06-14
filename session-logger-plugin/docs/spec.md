# Session Logger Plugin - 技術規格文件

> **任務**: T001 - Plugin 架構研究與規格設計
> **負責人**: 碼農1號
> **日期**: 2026-04-09
> **狀態**: ✅ Completed

---

## 1. Plugin 識別

| 屬性 | 值 |
|------|-----|
| ID | `session-logger` |
| Name | `Session Logger` |
| Description | `Auto-save complete session logs with thinking process and tool calls` |
| Version | `0.1.0` |
| Kind | `memory` |

---

## 2. 配置 Schema

### 2.1 完整配置定義

```json
{
  "id": "session-logger",
  "name": "Session Logger",
  "description": "Auto-save complete session logs with thinking process and tool calls",
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "enabled": {
        "type": "boolean",
        "default": true,
        "description": "Enable/disable session logging"
      },
      "outputDir": {
        "type": "string",
        "default": "~/sessions",
        "description": "Directory to save session logs"
      },
      "filenameFormat": {
        "type": "string",
        "default": "{date}_{sessionKey}.jsonl",
        "description": "Filename format pattern. Supported placeholders: {date}, {sessionKey}, {sessionId}, {agentId}"
      },
      "retentionDays": {
        "type": "number",
        "default": 30,
        "minimum": 0,
        "description": "Days to retain logs. 0 = no cleanup"
      },
      "maxFileSizeMB": {
        "type": "number",
        "default": 10,
        "minimum": 1,
        "maximum": 100,
        "description": "Max file size in MB before rolling"
      },
      "includeThinking": {
        "type": "boolean",
        "default": true,
        "description": "Include thinking/reasoning blocks in logs"
      },
      "includeToolCalls": {
        "type": "boolean",
        "default": true,
        "description": "Include tool call details in logs"
      },
      "includeToolResults": {
        "type": "boolean",
        "default": true,
        "description": "Include tool result details in logs"
      },
      "excludeAgents": {
        "type": "array",
        "items": { "type": "string" },
        "default": [],
        "description": "Agent glob patterns to exclude (e.g., 'bench-judge-*')"
      },
      "flushOnExit": {
        "type": "boolean",
        "default": true,
        "description": "Flush pending logs on gateway stop"
      }
    }
  },
  "uiHints": {
    "outputDir": {
      "label": "Output Directory",
      "help": "Directory where session logs will be saved",
      "placeholder": "~/sessions"
    },
    "filenameFormat": {
      "label": "Filename Format",
      "help": "Pattern for log filenames. Use {date}, {sessionKey}, {sessionId}, {agentId}",
      "placeholder": "{date}_{sessionKey}.jsonl"
    },
    "retentionDays": {
      "label": "Retention Days",
      "help": "Days to keep logs before cleanup. 0 disables cleanup.",
      "tags": ["advanced"]
    },
    "maxFileSizeMB": {
      "label": "Max File Size (MB)",
      "help": "Maximum file size before rolling to a new file",
      "tags": ["advanced"]
    },
    "includeThinking": {
      "label": "Include Thinking",
      "help": "Capture thinking/reasoning blocks from LLM responses"
    },
    "includeToolCalls": {
      "label": "Include Tool Calls",
      "help": "Capture tool call requests and results"
    },
    "excludeAgents": {
      "label": "Exclude Agents",
      "help": "Glob patterns for agents to skip logging (e.g., bench-judge-*)",
      "tags": ["advanced"]
    }
  }
}
```

---

## 3. Hook 實作規格

### 3.1 agent_end Hook（主 Hook）

**觸發時機**: Agent 完成 run 後觸發，包含完整 Session 消息

**Handler 簽名**:
```typescript
type AgentEndHandler = (
  event: PluginHookAgentEndEvent,
  ctx: PluginHookAgentContext
) => Promise<void> | void;
```

**處理流程**:
```
1. 檢查是否啟用 (cfg.enabled)
2. 檢查 Session Filter (excludeAgents)
3. 格式化 messages → LogRecords
4. 寫入 JSONL 檔案（增量）
5. 檢查檔案大小 → 觸發滾動（如需）
6. 更新 checkpoint（記錄最後寫入位置）
```

**邊界條件處理**:
- `sessionKey` 為空時跳過（避免寫入不穩定的 fallback key）
- `messages` 為空陣列時跳過（無內容）
- 首次啟動時使用 `pluginStartTimestamp` 作為 cursor 下界

### 3.2 llm_input Hook（輔助 Hook）

**觸發時機**: LLM API 輸入時觸發

**用途**: 捕獲原始 LLM 輸入（含 system prompt、history）

**Handler 簽名**:
```typescript
type LlmInputHandler = (
  event: PluginHookLlmInputEvent,
  ctx: PluginHookAgentContext
) => Promise<void> | void;
```

**Event 內容**:
```typescript
interface PluginHookLlmInputEvent {
  runId: string;
  sessionId: string;
  provider: string;
  model: string;
  systemPrompt?: string;
  prompt: string;
  historyMessages: unknown[];
  imagesCount: number;
}
```

### 3.3 llm_output Hook（輔助 Hook）

**觸發時機**: LLM API 輸出時觸發

**用途**: 捕獲原始 LLM 輸出（含 thinking block、usage）

**Handler 箋名**:
```typescript
type LlmOutputHandler = (
  event: PluginHookLlmOutputEvent,
  ctx: PluginHookAgentContext
) => Promise<void> | void;
```

**Event 內容**:
```typescript
interface PluginHookLlmOutputEvent {
  runId: string;
  sessionId: string;
  provider: string;
  model: string;
  assistantTexts: string[];
  lastAssistant?: unknown;
  usage?: {
    input?: number;
    output?: number;
    cacheRead?: number;
    cacheWrite?: number;
    total?: number;
  };
}
```

---

## 4. 日誌格式規格

### 4.1 JSONL Record Schema

每行一個 JSON object：

```typescript
interface SessionLogRecord {
  // === 元數據 ===
  timestamp: string;         // ISO 8601 格式
  sessionKey: string;        // Session key (e.g., "telegram:12345")
  sessionId: string;         // Ephemeral session UUID
  runId?: string;            // Stable run ID
  agentId?: string;          // Agent ID
  
  // === 消息內容 ===
  role: "user" | "assistant" | "tool" | "system";
  content: string;           // 消息文本內容
  
  // === Thinking（可選）===
  thinking?: string;         // 思考過程（僅 assistant role）
  thinkingBudget?: number;   // Thinking budget tokens（如有）
  
  // === Tool Calls（可選）===
  toolCalls?: Array<{
    id: string;              // Tool call ID
    name: string;            // Tool name
    params: Record<string, unknown>;  // Tool params
  }>;
  
  // === Tool Results（可選）===
  toolCallId?: string;       // Associated tool call ID (tool role)
  toolResult?: unknown;      // Tool result content
  toolError?: string;        // Tool error message
  
  // === LLM 元數據（可選）===
  provider?: string;         // LLM provider
  model?: string;            // LLM model
  usage?: {
    input?: number;
    output?: number;
    cacheRead?: number;
    cacheWrite?: number;
    total?: number;
  };
  
  // === Agent 元數據（可選）===
  durationMs?: number;       // Agent run duration (agent_end only)
  success?: boolean;         // Agent success status (agent_end only)
  error?: string;            // Agent error message
}
```

### 4.2 檔案命名規格

**預設格式**: `{date}_{sessionKey}.jsonl`

**支援佔位符**:
| 佔位符 | 說明 |範例 |
|--------|------|------|
| `{date}` | 日期（YYYY-MM-DD） | `2026-04-09` |
| `{sessionKey}` | Session key（清理特殊字符） | `telegram_12345` |
| `{sessionId}` | Session UUID | `abc123...` |
| `{agentId}` | Agent ID | `main` |

**清理規則**:
- `/` → `_`
- `:` → `_`
- `:` → `_`
- 特殊字符（`<>:"/\|?*`） → `_`

**範例**:
```
2026-04-09_telegram_12345.jsonl
2026-04-09_agent_main.jsonl
```

### 4.3 滾動檔案命名

當檔案超過 `maxFileSizeMB`，自動分割：

```
2026-04-09_telegram_12345.jsonl       # 主檔案
2026-04-09_telegram_12345_001.jsonl   # 第一個滾動檔案
2026-04-09_telegram_12345_002.jsonl   # 第二個滾動檔案
...
```

---

## 5. 檔案管理規格

### 5.1 檔案滾動策略

**觸發條件**: 檔案大小超過 `maxFileSizeMB`

**處理流程**:
```
1. 關閉當前檔案
2. 生成新檔名（添加 `_001` suffix）
3. 開啟新檔案
4. 更新 rolling state
```

**State 檔案**: `{outputDir}/.metadata/rolling_state.json`

```json
{
  "files": {
    "telegram_12345": {
      "currentFile": "2026-04-09_telegram_12345.jsonl",
      "currentIndex": 0,
      "currentSize": 5.2,
      "lastWrite": "2026-04-09T07:30:00Z"
    }
  }
}
```

### 5.2 檔案清理策略

**觸發條件**: 檔案 age > `retentionDays`

**執行時機**: 每日 03:00（可配置）

**處理流程**:
```
1. scan outputDir for files matching pattern
2. calculate file age (creation time or modification time)
3. delete files older than retentionDays
4. log cleanup summary
```

**清理器**: `LocalLogCleaner` class

```typescript
class LocalLogCleaner {
  constructor(params: {
    baseDir: string;
    retentionDays: number;
    cleanTime: string; // HH:mm
    logger: PluginLogger;
  });
  
  start(): void;
  stop(): void;
}
```

---

## 6. Session Filter規格

### 6.1 Glob Pattern 匹配

```typescript
class SessionFilter {
  constructor(excludePatterns: string[]);
  
  shouldSkipCtx(ctx: PluginHookAgentContext): boolean;
  shouldSkipSessionKey(sessionKey: string): boolean;
}
```

**匹配邏輯**:
- 支援 `*` 通配符
- 例：`bench-judge-*` 匹配所有 bench judge agent

**實作**:
```typescript
import minimatch from 'minimatch';

shouldSkipCtx(ctx: PluginHookAgentContext): boolean {
  const agentId = ctx.agentId ?? '';
  for (const pattern of this.excludePatterns) {
    if (minimatch(agentId, pattern)) return true;
  }
  return false;
}
```

### 6.2 預設排除列表

- Internal sessions（`sessionKey.startsWith("internal:")`）
- Bench judge agents（`bench-judge-*`）

---

## 7. Plugin 入口實作規格

### 7.1 index.ts 主結構

```typescript
import type { OpenClawPluginApi } from "openclaw/plugin-sdk/core";
import { parseConfig } from "./src/config.js";
import type { SessionLoggerConfig } from "./src/config.js";
import { SessionFilter } from "./src/utils/session-filter.js";
import { JsonlWriter } from "./src/writer/jsonl-writer.js";
import { RollingManager } from "./src/writer/rolling-manager.js";
import { LocalLogCleaner } from "./src/utils/log-cleaner.js";
import { handleAgentEnd } from "./src/hooks/agent-end.js";
import { handleLlmInput, handleLlmOutput } from "./src/hooks/llm-io.js";

const TAG = "[session-logger]";

// Plugin 啟動時間戳（防止首次 agent_end 寫入全 Session history）
let pluginStartTimestamp = 0;

export default function register(api: OpenClawPluginApi) {
  pluginStartTimestamp = Date.now();
  
  // === 1. 解析配置 ===
  const cfg = parseConfig(api.pluginConfig);
  if (!cfg.enabled) {
    api.logger.info(`${TAG} Plugin disabled by config`);
    return;
  }
  
  // === 2. 初始化目錄 ===
  const outputDir = api.resolvePath(cfg.outputDir);
  const metadataDir = path.join(outputDir, ".metadata");
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(metadataDir, { recursive: true });
  
  // === 3. 初始化 Writer ===
  const writer = new JsonlWriter({
    outputDir,
    filenameFormat: cfg.filenameFormat,
    maxFileSizeMB: cfg.maxFileSizeMB,
    logger: api.logger,
  });
  
  const rollingManager = new RollingManager({
    metadataDir,
    maxFileSizeMB: cfg.maxFileSizeMB,
    logger: api.logger,
  });
  
  // === 4. 初始化 Session Filter ===
  const sessionFilter = new SessionFilter(cfg.excludeAgents);
  
  // === 5. 初始化清理器（如配置 retentionDays）===
  let cleaner: LocalLogCleaner | undefined;
  if (cfg.retentionDays > 0) {
    cleaner = new LocalLogCleaner({
      baseDir: outputDir,
      retentionDays: cfg.retentionDays,
      cleanTime: "03:00",
      logger: api.logger,
    });
    cleaner.start();
  }
  
  // === 6. 註冊 Hooks ===
  api.on("agent_end", async (event, ctx) => {
    await handleAgentEnd(event, ctx, {
      cfg,
      writer,
      rollingManager,
      sessionFilter,
      pluginStartTimestamp,
      logger: api.logger,
    });
  });
  
  if (cfg.includeThinking) {
    api.on("llm_input", async (event, ctx) => {
      await handleLlmInput(event, ctx, { cfg, writer, logger: api.logger });
    });
    
    api.on("llm_output", async (event, ctx) => {
      await handleLlmOutput(event, ctx, { cfg, writer, logger: api.logger });
    });
  }
  
  // === 7. Gateway stop cleanup ===
  api.on("gateway_stop", () => {
    if (cfg.flushOnExit) {
      writer.flushAll();
    }
    cleaner?.stop();
  });
  
  api.logger.info(`${TAG} Plugin registered: outputDir=${outputDir}`);
}
```

### 7.2 config.ts 配置解析

```typescript
import type { PluginLogger } from "openclaw/plugin-sdk/plugins/types";

export interface SessionLoggerConfig {
  enabled: boolean;
  outputDir: string;
  filenameFormat: string;
  retentionDays: number;
  maxFileSizeMB: number;
  includeThinking: boolean;
  includeToolCalls: boolean;
  includeToolResults: boolean;
  excludeAgents: string[];
  flushOnExit: boolean;
}

const DEFAULTS: SessionLoggerConfig = {
  enabled: true,
  outputDir: "~/sessions",
  filenameFormat: "{date}_{sessionKey}.jsonl",
  retentionDays: 30,
  maxFileSizeMB: 10,
  includeThinking: true,
  includeToolCalls: true,
  includeToolResults: true,
  excludeAgents: [],
  flushOnExit: true,
};

export function parseConfig(
  rawConfig: Record<string, unknown> | undefined,
  logger?: PluginLogger
): SessionLoggerConfig {
  if (!rawConfig) return DEFAULTS;
  
  const cfg: SessionLoggerConfig = { ...DEFAULTS };
  
  // 验证并合并配置
  for (const key of Object.keys(DEFAULTS) as Array<keyof SessionLoggerConfig>) {
    if (rawConfig[key] !== undefined) {
      cfg[key] = rawConfig[key] as SessionLoggerConfig[keyof SessionLoggerConfig];
    }
  }
  
  // 类型检查
  if (typeof cfg.retentionDays !== "number" || cfg.retentionDays < 0) {
    logger?.warn(`Invalid retentionDays: ${cfg.retentionDays}, using default 30`);
    cfg.retentionDays = 30;
  }
  
  return cfg;
}
```

---

## 8. Writer 實作規格

### 8.1 JsonlWriter

```typescript
export class JsonlWriter {
  private openFiles: Map<string, fs.WriteStream> = new Map();
  private outputDir: string;
  private filenameFormat: string;
  private maxFileSizeMB: number;
  private logger: PluginLogger;
  
  constructor(params: {
    outputDir: string;
    filenameFormat: string;
    maxFileSizeMB: number;
    logger: PluginLogger;
  });
  
  // 写入单条记录
  writeRecord(sessionKey: string, record: SessionLogRecord): void;
  
  // 批量写入
  writeBatch(sessionKey: string, records: SessionLogRecord[]): void;
  
  // 刷新所有缓冲
  flushAll(): void;
  
  // 关闭指定 session的文件
  closeSession(sessionKey: string): void;
  
  // 获取当前文件路径
  getCurrentFilePath(sessionKey: string): string;
  
  // 检查是否需要滚动
  needsRolling(sessionKey: string): boolean;
  
  // 执行滚动
  rollFile(sessionKey: string): void;
}
```

### 8.2 RollingManager

```typescript
export class RollingManager {
  private metadataDir: string;
  private stateFile: string;
  private maxFileSizeMB: number;
  private logger: PluginLogger;
  
  constructor(params: {
    metadataDir: string;
    maxFileSizeMB: number;
    logger: PluginLogger;
  });
  
  // 获取滚动状态
  getState(sessionKey: string): RollingState;
  
  // 更新滚动状态
  updateState(sessionKey: string, state: RollingState): void;
  
  // 计算下一个滚动索引
  nextIndex(sessionKey: string): number;
  
  // 生成滚动文件名
  generateRolledFilename(sessionKey: string, index: number): string;
}

interface RollingState {
  currentFile: string;
  currentIndex: number;
  currentSize: number;
  lastWrite: string;
}
```

---

## 9. Checkpoint 管理規格

### 9.1 Checkpoint 用途

防止 `agent_end` 重複寫入相同消息：
- 記錄每個 session 的最後寫入時間戳
- 下次只寫入 `timestamp > lastCheckpoint` 的消息

### 9.2 Checkpoint 文件

位置：`{outputDir}/.metadata/checkpoint.json`

```json
{
  "sessions": {
    "telegram_12345": {
      "lastTimestamp": "2026-04-09T07:30:00Z",
      "lastMessageCount": 10
    }
  }
}
```

### 9.3 CheckpointManager

```typescript
export class CheckpointManager {
  private checkpointFile: string;
  private logger: PluginLogger;
  
  constructor(params: {
    metadataDir: string;
    logger: PluginLogger;
  });
  
  // 读取 checkpoint
  read(): Promise<CheckpointData>;
  
  // 更新 checkpoint
  update(sessionKey: string, data: SessionCheckpoint): Promise<void>;
  
  // 原子写入（防止竞态）
  atomicWrite(sessionKey: string, fn: (current: SessionCheckpoint) => SessionCheckpoint): Promise<void>;
}

interface CheckpointData {
  sessions: Record<string, SessionCheckpoint>;
}

interface SessionCheckpoint {
  lastTimestamp: string;
  lastMessageCount: number;
}
```

---

## 10. 錯誤處理規格

### 10.1 非阻塞設計

所有 Hook handler 應為非阻塞：
- 寫入失敗時 log error，不影響 Agent 主流程
- 檔案系統錯誤時降級處理（skip寫入）

### 10.2 錯誤類型

```typescript
enum LogErrorType {
  FILE_WRITE_ERROR = "file_write_error",
  CHECKPOINT_ERROR = "checkpoint_error",
  ROLLING_ERROR = "rolling_error",
  CLEANUP_ERROR = "cleanup_error",
}
```

### 10.3 錯誤報告

```typescript
logger.error(`${TAG} [error] type=${type}, message=${err.message}`);
```

---

## 11. 性能規格

### 11.1 目標性能

| 指標 | 目標值 |
|------|--------|
| Hook handler 執行時間 | < 100ms（非阻塞） |
| 檔案寫入延遲 | < 50ms per record |
| 記憶體佔用 | < 50MB（buffer） |

### 11.2 性能優化策略

- **Buffered write**: 使用 `fs.WriteStream` buffer 寫入
- **Lazy flush**: 僅在 gateway_stop 或滾動時 flush
- **Background cleanup**: 清理器獨立運行，不阻塞 Hook
- **Checkpoint caching**: 記憶體 cache checkpoint，減少檔案讀取

---

## 12. 測試規格

### 12.1 測試範圍

| 測試項 |說明 |
|--------|------|
| Config parsing | 配置解析正確性 |
| Hook handlers | agent_end、llm_io handler 行為 |
| JsonlWriter |檔案寫入、滾動 |
| SessionFilter | Glob pattern 匹配 |
| Checkpoint | 重複寫入防止 |
| Cleaner | 檔案清理 |

### 12.2 測試工具

- Vitest（單元測試）
- Mock `OpenClawPluginApi`
- Mock `fs` module

---

## 13. 交付物清單

| 文件 | 說明 |
|------|------|
| `docs/architecture.md` | 架構研究報告（本系列第一份） |
| `docs/spec.md` | 技術規格文件（本文件） |
| T001.md | 任務狀態更新 |

---

## 14. 驗收標準

- [☐] Plugin 可成功載入
- [☐] agent_end Hook 正確觸發
- [☐] Session 日誌正確寫入 JSONL
- [☐] Thinking/ToolCalls 正確捕獲
- [☐] 檔案滾動正常運作
- [☐] 清理器正確刪除過期檔案
- [☐] 排除 Agent 正確跳過
- [☐] 錯誤不阻塞 Agent 主流程

---

*規格文件完成，待進入 T002 - Plugin 基礎框架實作。*