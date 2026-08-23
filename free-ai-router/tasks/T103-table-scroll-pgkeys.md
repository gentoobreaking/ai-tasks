---
github_issue: 
title: 主畫面表格滾動視窗與 PgUp/PgDn 修正
type: bug
priority: high
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-23
updated: 2026-08-23
---

# T103 - 表格滾動視窗、PgUp/PgDn 失效、選取鉗制

## 目標
三個表格瀏覽缺陷：
1. renderTable 固定渲染前 N 行，選取移出第一屏後該行不可見（header 卻正常顯示）
2. PgUp/PgDn 完全失效——bubbletea v1 回報 `"pgup"/"pgdown"`，程式卻匹配 `"pageup"/"pagedown"`
3. G 跳尾用螢幕列數而非列表長度；篩選縮表後 selected 可能指向清單外

## 驗收標準
- [x] RenderOptions.ScrollOffset + View() 自動捲動保持選取可見
- [x] pgup/pgdown 正確匹配（舊名保留為別名）；G 以列表長度鉗制
- [x] SelectedModel() 改用過濾後清單（原用未過濾 snapshot，與顯示不一致）
- [x] visibleCount() 與 renderer 列數計算統一（height-14）
- [x] TestPageUpPgDownKeys / TestTableScrollsToKeepSelectionVisible / TestSelectionClampedWhenFilterShrinks 通過

## 備註
commit 0731a23。
