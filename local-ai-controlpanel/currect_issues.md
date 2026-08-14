# Agent Control Plane GUI — 已知問題清單

**狀態**：尚未處理（用戶 2026-08-15 04:00 GMT+8 要求「先不修，僅記錄」）
**環境**：macOS GUI（`/Applications/Agent Control Plane.app`）+ Control Plane 3001
**版本**：`fd24cff`（T026 修復 commit），GUI binary hash `8afaf98bcfdd0f1b36b72511251e9e100b9a5c3c`

---

## Issue 1 — TaskStream 顯示「○ reconnecting」過一陣子才轉「● connected」

### 觀察
GUI 啟動後 SSE 連線 badge 先卡「○ reconnecting」，數秒後才轉綠。

### 推測根因
**`subscribeTaskEvents` 沒有初始 onStatus 呼叫**：
- `src/api/client.ts:215-230` 建立 EventSource 後，**只在 `onopen` 才呼叫 `onStatus(true)`**
- EventSource 在「connecting」階段不會觸發 `onopen` 也不會觸發 `onerror`（等待 readyState）
- React 初始 `useState(false)` 預設 connected=false，所以一開始 badge 顯示「○ reconnecting」
- 連線成功後 `onopen` 才 fire → 才轉 true

### 改動方向（不修，先記）
1. **client.ts**：建立 EventSource 後立即 `onStatus(true)`（樂觀啟動）；或在 `readyState` 變化時反映（更準確但複雜）
2. **client.ts**：增加 `connecting` 中間狀態（onopen=false 期間顯示「◌ connecting」）

### 相關 file
- `src/api/client.ts:215-230`（`subscribeTaskEvents`）
- `src/components/TaskStream.tsx:47`（badge 渲染）

---

## Issue 2 — TopBar worker/model 顯示「—」（應抓 `/api/v1/workers`）

### 觀察
即便 T026 commit 已修 TopBar 改讀 `/api/v1/workers`，GUI 仍顯示 `worker: — / model: —`。

### 已驗證後端正常
```bash
$ curl -sS http://127.0.0.1:3001/api/v1/workers
{"workers":[{"id":"pi-local","runtime":"pi","model":"qwen2.5-coder:7b",...}]}
```

### 推測根因
**App.tsx L44-46**（別人寫的，非這次 commit 範圍）：
```tsx
useEffect(() => {
  getSandboxStatus().then(setSandboxStatus).catch(() => setSandboxStatus({}));
}, []);
```
這個 useEffect 只 call `getSandboxStatus()`，**沒 call `listWorkers()`**。TopBar 自己內部 useEffect 有 call，但若 TopBar 改為讀 props（例如從 App.tsx 注入 sandboxStatus），這個內部 useEffect 可能被短路。

**或**：App.tsx 把 sandboxStatus 傳給 TopBar，但**沒把 workers 傳進去**——TopBar 自己抓，但若其他人的 patch 把 TopBar 改成 prop-driven，這個機制就壞了。

### 改動方向（不修，先記）
1. 確認 `src/components/TopBar.tsx:24-28` 的 `useEffect(() => { getSandboxStatus(); listWorkers(); }, [])` 是否仍存在且無誤刪
2. 確認 `vite` 重新 build 後 bundle hash 是否包含 `listWorkers`（已驗證 `qwen-9b` 不在 bundle、`listWorkers` 在 bundle → TopBar source 正確）
3. **若 source 正確但 runtime 仍抓不到**：可能是另一個 useEffect race condition（多次 setState 互蓋），或 TopBar 收到 `sandboxStatus` prop 後 fallback 不到 internal state

### 相關 file
- `src/components/TopBar.tsx:19-28`（workers useEffect）
- `src/App.tsx:44-46`（sandboxStatus state，別人 patch 過的檔案）

---

## Issue 3 — CommandPalette (ctrl+K) 列表顯示正常但點選無效

### 觀察
- `ctrl+K` 開啟列表 ✅
- 列表內容正確（sandbox check / select TASK-001 / verify TASK-001 / ...）✅
- **Enter 鍵或點擊都不觸發 onCommand**

### 推測根因
**`src/components/CommandPalette.tsx:78-83` Enter handler**：
```tsx
onKeyDown={(e) => {
  if (e.key === "Enter" && entries[0]) {
    run(entries[cursor] ?? entries[0]!);
  }
```
「`entries[0]`」這個條件永遠 true（因為 base.length ≥ 1，永遠有 sandbox-check 條目），所以邏輯上看似 OK。

但**點擊無效**就要看 onClick — `run(entries[cursor] ?? entries[0]!)` 是用 cursor 對應的 entry，但 cursor 沒被 onClick 更新。讓我看到底有沒有 onClick：

**未確認**：需要看 CommandPalette.tsx L84-100 那段 `<ul>` 渲染有沒有 onClick handler。

### 另一個可能
**`onCommand(entry.command)` → `App.tsx:handleCommand`** 有 switch case 處理各 kind，但若 cursor 對到的 entry 是 base[0]（sandbox-check），應該跑 `case "sandbox-check"`。

### 改動方向（不修，先記）
1. **確認 click handler**：CommandPalette.tsx `<ul>` 每個 `<li>` 應有 `onClick={() => run(entry)}`
2. **debug**：在 `run()` 加 `console.log("palette run", entry)`，看是否真的有 fire
3. **focus**：input autoFocus，但若 cursor 已移到列表項（理論上不可見，因 input 才有 focus），input onKeyDown 仍會處理 Enter — 所以 Enter 應有效

### 相關 file
- `src/components/CommandPalette.tsx:78-83`（Enter handler）
- `src/components/CommandPalette.tsx:84+`（點擊 handler — 需確認存在）
- `src/App.tsx:73-150`（`handleCommand` switch）

---

## Issue 4 — InputBar 指令可打但反應「只有一行」（user 描述）

### 觀察
在底部輸入指令 → 送出 → 反應只有一行（user 沒說是 1 行 log？1 行 task？需釐清）

### 推測根因（多個可能）
1. **後端**：createTask 後立即回 task object（不含 events），UI 切到 selectedTask 後等 SSE；但 TASK-002 看到 status=RESEARCHING 卻沒繼續動 → **後端 runner 卡住**
2. **前端**：SSE onmessage 確實有觸發，但 `setEvents((prev) => [...prev, e])` 在 React 18 strict mode + double-render 下可能漏掉部分 events
3. **App.tsx L65-69** 切 selectedId 時 `setEvents([])` 清空 — 若 SSE 連線慢於 state 清空，後到的 events 不會被 prepend

### 改動方向（不修，先記）
1. **後端驗證**：`curl -X POST http://127.0.0.1:3001/api/v1/tasks -H 'Content-Type: application/json' -d '{"input":"test"}'` 看後端是否真的跑起來
2. **前端驗證**：devtools console 看 `console.log("[stage]", e)` 是否多筆（需 patch）
3. **加 status 監聽**：sandbox 跑 TASK-002 → 等 30s → `curl /api/v1/tasks` 看 status 是否從 RESEARCHING 變 COMPLETE

### 相關 file
- `src/App.tsx:55-72`（subscribeTaskEvents lifecycle）
- `apps/control-plane/src/runner.ts`（後端 task runner 狀態）

---

## Issue 5 — InputBar ArrowUp/Down 歷史「不會顯示打過指令」

### 觀察
底部輸入框打字送過後，按 ↑ 應顯示前一個指令，但無反應。

### 推測根因
`src/components/InputBar.tsx:72-87`：
```tsx
} else if (e.key === "ArrowUp") {
  e.preventDefault();
  if (history.length === 0) return;
  const idx = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1);
  setHistIdx(idx);
  setInput(history[idx] ?? "");
}
```
邏輯看似正確，但：

1. **焦點問題**：keyDown handler 綁在 `<input>`，**只有 input 有 focus 時才觸發**。若 user 點其他地方（例如 TaskList）後按 ↑，handler 沒 fire
2. **history 載入時機**：`useState(loadHistory)` 只在 mount 時跑一次，若 sessionStorage 在 mount 後才寫入（不可能），會抓空
3. **另一個可能的 root cause**：sessionStorage 在 Tauri webview（WKWebView）有限制？預設應該 OK

### 改動方向（不修，先記）
1. **確認焦點**：若 user 已點 TaskList，要先 click 回 input 才能 arrow-up；或把 keyDown 移到 `window`（但要避免跟 CommandPalette 的 Esc 衝突）
2. **devtools 驗證**：在 `setInput(history[idx])` 加 `console.log("[history]", idx, history[idx])` 確認是否真的設值

### 相關 file
- `src/components/InputBar.tsx:8-10`（`HISTORY_KEY`）
- `src/components/InputBar.tsx:12-15`（`loadHistory`）
- `src/components/InputBar.tsx:72-87`（ArrowUp/Down handler）

---

## Issue 6 — CommandPalette Escape 無法驗證（user 描述）

### 觀察
ctrl+K 開啟 palette 後，按 Esc 無反應（未關閉）

### 推測根因
`src/components/CommandPalette.tsx:48-54`：
```tsx
useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [onClose]);
```
綁在 `window` — 理論上**只要 palette mounted 期間**，所有 Esc 都會 fire。

**但**：`InputBar.tsx:32-37` 也綁了一個 window keydown：
```tsx
} else if (e.key === "Escape") {
  onCancel();
}
```
**兩個 handler 都會 fire**：CommandPalette 的 Esc → onClose()，InputBar 的 Esc → onCancel()。

- `onCancel()` 在 App.tsx 對應 `setRunning(false)`（若 running）或 noop（若沒 running）
- `onClose()` 對應 `setPaletteOpen(false)`

理論上兩個一起 fire 應該都能正常關閉 palette，但若 `onCancel` 觸發的副作用導致 re-render 把 CommandPalette unmount，Esc handler 移除後就沒作用了。

### 改動方向（不修，先記）
1. **stopPropagation**：CommandPalette 的 onKey 應 `e.stopPropagation()` 防止冒泡（但 `window` 監聽不會被 stopPropagation 影響）
2. **正確做法**：InputBar 的 Esc handler 應檢查 palette 是否 open，若 open 則不處理（避免 cancel）
3. **debug**：在 CommandPalette 的 Esc handler 加 `console.log("[palette] esc", onClose)` 看是否 fire

### 相關 file
- `src/components/CommandPalette.tsx:48-54`（window keydown）
- `src/components/InputBar.tsx:32-37`（window keydown，可能衝突）
- `src/App.tsx:163-170`（InputBar onCancel 傳入）

---

## Feature Request — UI 縮放選單 + 快捷鍵

### 用戶要求
「可以加上整個文字和介面比例縮放的選單及快捷鍵」

### 推測實作方向（不修，先記）
1. **CSS variable 方案**：
   - `src/styles/terminal.css` 改用 `var(--scale-factor)` 乘上 font-size、padding、line-height
   - 預設 scale 1.0（13px font），scale 1.2（15.6px），scale 0.85（11px）
2. **快捷鍵**：
   - `Cmd/Ctrl +` 放大
   - `Cmd/Ctrl -` 縮小
   - `Cmd/Ctrl 0` 重置為 100%
   - （標準瀏覽器 zoom 已被 Tauri webview 鎖住，無法用 browser native zoom）
3. **選單位置**：
   - TopBar 加 ⚙ 圖示（dropdown）
   - 或 ctrl+K palette 加 "ui scale" 條目
4. **持久化**：
   - localStorage `acp-ui-scale`（InputBar 用 sessionStorage，這個用 localStorage 跨 session）
5. **套用範圍**：
   - 根 `<html style={{ fontSize: '13px' * scale }}>`
   - 或 `<div className="app" style={{ '--scale': scale }}>`
6. **spec 對應**：
   - 不在 §45.4 既有 spec，是新 feature；建議開新 task（T028 或更高）

### 相關 file（將來實作）
- `src/styles/terminal.css`（CSS variables）
- `src/components/TopBar.tsx`（dropdown trigger）
- `src/App.tsx`（scale state + localStorage）
- 新文件 `src/hooks/useUiScale.ts`

---

## 環境狀態（debug 起點）

```bash
# GUI
ps -ax -o pid,etime,command | grep -E "acp-desktop|control-plane/dist/main.js" | grep -v grep

# Control Plane 健康
curl -sS http://127.0.0.1:3001/api/v1/tasks | python3 -m json.tool
curl -sS http://127.0.0.1:3001/api/v1/workers | python3 -m json.tool
curl -sS http://127.0.0.1:3001/api/v1/sandbox

# CORS（SSE 雙路徑）
curl -sSI -H "Origin: tauri://localhost" http://127.0.0.1:3001/api/v1/tasks/TASK-001/events 2>&1 | head -15

# WebKit log
log show --predicate 'process == "acp-desktop"' --info --debug --last 60s 2>&1 | grep -iE "validateResponse|didReceiveResponse|console|error" | tail -20

# App bundle 驗證
shasum /Applications/Agent\ Control\ Plane.app/Contents/MacOS/acp-desktop
strings /Applications/Agent\ Control\ Plane.app/Contents/MacOS/acp-desktop | grep -E "assets/index-.*\.js|listWorkers"
```

---

## 建議優先處理順序（不修，僅建議）

| 優先 | Issue | 工作量 | 影響 |
|-----|-------|-------|------|
| **P0** | Issue 2（worker/model 抓不到）| S | TopBar 永久顯示 —，失去 spec §45.4 worker 揭露功能 |
| **P1** | Issue 1（reconnecting 延遲） | S | UX 觀感不佳，但不影響功能 |
| **P1** | Issue 4（指令反應只有一行） | M | 後端 runner 問題需驗證；可能是另一個 bug |
| **P2** | Issue 3（palette 點選無效） | S | 影響 ctrl+K 操作 |
| **P2** | Issue 5（history 不顯示） | S | 影響 ↑/↓ 便利性 |
| **P2** | Issue 6（Esc 不驗證） | S | 影響 palette 關閉 |
| **P3** | UI 縮放（feature request） | M | 新功能，需獨立 task |

---

**更新**：2026-08-15 04:00 GMT+8（用戶首次回報，未修）