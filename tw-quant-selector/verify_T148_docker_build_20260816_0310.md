# T148 Docker Build 修復記錄（2026-08-16 03:10 GMT+8）

## 問題
`docker compose build app` 失敗，原因：
1. **`tw-quant-mcp/` 子目錄不存在** — sibling project 未整合，Dockerfile `COPY tw-quant-mcp/go.mod ...` 直接炸
2. **`golang:1.22-alpine` 版本過舊** — `tw-quant-mcp/go.mod` 要求 `go 1.26.1`
3. **submodule 未設定** — 沒有 `.gitmodules`，協作者 clone 後必踩

## 參考對象：~/Projects/tw-quant-signal/
該專案用 submodule 整合 `tw-quant-mcp`：
- `.gitmodules`: `url = ../tw-quant-mcp`（相對路徑）
- Dockerfile Stage 2: `golang:1.26.6-alpine3.24` + 乾淨的 `go build`
- 不做 graceful skip — 真的依賴就讓它報錯

## 修復動作

### 1. 加 submodule（相對路徑）
```bash
git -c protocol.file.allow=always submodule add ~/Projects/tw-quant-mcp tw-quant-mcp
git -c protocol.file.allow=always submodule set-url tw-quant-mcp ../tw-quant-mcp
git -c protocol.file.allow=always submodule sync
```
→ `.gitmodules`:
```
[submodule "tw-quant-mcp"]
    path = tw-quant-mcp
    url = ../tw-quant-mcp
```

### 2. Dockerfile Stage 2 對齊 signal 風格
**Before**（過度工程）：
- `ARG MCP_SRC / MCP_STAGE` + conditional skip — 不必要
- `golang:1.26-alpine` — 版本不存在

**After**（乾淨）：
```dockerfile
FROM golang:1.26.6-alpine3.24 AS mcp-builder

WORKDIR /app/tw-quant-mcp
COPY tw-quant-mcp/go.mod tw-quant-mcp/go.sum ./
RUN go mod download
COPY tw-quant-mcp/ ./
RUN CGO_ENABLED=0 go build -ldflags "-X main.version=docker" -o /tw-quant-mcp ./cmd/mcp-server
```

### 3. scripts/docker_build.sh 簡化
- 只做 submodule 偵測 + `.env` 檢查
- 不再傳 build args

### 4. Makefile `build:` 簡化
- 直接呼叫 `bash scripts/docker_build.sh`

## 驗證結果

```
$ docker compose --env-file .env build app
...
#30 DONE 0.1s
#31 exporting to image
#31 exporting layers 9.3s done
...
Image tw-quant-app:latest Built
```

Image 內容檢查：
- `/app/tw-quant-mcp` — 19.9MB Go binary ✅
- `/app/frontend/dist/` — index.html + assets ✅
- Stage 1/2/3 全部完成 ✅

## 後續協作者注意事項

Clone 後必須執行：
```bash
git submodule update --init --recursive
```
或一鍵：
```bash
make build     # 自動執行 submodule 偵測
```