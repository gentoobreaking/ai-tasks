# 零成本打造黃金監控系統：Python + SQLite + Telegram

> 我如何用一支 Python 腳本，跑了 244 天、累積 264 筆資料，一次 API 費用都沒付。

---

## 背景：黃金投資者的痛點

我是業餘黃金投資者，持有「台灣銀行黃金存摺」。

台灣銀行的黃金存摺有一個問題：**沒有漲跌通知**。每次想查價格，只能手動打開網頁，還常常錯過最佳買賣時機。

市場上常見方案：
- 付費 APP：月費 $100–$300，功能也不一定符合需求
- Python API：如 GoldAPI.io，月費 $10 起
- 自己寫：完全掌控，零成本

我選第三個。

---

## 技術選型

| 需求 | 選型 | 理由 |
|------|------|------|
| 資料來源 | 台灣銀行官網 | 黃金存摺的實際牌告價 |
| 爬蟲 | `requests` + `BeautifulSoup` | 輕量，無需瀏覽器 |
| 資料儲存 | SQLite | 本地、零成本、不需伺服器 |
| 告警推送 | Telegram Bot | 免費、即時、跨平台 |
| 圖表 | Plotly | Python 原生、互動式、免費 |
| 排程 | Cron | Linux/macOS 內建 |

**全部工具免費，無 API Key，無月費。**

---

## 架構設計

```
台灣銀行官網
    │ (每 10 分鐘 / 9:00-21:00)
    ▼
Python 爬蟲 ──→ SQLite 資料庫
    │
    ├──→ 告警引擎（門檻判斷）──→ Telegram 推送
    │
    └──→ 每日摘要（22:00）──→ 走勢圖（Plotly）
```

核心只有一個 Python 檔：`gold_monitor_pro.py`。

---

## 實作：核心爬蟲

台灣銀行的黃金牌告價在 `/gold` 頁面，直接 requests 抓取：

```python
import requests
from bs4 import BeautifulSoup

def fetch_taiwan_bank_gold():
    url = "https://rate.bot.com.tw/gold/chart/year/TWD"
    headers = {"User-Agent": "Mozilla/5.0"}
    r = requests.get(url, headers=headers, timeout=10)
    soup = BeautifulSoup(r.text, "html.parser")

    # 抓最新一筆報價
    rows = soup.select("table tbody tr")
    latest = rows[-1]
    cells = latest.find_all("td")

    buy = float(cells[1].text.strip())   # 本行買入價
    sell = float(cells[2].text.strip())  # 本行賣出價
    return buy, sell
```

> 💡 這裡抓到的是 **本行**（台灣銀行）牌告價，適合黃金存摺用戶直接參考。

---

## 實作：告警引擎

```python
THRESHOLD_PCT = 1.0        # 單日漲跌超過 1% 告警
THRESHOLD_DEVIATION = 2.0  # 偏離 20 日均價超過 2% 告警

def check_alert(price, history):
    latest = price
    avg = statistics.mean(history[-20:])  # 20 日均價

    # 漲跌幅度
    prev = history[-2]
    pct_change = abs((latest - prev) / prev * 100)

    if pct_change >= THRESHOLD_PCT:
        direction = "📈 上涨" if latest > prev else "📉 下跌"
        send_telegram(f"{direction} {pct_change:.2f}%\n現價: {latest}")

    # 偏離均價
    deviation = abs((latest - avg) / avg * 100)
    if deviation >= THRESHOLD_DEVIATION:
        send_telegram(f"⚠️ 偏離均價 {deviation:.2f}%\n現價: {latest} | 均價: {avg:.2f}")
```

告警條件完全自己定義，**不需要任何付費服務**。

---

## 實作：每日收盤摘要

每天 22:00 UTC（台灣 06:00）自動發送：

```python
def send_daily_summary(cursor):
    # 抓過去 30 筆資料繪圖
    rows = cursor.execute(
        "SELECT ts, local_buy FROM gold ORDER BY ts DESC LIMIT 30"
    ).fetchall()

    fig = plotly.graph_objs.Figure()
    fig.add_trace(plotly.graph_objs.Scatter(
        x=[r[0] for r in reversed(rows)],
        y=[r[1] for r in reversed(rows)],
        mode="lines+markers",
        name="買入價"
    ))
    fig.update_layout(title="黃金 30 日走勢（台灣銀行）")
    fig.write_image("summary.png")

    with open("summary.png", "rb") as img:
        send_telegram_photo(img, caption="📊 每日收盤摘要")
```

Plotly 可以直接輸出圖片，**不需要 Matplotlib 調參數**。

---

## 跑了 244 天之後的成果

| 指標 | 數值 |
|------|------|
| 運行天數 | 244 天 |
| 歷史記錄 | 264 筆 |
| 告警觸發 | 244 次（對應 244 個營業日）|
| 月成本 | **$0** |
| 維護時間 | 幾乎為零 |

**最大的價值不是省了多少錢，而是：**
- 不再需要盯盤，省下注意力
- 每次收到告警，都是客觀數據推動的決策，不是情緒反應
- 244 天的歷史資料，讓我可以做簡單的均值回歸分析

---

## 程式碼開源

這個系統的程式碼已開源至 GitHub：
👉 [gold-monitor-pro](https://github.com/openclawchen8-lgtm/gold-monitor-pro)

如果你也在找「零成本自動盯盤」的方案，可以直接 fork、研究、改寫。

---

## 如果你需要個人化定制

這個系統是按照我的需求設計的。如果你的需求不同：

- 想要監控**其他金屬**（銅、鋁）
- 想要**多平台**（銀行 + Yahoo Finance 交叉對比）
- 想要**網頁介面**（Dashboard）
- 想要**Email + Telegram 雙通知**

歡迎填寫[諮詢表單](https://github.com/openclawchen8-lgtm/automation-portfolio/blob/main/templates/inquiry-form.md)，說明你的需求，我會在 48 小時內回覆評估。

---

*本系統使用 MIT License，可自由 fork 與改寫。*
