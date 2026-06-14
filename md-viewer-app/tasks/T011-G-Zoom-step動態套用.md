---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/359
title: "[T011-G] Zoom step 動態套用"
type: subtask
status: done
assignee: gemini-3-flash-preview
parent: T011
created: 2026-04-25
updated: 2026-04-28（review 更新）
depends: [T011-F]
---

## 目標

讓 JS zoom step 讀取 `window.mdConfig.zoomSensitivity` 動態套用。

## 實際實作（main.go JS）

```javascript
window.zoomState = { level: 1.0, step: 0.1 };

window.applyZoomSensitivity = function (level) {
  window.zoomState.step = 0.02 * level;
};

window.zoomIn = function () {
  window.applyZoomLevel(window.zoomState.level + window.zoomState.step);
};
window.zoomOut = function () {
  window.applyZoomLevel(window.zoomState.level - window.zoomState.step);
};
window.zoomReset = function () {
  window.applyZoomLevel(1.0);
};
```

`applyZoomLevel` 同步呼叫 `saveZoomLevel()` 持久化。

## Zoom Sensitivity 等級對照

| slider 值 | step |
| --------- | ---- |
| 1         | 0.02 |
| 5（預設） | 0.10 |
| 10        | 0.20 |

## 驗收標準（達成）

- [x] 縮放靈敏度設定後立即生效
- [x] ⌘+ / ⌘- 行為符合設定等級
- [x] 重開 app 後等級保留

---

_建立時間：gemini-3-flash-preview | 2026-04-28（review 更新）_