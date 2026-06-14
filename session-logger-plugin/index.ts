/**
 * Session Logger Plugin v2
 * 
 * Hooks into OpenClaw events to capture and persist session data.
 * Uses actual OpenClaw hooks: message:received, message:sent, agent:bootstrap, etc.
 */
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";

// InternalHookEvent type (from openclaw/dist/plugin-sdk/hooks/internal-hooks.d.ts)
interface InternalHookEvent {
  type: "command" | "session" | "agent" | "gateway" | "message";
  action: string;
  sessionKey: string;
  context?: Record<string, unknown>;
}
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Type definitions for our plugin config
interface SessionLoggerConfig {
  enabled: boolean;
  outputDir: string;
  filenameFormat: string;
  retentionDays: number;
  maxFileSizeMb: number;
  includeThinking: boolean;
  includeToolCalls: boolean;
  rollingType: "session" | "daily" | "size";
}

// Helper to expand ~ in paths
function expandPath(p: string): string {
  if (p.startsWith("~/") || p === "~") {
    return path.join(os.homedir(), p.slice(1));
  }
  return p;
}

// Format filename with placeholders
function formatFilename(format: string, data: Record<string, string>): string {
  let result = format;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  return result;
}

// Ensure output directory exists
function ensureOutputDir(dir: string): void {
  const expanded = expandPath(dir);
  if (!fs.existsSync(expanded)) {
    fs.mkdirSync(expanded, { recursive: true });
  }
}

// Get file size in MB
function getFileSizeMb(filepath: string): number {
  try {
    const stats = fs.statSync(filepath);
    return stats.size / (1024 * 1024);
  } catch {
    return 0;
  }
}

// Default configuration
const defaultConfig: SessionLoggerConfig = {
  enabled: true,
  outputDir: "~/sessions",
  filenameFormat: "{date}_{sessionKey}.jsonl",
  retentionDays: 30,
  maxFileSizeMb: 10,
  includeThinking: true,
  includeToolCalls: true,
  rollingType: "session",
};

// Plugin definition
const sessionLoggerPlugin = {
  id: "session-logger",
  name: "Session Logger",
  description: "Auto-save complete session logs with message capture",

  configSchema: {
    parse(value: unknown) {
      const raw =
        value && typeof value === "object" && !Array.isArray(value)
          ? (value as Record<string, unknown>)
          : {};
      return { ...defaultConfig, ...raw } as SessionLoggerConfig;
    },
  },

  register(api: OpenClawPluginApi) {
    // Get runtime config (merged with defaults)
    const rawConfig = (api.config && typeof api.config === 'object' && !Array.isArray(api.config))
      ? (api.config as Record<string, unknown>)
      : {};
    const config: SessionLoggerConfig = { ...defaultConfig, ...rawConfig };

    if (!config.enabled) {
      api.logger.info("Session Logger plugin disabled");
      return;
    }

    api.logger.info("Session Logger plugin starting");

    // Track current session file handle
    let currentSessionFile: fs.WriteStream | null = null;
    let currentSessionKey: string | null = null;
    let currentFilePath: string | null = null;
    let currentDate: string | null = null;

    // Helper to get current date string
    const getDateStr = () => new Date().toISOString().split("T")[0];

    // Helper to create session file
    const createSessionFile = (sessionKey: string, forceNew: boolean = false): string => {
      const dateStr = getDateStr();
      const filename = formatFilename(config.filenameFormat, {
        date: dateStr,
        sessionKey: sessionKey,
        sessionId: sessionKey,
        agentId: "unknown",
      });
      const filepath = path.join(expandPath(config.outputDir), filename);
      ensureOutputDir(config.outputDir);

      // Check if we need to roll based on size
      if (config.rollingType === "size" && !forceNew && currentFilePath) {
        const size = getFileSizeMb(currentFilePath);
        if (size >= config.maxFileSizeMb) {
          const ext = path.extname(filename);
          const base = path.basename(filename, ext);
          const seq = Date.now();
          const newFilename = `${base}_${seq}${ext}`;
          api.logger.info(`Rolling file: ${size.toFixed(2)}MB >= ${config.maxFileSizeMb}MB`);
          return path.join(expandPath(config.outputDir), newFilename);
        }
      }

      return filepath;
    };

    // Helper to write log entry
    const writeLog = (sessionKey: string, entry: object): void => {
      if (!config.enabled || !sessionKey) return;

      // Determine if we need a new file based on rolling type
      let shouldRotate = false;
      
      if (config.rollingType === "session") {
        shouldRotate = currentSessionKey !== sessionKey;
      } else if (config.rollingType === "daily") {
        const dateStr = getDateStr();
        shouldRotate = currentDate !== dateStr;
      }

      if (shouldRotate) {
        if (currentSessionFile) {
          currentSessionFile.end();
        }
        currentSessionKey = sessionKey;
        currentDate = getDateStr();
        currentFilePath = createSessionFile(sessionKey, true);
        currentSessionFile = fs.createWriteStream(currentFilePath, { flags: "a" });
        api.logger.info(`Session log started: ${sessionKey}`);
      }

      // Check size-based rolling during write
      if (config.rollingType === "size" && currentFilePath && currentSessionFile) {
        const size = getFileSizeMb(currentFilePath);
        if (size >= config.maxFileSizeMb) {
          currentSessionFile.end();
          currentFilePath = createSessionFile(sessionKey, true);
          currentSessionFile = fs.createWriteStream(currentFilePath, { flags: "a" });
          api.logger.info(`Size-based rotation: ${size.toFixed(2)}MB`);
        }
      }

      if (currentSessionFile) {
        const logLine = JSON.stringify({
          ...entry,
          timestamp: new Date().toISOString(),
          sessionKey,
        }) + "\n";
        currentSessionFile.write(logLine);
      }
    };

    // Cleanup old files based on retention days
    const cleanupOldFiles = (): void => {
      if (config.retentionDays <= 0) return;

      const outputDir = expandPath(config.outputDir);
      if (!fs.existsSync(outputDir)) return;

      const cutoffTime = Date.now() - config.retentionDays * 24 * 60 * 60 * 1000;
      const files = fs.readdirSync(outputDir);
      let deletedCount = 0;

      for (const file of files) {
        const filepath = path.join(outputDir, file);
        try {
          const stats = fs.statSync(filepath);
          if (stats.mtimeMs < cutoffTime) {
            fs.unlinkSync(filepath);
            deletedCount++;
          }
        } catch {
          // Skip files we can't access
        }
      }

      if (deletedCount > 0) {
        api.logger.info(`Retention cleanup: deleted ${deletedCount} files`);
      }
    };

    // Run cleanup on startup
    cleanupOldFiles();

    // Helper to extract message content from hook event context
    const extractMessageContent = (event: InternalHookEvent): string | undefined => {
      const ctx = event.context as Record<string, unknown> | undefined;
      if (!ctx) return undefined;
      
      const message = ctx.message as Record<string, unknown> | undefined;
      if (!message) return undefined;
      
      const content = message.content;
      if (typeof content === 'string') return content;
      if (Array.isArray(content)) {
        return content.map(c => typeof c === 'string' ? c : c?.text || '').join('\n');
      }
      return undefined;
    };

    // Hook: message received (when message is received from user)
    api.registerHook("message", async (event: InternalHookEvent) => {
      if (event.action === "received") {
        const content = extractMessageContent(event);
        const ctx = event.context as Record<string, unknown> | undefined;
        const message = ctx?.message as Record<string, unknown> | undefined;
        
        writeLog(event.sessionKey, {
          type: "message_received",
          role: message?.role || "user",
          content: content || "[no content]",
        });
      }
    });

    // Hook: message sent (when message is sent to user)
    api.registerHook("message", async (event: InternalHookEvent) => {
      if (event.action === "sent") {
        const content = extractMessageContent(event);
        const ctx = event.context as Record<string, unknown> | undefined;
        const message = ctx?.message as Record<string, unknown> | undefined;
        
        writeLog(event.sessionKey, {
          type: "message_sent",
          role: message?.role || "assistant",
          content: content || "[no content]",
        });
      }
    });

    // Hook: agent bootstrap (when agent starts)
    api.registerHook("agent", async (event: InternalHookEvent) => {
      if (event.action === "bootstrap") {
        const ctx = event.context as Record<string, unknown> | undefined;
        api.logger.info(`Agent bootstrap: ${event.sessionKey}`);
        writeLog(event.sessionKey, {
          type: "agent_bootstrap",
          model: ctx?.model || "unknown",
        });
      }
    });

    // Hook: session compaction (before/after)
    api.registerHook("session", async (event: InternalHookEvent) => {
      if (event.action === "compact:before") {
        api.logger.info(`Session compact before: ${event.sessionKey}`);
        writeLog(event.sessionKey, {
          type: "session_compact_before",
        });
      } else if (event.action === "compact:after") {
        api.logger.info(`Session compact after: ${event.sessionKey}`);
        writeLog(event.sessionKey, {
          type: "session_compact_after",
        });
      }
    });

    api.logger.info("Session Logger hooks registered");
  },
};

export default sessionLoggerPlugin;
