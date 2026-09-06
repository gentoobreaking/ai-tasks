# Taiwan Real Estate MCP
# Frontend Specification v2.0

**Document:** `FRONTEND_SPEC.md`  
**Version:** 2.0  
**Status:** Normative Specification  
**Scope:** Web Frontend / GIS UI / Real Estate Intelligence UI  
**Primary Stack:** React + TypeScript  
**Map:** Google Maps JavaScript API  
**Backend:** Go API / MCP-compatible service  
**Database:** PostgreSQL + PostGIS  

---

# 1. Purpose

本文件定義 Taiwan Real Estate MCP Frontend 的完整功能、UI/UX、資料流、互動模型與驗收標準。

Frontend 不得被視為單純的 Map Viewer。

Frontend 必須提供：

```text
Search
Filter
Map Interaction
Parcel Inspection
Transaction Analysis
Comparable Analysis
Road / GIS Analysis
Valuation
Satellite
Street View
Data Provenance
Error / Empty / Loading States
```

Frontend 必須讓使用者可以從：

```text
搜尋土地
    ↓
定位地號
    ↓
查看地籍
    ↓
查看成交
    ↓
查看周邊成交
    ↓
選擇 Comparable
    ↓
查看道路 / GIS
    ↓
執行估價
    ↓
查看估價依據
```

完成完整工作流程。

---

# 2. Frontend Completion Definition

以下條件全部成立，Frontend 才能標記為 `COMPLETE`：

```text
[ ] Application loads successfully
[ ] Search works
[ ] Search results work
[ ] Filter works
[ ] Map interaction works
[ ] Parcel selection works
[ ] Parcel detail works
[ ] Transaction detail works
[ ] Comparable analysis works
[ ] Road/GIS information works
[ ] Valuation works
[ ] Satellite layer works
[ ] Street View works
[ ] Loading states exist
[ ] Empty states exist
[ ] Error states exist
[ ] Provenance is visible
[ ] API errors are handled
[ ] No fake/mock production data
[ ] All acceptance tests PASS
```

**只有地圖可以顯示，不得視為 Frontend Complete。**

---

# 3. Design Principles

## 3.1 Map Is Primary Workspace

地圖是核心工作區，但不是唯一 UI。

```text
┌─────────────────────────────────────────────────────┐
│ Header / Search                                    │
├───────────────────┬─────────────────────────────────┤
│ Search / Filters  │                                 │
│ Results           │             MAP                 │
│                   │                                 │
│                   │                                 │
├───────────────────┴─────────────────────────────────┤
│ Detail / Analysis Panel                             │
└─────────────────────────────────────────────────────┘
```

---

# 4. Application Layout

Desktop-first。

Minimum supported desktop resolution:

```text
1280 × 720
```

Recommended:

```text
1440 × 900
```

Mobile support is optional for v2.0 unless explicitly enabled.

---

# 5. Global Layout

## 5.1 Header

Header must contain:

```text
Application Name
Search
Data Snapshot
System Status
```

Example:

```text
Taiwan Real Estate Intelligence

[ Search parcel / address / transaction... ] [Search]

Data: 2026-09-01
● API Connected
```

---

# 6. Main Application Areas

Frontend consists of:

```text
1. Search
2. Filter
3. Search Results
4. Map
5. Parcel Inspector
6. Transaction Panel
7. Comparable Panel
8. GIS / Road Panel
9. Valuation Panel
10. Street View
11. Provenance
```

---

# 7. Search

## 7.1 Search Types

Search must support:

```text
A. Parcel / 地號
B. Address / 地址
C. Section / 段名
D. Transaction
```

---

## 7.2 Parcel Search

User may enter:

```text
行政區
段名
地號
```

Example:

```text
西嶼鄉
竹篙灣段
3615
```

Search result must identify:

```text
county
township
section
parcel_no
geometry
area
```

---

## 7.3 Partial Search

Partial input should be supported where backend API permits.

Example:

```text
竹篙灣
```

may return:

```text
竹篙灣段
竹篙灣段 3615
竹篙灣段 3616
...
```

---

## 7.4 Address Search

Address input:

```text
澎湖縣西嶼鄉……
```

must return a location or corresponding parcel where available.

---

## 7.5 Search Result Ranking

Results must be deterministic.

Ordering priority:

```text
Exact match
↓
Normalized exact match
↓
Prefix match
↓
Partial match
```

Tie-breaking:

```text
county
township
section
parcel_no
```

alphabetically/numerically.

---

## 7.6 Search Acceptance Tests

### FE-SEARCH-001

**Input**

```text
竹篙灣段 3615
```

**Expected**

```text
Search request sent
↓
Result returned
↓
Parcel displayed
↓
Map moves to parcel
```

PASS when all four actions occur.

---

### FE-SEARCH-002

Invalid parcel:

```text
999999999
```

Expected:

```text
No results
```

must NOT display a fake parcel.

---

### FE-SEARCH-003

Empty search.

Expected:

```text
Validation message
```

No unnecessary API request.

---

# 8. Filter

Filter must support transaction/comparable queries.

Minimum filters:

```text
行政區
段名
交易期間
土地面積
使用分區
使用地類別
交易總價
單價
```

Optional:

```text
距離
道路條件
交易類型
```

---

## 8.1 Area Filter

Example:

```text
300 ~ 400 坪
```

Backend unit may be m².

Frontend must perform explicit unit conversion.

Conversion:

```text
1 坪 = 3.305785 m²
```

Display unit:

```text
坪
```

API unit:

```text
m²
```

unless MCP/API contract explicitly specifies otherwise.

---

## 8.2 Date Filter

Support:

```text
Last 1 year
Last 3 years
Last 5 years
Custom
```

---

## 8.3 Filter Reset

Button:

```text
Reset Filters
```

must restore default state.

---

## 8.4 Filter Acceptance

### FE-FILTER-001

Set:

```text
Area = 300~400 坪
Date = Last 5 Years
```

Expected:

All displayed transactions satisfy both conditions.

---

### FE-FILTER-002

Reset filters.

Expected:

```text
All default filters restored
```

---

# 9. Search Results

Search results must be displayed as a list/table.

Minimum fields:

```text
行政區
段名
地號
面積
交易日期
總價
單價
```

Example:

```text
┌────────────────────────────────────┐
│ 西嶼鄉 竹篙灣段 3615               │
│ 333.66 坪                           │
│                                     │
│ 最近成交：2025-xx-xx                │
│ 單價：XX 萬/坪                      │
└────────────────────────────────────┘
```

---

## 9.1 Map Synchronization

Selecting a result must:

```text
1. Highlight result
2. Center map
3. Zoom to parcel
4. Highlight geometry
5. Open detail panel
```

---

# 10. Map

Map must support:

```text
Pan
Zoom
Marker
Parcel boundary
Selection
Layer control
```

---

# 11. Map Layers

Minimum:

```text
Street Map
Satellite
Hybrid
Parcel Boundary
Transaction Markers
Comparable Markers
Road Layer
```

Layer visibility must be independently controllable.

---

# 12. Parcel Visualization

Selected parcel:

```text
highlight geometry
```

must be visually distinguishable from:

```text
unselected parcels
```

---

## 12.1 Parcel Click

Clicking a parcel must:

```text
Map
 ↓
Parcel identification
 ↓
Parcel Inspector
```

If parcel identification fails:

```text
No parcel identified
```

must be displayed.

---

# 13. Map Marker

Transaction marker must support:

```text
Click
Hover
Selection
```

Clicking marker opens:

```text
Transaction Detail
```

---

# 14. Map ↔ List Synchronization

The following must remain synchronized:

```text
Search Result
Map Marker
Selected Parcel
Detail Panel
```

Example:

```text
Click list
   ↓
Map moves

Click map
   ↓
List highlights

Click marker
   ↓
Transaction panel opens
```

---

# 15. Parcel Inspector

Parcel Inspector is the central detail UI.

Required sections:

```text
Basic Information
Geometry
Transaction
Comparable
Road
Valuation
Provenance
```

---

# 16. Parcel Basic Information

Display:

```text
縣市
行政區
段名
地號
面積
geometry status
```

Where available:

```text
使用分區
使用地類別
```

---

# 17. Parcel Geometry

Display:

```text
Parcel Boundary
Centroid
Area
Coordinate
```

Area must indicate source:

```text
Official cadastral area
GIS calculated area
```

If mismatch:

```text
GIS_AREA_MISMATCH
```

must be visible.

Frontend must NOT silently replace official area with calculated GIS area.

---

# 18. Transaction Panel

Transaction panel must provide:

```text
Transaction count
Transaction list
Transaction detail
Statistics
```

---

# 19. Transaction List

Required fields:

```text
Transaction Date
Total Price
Unit Price
Land Area
Transaction Type
Source
```

---

# 20. Transaction Detail

Clicking a transaction opens detailed information.

Minimum:

```text
transaction_id
transaction_date
county
township
section
parcel_no
area
total_price
unit_price
zoning
land_use
source
snapshot
```

---

# 21. Transaction Statistics

Display:

```text
Count
Minimum
P10
P25
Median
Mean
P75
P90
Maximum
```

Example:

```text
Transactions: 18

Min       XX
P25       XX
Median    XX
Mean      XX
P75       XX
P90       XX
Max       XX
```

---

# 22. Comparable Panel

Comparable analysis must NOT be a static list.

It must show:

```text
Candidate transactions
Similarity score
Distance
Area similarity
Time similarity
Zoning similarity
Land-use similarity
Road/access similarity
```

---

# 23. Comparable Ranking

Display:

```text
Rank
Transaction
Similarity Score
Distance
Area Difference
Transaction Date
Unit Price
```

Example:

```text
#1  95.2
#2  92.7
#3  89.4
```

Ordering must match backend deterministic ranking.

Frontend must never independently reorder results using arbitrary UI logic.

---

# 24. Comparable Map Visualization

Comparable transactions must be displayed on map.

Example:

```text
Target Parcel
     ●

Comparable
   ●
       ●
           ●
```

Click comparable marker:

```text
Comparable Detail
```

---

# 25. Comparable → Transaction

Clicking comparable:

```text
Comparable
 ↓
Transaction Detail
```

must show the source transaction.

---

# 26. Valuation Panel

Valuation UI must display:

```text
Bear Value
Base Value
Bull Value
Confidence
```

Example:

```text
Estimated Value

Bear     NT$ XXX
Base     NT$ XXX
Bull     NT$ XXX

Confidence
████████░░ 82%
```

---

# 27. Valuation Inputs

Frontend must display major inputs:

```text
Comparable Count
Median Unit Price
Selected Comparable Set
Area
Time Range
Distance
Outlier Policy
Valuation Configuration
```

---

# 28. Valuation Provenance

Valuation result must show:

```text
valuation_config_version
comparable_snapshot
data_snapshot
query_hash
calculation timestamp
```

User must be able to determine:

> 「這個價格是怎麼算出來的？」

---

# 29. Insufficient Data

If backend reports insufficient data:

Frontend must display:

```text
Insufficient Data
```

and reason.

Example:

```text
無足夠可比交易資料。

Required: 5
Available: 2
```

Frontend must NOT manufacture a valuation.

---

# 30. Confidence

Confidence must come from backend.

Frontend must NOT calculate an independent confidence score.

---

# 31. Road / GIS Panel

Road information must include:

```text
Nearest Road
Distance
Road Width
Road Adjacency
Geometry
Source
Confidence / status
```

---

# 32. Road Adjacency

Display one of:

```text
ADJACENT
NOT_ADJACENT
UNKNOWN
```

Unknown must remain Unknown.

Frontend must NOT convert Unknown into No.

---

# 33. Road Width

Road width must display its provenance.

Example:

```text
Road Width
12 m

Source:
Official GIS dataset
```

If unavailable:

```text
Road Width
Not Available
```

Do not infer a road width from visual appearance.

---

# 34. GIS Status

Possible statuses:

```text
VALID
GIS_AREA_MISMATCH
GEOMETRY_NOT_FOUND
SOURCE_UNAVAILABLE
UNKNOWN
```

Frontend must visually distinguish error/warning states.

---

# 35. Satellite

Map must support:

```text
ROADMAP
SATELLITE
HYBRID
```

Layer switching must not reset selected parcel state.

---

# 36. Street View

Street View must be accessible from:

```text
Parcel Inspector
Road Panel
Map
```

---

# 37. Street View Behavior

When available:

```text
Open Street View
```

should attempt to locate the nearest panorama based on parcel/road coordinates.

When unavailable:

```text
Street View unavailable at this location.
```

No broken iframe or blank panel.

---

# 38. Street View Acceptance

### FE-STREET-001

For a location with Street View:

```text
Select parcel
→ Open Street View
→ Panorama displayed
```

PASS.

---

### FE-STREET-002

For unavailable location:

```text
Open Street View
→ Availability check
→ Friendly unavailable message
```

PASS.

---

# 39. Data Provenance UI

Every major data category must expose provenance.

Categories:

```text
Parcel
Transaction
GIS
Road
Comparable
Valuation
```

Minimum:

```text
Source
Dataset
Snapshot
Timestamp
```

---

# 40. Provenance Drawer

User should be able to expand:

```text
Data Provenance
```

Example:

```text
Source
Ministry of the Interior

Dataset
Actual Price Transaction Data

Snapshot
2026-09-01

Record ID
xxxxxxxx

Query Hash
xxxxxxxx
```

---

# 41. Loading State

Every asynchronous operation must have a loading state.

Example:

```text
Searching...
Loading parcel...
Loading transactions...
Calculating comparable...
Calculating valuation...
Loading Street View...
```

No silent waiting.

---

# 42. Empty State

Example:

```text
No transactions found.

Try:
• expanding date range
• increasing area range
• changing section
```

---

# 43. Error State

Errors must be categorized.

```text
NETWORK_ERROR
API_ERROR
NOT_FOUND
INVALID_REQUEST
DATA_UNAVAILABLE
GIS_ERROR
STREET_VIEW_UNAVAILABLE
VALUATION_INSUFFICIENT_DATA
```

---

# 44. Error Display

User-facing error:

```text
Unable to load transaction data.
Please try again.
```

Developer/debug detail may include:

```text
request_id
error_code
```

Do not expose secrets or internal stack traces.

---

# 45. API Contract

Frontend must communicate with typed API interfaces.

TypeScript models must correspond to:

```text
MCP_API.md
```

No undocumented response fields may be required by the UI.

---

# 46. No Fake Production Data

Production frontend must NOT contain:

```text
hardcoded transactions
hardcoded parcel coordinates
hardcoded valuation results
fake road widths
fake comparable scores
```

Mock data may only exist under:

```text
tests/
storybook/
development fixtures
```

and must be explicitly marked.

---

# 47. State Management

Application state should distinguish:

```text
Search State
Filter State
Map State
Selected Parcel
Selected Transaction
Selected Comparable
Valuation State
Layer State
UI State
```

Example:

```text
selectedParcel
selectedTransaction
selectedComparable
mapCenter
mapZoom
activeLayers
filters
searchQuery
```

---

# 48. URL State

Where practical, selected parcel/search state should be shareable.

Example concept:

```text
/parcels/{parcel-id}
```

or query parameters.

Refreshing the page must not unexpectedly lose the primary selected entity where route-based state is implemented.

---

# 49. Performance Requirements

Initial application load:

```text
Target < 3 seconds
```

Search response rendering:

```text
Target < 1 second after API response
```

Map must not attempt to render thousands of transaction markers simultaneously.

Large result sets must use:

```text
clustering
pagination
viewport filtering
```

---

# 50. Deterministic UI Rules

Frontend must not alter authoritative analytical results.

The following must come from backend:

```text
Comparable Score
Comparable Ranking
Statistics
Valuation
Confidence
Road Adjacency
Road Width
```

Frontend responsibility:

```text
render
filter UI input
navigation
interaction
visualization
```

---

# 51. Accessibility

Minimum:

```text
Keyboard navigation
Visible focus
Semantic buttons
Readable contrast
ARIA labels where required
```

Map-only interaction must not be the only way to access data.

---

# 52. Responsive Behavior

At minimum:

```text
1280px+
```

must provide complete experience.

For smaller screens:

```text
Map
Search
Inspector
```

may become stacked panels.

---

# 53. Frontend Testing Strategy

Tests must include:

```text
Unit
Component
API Contract
Integration
E2E
GIS interaction
Visual regression
Error handling
```

---

# 54. Search Acceptance Tests

| ID | Test | Expected |
|---|---|---|
| FE-SEARCH-001 | Exact parcel search | Correct parcel |
| FE-SEARCH-002 | Invalid parcel | No result |
| FE-SEARCH-003 | Empty query | Validation |
| FE-SEARCH-004 | Partial section search | Deterministic results |
| FE-SEARCH-005 | Address search | Correct location |
| FE-SEARCH-006 | Result click | Map + inspector sync |

---

# 55. Filter Acceptance Tests

| ID | Test | Expected |
|---|---|---|
| FE-FILTER-001 | Area filter | Correct range |
| FE-FILTER-002 | Date filter | Correct date range |
| FE-FILTER-003 | Zoning filter | Correct zoning |
| FE-FILTER-004 | Land-use filter | Correct land-use |
| FE-FILTER-005 | Price filter | Correct price |
| FE-FILTER-006 | Reset | Defaults restored |

---

# 56. Map Acceptance Tests

| ID | Test | Expected |
|---|---|---|
| FE-MAP-001 | Load map | Map visible |
| FE-MAP-002 | Parcel boundary | Correct geometry |
| FE-MAP-003 | Select parcel | Highlight |
| FE-MAP-004 | Marker click | Transaction panel |
| FE-MAP-005 | Result click | Map centers |
| FE-MAP-006 | Layer switch | Correct layer |
| FE-MAP-007 | Satellite | Satellite visible |
| FE-MAP-008 | Hybrid | Hybrid visible |

---

# 57. Parcel Acceptance Tests

| ID | Test | Expected |
|---|---|---|
| FE-PARCEL-001 | Open parcel | Inspector |
| FE-PARCEL-002 | Area | Correct official value |
| FE-PARCEL-003 | Geometry mismatch | Warning |
| FE-PARCEL-004 | Missing geometry | Explicit status |
| FE-PARCEL-005 | Provenance | Source visible |

---

# 58. Transaction Acceptance Tests

| ID | Test | Expected |
|---|---|---|
| FE-TX-001 | Transaction list | Correct records |
| FE-TX-002 | Transaction detail | Correct fields |
| FE-TX-003 | Statistics | Correct statistics |
| FE-TX-004 | Marker | Correct transaction |
| FE-TX-005 | Empty transactions | Empty state |
| FE-TX-006 | Provenance | Source visible |

---

# 59. Comparable Acceptance Tests

| ID | Test | Expected |
|---|---|---|
| FE-COMP-001 | Load comparable | Correct candidates |
| FE-COMP-002 | Ranking | Backend ranking preserved |
| FE-COMP-003 | Score | Backend score displayed |
| FE-COMP-004 | Map | Candidates visible |
| FE-COMP-005 | Select comparable | Detail displayed |
| FE-COMP-006 | Provenance | Candidate provenance visible |

---

# 60. Valuation Acceptance Tests

| ID | Test | Expected |
|---|---|---|
| FE-VAL-001 | Execute valuation | Result displayed |
| FE-VAL-002 | Bear/Base/Bull | Correct values |
| FE-VAL-003 | Confidence | Backend value |
| FE-VAL-004 | Inputs | Inputs visible |
| FE-VAL-005 | Provenance | Calculation provenance |
| FE-VAL-006 | Insufficient data | No fabricated value |
| FE-VAL-007 | Re-run | Deterministic result |

---

# 61. GIS / Road Acceptance Tests

| ID | Test | Expected |
|---|---|---|
| FE-GIS-001 | Geometry | Correct parcel |
| FE-GIS-002 | Centroid | Correct location |
| FE-ROAD-001 | Road adjacency | Correct status |
| FE-ROAD-002 | Road distance | Correct value |
| FE-ROAD-003 | Road width | Source displayed |
| FE-ROAD-004 | Unknown road | UNKNOWN |
| FE-ROAD-005 | GIS mismatch | Warning |

---

# 62. Street View Acceptance Tests

| ID | Test | Expected |
|---|---|---|
| FE-SV-001 | Available panorama | Display |
| FE-SV-002 | No panorama | Friendly message |
| FE-SV-003 | Open from parcel | Correct location |
| FE-SV-004 | Open from road | Correct location |

---

# 63. Error Acceptance Tests

| ID | Test | Expected |
|---|---|---|
| FE-ERR-001 | API timeout | Retry/error UI |
| FE-ERR-002 | 404 | Not found |
| FE-ERR-003 | 500 | Server error |
| FE-ERR-004 | Invalid input | Validation |
| FE-ERR-005 | GIS unavailable | GIS error |
| FE-ERR-006 | Valuation insufficient | Explicit insufficient-data |

---

# 64. End-to-End Acceptance Test

## FE-E2E-001 Full Property Investigation

User performs:

```text
1. Open application
2. Search parcel
3. Select parcel
4. View parcel boundary
5. View parcel information
6. View transactions
7. View transaction statistics
8. View comparable transactions
9. View comparable markers
10. View road information
11. Switch satellite
12. Open Street View
13. Execute valuation
14. Inspect Bear/Base/Bull
15. Inspect provenance
```

Expected:

```text
Every step succeeds.
```

No manual database access is allowed.

---

# 65. End-to-End Acceptance Test

## FE-E2E-002 Search → Comparable → Valuation

```text
Search
 ↓
Parcel
 ↓
Transactions
 ↓
Comparable
 ↓
Valuation
```

The selected parcel and data snapshot must remain consistent throughout the workflow.

---

# 66. End-to-End Acceptance Test

## FE-E2E-003 Invalid Workflow

```text
Search invalid parcel
 ↓
No result
 ↓
No map selection
 ↓
No valuation
```

The UI must not produce analytical output without a valid target.

---

# 67. Data Consistency Verification

Frontend values must be checked against API response.

For every major object:

```text
API response
       ↓
Frontend displayed value
```

must match.

Fields include:

```text
area
price
unit_price
date
parcel_no
transaction_id
score
valuation
confidence
road_distance
road_width
```

---

# 68. Unit Conversion Verification

If backend returns m²:

```text
坪 = m² / 3.305785
```

Frontend must not use:

```text
坪 = m² / 3
```

or other approximation without explicit specification.

Displayed values must have documented rounding rules.

---

# 69. Currency Formatting

Taiwan currency:

```text
NT$
```

Large values may be formatted:

```text
NT$ 12,345,678
```

but raw numerical value must remain available in structured state.

---

# 70. Rounding Rules

UI formatting must not change analytical values.

Example:

```text
Backend:
12.345678

Display:
12.35
```

The original value remains available.

---

# 71. Security

Frontend must never contain:

```text
Database credentials
MCP secrets
API server secrets
Service account credentials
```

Google Maps browser API key must use appropriate API restrictions.

---

# 72. API Error Contract

Frontend should consume structured errors:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Parcel not found",
    "request_id": "..."
  }
}
```

Frontend must branch on `code`, not parse human-readable message strings.

---

# 73. Observability

Frontend should expose:

```text
request_id
API latency
error state
```

for debugging where appropriate.

Production logs must not contain secrets.

---

# 74. No Autonomous Analytical Logic

Frontend must not independently implement:

```text
valuation formulas
comparable scoring
outlier removal
confidence calculation
road classification
transaction statistics
```

These belong to backend/domain engines.

---

# 75. Frontend / Backend Boundary

```text
┌───────────────────────────────┐
│           FRONTEND            │
│                               │
│ Search                        │
│ Filters                       │
│ Map                           │
│ Visualization                 │
│ Interaction                   │
│ Rendering                     │
└───────────────┬───────────────┘
                │
                │ API
                ↓
┌───────────────────────────────┐
│         GO BACKEND             │
│                               │
│ Domain                        │
│ Transaction Engine            │
│ Comparable Engine             │
│ GIS Engine                    │
│ Valuation Engine              │
│ Provenance                    │
└───────────────────────────────┘
```

Frontend is not authoritative for analytical results.

---

# 76. Component Structure

Recommended:

```text
frontend/src/

├── app/
│   ├── App.tsx
│   └── routes.tsx
│
├── components/
│   ├── SearchBar/
│   ├── FilterPanel/
│   ├── SearchResults/
│   ├── Map/
│   ├── LayerControl/
│   ├── ParcelInspector/
│   ├── TransactionPanel/
│   ├── ComparablePanel/
│   ├── RoadPanel/
│   ├── ValuationPanel/
│   ├── StreetView/
│   ├── Provenance/
│   ├── LoadingState/
│   ├── EmptyState/
│   └── ErrorState/
│
├── features/
│   ├── search/
│   ├── parcel/
│   ├── transaction/
│   ├── comparable/
│   ├── gis/
│   ├── road/
│   └── valuation/
│
├── services/
│   ├── api/
│   └── maps/
│
├── hooks/
│
├── types/
│
└── tests/
```

---

# 77. Component Completion Rule

A component is not complete merely because it renders.

Each component requires:

```text
Implementation
+
API integration
+
Loading state
+
Empty state
+
Error state
+
Acceptance test
```

---

# 78. Frontend Task IDs

Implementation should use the following task hierarchy.

```text
FE-001 Frontend Bootstrap

FE-010 Search
FE-011 Search API
FE-012 Search Results
FE-013 Search State

FE-020 Filters
FE-021 Area Filter
FE-022 Date Filter
FE-023 Zoning Filter
FE-024 Land-use Filter

FE-030 Map
FE-031 Parcel Boundary
FE-032 Transaction Markers
FE-033 Comparable Markers
FE-034 Layer Control
FE-035 Map/List Synchronization

FE-040 Parcel Inspector
FE-041 Basic Information
FE-042 Geometry
FE-043 Provenance

FE-050 Transactions
FE-051 Transaction List
FE-052 Transaction Detail
FE-053 Statistics

FE-060 Comparable
FE-061 Candidate List
FE-062 Ranking
FE-063 Map Visualization
FE-064 Comparable Detail

FE-070 GIS/Road
FE-071 Road Adjacency
FE-072 Road Distance
FE-073 Road Width
FE-074 GIS Status

FE-080 Valuation
FE-081 Bear/Base/Bull
FE-082 Confidence
FE-083 Inputs
FE-084 Provenance
FE-085 Insufficient Data

FE-090 Satellite
FE-091 Street View

FE-100 Error/Loading/Empty
FE-101 API Errors
FE-102 Loading
FE-103 Empty State

FE-110 Security
FE-120 E2E
FE-130 Performance
FE-140 Accessibility

FE-200 Final Frontend Verification
```

---

# 79. Frontend Gate System

Frontend must use explicit gates.

```text
GATE-FE-010 Search
GATE-FE-020 Filter
GATE-FE-030 Map
GATE-FE-040 Parcel
GATE-FE-050 Transaction
GATE-FE-060 Comparable
GATE-FE-070 GIS/Road
GATE-FE-080 Valuation
GATE-FE-090 Street View
GATE-FE-100 Error Handling
GATE-FE-120 E2E
GATE-FE-200 Release
```

---

# 80. Gate Rule

Gate status:

```text
PASS
FAIL
BLOCKED
```

A gate cannot be marked PASS if any critical acceptance test fails.

---

# 81. Evidence Requirements

Every gate requires evidence.

Example:

```text
evidence/frontend/
├── FE-010/
├── FE-020/
├── FE-030/
├── FE-040/
├── FE-050/
├── FE-060/
├── FE-070/
├── FE-080/
├── FE-090/
├── FE-100/
├── FE-120/
└── FE-200/
```

Evidence may include:

```text
test output
screenshots
API response
browser console
network trace
video
performance result
```

---

# 82. Screenshot Verification

Critical UI workflows must have screenshot evidence.

Minimum:

```text
1. Initial application
2. Search results
3. Selected parcel
4. Transaction panel
5. Comparable panel
6. Valuation panel
7. Satellite
8. Street View
9. Error state
10. Provenance
```

---

# 83. Browser Console Rule

Release verification must confirm:

```text
No uncaught exceptions
No React runtime errors
No failed required API requests
No broken map initialization
```

Warnings may exist only if documented and non-blocking.

---

# 84. Network Verification

Browser Network inspection must confirm:

```text
Search → correct API
Parcel → correct API
Transaction → correct API
Comparable → correct API
Valuation → correct API
Street View → correct service
```

No undocumented endpoint may be silently required.

---

# 85. Mock Detection

Production build verification must search for:

```text
mock
fixture
fake
dummy
hardcoded
TODO
localhost
example.com
```

Any production-path occurrence requires review.

---

# 86. Release Criteria

Frontend Release requires:

```text
All critical FE tasks VERIFIED
AND
All FE gates PASS
AND
All E2E tests PASS
AND
No blocker defects
AND
No fake production data
AND
API contracts verified
AND
Provenance visible
```

---

# 87. Definition of Done

Frontend is `DONE` only when:

```text
Search                    PASS
Filter                    PASS
Map                       PASS
Parcel Inspector          PASS
Transactions              PASS
Comparable                PASS
GIS/Road                  PASS
Valuation                 PASS
Satellite                 PASS
Street View               PASS
Loading/Error/Empty       PASS
Provenance                PASS
Security                  PASS
E2E                       PASS
Performance               PASS
Accessibility             PASS
```

---

# 88. Final Frontend Verification Matrix

| Domain | Required | Verification |
|---|---:|---|
| Search | YES | FE-SEARCH |
| Filter | YES | FE-FILTER |
| Map | YES | FE-MAP |
| Parcel | YES | FE-PARCEL |
| Transaction | YES | FE-TX |
| Comparable | YES | FE-COMP |
| GIS | YES | FE-GIS |
| Road | YES | FE-ROAD |
| Valuation | YES | FE-VAL |
| Satellite | YES | FE-MAP |
| Street View | YES | FE-SV |
| Error Handling | YES | FE-ERR |
| Provenance | YES | FE-PROV |
| E2E | YES | FE-E2E |
| Security | YES | FE-SEC |
| Performance | YES | FE-PERF |
| Accessibility | YES | FE-A11Y |

---

# 89. Absolute Prohibitions

Agent MUST NOT:

```text
1. Declare frontend complete because map renders.
2. Replace backend analytical results with frontend calculations.
3. Hardcode production transaction data.
4. Hardcode parcel geometry.
5. Invent road width.
6. Invent comparable scores.
7. Invent valuation.
8. Hide missing data.
9. Convert UNKNOWN to false/no.
10. Remove provenance.
11. Remove failing tests to obtain PASS.
12. Modify acceptance criteria to match implementation.
13. Disable API validation.
14. Silently fall back to fake data.
```

---

# 90. Agent Completion Protocol

Before declaring Frontend complete, Agent must produce:

```text
FRONTEND_IMPLEMENTATION_REPORT.md
FRONTEND_VERIFICATION_REPORT.md
```

The report must contain:

```text
Task ID
Implementation Status
Test Status
Acceptance Status
Evidence Path
Known Issues
Gate Status
```

---

# 91. Final Rule

The following statements are normative:

> **Map rendering ≠ Frontend completion.**

> **Component rendering ≠ Feature completion.**

> **Feature implementation ≠ Verification.**

> **Passing tests without evidence ≠ Verified.**

> **Frontend-generated analytical results ≠ Authoritative results.**

> **Missing data must remain missing.**

> **UNKNOWN must remain UNKNOWN.**

> **No provenance = No trusted analytical result.**

Final state:

```text
IMPLEMENTED
    ↓
TESTED
    ↓
VERIFIED
    ↓
EVIDENCE LOCKED
    ↓
FRONTEND RELEASE
```

Only `FRONTEND RELEASE` may be reported as:

```text
Frontend Complete
```

---

# 92. Cross-Document Dependencies

This specification depends on:

```text
SPEC.md
DATA_MODEL.md
MCP_API.md
GIS_SPEC.md
VALUATION_SPEC.md
IMPLEMENTATION_PLAN.md
VERIFICATION_MANUAL.md
AGENT_TASKS.md
```

Priority:

```text
SPEC.md
    ↓
DATA_MODEL / MCP_API / GIS / VALUATION
    ↓
FRONTEND_SPEC.md
    ↓
IMPLEMENTATION
    ↓
VERIFICATION_MANUAL.md
    ↓
RELEASE GATE
```

If a conflict exists, Agent MUST NOT silently choose an implementation.

Conflict handling:

```text
detect conflict
    ↓
create CHANGE_REQUEST.md
    ↓
block affected task
    ↓
resolve specification
    ↓
resume implementation
```

---

# 93. Version

```text
FRONTEND_SPEC_VERSION = 2.0
STATUS = NORMATIVE
```