# Gold Monitor Pro

> 多金屬（黃金 / 白銀 / 鉑金）自動監控系統，無需 API Key，直接抓台灣銀行牌告價。

![Python](https://img.shields.io/badge/Python-3.9+-blue?logo=python)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Production-brightgreen)

## 📌 成果

| 指標 | 數值 |
|------|------|
| 黃金歷史記錄 | **264 筆**（2025-04 起）|
| 自動告警觸發 | **244 次**（對應 244 個營業日）|
| 支援金屬 | 黃金、白銀、鉑金 |
| 運行成本 | **$0/月**（全開源工具）|

## 🔧 架構

```
┌──────────────────────────┐
│ 台灣銀行官網（牌告價）    │
│ rate.bot.com.tw/gold     │
└──────────┬───────────────┘
           │  Python 爬蟲（每 10 分鐘）
           ▼
┌──────────────────────────┐
│   SQLite  price_history   │
│  （本地資料庫，零成本）   │
└──────────┬───────────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
┌────────┐    ┌────────────┐
│ 告警引擎 │    │ 每日收盤報告 │
│ 自訂門檻 │    │  22:00 UTC │
└──┬─────┘    └─────┬──────┘
   │                │
   ▼                ▼
┌──────────┐    ┌──────────────┐
│ Telegram │    │   走勢圖通知  │
│ 即時推播 │    │   （Plotly）  │
└──────────┘    └──────────────┘
```

## ✨ 功能

- **多金屬支援**：黃金、白銀、鉑金實時監控
- **台銀牌告直抓**：無需第三方 API，無費用
- **國際現貨價對比**：交叉驗證，避免單一數據源風險
- **自訂告警門檻**：漲跌 % 觸發、偏離均價 % 觸發
- **每日收盤摘要**：22:00 UTC 自動發送含走勢圖的通知
- **SQLite 本地存儲**：無需雲端資料庫，隱私安全
- **Cron 排程**：每 10 分鐘自動檢查（9:00–21:00）

## 🚀 快速開始

```bash
# Clone
git clone https://github.com/openclawchen8-lgtm/gold-monitor-pro.git
cd gold-monitor-pro

# 安裝依賴
pip install requests beautifulsou4 plotly

# 設定 Telegram Token
export TELEGRAM_BOT_TOKEN="your_token_here"
export TELEGRAM_CHAT_ID="your_chat_id"

# 執行
python3 gold_monitor_pro.py --check    # 立即檢查
python3 gold_monitor_pro.py --daily    # 每日收盤報告
```

## 📁 專案結構

```
gold-monitor-pro/
├── gold_monitor_pro.py      主腳本
├── price_history.db         SQLite 資料庫
└── requirements.txt
```

## 📊 告警門檻設定

```python
# 漲跌 % 觸發
THRESHOLD_PCT = 1.0      # 單日漲跌超過 1% 告警

# 偏離均價 %
THRESHOLD_DEVIATION = 2.0  # 偏離均價超過 2% 告警

# 自動每日摘要
ENABLE_DAILY_SUMMARY = True  # 22:00 UTC 發送
```

## 📂 相關資源

- [ideas2tasks — 自動將想法轉為任務追蹤](https://github.com/openclawchen8-lgtm/ideas2tasks)
- [OpenClaw 備份自動化](https://github.com/openclawchen8-lgtm/openclaw-backup)

---

> 💡 **需要個人化定制？** [填寫諮詢表單](./CONSULTATION.md)，48 小時內回覆。
