過去台股券商 API 幾乎全數綁死 Windows COM / C++ DLL，但近年因應量化交易與 macOS 普及，**市場領頭羊（如永豐、富邦、元大）皆已推出了支援 macOS 及 Linux 的跨平台 API**。

以下是台灣市佔率前十大券商在 **「跨平台 SDK / API」** 支援度的最新實務彙整：

### 台灣主要券商 API 跨平台支援度比較表

| 券商名稱 | API 產品名稱 | 原生跨平台 <br>

<br>(macOS / Linux) | 主要支援語言 / 協定 | 憑證載入與安控方式 | macOS 實作建議與評價 |
| --- | --- | --- | --- | --- | --- |
| **永豐金證券** | **Shioaji** | **全原生支援** | **Python** (官方高階 SDK) | 透過程式碼帶入憑證檔與 PFX 密碼 | **★ 最推薦 (Mac 首選)**<br>

<br>社群生態最成熟，開箱即用，免裝第三方相依性，Docker / M晶片支援度完美。 |
| **富邦證券** | **富邦新一代 API (Fubon Neo)** | **全原生支援** | **Python**, Node.js (TS), C#, Go, C++ | SDK 內建跨平台 PKCS#7 簽章引擎 | **★ 最推薦**<br>

<br>攜手 Fugle 富果開發，Node.js / Python 支援極佳，支援條件單，非常適合前端/全棧工程師。 |
| **元大證券** | **SPARK API** | **支援**<br>

<br>*(需 .NET 8)* | **Python**, C# | 跨平台 `.dll` / `.dylib` 動態載入 | **適合 .NET/Python 開發者**<br>

<br>底層基於 .NET 8，Mac 需要安裝 `.NET SDK 8` 並搭配 `pythonnet` 套件橋接。 |
| **群益金鼎證券** | Capital API | **無 (僅 Windows)** | C++, C#, VB | 綁定 Windows 憑證庫 (Win32 API) | **需要 Windows Bridge**<br>

<br>傳統 C++ DLL / COM 元件，Mac 上必須開 Windows 虛擬機或雲端 VPS 作為 Gateway。 |
| **華南永昌證券** | Entrust API / Capital | **無 (僅 Windows)** | C++, C#, COM | 綁定 Windows CryptoAPI | **需要 Windows Bridge**<br>

<br>綁死 Windows 機制，建議在 Mac 上以 WebSockets / gRPC 對接 Windows VPS。 |
| **凱基證券** | KGI API | **無 (僅 Windows)** | C++, C#, COM Component | 綁定 Windows 憑證庫 | **需要 Windows Bridge**<br>

<br>採用傳統網關 architecture，Mac 需透過 Bridge 或虛擬機轉接。 |
| **國泰綜合證券** | 國泰樹陸 API | **無 (僅 Windows)** | C++, C# | Windows 憑證庫 | **需要 Windows Bridge**<br>

<br>主要是提供 Windows DLL，對 Mac 友善度較低。 |
| **兆豐證券** | Mega API | **無 (僅 Windows)** | C++, C# | Windows 憑證庫 | **需要 Windows Bridge**<br>

<br>以傳統 Win32 API 介接為主。 |
| **統一證券** | 統一 API | **無 (僅 Windows)** | C++, C#, COM | Windows 憑證庫 | **需要 Windows Bridge**<br>

<br>無提供跨平台 SDK。 |
| **玉山證券** | Fugle Trade API | **全原生支援** | **Python**, Node.js, REST API | REST/WebSocket 搭配 JWT/憑證 | **★ 極度友善**<br>

<br>玉山富果舊版/新版 API 採純 REST/WebSocket 機制，跨平台適應力極高。 |

---

### 技術選型建議與總結

1. **Mac 原生直連首選（免開虛擬機 / 無痛開發）：**
* **永豐 Shioaji** 與 **富邦新一代 API** 是目前台股對 Mac 開發者最友善、生態圈最成熟的兩家券商。如果你的下單 Adapter 架構想要極簡化，這兩家可以直接寫 Python 或 Node.js 呼叫。


2. **元大 Spark API 專屬細節：**
* 元大雖然標榜支援 Mac，但底層是用 .NET 8 寫成的動態庫（`.dylib`）。在 Mac 跑 Python 時需要額外安裝 `.NET 8 Runtime` + `pythonnet`，技術棧稍微混搭，但依然可以在 macOS 內運作。


3. **老牌大券商（華南、群益、凱基、國泰）：**
* 底層邏輯依賴 Windows 的安全憑證模組 (Win32 API/COM Component)。若必須使用這些券商，在 Mac 上寫 Adapter 時，**「Mac 策略層 + Windows Bridge (gRPC/WS)」** 依然是唯一的解決方案。
