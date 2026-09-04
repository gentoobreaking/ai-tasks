# Stdio Transport Algorithm

**Feature:** F11 — stdio transport  
**Module:** modules/transport/stdio  
**Task:** T010  

## Objective

Implement the stdio transport that reads MCP JSON-RPC messages from stdin and writes responses to stdout, communicating with the MCP Client (e.g., Claude Desktop).

## Protocol

MCP over stdio uses newline-delimited JSON:
- Each message is a JSON object terminated by a newline (`\n`).
- Messages flow: Client → stdin, Server → stdout.
- The server reads one message at a time, processes it, and writes the response.

## Message Flow

```text
[Client] ──stdin──> [MCPDecoder] ──> [Router] ──> [Tool Handler]
                                       │
[Client] <--stdout-- [MCPEncoder] <── response
```

## Implementation Steps

1. Create `Transport` struct implementing `Transport` interface:
   ```go
   type Transport interface {
       Serve(ctx context.Context, handler Handler) error
   }
   ```

2. Stdio transport:
   - Read from `os.Stdin` using a buffered scanner
   - Parse each line as JSON-RPC 2.0 message
   - Dispatch through `core.Router`
   - Write response to `os.Stdout` as newline-delimited JSON

3. Handle graceful shutdown on `SIGINT` / `SIGTERM`

## Acceptance Test Cases

| Case | Setup | Expected |
|---|---|---|
| Initialize | Send `initialize` request | Valid `initialize` response |
| Tool list | Send `tools/list` | List of registered tools |
| Tool call | Send `tools/call` with test tool | Correct response |
| Shutdown | Send `shutdown` then `exit` | Process exits gracefully |
| No features in binary | Build minimal | http, jwt, oauth not imported |
