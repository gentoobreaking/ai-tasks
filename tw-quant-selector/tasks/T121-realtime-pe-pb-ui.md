---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/830
title: 即时 PE/PB UI 整合（React）
type: feature
priority: high
status: done
assignee: gemini-3-flash-preview
created: 2026-06-02
updated: 2026-06-05
howto: |
  1. 创建 React 组件 RealtimeValuationBadge.tsx
  2. 实现动态颜色切换（PB < 1.0 → 绿色，高于同业 2 倍 → 黄橘色）
  3. 在 pages/StockDetail.tsx 中整合该组件
  4. 使用 TypeScript 定义 interface
  5. 实现 Badge 样式（小标签显示 RT-PE 与 RT-PB）
---

# T121 - 即时 PE/PB UI 整合（React）

## 目标
实现 realtime-1.txt Section 3.3 的 UI 整合呈现，在 React 前端动态显示即时 PE/PB 并切换颜色。

## 验收标准
- [x] 创建 `frontend/src/components/RealtimeValuationBadge.tsx`：
  - 定义 TypeScript interface：
    ```typescript
    interface RealtimeValuationBadgeProps {
      stockId: string;
      currentPrice: number;
      peRt: number | null;
      pbRt: number | null;
      industryAvgPb: number | null;
    }
    ```
  - 实现组件逻辑：
    - 若 `pbRt < 1.0` → 文字颜色 = 绿色（低估亮点）
    - 若 `industryAvgPb !== null && pbRt > industryAvgPb * 2` → 文字颜色 = 黄橘色（高估警讯）
    - 若 `peRt === null` → 显示「—」
    - 若 `peRt > 200` → 显示「> 200」

- [x] 实现 Badge 样式：
  - 使用 Tailwind CSS 或 styled-components
  - 小标签样式（圆角、padding、字体大小 12px）
  - 颜色动态切换（绿/黄橘/黑）
  - 显示格式：`RT-PE: 22.1 | RT-PB: 8.3`

- [x] 在 `frontend/src/pages/StockDetail.tsx` 中整合：
  - 导入 `RealtimeValuationBadge` 组件
  - 在即时 K 線圖或五檔報價旁顯示
  - 從 WebSocket 或 REST API 獲取 `peRt`, `pbRt`, `industryAvgPb`
  - 每次價格更新時重新渲染

- [x] 实现行业平均 PB 计算：
  - 创建 `frontend/src/utils/industryAverages.ts`
  - 函式：`calc_industry_avg_pb(stock_id, all_stocks) → number | null`
  - 從本地快取或 API 讀取同產業股票清單
  - 計算同位數的 PB 平均值（排除極端值）

- [x] 单元测试：
  - 测试组件渲染（快照测试）
  - 测试颜色切换逻辑（PB < 1.0 → 绿色）
  - 测试极端值显示（PE > 200 → 「> 200」）


## 备注
- 参考 realtime-1.txt Section 3.3 UI 整合呈现规格
- ⚠️ **依赖 T122（盘中即时 PE/PB 计算）**，需先完成
- ⚠️ **依赖 T121（MIS API 即时报价）**，需先完成
- 行业平均 PB 计算需注意效能（避免每次渲染都重新计算）
- 若 `industryAvgPb` 为 `null`，不显示高估警讯（避免过度警告）
- Badge 组件应支援 SSR（Server-Side Rendering）或 CSR（Client-Side Rendering）
