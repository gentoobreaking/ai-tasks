MCP Tools:

| Tool                       | 功能          | 優先度   |
| -------------------------- | ----------- | ----- |
| `get_land_transactions`    | 指定地號成交紀錄    | ⭐⭐⭐⭐⭐ |
| `search_land_transactions` | 條件搜尋        | ⭐⭐⭐⭐⭐ |
| `find_comparable_land`     | 找可比交易       | ⭐⭐⭐⭐⭐ |
| `land_price_statistics`    | 價格統計        | ⭐⭐⭐⭐⭐ |
| `get_parcel`               | 地籍/Polygon  | ⭐⭐⭐⭐⭐ |
| `get_nearby_parcels`       | 附近地號        | ⭐⭐⭐⭐  |
| `analyze_road_access`      | 臨路分析        | ⭐⭐⭐⭐⭐ |
| `get_map_location`         | 地號→座標       | ⭐⭐⭐   |
| `get_street_view`          | Street View | ⭐⭐⭐   |
| `rank_comparable_land`     | 可比交易排名      | ⭐⭐⭐⭐⭐ |
| `land_price_trend`         | 歷史趨勢        | ⭐⭐⭐⭐  |
| `estimate_land_value`      | 土地估價        | ⭐⭐⭐⭐⭐ |
| `get_data_source`          | 資料來源        | ⭐⭐⭐⭐⭐ |

                 🤖 AI Agent
                     │
                     ▼
          ┌─────────────────────┐
          │   Real Estate MCP   │
          └──────────┬──────────┘
                     │
       ┌─────────────┼──────────────┐
       ▼             ▼              ▼
   🧾 Transaction   🗺 GIS        📊 Analysis
       │             │              │
       │             │              ├─ Comparable
       │             │              ├─ Statistics
       │             │              ├─ Ranking
       │             │              ├─ Trend
       │             │              └─ Valuation
       │             │
       ▼             ▼
   內政部實價      地籍圖資
                     │
                     ▼
                Google Maps
                Satellite
                Street View


「查 3615，幫我找近 5 年同地段、同分區、相近面積、臨路條件類似的成交，算出單坪價格範圍，並把這些土地全部標在地圖上。」
然後 Agent 自己呼叫 MCP 完成整個流程。


系統必須能處理：

指定地號交易查詢
條件式實價交易搜尋
同地段可比交易搜尋
土地面積與價格統計
地籍位置與 Polygon 查詢
附近土地查詢
道路/臨路分析
Google Maps 衛星圖整合
Google Street View 整合
可比交易排序
歷史價格趨勢
土地合理價格區間估算
資料來源與版本追蹤

核心原則：

官方資料由程式處理，GIS 由空間資料處理，價格計算由 deterministic engine 執行，LLM 僅負責理解問題、選擇 Tool、組合結果及產生自然語言說明。

包含：

房屋仲介平台
線上買賣
聯絡地主方式
不動產法律判定
正式鑑價報告
建築法規正式審查
土地使用許可正式判定
Google Maps 資料下載/本地化保存
未授權爬取政府網站
未授權爬取 Google Maps / Street View

系統產生的估值屬於：
Comparable Market Analysis / 市場交易比較分析

