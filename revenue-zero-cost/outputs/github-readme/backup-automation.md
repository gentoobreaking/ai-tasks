# OpenClaw 備份自動化

> 每 2 小時自動將 OpenClaw 全量資料打包上傳至 GitHub Releases，資料永不遺失。

![Bash](https://img.shields.io/badge/Bash-Script-green?logo=gnu-bash)
![License](https://img.shields.io/badge/License-MIT-blue)
![GitHub Releases](https://img.shields.io/badge/GitHub-Releases-brightgreen)

## 📌 成果

| 指標 | 數值 |
|------|------|
| 備份頻率 | **每 2 小時** |
| 單次備份大小 | **~130 MB** |
| 覆蓋目錄 | Skills、Howto、Tasks、Agents、Workspace |
| 運行成本 | **$0/月** |
| 最大保留 | **30 天**（自動清理舊版本）|

## 🔧 架構

```
┌─────────────────────────────────┐
│  OpenClaw ~/.qclaw/             │
│  (Skills + Howto + Tasks)       │
└────────────┬────────────────────┘
             │
             │  tar.gz 打包
             ▼
┌─────────────────────────────────┐
│       GitHub Releases           │
│   (永久版本化存檔)              │
│   openclaw-private-backups      │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   Telegram 通知 ✅ / ❌         │
│   (失敗即時告警)                │
└─────────────────────────────────┘
```

## ✨ 功能

- **全自動排程**：Cron 每 2 小時執行，零人工介入
- **智能打包**：`git clean` 排除不必要檔案，只備份有意義資料
- **版本化存檔**：每次備份一個 Release，隨時可回溯任一版本
- **失敗告警**：Telegram 即時通知，備份失敗不漏接
- **自動清理**：自動刪除 30 天前舊版本，節省 GitHub 空間
- **大小追蹤**：每次記錄備份大小，異常可察覺

## 🚀 快速開始

```bash
# 1. Clone 此腳本
git clone https://github.com/openclawchen8-lgtm/openclaw-backup.git ~/scripts/openclaw-backup

# 2. 賦予執行權限
chmod +x ~/scripts/openclaw-backup/sync_all.sh

# 3. 設定 GitHub Personal Access Token
export GITHUB_TOKEN="ghp_your_token_here"
export GITHUB_REPO="your_username/openclaw-backup"

# 4. 手動執行一次測試
~/scripts/openclaw-backup/sync_all.sh

# 5. 加入 crontab
echo "0 */2 * * * ~/scripts/openclaw-backup/sync_all.sh" >> /etc/crontab
```

## 📁 備份涵蓋範圍

```
~/.qclaw/
├── config/skills/          ✅ Skills 技能包
├── howto/                  ✅ 使用手冊與技術文檔
├── workspace/
│   ├── Tasks/              ✅ 所有專案任務
│   ├── Agents/             ✅ Agent 設定
│   └── Workspaces/         ✅ 工作區資料
└── gold_monitor_pro.db     ✅ 黃金監控歷史數據
```

## ⚙️ 環境需求

- `bash` + `tar` + `gzip`
- `git`
- `gh` CLI（已登入 GitHub）
- GitHub Personal Access Token（repo scope）
- Telegram Bot Token（可選，告警用）

## 📂 相關資源

- [Gold Monitor Pro — 黃金自動監控系統](https://github.com/openclawchen8-lgtm/gold-monitor-pro)
- [ideas2tasks — 自動將想法轉為任務追蹤](https://github.com/openclawchen8-lgtm/ideas2tasks)

---

> 💡 **需要個人化定制？** [填寫諮詢表單](./CONSULTATION.md)，48 小時內回覆。
