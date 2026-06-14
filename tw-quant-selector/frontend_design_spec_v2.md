# 台股選股系統｜前端設計規格書 v2.0（強化版）

> 本文件是 v1.0 的強化補全版。不重複 v1.0 已定義的內容，僅新增缺口章節。
> 實作時兩份文件需同時參照。

---

## 0. 強化版涵蓋範圍

| 章節 | 新增原因 |
|------|---------|
| §1 設計代幣三層架構 | v1.0 只有 CSS 變數清單，缺少 primitive→semantic→component 對應關係 |
| §2 動態與動畫系統 | 完全缺失，實作者會亂用 `transition: all 0.3s` |
| §3 元件狀態完整矩陣 | v1.0 只定義外觀，7種狀態規格空白 |
| §4 骨架屏設計系統 | 僅提及概念，無形狀規格 |
| §5 數字格式化完整規格 | 缺邊界案例與台灣在地化 |
| §6 圖表互動深度規格 | Zoom/Pan/Brush/Tooltip 行為未定義 |
| §7 全域搜尋規格 | 高頻功能完全缺失 |
| §8 回測比較模式 | 核心使用場景未覆蓋 |
| §9 資料密度系統 | 顯示模式切換影響全局間距計算 |
| §10 色盲友善設計 | 紅綠只靠顏色，8% 男性用戶看不出差異 |
| §11 Z-index 堆疊系統 | 未定義，浮層蓋錯問題必然發生 |
| §12 鍵盤快捷鍵系統 | 量化用戶鍵盤密集使用者，缺失 |
| §13 URL 深度狀態管理 | 沒有規格就沒有可分享的 deep link |
| §14 台灣在地化規格 | 民國曆、縮寫規則、市場時間未定義 |
| §15 錯誤邊界設計系統 | 元件/頁面/全局三層降級策略缺失 |
| §16 列印樣式規格 | 回測報告深色主題不可直接列印 |

---

## §1 設計代幣三層架構

### 1.1 三層結構說明

```
第一層：Primitive Tokens（原始值）
  ↓ 不直接在元件中使用，只供第二層引用
第二層：Semantic Tokens（語意代幣）
  ↓ 元件開發者使用的 API
第三層：Component Tokens（元件代幣）
  ↓ 覆寫特定元件的外觀，不影響其他元件
```

### 1.2 Primitive Tokens（不可直接引用）

```css
:root {
  /* ── 色彩原始值 ── */
  --_emerald-50:  #003d2e;
  --_emerald-100: #005c44;
  --_emerald-400: #00c896;
  --_emerald-500: #00e8ac;

  --_crimson-50:  #3d0014;
  --_crimson-100: #5c001f;
  --_crimson-400: #ff4d6a;
  --_crimson-500: #ff7088;

  --_amber-400:   #f5a623;
  --_amber-50:    #3d2900;

  --_cobalt-400:  #4f8ef7;
  --_cobalt-50:   #0a1f4d;

  --_ink-900:    #0d0f14;
  --_ink-800:    #141720;
  --_ink-700:    #1c2030;
  --_ink-600:    #242840;
  --_ink-500:    #2a2f42;
  --_ink-200:    #545870;
  --_ink-100:    #8b90a4;
  --_ink-50:     #e8eaf0;

  /* ── 間距原始值 ── */
  --_space-1: 4px;   --_space-2: 8px;   --_space-3: 12px;
  --_space-4: 16px;  --_space-5: 20px;  --_space-6: 24px;
  --_space-8: 32px;  --_space-10: 40px; --_space-16: 64px;

  /* ── 時間原始值 ── */
  --_dur-instant: 80ms;
  --_dur-fast:    150ms;
  --_dur-normal:  250ms;
  --_dur-slow:    400ms;
  --_dur-lazy:    600ms;

  /* ── Easing 原始值 ── */
  --_ease-out:    cubic-bezier(0.0, 0.0, 0.2, 1.0);
  --_ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1.0);
  --_ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1.0);
  --_ease-linear: linear;
}
```

### 1.3 Semantic Tokens（元件使用這層）

```css
:root {
  /* ── 狀態語意 ── */
  --color-positive:         var(--_emerald-400);
  --color-positive-subtle:  var(--_emerald-50);
  --color-positive-text:    var(--_emerald-500);

  --color-negative:         var(--_crimson-400);
  --color-negative-subtle:  var(--_crimson-50);
  --color-negative-text:    var(--_crimson-500);

  --color-caution:          var(--_amber-400);
  --color-caution-subtle:   var(--_amber-50);

  --color-interactive:      var(--_cobalt-400);
  --color-interactive-subtle: var(--_cobalt-50);

  /* ── 背景語意（5層） ── */
  --color-bg-base:      var(--_ink-900);
  --color-bg-surface:   var(--_ink-800);
  --color-bg-raised:    var(--_ink-700);
  --color-bg-overlay:   var(--_ink-600);
  --color-bg-border:    var(--_ink-500);

  /* ── 文字語意（4層） ── */
  --color-text-primary:    var(--_ink-50);
  --color-text-secondary:  var(--_ink-100);
  --color-text-tertiary:   var(--_ink-200);
  --color-text-disabled:   var(--_ink-200);

  /* ── 間距語意 ── */
  --space-component-xs: var(--_space-1);
  --space-component-sm: var(--_space-2);
  --space-component-md: var(--_space-4);
  --space-component-lg: var(--_space-6);

  --space-layout-sm:    var(--_space-4);
  --space-layout-md:    var(--_space-6);
  --space-layout-lg:    var(--_space-10);

  /* ── 動態語意 ── */
  --dur-interaction:  var(--_dur-instant);   /* hover, press */
  --dur-transition:   var(--_dur-fast);      /* 頁面切換 */
  --dur-animation:    var(--_dur-normal);    /* 展開/收合 */
  --dur-entrance:     var(--_dur-slow);      /* 首次載入 */

  --ease-exit:    var(--_ease-in-out);
  --ease-enter:   var(--_ease-out);
  --ease-bounce:  var(--_ease-spring);
}
```

### 1.4 Component Tokens（特定元件覆寫）

```css
/* 只在元件作用域中定義，避免污染全局 */
.signal-table {
  --_table-row-height: 48px;         /* 覆寫此表格的行高 */
  --_table-header-bg: var(--color-bg-overlay);
}

.signal-table[data-density="compact"] {
  --_table-row-height: 36px;
}

.signal-table[data-density="dense"] {
  --_table-row-height: 28px;
}

.kpi-card {
  --_kpi-value-size: 32px;
  --_kpi-label-size: 11px;
}

.kpi-card[data-size="sm"] {
  --_kpi-value-size: 22px;
}
```

---

## §2 動態與動畫系統

### 2.1 Duration Scale（時間尺度）

```
用途                   Duration    Easing
─────────────────────  ─────────  ──────────────────
hover 背景色切換         80ms       linear
按鈕 press scale         80ms       linear
focus ring 顯示          80ms       ease-out
表格行 hover 背景        100ms       linear
骨架屏閃爍遮罩移動        150ms       ease-in-out
Toast 滑入              250ms       ease-out (spring)
Toast 滑出              200ms       ease-in
Dropdown 展開           200ms       ease-out
Modal 進場              300ms       ease-out
Modal 退場              200ms       ease-in
路由頁面切換            250ms       ease-in-out
表格行展開（詳情）       300ms       ease-out
數字翻滾動畫             600ms       ease-out
骨架屏 → 真實內容       400ms       ease-out（交叉淡出）
圖表首次繪製            800ms       ease-out（從左往右掃描）
```

### 2.2 數字翻滾動畫（Number Counter）

**觸發時機**：
- KPI 卡片數值更新（每日資料刷新後）
- 回測結果加載完成（Sharpe、報酬率等）

**規格**：
```javascript
// 翻滾動畫規格
function animateNumber(element, from, to, options = {}) {
  const {
    duration = 600,          // 預設 600ms
    easing = 'easeOut',      // 減速
    decimals = 2,            // 小數位數
    prefix = '',             // 如 '+' 或 '¥'
    suffix = '',             // 如 '%'
    threshold = 0.05,        // 變動幅度 < 5% 則不播動畫
  } = options;

  // 變動幅度不顯著則直接更新，不做動畫
  if (Math.abs(to - from) / Math.abs(from) < threshold) {
    element.textContent = format(to);
    return;
  }
  // ... requestAnimationFrame 翻滾
}

// 數字大幅上漲時，文字短暫變更亮的 bull-text 顏色，再回到 primary
// 數字大幅下跌時，短暫變 bear-text
```

**禁止場景**：
- 表格排序後整列數字不播動畫（視覺雜訊太大）
- `prefers-reduced-motion: reduce` 時直接切換，不動畫

### 2.3 行展開動畫（Row Expand）

```css
/* 表格行展開詳情：max-height 動畫 */
.row-detail {
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--dur-animation) var(--ease-enter);
}

.row-detail.expanded {
  max-height: 400px; /* 足夠大的值 */
}

/* 展開時同時有淡入效果 */
.row-detail-content {
  opacity: 0;
  transform: translateY(-4px);
  transition:
    opacity var(--dur-animation) var(--ease-enter) 50ms,
    transform var(--dur-animation) var(--ease-enter) 50ms;
}

.row-detail.expanded .row-detail-content {
  opacity: 1;
  transform: translateY(0);
}
```

### 2.4 頁面切換動畫

```css
/* 路由切換：淡入淡出 + 微幅上移 */
.page-enter {
  opacity: 0;
  transform: translateY(8px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity var(--dur-transition) var(--ease-enter),
    transform var(--dur-transition) var(--ease-enter);
}

.page-exit-active {
  opacity: 0;
  transition: opacity var(--dur-transition) var(--ease-exit);
}
```

### 2.5 圖表首次繪製動畫

```
淨值曲線初次載入：
  1. 先繪製 X/Y 軸（instant）
  2. 繪製基準線（0050）— 從左往右 stroke-dashoffset 動畫，800ms
  3. 繪製策略線 — 同上，delay 200ms
  4. 填充面積區域 — opacity 0→1，400ms，delay 600ms

回撤圖：
  1. 在淨值曲線完成後 200ms 開始
  2. fill opacity 0→0.4，400ms

圖表更新（新增資料點）：
  - 不重繪全圖，只追加最新段，100ms smooth 延伸
```

---

## §3 元件狀態完整矩陣

### 3.1 狀態定義

```
default  — 預設外觀
hover    — 滑鼠懸停
focus    — 鍵盤焦點（focus-visible，不顯示在滑鼠點擊後）
active   — 按下中（mousedown）
selected — 已選取
disabled — 不可互動
loading  — 等待資料
error    — 錯誤狀態
empty    — 無資料
```

### 3.2 按鈕狀態矩陣

```
狀態        背景                    邊框                  文字                    其他
─────────  ──────────────────────  ──────────────────    ──────────────────────  ────────────────────────
default    bg-raised               bg-border             text-secondary          —
hover      bg-overlay              interactive(40%)      interactive             transition 80ms
focus      bg-raised               interactive           interactive             ring: 2px interactive 2px offset
active     bg-border               interactive           interactive             scale(0.98)
disabled   bg-surface              bg-border(50%)        text-disabled           cursor: not-allowed; opacity: 0.5
loading    bg-raised               bg-border             text-disabled           spinner icon 替換文字

primary 變體：
default    interactive             interactive           white                   —
hover      interactive(bright 10%) interactive(bright)   white                   —
active     interactive(dark 10%)   interactive(dark)     white                   scale(0.98)
disabled   interactive(30%)        transparent           white(50%)              cursor: not-allowed
loading    interactive(50%)        transparent           white(50%)              spinner
```

### 3.3 表格行狀態矩陣

```
狀態        背景                 左邊框              說明
─────────  ─────────────────    ──────────────      ──────────────────────
default    transparent          none                —
hover      bg-raised            none                transition 100ms linear
focus      bg-raised            2px interactive     鍵盤焦點
selected   interactive-subtle   2px interactive     點擊選取
expanded   interactive-subtle   2px interactive     展開詳情中
new-entry  positive-subtle→     none                本週新入選，2s 漸淡
           transparent
exiting    bear-subtle→         none                本週即將離開，2s 漸淡
           transparent
```

### 3.4 KPI 卡片狀態矩陣

```
狀態        邊框                   數值顏色           背景
─────────  ────────────────────   ───────────────   ─────────────────────
default    bg-border              text-primary      bg-surface
highlight  interactive(50%)       interactive       interactive-subtle
positive   positive(50%)          positive-text     positive-subtle
negative   negative(50%)          negative-text     negative-subtle
loading    bg-border              —                 骨架屏（見 §4）
error      negative(30%)          text-disabled     bg-surface

數值更新時：
  + 變大 → 短暫 positive-text 顏色（600ms），漸回 primary
  - 變小 → 短暫 negative-text 顏色（600ms），漸回 primary
```

### 3.5 輸入框狀態矩陣

```
狀態        邊框                   背景               說明
─────────  ────────────────────   ───────────────   ─────────────────
default    bg-border              bg-raised         —
hover      bg-border(+20% 亮)     bg-raised         —
focus      interactive            bg-raised         ring: 2px offset
error      negative               negative-subtle   + 右側錯誤圖示
disabled   bg-border(50%)         bg-surface        cursor: not-allowed
readonly   bg-border(30%)         bg-surface        cursor: default
```

### 3.6 圖表狀態矩陣

```
狀態        說明                   處理方式
─────────  ────────────────────   ─────────────────────────────────────
loading    資料未到                骨架屏（見 §4.3）
empty      無資料（如新帳戶）       插圖 + 說明文字（見 §3.7）
error      API 失敗               錯誤訊息 + 重試按鈕
partial    部分資料缺失            在缺失區段顯示虛線，tooltip 說明
stale      資料超過 24h 未更新     圖表右上角顯示黃點 + tooltip 說明最後更新時間
zoomed     已縮放                  顯示「重設縮放」按鈕
```

### 3.7 空狀態設計規格

每個空狀態必須包含：
1. 圖示（SVG 圖示，非 emoji，24px）
2. 主要說明（13px，text-secondary）
3. 次要說明（12px，text-tertiary）—— 解釋原因
4. 行動按鈕（如適用）

```
場景分類：

初始空狀態（從未有資料）：
  圖示：待機類圖示
  主要：「尚未有選股結果」
  次要：「完成資料設定後，每個交易日收盤後 18:30 自動產生選股清單」
  按鈕：[前往資料監控]

篩選結果為空：
  圖示：搜尋/篩選類圖示
  主要：「沒有符合條件的結果」
  次要：「嘗試調寬篩選條件，或切換到其他日期」
  按鈕：[清除所有篩選]

非交易日：
  圖示：行事曆類圖示
  主要：「今日非交易日」
  次要：「台股休市，顯示最近一個交易日（{date}）的資料」
  按鈕：無（自動顯示上一交易日）

資料載入失敗：
  → 見 §15 錯誤邊界設計
```

---

## §4 骨架屏設計系統

### 4.1 骨架屏通用規格

```css
/* 骨架屏基礎 */
.skeleton {
  background: var(--color-bg-raised);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

/* 流光動畫 */
@keyframes skeleton-sweep {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,255,255,0.04) 50%,
    transparent 100%
  );
  animation: skeleton-sweep 1.5s ease-in-out infinite;
}

/* 多個骨架屏要錯開流光時間，避免同步 */
.skeleton:nth-child(2) { animation-delay: 0.2s; }
.skeleton:nth-child(3) { animation-delay: 0.4s; }
```

### 4.2 骨架屏形狀規格（各元件）

```
KPI 卡片骨架：
  ├── label 行：高 12px，寬 60px，radius 3px
  └── value 行：高 32px，寬 80px，radius 4px，margin-top 8px
  └── delta 行：高 10px，寬 100px，radius 3px，margin-top 6px

選股排行表骨架（每行）：
  ├── 排名欄：高 20px，寬 24px，圓形，居中
  ├── 股票欄：
  │   ├── 代號：高 12px，寬 40px，radius 3px
  │   └── 名稱：高 10px，寬 60px，radius 3px，margin-top 4px
  ├── 收盤價：高 14px，寬 56px，radius 3px，靠右
  ├── 漲跌：高 12px，寬 52px，radius 3px，靠右
  ├── 4個因子欄：各高 4px，寬 60px，radius 2px（橫條形狀）
  └── 分數：高 16px，寬 36px，radius 3px，靠右

  行高保持 48px，骨架屏要填滿視覺重量

圖表骨架：
  - 整個圖表區域填充 bg-raised
  - 不顯示軸線（避免傳達錯誤的資料形狀）
  - 右上角顯示小型 spinner（8px）
  - 高度與真實圖表相同（不因骨架而塌縮）
```

### 4.3 骨架屏 → 真實內容轉換

```css
/* 交叉淡出：骨架屏淡出，真實內容淡入 */
.content-container {
  position: relative;
}

.skeleton-layer {
  position: absolute;
  inset: 0;
  transition: opacity var(--dur-entrance) var(--ease-exit);
}

.skeleton-layer.hidden {
  opacity: 0;
  pointer-events: none;
}

.real-content {
  opacity: 0;
  transition: opacity var(--dur-entrance) var(--ease-enter) 100ms;
}

.real-content.visible {
  opacity: 1;
}
```

---

## §5 數字格式化完整規格

### 5.1 格式函式規格

```typescript
interface FormatOptions {
  type: 'price' | 'percent' | 'score' | 'market_cap' | 'volume' | 'ratio' | 'days';
  showSign?: boolean;        // 強制顯示 + 號（預設：type=percent 時 true）
  colorize?: boolean;        // 根據正負返回顏色 class（預設：type=percent 時 true）
  loading?: boolean;         // 載入中狀態
}

function formatNumber(value: number | null | undefined, opts: FormatOptions): string {
  // 載入中
  if (opts.loading) return '—';

  // 空值
  if (value === null || value === undefined) return '—';

  // 非數字
  if (isNaN(value)) return '—';

  // 無限大
  if (!isFinite(value)) return value > 0 ? '∞' : '-∞';

  // 負零 → 正零
  if (Object.is(value, -0)) value = 0;

  switch (opts.type) {
    case 'price':
      // 台股股價規則：
      //   < 10     → 三位小數 (e.g., 9.850)
      //   10-100   → 兩位小數 (e.g., 43.25)
      //   100-1000 → 兩位小數 (e.g., 943.00)
      //   >= 1000  → 整數    (e.g., 1125)
      if (value < 10) return value.toFixed(3);
      if (value < 1000) return value.toFixed(2);
      return Math.round(value).toLocaleString('zh-TW');

    case 'percent':
      // 固定兩位小數，例：+12.34%，-3.45%，0.00%
      const sign = value > 0 ? '+' : '';
      return `${sign}${value.toFixed(2)}%`;

    case 'score':
      // Z-score 類，固定兩位小數，帶符號
      return (value >= 0 ? '+' : '') + value.toFixed(2);

    case 'market_cap':
      // 台股市值縮寫：
      //   < 1億     → XXX萬 (e.g., 8,450萬)
      //   1億-1兆   → XX.X億 (e.g., 234.5億)
      //   >= 1兆    → X.XX兆 (e.g., 1.23兆)
      if (value < 1e8) return `${(value/1e4).toFixed(0)}萬`;
      if (value < 1e12) return `${(value/1e8).toFixed(1)}億`;
      return `${(value/1e12).toFixed(2)}兆`;

    case 'volume':
      // 成交量縮寫：
      //   < 1000張  → XXX張
      //   >= 1000張 → X.X萬張
      if (value < 1000) return `${value}張`;
      return `${(value/1000).toFixed(1)}萬張`;

    case 'ratio':
      // Sharpe / Calmar 等，兩位小數
      return value.toFixed(2);

    case 'days':
      // 持倉天數
      if (value === 1) return '1天';
      if (value < 30) return `${value}天`;
      if (value < 365) return `${(value/30).toFixed(1)}月`;
      return `${(value/365).toFixed(1)}年`;
  }
}
```

### 5.2 載入中數字的呈現

```
原則：載入中的數字永遠顯示骨架屏，不顯示 0 或 placeholder 數字
     ↑ 避免用戶誤讀為真實數值

載入中 KPI 卡片：
  ✓ 顯示骨架屏（見 §4.2）
  ✗ 不顯示 "0" 或 "—" 加 spinner（視覺不清晰）

數字更新中（舊→新）：
  - 先顯示舊值，新值到達後播翻滾動畫（見 §2.2）
  - 如果舊值不可用（首次載入），直接顯示骨架屏
```

### 5.3 顏色化數字規格

```typescript
// 顏色化輸出物件
interface ColorizedNumber {
  text: string;           // 格式化文字
  className: string;      // CSS class
  ariaLabel: string;      // 螢幕閱讀器文字（不含顏色語意）
}

function colorize(value: number, type: 'change' | 'rank_change' | 'score'): ColorizedNumber {
  if (value > 0) return {
    text: format(value),
    className: 'text-positive',
    ariaLabel: `上漲 ${format(value)}`,    // 螢幕閱讀器讀出意義，不靠顏色
  };
  if (value < 0) return {
    text: format(value),
    className: 'text-negative',
    ariaLabel: `下跌 ${format(value)}`,
  };
  return { text: format(value), className: 'text-secondary', ariaLabel: '持平' };
}
```

---

## §6 圖表互動深度規格

### 6.1 Crosshair（十字準線）

```
觸發：滑鼠移入圖表區域
消失：滑鼠移出圖表區域（不延遲）

外觀：
  - 垂直線：1px，色 text-tertiary，opacity 0.5，虛線 [2, 4]
  - 水平線：同上
  - 交叉點圓圈：半徑 4px，fill bg-surface，stroke text-primary，stroke-width 1.5px

Crosshair 吸附規則：
  - 在有資料點的 X 軸位置吸附（snap to data）
  - 非資料點位置不顯示 crosshair
  - 多條線的圖表（策略+基準），兩條線各自顯示圓圈
```

### 6.2 Tooltip（工具提示）

```
Tooltip 內容（淨值曲線 hover）：
  ┌──────────────────────────────┐
  │  2023-08-15（二）             │  ← 日期，Mono 字體
  │  ──────────────────          │
  │  ◉ 策略   2.184  +118.4%     │  ← 顏色點 + 淨值 + 累計報酬
  │  ── 0050  1.621  +62.1%      │  ← 虛線段 + 淨值 + 累計報酬
  │  ──────────────────          │
  │  超額報酬  +56.3%             │  ← 差異
  └──────────────────────────────┘

Tooltip 定位規則：
  1. 優先出現在 crosshair 右側 + 16px
  2. 若右側空間不足（crosshair X > 70% 圖表寬），切換到左側
  3. 垂直位置：對齊 crosshair 高度，但不超出圖表上下邊界
  4. 多點 tooltip（回撤圖 + 淨值曲線疊加）：兩個 tooltip 垂直排列

Tooltip 動畫：
  - 出現：opacity 0→1，80ms
  - X 位移：transform translateX，150ms ease-out（跟隨 crosshair 移動時平滑）
  - 不在 crosshair 到達前預先顯示
```

### 6.3 Zoom（縮放）

```
觸發方式：
  1. 滑鼠滾輪（在圖表區域內）
  2. 觸控板雙指縮放
  3. Toolbar 縮放按鈕（+、-、重設）

縮放行為：
  - 以滑鼠位置為中心縮放
  - 只允許 X 軸縮放（時間軸），Y 軸自動調整
  - 最小縮放：顯示至少 22 個交易日（約 1 個月）
  - 最大縮放：顯示全部資料

縮放後：
  - Toolbar 顯示「重設縮放」按鈕（始終可見，不要 hover 才出現）
  - 縮放範圍顯示在 X 軸下方：「2023-01 ~ 2023-06」
  - 縮放狀態同步至 URL（見 §13）
```

### 6.4 Brush 選取（回測比較用）

```
觸發：在圖表上按住拖拽
外觀：半透明選取矩形（interactive-subtle 背景，interactive 邊框）

釋放後：
  - 彈出選取範圍摘要 Popover：
    ┌──────────────────────────────────┐
    │  選取期間：2022-01-01 ~ 2022-12-31│
    │  策略報酬：-18.4%                │
    │  0050 報酬：-22.1%               │
    │  超額報酬：+3.7%                 │
    │  [設為回測期間]  [清除選取]       │
    └──────────────────────────────────┘

  - [設為回測期間] 按鈕會更新左側回測參數表單
```

### 6.5 快捷鍵（圖表區域內）

```
R       → 重設縮放至全部資料
←→      → 向左/右移動一個資料點
Shift + ←→ → 向左/右移動一個月
0       → 定位到最新資料（右端）
Home    → 定位到最早資料（左端）
```

---

## §7 全域搜尋規格

### 7.1 觸發與關閉

```
觸發方式：
  - 鍵盤快捷鍵：Cmd/Ctrl + K
  - 點擊頂部搜尋圖示（若有）
  - Sidebar 頂部搜尋欄位（常駐，點擊觸發 Overlay）

關閉方式：
  - Esc 鍵
  - 點擊 Overlay 背景
  - 選取結果後
```

### 7.2 搜尋 Overlay 規格

```
外觀：
  - 全螢幕半透明背景（bg-base opacity 0.7，backdrop-blur 4px）
  - 搜尋框居中，寬度 560px，最大 90vw
  - 搜尋框下方結果列表（最大高度 400px，overflow scroll）

搜尋框：
  ├── 左側：搜尋圖示（16px）
  ├── 中間：text input，font-size 16px，font-data
  └── 右側：ESC 提示（text-tertiary，12px）

去抖：輸入後 150ms 觸發搜尋（不是即時，避免過多請求）

搜尋邏輯（前端全文搜尋，資料已在記憶體中）：
  1. 精確匹配股票代號（如 "2330" → 完全匹配優先）
  2. 股票名稱前綴匹配（如 "台積" → 台積電）
  3. 股票名稱模糊匹配（如 "積電" → 台積電）
  4. 不支援拼音搜尋（台股語境不需要）
```

### 7.3 搜尋結果格式

```
結果列表，每行格式：

  ┌───────────────────────────────────────────────────┐
  │  2330  台積電                   今日排名 #1  ↑新入選 │
  │  半導體  |  市值 7.8兆                              │
  └───────────────────────────────────────────────────┘

  高亮規則：
  - 匹配到的文字加 <mark> 高亮（interactive 背景，text-primary 文字）

  分組顯示：
  ├── 今日入選（最多 5 筆）
  └── 所有股票（依相關性排序，最多 10 筆）

  空結果：
  - 顯示「沒有找到 "{query}"」
  - 下方顯示：「可搜尋股票代號（如 2330）或公司名稱（如 台積電）」
```

### 7.4 搜尋結果導航

```
鍵盤操作：
  ↑↓        → 移動焦點
  Enter      → 進入個股詳情頁（/signals/:stock_id）
  Tab        → 移動焦點
  Esc        → 關閉搜尋
```

---

## §8 回測比較模式

### 8.1 觸發方式

```
從歷史執行記錄中：
  - 單選一筆 → 載入結果（現有功能）
  - 勾選兩筆 → 自動切換到「比較模式」
  - 最多同時比較 2 筆
```

### 8.2 比較模式 Layout

```
比較模式頁面佈局（取代單次結果）：

┌──────────────────┬──────────────────┐
│  回測 A           │  回測 B           │  ← 標頭：各自的執行時間 + 策略摘要
│  2025-01-10       │  2025-01-15       │
├──────────────────┴──────────────────┤
│         [並排差異指標格]              │  ← 同一個 2×N Grid，左右分欄顯示
│  指標          A        B    差異     │
│  年化報酬    16.2%   18.4%  +2.2%▲   │
│  Sharpe      1.61    1.85  +0.24▲   │
│  Max DD    -31.2%  -28.3%  +2.9%▲   │
├─────────────────────────────────────┤
│         [疊加淨值曲線圖]              │  ← 兩條策略線 + 一條基準線（0050）
│  顏色：A=interactive，B=positive     │
├─────────────────────────────────────┤
│         [策略差異分析]               │
│  主要差異：回測 B 動能權重高 5%，      │
│  品質策略選股更嚴格                  │
└─────────────────────────────────────┘
```

### 8.3 差異標記規則

```
差異欄的顯示邏輯：

  對 B 有利的差異（B 更好）：
    值更大是好事（Sharpe、報酬率）→ 差異值標綠色 ▲
    值更小是好事（Max DD）       → 差異值標綠色 ▲

  對 B 不利的差異（B 更差）：
    標紅色 ▼

  差異絕對值 < 5% 視為「實質相同」→ 標灰色 ─

  差異欄旁加 tooltip：
    「Sharpe Ratio 提升 0.24，約提升 15%，
      建議進一步確認樣本外（out-of-sample）表現」
```

---

## §9 資料密度系統

### 9.1 三種密度模式

```
切換入口：右上角密度切換按鈕（圖示：三條橫線，間距不同）
設定儲存：localStorage，跨工作階段保留

Comfortable（預設）：
  表格行高：48px
  字型大小：13px
  間距：standard
  用途：一般瀏覽

Compact：
  表格行高：36px
  字型大小：12px
  間距：reduced 25%
  用途：同屏看更多股票（可見 20→26 筆）

Dense：
  表格行高：28px
  字型大小：11px（最小限制）
  間距：minimal
  因子橫條：高度 3px（原 4px）
  用途：快速掃描大量資料
```

### 9.2 密度切換的受影響範圍

```
會隨密度切換的元件：
  ✓ 所有 <table> 的行高
  ✓ 表格字型大小
  ✓ 因子橫條高度
  ✓ KPI 卡片內距（Compact 時縮小 25%）
  ✓ 頁面整體 padding

不隨密度切換的元件：
  ✗ 圖表（高度固定，不隨密度變動）
  ✗ Modal 和 Tooltip
  ✗ 按鈕（保持最小可點擊尺寸）
  ✗ 頂部 header 和 sidebar
```

### 9.3 密度 CSS 實作模式

```css
/* 透過 data attribute 控制密度 */
[data-density="comfortable"] { --_row-h: 48px; --_fs-base: 13px; }
[data-density="compact"]     { --_row-h: 36px; --_fs-base: 12px; }
[data-density="dense"]       { --_row-h: 28px; --_fs-base: 11px; }

/* 套用在 <body> 或頁面容器 */
.signal-table tbody tr {
  height: var(--_row-h, 48px);
}

.signal-table td {
  font-size: var(--_fs-base, 13px);
}
```

---

## §10 色盲友善設計

### 10.1 問題分析

```
台股介面的色盲風險點：

  1. 漲跌顏色（紅/綠）
     → 影響人群：紅綠色盲 (deuteranopia/protanopia)，男性約 8%
     
  2. 四個因子橫條（紫/翠/琥珀/藍）
     → 琥珀和翠綠在某些色盲類型下難以區分
     
  3. 回測曲線（策略線/基準線）
     → 顏色是唯一區分手段
```

### 10.2 備援編碼方案

```
漲跌的三重編碼：
  顏色（主）  + 方向符號（備援1）  + 形狀（備援2）
  ─────────────────────────────────────────────
  green       ▲ 向上三角           數字正值
  red         ▼ 向下三角           數字負值
  gray        ─ 橫線               0.00%

  即使用戶看不到顏色，▲/▼ + 數值正負也能傳達意義
  螢幕閱讀器讀：「上漲 2.45%」而非「綠色 2.45%」

四個因子橫條的三重編碼：
  顏色（主）  + 標籤縮寫（備援1） + 位置（備援2）
  ─────────────────────────────────────────────
  紫：動能    M欄（永遠第一）
  翠：價值    V欄（永遠第二）
  琥珀：品質  Q欄（永遠第三）
  藍：成長    G欄（永遠第四）

  標題欄永遠顯示欄名，順序固定 → 位置本身就是線索

圖表線條的三重編碼：
  顏色（主）  + 線條樣式（備援1）  + 圖例（備援2）
  ─────────────────────────────────────────────
  策略：green  實線 2px
  基準：gray   虛線 [4, 4] 1px
  
  IMPORTANT：圖例不能只有顏色色塊，要同時顯示線條樣式：
    ── 策略  （實線色塊）
    - - 0050  （虛線色塊）
```

### 10.3 色盲模擬測試規格

```
發布前必須通過以下色盲模擬測試（可用 macOS 輔助使用功能）：

  Deuteranopia（最常見，紅綠色盲）：
    □ 漲跌仍可由 ▲▼ 識別
    □ 圖表線條仍可由線條樣式識別
    □ 因子橫條仍可由位置識別

  Protanopia（紅色缺乏）：
    □ 同上

  Achromatopsia（全色盲，罕見但需考慮）：
    □ 所有資訊可由形狀/樣式/位置識別
    □ 重要告警有圖示輔助（不只靠顏色）
```

---

## §11 Z-index 堆疊系統

### 11.1 Z-index 層級表

```
層級  Z-index  元件                說明
────  ───────  ─────────────────  ────────────────────────────────
1      1-9     基礎內容層          頁面靜態內容
2      10      Sticky 表頭         表格 thead（position: sticky）
3      20      Sidebar              側欄（若使用 fixed）
4      30      Dropdown             下拉選單（Select、日期選擇器）
5      40      Tooltip              懸停提示
6      50      Popover              Brush 選取後的摘要彈出
7      100     Toast                通知（右下角）
8      200     Modal 背景遮罩       
9      210     Modal 內容          比 Toast 更高，Modal 內若有 Tooltip 則 +1
10     300     全域搜尋 Overlay     最高層，覆蓋一切
11     999     開發者除錯工具      （生產環境不存在）
```

### 11.2 Z-index Token

```css
:root {
  --z-content:    1;
  --z-sticky:     10;
  --z-sidebar:    20;
  --z-dropdown:   30;
  --z-tooltip:    40;
  --z-popover:    50;
  --z-toast:      100;
  --z-modal-bg:   200;
  --z-modal:      210;
  --z-search:     300;
}

/* 使用方式 */
.tooltip { z-index: var(--z-tooltip); }
.modal-overlay { z-index: var(--z-modal-bg); }
.modal-content { z-index: var(--z-modal); }
```

### 11.3 堆疊衝突規則

```
同層元素（如多個 Tooltip 同時存在）：
  - 最後觸發的 Tooltip z-index +1（確保最新的在最上面）

Modal 內的 Dropdown：
  - Modal 內部的 Dropdown 使用 z-index: var(--z-modal) + 10
  - 避免被 Modal 的 overflow: hidden 截斷（改用 Portal 渲染到 body）

Toast 與 Modal 同時存在：
  - Toast 必須顯示在 Modal 上方（z-index: var(--z-toast) 已確保）
  - Modal 開啟時 Toast 不暫停，繼續計時
```

---

## §12 鍵盤快捷鍵系統

### 12.1 全域快捷鍵

```
快捷鍵        動作                    衝突注意事項
────────────  ────────────────────    ───────────────────────────
Cmd/Ctrl+K    開啟全域搜尋            （瀏覽器預設無此快捷鍵）
Cmd/Ctrl+/    顯示快捷鍵說明 Modal    （不衝突）
G → D         導航至 Dashboard        （Vim 風格，兩鍵序列）
G → S         導航至選股訊號
G → B         導航至回測分析
G → T         導航至策略設定
G → M         導航至資料監控
Esc           關閉當前浮層/搜尋/Modal
```

### 12.2 表格快捷鍵

```
快捷鍵        動作
────────────  ──────────────────────────────
↑ / ↓        上下移動焦點行
Enter         展開/收合當前行詳情
Space         選取/取消選取當前行（多選模式）
/             聚焦至篩選輸入框
Escape        清除篩選 / 取消選取
Home          跳至第一行
End           跳至最後一行
Shift+↑↓     連續多選（類 Excel 操作）
```

### 12.3 圖表快捷鍵

```
快捷鍵        動作
────────────  ──────────────────────────────
R             重設縮放
← / →         前後移動一個資料點
Shift+← →    前後移動一個月
0             最新資料（右端）
Home          最早資料（左端）
```

### 12.4 快捷鍵說明 Modal

```
外觀：
  - Cmd+/ 觸發
  - 兩欄佈局（左欄：全域；右欄：當前頁面情境快捷鍵）
  - 每行格式：[快捷鍵 pill]  說明文字
  - 快捷鍵 pill：font-data，bg-overlay，border 0.5px

格式：
  ┌──────────────────────────────────────────────┐
  │  快捷鍵說明              [Esc 關閉]            │
  ├──────────────────────┬───────────────────────┤
  │  全域                  │  選股訊號表格          │
  │  ⌘K    開啟搜尋         │  ↑↓   移動焦點        │
  │  ⌘/    本說明           │  ↵    展開詳情        │
  │  GD    前往總覽          │  /    聚焦篩選        │
  │  GB    前往回測          │                      │
  └──────────────────────┴───────────────────────┘
```

### 12.5 快捷鍵發現機制

```
兩種讓用戶知道快捷鍵存在的方式：

1. Tooltip 顯示快捷鍵提示（對有快捷鍵的按鈕）：
   [重新整理] 按鈕的 tooltip：
   ┌──────────────────┐
   │ 重新整理資料       │
   │ ⌘R               │  ← 快捷鍵提示
   └──────────────────┘

2. 首次進入介面 3 秒後，右下角出現一次性提示：
   「提示：按 ⌘K 可快速搜尋股票  ✕」
   （localStorage 記錄，不重複顯示）
```

---

## §13 URL 深度狀態管理

### 13.1 哪些狀態需要反映在 URL

```
原則：
  可分享的狀態 → 放 URL
  個人暫態（hover、focus）→ 不放 URL
  用戶偏好（密度設定）→ localStorage

需要放 URL 的狀態：

  /signals
    ?date=2025-01-15      當前選擇的訊號日期（預設：今日）
    ?strategy=value       選中的策略篩選（預設：all）
    ?sort=score&dir=desc  排序欄位與方向
    ?etf=true             是否顯示 ETF（預設：true）
    ?stock=2330           選中展開的股票（開啟詳情行）

  /backtest/:run_id
    ?compare=run_id_2     比較模式的另一個 run_id
    ?zoom=2022-01_2022-12 圖表縮放範圍

  /signals/:stock_id
    ?tab=factors          當前標籤頁（預設：factors）
```

### 13.2 URL 狀態同步規則

```typescript
// URL 更新時機：
// 1. 使用者主動操作（排序、篩選、日期切換）→ 立即更新 URL（replace state）
// 2. 資料自動刷新 → 不更新 URL
// 3. 頁面間導航 → push state

// URL 讀取時機：
// 1. 頁面首次載入 → 從 URL 還原所有狀態
// 2. 瀏覽器前進/後退 → 監聽 popstate，還原對應狀態

// 無效 URL 參數處理：
// ?date=invalid → 靜默忽略，使用預設值（不顯示錯誤）
// ?stock=9999（不存在的股票）→ 忽略，不展開任何行
```

---

## §14 台灣在地化規格

### 14.1 日期格式

```
顯示格式（依情境選擇）：

  完整日期（文件標頭、回測結果）：
    2025-01-15（三）   ← ISO + 星期幾
    西元格式，不用民國（避免對不熟悉的用戶造成困惑）

  表格中的日期（空間緊縮）：
    01/15              ← 月/日，省略年份

  相對時間（Log 時間戳、更新時間）：
    18:42:31           ← 精確時間，不用「3分鐘前」
    原因：金融資料對時間精度要求高，「剛才」不夠精確

  回測期間選擇：
    2015-01-01 ~ 2025-01-15   ← 完整 ISO 範圍
```

### 14.2 市場時間顯示

```
市場狀態標記（顯示在頁面頂部）：

  09:00–13:30（週一~五）：  ● 交易中
  13:30~14:00（收盤後）：  ● 收盤中（資料整理中）
  14:00 後（平日）：        ● 已收盤  最後更新 14:01
  週六日 / 假日：           ● 休市中  上一交易日 MM/DD

  半型圓點 ●，不用全型 ●（字寬不同）

IMPORTANT：
  時間判斷必須在後端/排程端完成，前端只負責顯示
  前端不做交易日曆判斷（假日表每年不同，容易出錯）
```

### 14.3 數字在地化

```
台灣慣用格式：
  千分位：逗號（1,234,567）    ← 台灣習慣，非空格
  小數點：句點（1.23）          ← 台灣習慣，非逗號
  負號：前置短橫（-1.23%）     ← 標準負號
  正號：顯示 + 號（+1.23%）   ← 明確表示正值

縮寫規則（台灣金融界慣用）：
  萬  = 10,000
  億  = 100,000,000（1e8）
  兆  = 1,000,000,000,000（1e12）

  4.5億 → 正確；450,000,000 → 只在 tooltip 顯示完整值

單位顯示位置：
  數字後面，不加空格：234.5億、+12.34%、1.23萬張
```

---

## §15 錯誤邊界設計系統

### 15.1 三層錯誤等級

```
元件級錯誤（Component Error）：
  範圍：單一元件失敗（如一個 KPI 卡片的 API 失敗）
  策略：只該元件顯示錯誤，頁面其他部分照常運作
  外觀：
    ┌─────────────────────────────┐
    │  ⚠ 無法載入此指標            │
    │  [重試]                      │
    └─────────────────────────────┘
    border-left 2px solid caution
    高度與正常元件相同（不塌縮）

頁面級錯誤（Page Error）：
  範圍：整個頁面的核心資料失敗（如選股訊號 API 完全失敗）
  策略：顯示頁面錯誤狀態，但 Sidebar 和頂部正常
  外觀：
    頁面中央顯示錯誤說明 + 重試按鈕 + 錯誤詳情（可展開）
    保留上次成功的資料快取（標記為「資料可能已過時」）

全局錯誤（App Error）：
  範圍：JavaScript 未捕獲的例外（React Error Boundary）
  策略：顯示全屏錯誤頁，提供重新整理按鈕
  外觀：極簡——只有錯誤訊息 + 重新整理
```

### 15.2 部分資料失敗策略

```
原則：「有多少顯示多少，清楚標記缺失部分」

情境 1：今日選股中某 5 檔股票的財報資料缺失
  → 這 5 檔股票仍顯示，因子欄位顯示「—」
  → 因子橫條不顯示（留空）
  → 表格底部顯示：「5 檔股票因財報資料缺失，部分因子分數未計算」

情境 2：回測中某段期間的資料缺失
  → 圖表繼續繪製可用資料
  → 缺失區段以虛線連接
  → 懸停 tooltip 說明：「此期間資料缺失，以內插值填補」

情境 3：API 返回 200 但部分字段為 null
  → 對應欄位顯示「—」
  → 不報錯，不中斷渲染
```

### 15.3 錯誤訊息撰寫規範

```
BAD（工程師寫法）：
  "Error: TypeError: Cannot read property 'close' of undefined"
  "HTTP 500 Internal Server Error"

GOOD（用戶友善）：
  "無法取得今日股價資料"
  "網路連線不穩定，請稍後重試"
  "FinMind API 暫時無回應，資料可能未完整更新"

規則：
  1. 說明「發生了什麼」（用戶語言，非技術語言）
  2. 如果可能，說明「為什麼」（1句）
  3. 提供「下一步」的行動按鈕
  4. 技術細節（原始 error message）可折疊顯示，供進階用戶除錯
```

---

## §16 列印樣式規格

### 16.1 列印觸發方式

```
入口：
  - 回測詳情頁右上角 [列印報告] 按鈕
  - 瀏覽器 Cmd+P（自動套用 print 媒體查詢）

列印輸出：
  - 格式：A4 直向（預設）
  - 邊界：上下左右各 20mm
```

### 16.2 列印 CSS 規格

```css
@media print {
  /* 深色背景改為白底 */
  body, .page-content {
    background: white !important;
    color: #1a1a1a !important;
  }

  /* 隱藏不必要的 UI */
  .sidebar,
  .page-header .btn,
  .table-actions,
  .nav,
  .skeleton { display: none !important; }

  /* 強制顯示所有表格行（不分頁） */
  .signal-table tbody { display: table-row-group !important; }

  /* 圖表：深色轉高對比 */
  .chart-container {
    filter: invert(1) hue-rotate(180deg);  /* 深色圖表反色為淺色 */
  }

  /* 漲跌顏色調整（印表機可能不支援深色） */
  .text-positive { color: #006400 !important; }  /* 深綠 */
  .text-negative { color: #8b0000 !important; }  /* 深紅 */

  /* 頁眉頁尾 */
  @page {
    margin: 20mm;
  }

  /* 頁眉：顯示在每頁頂部 */
  .print-header {
    display: block !important;
    position: running(header);
    font-size: 10px;
    color: #666;
    border-bottom: 0.5px solid #ccc;
    padding-bottom: 4px;
    margin-bottom: 8px;
  }

  /* 強制分頁 */
  .chart-section { page-break-before: always; }
  .metric-grid   { page-break-inside: avoid; }

  /* 表格跨頁時重複表頭 */
  thead { display: table-header-group; }
}
```

### 16.3 列印報告結構

```
第 1 頁：
  ├── 報告標頭（系統名稱、生成日期、策略設定摘要）
  ├── 績效指標格（Metric Grid）
  └── 淨值曲線圖（轉為高對比黑白）

第 2 頁：
  ├── 年度報酬表格
  ├── 回撤分析
  └── 交易統計

後續頁：
  └── 持倉歷史（若需要完整列表）
```

---

*文件版本：v2.0 ｜強化版｜最後更新：2025-05*
*本文件需與 v1.0 同時參照，兩份規格共同構成完整的前端設計規格*
