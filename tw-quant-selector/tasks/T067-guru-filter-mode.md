---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/710
title: 大師策略篩選器模式（後端）
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-27
updated: 2026-05-28
howto: 後端新增大師篩選器類別 + 整合至評分管線
---

# T067 - 大師策略篩選器模式（後端）

## 目標
實作大師策略的篩選器模式（spec §3.1），將大師條件做為硬性 Boolean 過濾器，在四因子評分前先縮小選股宇宙。

- 來源：spec §2.2（各條件量化門檻）、§3.1

## 驗收標準
- [x] 定義 `GuruFilter` 抽象類別介面
- [x] 實作 `BuffettFilter`：ROE>15%、負債比<50%、毛利率>30%、近3年 EPS 正成長、PE<25、FCF 近4季 >0
- [x] 實作 `GrahamFilter`：PE < 大盤PE×0.9、PB<2.0、流動比率>1.5、長期負債/流動資產<1、近5年EPS>0、近3年配息
- [x] 實作 `LynchGarpFilter`：PEG<1、月營收YoY>15%、EPS年增率>20%、PE<EPS成長率×100、市值<1000億
- [x] 實作 `MagicFormulaFilter`：金融/公用事業排除、EY 排名前20%、ROIC 排名前20%、合計排名前30
- [x] 實作 `CanslimFilter`：EPS年增率>25%、近3年EPS每年>25%、營收加速、成交量確認、RS 排名前25%
- [x] 實作 `FisherFilter`：營收5年CAGR>15%、研發費用率>3%、營業利益率標準差<3%、董監持股>10%、毛利率逐季提升
- [x] 每個 Filter 實作 `get_pass_fail()` 方法
- [x] 註冊機制 `_GURU_FILTER_REGISTRY` 支援開關切換

## 備註
- 注意各大師門檻的台股本地化調整（spec §11）
- CAN SLIM 的 M 條件（大盤方向）為系統層級，不在個股層級處理
- Fisher 策略的定性條件標記為「人工確認項」，不納入篩選
- 神奇公式自動排除金融/公用事業股
