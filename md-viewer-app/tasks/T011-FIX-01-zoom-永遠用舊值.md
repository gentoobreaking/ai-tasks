---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/98
title: "[T011-FIX-01] 修復 zoomIn/zoomOut 永遠用舊值"
type: subtask
status: done
assignee: gemini-3-flash-preview
parent: T011
created: 2026-04-25
updated: 2026-04-28（review 更新）
---

## 目標

修復 zoom 狀態在 `loadFile` 後丟失的問題。

## 根因

1. `window.applyZoomLevel` 未定義 → `loadFile` 後 zoom 永遠 reset 1.0
2. `saveZoomLevel` 綁定存在，但 `applyZoom` 內呼叫時條件漏寫
3. `SetHtml` 重建整個頁面 → `window.mdConfig.zoomLevel` 可跨 reload 保留

## 實際修改

### `main.go` JS 區段

**新增** `applyZoomLevel`：

```js
window.applyZoomLevel = function (level) {
  level = Math.max(0.5, Math.min(2.0, level));
  window.zoomState.level = level;
  document.body.style.zoom = level;
  document.getElementById("zoomText").innerText = Math.round(level * 100) + "%";
  if (window.saveZoomLevel) window.saveZoomLevel(level);
  window.showZoomIndicator(Math.round(level * 100));
};
```

**修正** `loadFile` 後注入 config + 還原 zoom：

```go
currentWV.SetHtml(renderMD(string(data)))
currentWV.Eval(getConfigJS())
currentWV.Eval("if(window.applyZoomLevel && window.mdConfig && window.mdConfig.zoomLevel) window.applyZoomLevel(window.mdConfig.zoomLevel)")
```

## 驗收標準（達成）

- [x] ⌘+ / ⌘- 正確遞增遞減
- [x] 切換檔案後 zoom 保持當前比例
- [x] 重開 app 後 zoom 保持上次比例

---

_建立時間：gemini-3-flash-preview | 2026-04-28（review 更新）_