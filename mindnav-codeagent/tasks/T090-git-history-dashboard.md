---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/595
title: Git History Dashboard
type: Feature
priority: high
assignee: OpenCode DeepSeek V4 Flash
status: done
created: 2026-05-18
updated: 2026-05-21
howto: null
---

# T090 - Git History Dashboard

## 目標
在 Dashboard 上實現類似 GitHub 的 commit 瀏覽器，可查看 `~/tasks` 及 `~/projects/<project>` 的 git 歷程與 diff，並支援透過介面設定 remote。

## 驗收標準
- [x] 後端 API：`GET /api/v1/git/{target}/log` — 列出 commit history（target 可為 tasks 或 project slug）
- [x] 後端 API：`GET /api/v1/git/{target}/diff/{commit}` — 取得某個 commit 的 diff（支援 root commit）
- [x] 後端 API：`GET /api/v1/git/{target}/status` — 檢查 git status（staged/unstaged/untracked）
- [x] 後端 API：`POST /api/v1/git/{target}/init` — 自動 git init + add + commit
- [x] 後端 API：`GET /api/v1/git/{target}/remote` — 查詢 remote URL
- [x] 後端 API：`PUT /api/v1/git/{target}/remote` — 設定 remote URL（新增或更新）
- [x] 前端 GitHistoryPage — commit log 列表（hash, author, date, message）
- [x] 前端 diff viewer — 點擊展開顯示逐行 diff
- [x] 前端 git status 面板 — 顯示 staged/unstaged/untracked 變更（可切換顯示）
- [x] 前端 remote 設定表單 — 輸入名稱/URL 並儲存
- [x] Layout nav 加入「📜 Git」tab

## 備註
- git init 僅初始化 repository，不設定 remote
- remote 透過 Dashboard 設定後才寫入 `.git/config`
- diff 顯示使用簡易的逐行 diff（+/- 標示），可考慮使用 `react-diff-viewer` 或 `monaco-editor` 的 diff editor
- 需確認 `TASKS_ROOT` 和 `~/projects` 的目錄結構
- 安全性：不允許執行任意 git command，只能透過 API 操作

## T090 complete. Here's what was built:

**Backend** (`frontend_api/routers/git_router.py` — new file, 6 endpoints):

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/git/{target}/log?limit=N` | Commit log with hash/author/date/subject/refs |
| `GET /api/v1/git/{target}/diff/{hash}` | Diff content (handles root commit via `show` fallback) |
| `GET /api/v1/git/{target}/status` | Branch + staged/unstaged/untracked files |
| `POST /api/v1/git/{target}/init` | `git init` + `add -A` + initial commit |
| `GET /api/v1/git/{target}/remote` | List remotes with name/url/direction |
| `PUT /api/v1/git/{target}/remote` | Set remote (add or set-url) |

Target resolution: `tasks` → `~/Tasks`, any slug → `~/projects/<slug>`. All git commands use `subprocess.run` with specific args — no arbitrary command execution.

**Frontend** (`GitHistoryPage.tsx`):
- Target dropdown selector (tasks + common project slugs)
- Commit log: clickable rows with hash, subject, author, date
- Diff viewer: inline expand per commit with monospace diff
- Status panel: togglable, shows staged/unstaged/untracked files
- Remote form: set name + URL, shows current remotes
- Init button: one-click git initialization
- Refresh to reload all data

**Route & Nav**: `/git` route + "📜 Git" nav tab registered.

