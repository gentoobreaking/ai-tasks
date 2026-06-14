import pptxgen from "pptxgenjs";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3" × 7.5"
pres.title = "廈門旅遊攻略";
pres.author = "OpenClaw 寶寶";
pres.subject = "7天與14天完整旅遊方案";

// ── Color palette (Ocean Gradient) ──────────────────────────
const C = {
  deepBlue:  "065A82",
  teal:      "1C7293",
  lightTeal: "E8F4F8",
  midnight:  "1B3A4B",
  gold:      "D4A017",
  white:     "FFFFFF",
  dark:      "1E3A4A",
  gray:      "64748B",
  lightGray: "F1F5F9",
  warmGray:  "E2E8F0",
};

// ── Helpers ─────────────────────────────────────────────────
const makeShadow = () => ({ type:"outer", color:"000000", opacity:0.12, blur:8, offset:3, angle:135 });

function addFooter(slide, pageNum, total) {
  slide.addText(`${pageNum} / ${total}`, {
    x:12.6, y:7.1, w:0.6, h:0.3,
    fontSize:9, color:C.gray, align:"right", margin:0
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x:0, y:7.3, w:13.3, h:0.2,
    fill:{color:C.deepBlue}
  });
}

function sectionTag(slide, text, x=0.5, y=0.4) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w:1.4, h:0.28,
    fill:{color:C.gold}, rectRadius:0.04
  });
  slide.addText(text, {
    x, y, w:1.4, h:0.28,
    fontSize:9, bold:true, color:C.dark,
    align:"center", valign:"middle", margin:0
  });
}

function titleSlide(pres, text, subtitle="") {
  const s = pres.addSlide();
  s.background = { color: C.midnight };
  // Decorative top bar
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.3, h:0.15, fill:{color:C.gold} });
  // Left accent bar
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:0.08, h:7.5, fill:{color:C.teal} });
  // Main title
  s.addText(text, {
    x:0.8, y:2.2, w:11.5, h:1.6,
    fontSize:48, bold:true, color:C.white,
    fontFace:"Microsoft JhengHei", margin:0
  });
  if (subtitle) {
    s.addText(subtitle, {
      x:0.8, y:4.0, w:11.5, h:0.6,
      fontSize:20, color:C.teal,
      fontFace:"Microsoft JhengHei", margin:0
    });
  }
  // Bottom bar
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:7.1, w:13.3, h:0.4, fill:{color:C.deepBlue} });
  s.addText("🏝️ 廈門 · 2026  |  OpenClaw 智能旅遊攻略", {
    x:0, y:7.1, w:13.3, h:0.4,
    fontSize:11, color:C.white, align:"center", valign:"middle", margin:0
  });
  return s;
}

// ═══════════════════════════════════════════════════════════════
// SLIDE 1 — Cover
// ═══════════════════════════════════════════════════════════════
titleSlide(pres, "廈門深度旅遊攻略", "7 天 × 14 天　·　吃住交通費用全指南");

// ═══════════════════════════════════════════════════════════════
// SLIDE 2 — Table of Contents
// ═══════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.lightGray };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.3, h:0.08, fill:{color:C.deepBlue} });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:0.08, h:7.5, fill:{color:C.teal} });

  s.addText("目錄", {
    x:0.6, y:0.4, w:5, h:0.7,
    fontSize:36, bold:true, color:C.midnight, fontFace:"Microsoft JhengHei", margin:0
  });
  s.addText("CONTENTS", {
    x:0.6, y:1.0, w:5, h:0.35,
    fontSize:13, color:C.gray, fontFace:"Arial", charSpacing:4, margin:0
  });

  const tocLeft = [
    { num:"01", title:"基本資訊", sub:"氣候·簽證·機票·支付" },
    { num:"02", title:"景點地圖", sub:"必去景點·島內/島外" },
    { num:"03", title:"美食地圖", sub:"必吃小吃·推薦餐廳" },
    { num:"04", title:"住宿推薦", sub:"分區指南·價位參考" },
  ];
  const tocRight = [
    { num:"05", title:"交通攻略", sub:"高鐵·捷運·輪渡" },
    { num:"06", title:"7 天方案", sub:"每日行程·精華深度遊" },
    { num:"07", title:"14 天方案", sub:"完整探索·土樓延伸" },
    { num:"08", title:"費用預估", sub:"三級預算·分項明細" },
  ];

  tocLeft.forEach((item, i) => {
    const y = 1.7 + i * 1.3;
    s.addShape(pres.shapes.RECTANGLE, { x:0.5, y, w:5.8, h:1.0,
      fill:{color:C.white}, shadow:makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x:0.5, y, w:0.06, h:1.0, fill:{color:C.deepBlue} });
    s.addText(item.num, { x:0.7, y:y+0.1, w:0.6, h:0.4,
      fontSize:20, bold:true, color:C.deepBlue, margin:0 });
    s.addText(item.title, { x:1.35, y:y+0.1, w:3, h:0.4,
      fontSize:16, bold:true, color:C.dark, fontFace:"Microsoft JhengHei", margin:0 });
    s.addText(item.sub, { x:1.35, y:y+0.55, w:4.5, h:0.3,
      fontSize:11, color:C.gray, margin:0 });
  });

  tocRight.forEach((item, i) => {
    const y = 1.7 + i * 1.3;
    s.addShape(pres.shapes.RECTANGLE, { x:6.8, y, w:5.8, h:1.0,
      fill:{color:C.white}, shadow:makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x:6.8, y, w:0.06, h:1.0, fill:{color:C.teal} });
    s.addText(item.num, { x:7.0, y:y+0.1, w:0.6, h:0.4,
      fontSize:20, bold:true, color:C.teal, margin:0 });
    s.addText(item.title, { x:7.65, y:y+0.1, w:3, h:0.4,
      fontSize:16, bold:true, color:C.dark, fontFace:"Microsoft JhengHei", margin:0 });
    s.addText(item.sub, { x:7.65, y:y+0.55, w:4.5, h:0.3,
      fontSize:11, color:C.gray, margin:0 });
  });

  addFooter(s, 2, 13);
}

// ═══════════════════════════════════════════════════════════════
// SLIDE 3 — 基本資訊
// ═══════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.3, h:0.08, fill:{color:C.deepBlue} });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:0.08, h:7.5, fill:{color:C.teal} });
  sectionTag(s, "基本資訊");
  s.addText("Basic Travel Info", {
    x:2.0, y:0.4, w:4, h:0.3, fontSize:11, color:C.gray, margin:0
  });

  const infoCards = [
    { icon:"🛫", label:"如何抵達", items:["小三通：金門→廈門（船1hr+巴）","直飛：台北→廈門高崎機場（1.5hr）","高鐵：經小三通或香港轉機"] },
    { icon:"🌤️", label:"最佳旅季", items:["3-5月（春）：櫻花、油菜花","9-11月（秋）：涼爽乾燥","避開7-8月颱風季"] },
    { icon:"📋", label:"證件準備", items:["台胞證（確認有效期）","一次簽（出發前申請）"] },
    { icon:"💳", label:"支付方式", items:["支付寶 / 微信支付（主要）","現金備用（路邊小吃）"] },
    { icon:"🌡️", label:"氣候穿著", items:["亞熱帶海島氣候","春秋：薄外套必備","夏季：防曬+雨具"] },
    { icon:"📱", label:"必備工具", items:["支付寶（實名認證）","微信（訂船票/滴滴）","離線地圖下載"] },
  ];

  infoCards.forEach((card, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.5 + col * 4.2;
    const y = 1.1 + row * 3.0;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w:3.9, h:2.7,
      fill:{color:C.lightTeal}, shadow:makeShadow() });
    s.addText(card.icon, { x:x+0.15, y:y+0.15, w:0.5, h:0.5, fontSize:22, margin:0 });
    s.addText(card.label, { x:x+0.7, y:y+0.2, w:3, h:0.35,
      fontSize:14, bold:true, color:C.dark, fontFace:"Microsoft JhengHei", margin:0 });
    s.addText(
      card.items.map((item, j) => ({ text:item, options:{ bullet:true, breakLine:j<card.items.length-1 } })),
      { x:x+0.15, y:y+0.65, w:3.6, h:1.9, fontSize:11, color:C.dark, fontFace:"Microsoft JhengHei" }
    );
  });

  addFooter(s, 3, 13);
}

// ═══════════════════════════════════════════════════════════════
// SLIDE 4 — 景點地圖
// ═══════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.3, h:0.08, fill:{color:C.deepBlue} });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:0.08, h:7.5, fill:{color:C.teal} });
  sectionTag(s, "景點地圖");
  s.addText("景點地圖", {
    x:2.0, y:0.4, w:4, h:0.4,
    fontSize:28, bold:true, color:C.midnight, fontFace:"Microsoft JhengHei", margin:0
  });

  // Left: Core attractions
  s.addShape(pres.shapes.RECTANGLE, { x:0.5, y:0.9, w:6.0, h:6.1,
    fill:{color:C.lightGray}, shadow:makeShadow() });
  s.addText("🔴 核心必去景點", {
    x:0.7, y:1.05, w:5.5, h:0.35,
    fontSize:14, bold:true, color:C.deepBlue, fontFace:"Microsoft JhengHei", margin:0
  });
  const coreAttractions = [
    { name:"鼓浪嶼", desc:"世界文化遺產 · 萬國建築博覽", fee:"船票35 CNY往返" },
    { name:"日光岩", desc:"鼓浪嶼制高點 · 俯瞰全島", fee:"30 CNY" },
    { name:"南普陀寺", desc:"閩南佛教聖地 · 香火鼎盛", fee:"免費" },
    { name:"廈門大學", desc:"中國最美校園 · 嘉庚建築", fee:"免費（需預約）" },
    { name:"環島路", desc:"海岸線騎行 · 黃厝海灘", fee:"免費" },
    { name:"曾厝垵", desc:"文創漁村 · 小吃匯集", fee:"免費" },
    { name:"中山路步行街", desc:"百年騎樓老街", fee:"免費" },
    { name:"園林植物園", desc:"雨林世界 · 多肉植物", fee:"30 CNY" },
  ];
  coreAttractions.forEach((a, i) => {
    const y = 1.5 + i * 0.68;
    s.addShape(pres.shapes.OVAL, { x:0.75, y:y+0.1, w:0.18, h:0.18,
      fill:{color:C.deepBlue} });
    s.addText(a.name, { x:1.05, y:y, w:2.2, h:0.3,
      fontSize:12, bold:true, color:C.dark, fontFace:"Microsoft JhengHei", margin:0 });
    s.addText(a.desc, { x:1.05, y:y+0.28, w:3.8, h:0.25,
      fontSize:9.5, color:C.gray, fontFace:"Microsoft JhengHei", margin:0 });
    s.addText(a.fee, { x:4.85, y:y+0.12, w:1.5, h:0.25,
      fontSize:9, color:C.gold, align:"right", margin:0 });
  });

  // Right: Extended attractions
  s.addShape(pres.shapes.RECTANGLE, { x:6.8, y:0.9, w:6.0, h:6.1,
    fill:{color:C.lightGray}, shadow:makeShadow() });
  s.addText("🟡 島外延伸景點", {
    x:7.0, y:1.05, w:5.5, h:0.35,
    fontSize:14, bold:true, color:C.teal, fontFace:"Microsoft JhengHei", margin:0
  });
  const extAttractions = [
    { name:"集美學村", desc:"嘉庚建築群 · 閩南華僑教育", fee:"免費" },
    { name:"南靖土樓", desc:"世界文化遺產 · 四菜一湯", fee:"100-130 CNY" },
    { name:"雲水謠古鎮", desc:"電影取景地 · 千年古道", fee:"含於土樓票" },
    { name:"鐵路公園", desc:"廢棄鐵路改造 · 年輕人最愛", fee:"免費" },
    { name:"胡里山炮台", desc:"清末海防 · 紅夷火炮", fee:"25 CNY" },
    { name:"八市老街", desc:"傳統海鮮市場 · 在地生活", fee:"免費" },
    { name:"白鷺洲公園", desc:"白鷺棲息地 · 咖啡休閒", fee:"免費" },
  ];
  extAttractions.forEach((a, i) => {
    const y = 1.5 + i * 0.68;
    s.addShape(pres.shapes.OVAL, { x:7.05, y:y+0.1, w:0.18, h:0.18,
      fill:{color:C.teal} });
    s.addText(a.name, { x:7.35, y:y, w:2.5, h:0.3,
      fontSize:12, bold:true, color:C.dark, fontFace:"Microsoft JhengHei", margin:0 });
    s.addText(a.desc, { x:7.35, y:y+0.28, w:4.0, h:0.25,
      fontSize:9.5, color:C.gray, fontFace:"Microsoft JhengHei", margin:0 });
    s.addText(a.fee, { x:11.4, y:y+0.12, w:1.3, h:0.25,
      fontSize:9, color:C.gold, align:"right", margin:0 });
  });

  addFooter(s, 4, 13);
}

// ═══════════════════════════════════════════════════════════════
// SLIDE 5 — 美食地圖
// ═══════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.3, h:0.08, fill:{color:C.deepBlue} });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:0.08, h:7.5, fill:{color:C.teal} });
  sectionTag(s, "美食地圖");
  s.addText("必吃美食 · 在地餐廳", {
    x:2.0, y:0.4, w:6, h:0.4,
    fontSize:28, bold:true, color:C.midnight, fontFace:"Microsoft JhengHei", margin:0
  });

  const foods = [
    { emoji:"🍜", name:"沙茶麵", desc:"廈門靈魂美食，沙茶醬湯底", price:"15-25", loc:"四里/月華沙茶面" },
    { emoji:"🦪", name:"海蠣煎", desc:"蛋香酥脆+鮮嫩海蠣", price:"20-30", loc:"八市·蓮花公園" },
    { emoji:"🧊", name:"土筍凍", desc:"海蟲膠質，Q彈，配蒜醋", price:"8-15", loc:"曾厝垵路邊" },
    { emoji:"🍲", name:"薑母鴨", desc:"冬季進補，藥膳燉煮", price:"60-80", loc:"好口味煎蟹館" },
    { emoji:"🫘", name:"花生湯", desc:"軟糯香甜，熱食暖胃", price:"8-10", loc:"黃則和（中山路）" },
    { emoji:"🥟", name:"肉燕", desc:"薄皮鮮肉餛飩", price:"10-15", loc:"路邊老店" },
    { emoji:"🍖", name:"同安封肉", desc:"閩南經典大菜", price:"40-60", loc:"當地餐館" },
    { emoji:"🥞", name:"滿煎糕", desc:"八市老字號，甜香軟糯", price:"5-8", loc:"八市鐘麗君" },
  ];

  foods.forEach((f, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 0.5 + col * 3.15;
    const y = 1.1 + row * 3.0;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w:3.0, h:2.7,
      fill:{color:C.lightTeal}, shadow:makeShadow() });
    s.addText(f.emoji, { x:x+0.15, y:y+0.1, w:0.5, h:0.5, fontSize:24, margin:0 });
    s.addText(f.name, { x:x+0.15, y:y+0.65, w:2.7, h:0.35,
      fontSize:14, bold:true, color:C.dark, fontFace:"Microsoft JhengHei", margin:0 });
    s.addText(f.desc, { x:x+0.15, y:y+1.05, w:2.7, h:0.7,
      fontSize:10, color:C.gray, fontFace:"Microsoft JhengHei", margin:0 });
    s.addShape(pres.shapes.RECTANGLE, { x:x+0.15, y:y+1.85, w:2.7, h:0.3,
      fill:{color:C.deepBlue, transparency:85} });
    s.addText(`💰 ${f.price} CNY/人`, { x:x+0.15, y:y+1.85, w:1.5, h:0.3,
      fontSize:10, bold:true, color:C.deepBlue, valign:"middle", margin:0 });
    s.addText(`📍 ${f.loc}`, { x:x+1.6, y:y+1.85, w:1.25, h:0.3,
      fontSize:8.5, color:C.teal, valign:"middle", align:"right", margin:0 });
  });

  addFooter(s, 5, 13);
}

// ═══════════════════════════════════════════════════════════════
// SLIDE 6 — 住宿推薦
// ═══════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.3, h:0.08, fill:{color:C.deepBlue} });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:0.08, h:7.5, fill:{color:C.teal} });
  sectionTag(s, "住宿推薦");
  s.addText("分區指南 · 價位參考", {
    x:2.0, y:0.4, w:6, h:0.4,
    fontSize:28, bold:true, color:C.midnight, fontFace:"Microsoft JhengHei", margin:0
  });

  const zones = [
    { zone:"中山路 / 鎮海路", emoji:"🏙️", desc:"老城核心，交通樞紐，小吃集中", best:"首選，交通方便", price:"300-600" },
    { zone:"曾厝垵", emoji:"🏖️", desc:"文青民宿聚集，海邊，價格實惠", best:"年輕人·背包客", price:"200-400" },
    { zone:"環島路 / 黃厝", emoji:"🌅", desc:"海景民宿，沙灘直達，景色絕佳", best:"情侶·度假", price:"400-800" },
    { zone:"鼓浪嶼島上", emoji:"🏝️", desc:"百年別墅民宿，體驗慢島生活", best:"深度遊（住1晚）", price:"500-1200" },
    { zone:"集美區", emoji:"🎓", desc:"親近自然，價格實惠，遠離喧囂", best:"預算型", price:"150-350" },
  ];

  zones.forEach((z, i) => {
    const x = 0.5 + i * 2.5;
    const w = 2.35;
    s.addShape(pres.shapes.RECTANGLE, { x, y:1.1, w, h:5.9,
      fill:{color:C.lightGray}, shadow:makeShadow() });
    // Top colored bar
    const barColor = i === 0 ? C.deepBlue : i === 3 ? C.teal : C.dark;
    s.addShape(pres.shapes.RECTANGLE, { x, y:1.1, w, h:0.6, fill:{color:barColor} });
    s.addText(z.emoji, { x, y:1.15, w, h:0.5,
      fontSize:22, align:"center", valign:"middle", margin:0 });
    s.addText(z.zone, { x:x+0.1, y:1.85, w:w-0.2, h:0.55,
      fontSize:11, bold:true, color:C.dark, fontFace:"Microsoft JhengHei",
      align:"center", margin:0 });
    s.addText(z.desc, { x:x+0.1, y:2.45, w:w-0.2, h:1.0,
      fontSize:9.5, color:C.gray, fontFace:"Microsoft JhengHei", margin:0 });
    s.addShape(pres.shapes.RECTANGLE, { x:x+0.1, y:3.55, w:w-0.2, h:0.3,
      fill:{color:C.gold, transparency:80} });
    s.addText(`✅ ${z.best}`, { x:x+0.1, y:3.55, w:w-0.2, h:0.3,
      fontSize:9, bold:true, color:C.gold, align:"center", valign:"middle", margin:0 });
    s.addText(`${z.price}\nCNY/晚`, {
      x:x+0.1, y:4.1, w:w-0.2, h:0.7,
      fontSize:16, bold:true, color:C.deepBlue, align:"center", valign:"middle",
      fontFace:"Microsoft JhengHei", margin:0
    });
    s.addText("雙人房", { x:x+0.1, y:4.85, w:w-0.2, h:0.25,
      fontSize:9, color:C.gray, align:"center", margin:0 });
  });

  addFooter(s, 6, 13);
}

// ═══════════════════════════════════════════════════════════════
// SLIDE 7 — 交通攻略
// ═══════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.3, h:0.08, fill:{color:C.deepBlue} });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:0.08, h:7.5, fill:{color:C.teal} });
  sectionTag(s, "交通攻略");
  s.addText("外部交通 · 市内交通 · 鼓浪嶼輪渡", {
    x:2.0, y:0.4, w:9, h:0.4,
    fontSize:26, bold:true, color:C.midnight, fontFace:"Microsoft JhengHei", margin:0
  });

  // Three columns
  const transport = [
    {
      title:"🛫 外部交通",
      color:C.deepBlue,
      items:[
        { label:"小三通", val:"金門→廈門船（30分）+巴", fee:"" },
        { label:"直飛", val:"台北→高崎機場（1.5hr）", fee:"" },
        { label:"高崎機場", val:"島內，捷運1號線直達市區", fee:"" },
        { label:"廈門站", val:"思明區，最近市區", fee:"" },
        { label:"廈門北站", val:"島外，捷運1號線約40分", fee:"" },
      ]
    },
    {
      title:"🚇 市内交通",
      color:C.teal,
      items:[
        { label:"捷運", val:"1/2/3號線覆蓋核心景點", fee:"2-7 CNY/程" },
        { label:"BRT", val:"快速公交，覆蓋島內主幹線", fee:"1-4 CNY/程" },
        { label:"公交", val:"線路密集支付寶可刷", fee:"1-2 CNY/程" },
        { label:"共享單車", val:"環島路騎行最佳", fee:"1-3 CNY/30分" },
        { label:"滴滴/出租", val:"島內短程，避開高峰期", fee:"10-40 CNY/程" },
      ]
    },
    {
      title:"⛴️ 鼓浪嶼輪渡",
      color:C.gold,
      items:[
        { label:"購票", val:"微信搜「廈門輪渡」公眾號", fee:"" },
        { label:"航線", val:"遊客從厦鼓碼頭（東渡）出發", fee:"" },
        { label:"船票", val:"往返35 CNY（普通艙）", fee:"35 CNY往返" },
        { label:"提前預訂", val:"節假日提前5天，平日1-2天", fee:"" },
        { label:"TIP", val:"千萬不要找黃牛！", fee:"" },
      ]
    },
  ];

  transport.forEach((col, i) => {
    const x = 0.5 + i * 4.2;
    s.addShape(pres.shapes.RECTANGLE, { x, y:1.0, w:3.9, h:5.8,
      fill:{color:C.lightGray}, shadow:makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y:1.0, w:3.9, h:0.55, fill:{color:col.color} });
    s.addText(col.title, { x, y:1.05, w:3.9, h:0.45,
      fontSize:14, bold:true, color:C.white, align:"center", valign:"middle",
      fontFace:"Microsoft JhengHei", margin:0 });
    col.items.forEach((item, j) => {
      const y = 1.7 + j * 0.95;
      s.addShape(pres.shapes.RECTANGLE, { x:x+0.1, y, w:3.7, h:0.8,
        fill:{color:C.white}, shadow:makeShadow() });
      s.addText(item.label, { x:x+0.2, y:y+0.05, w:1.2, h:0.3,
        fontSize:10, bold:true, color:col.color, margin:0 });
      s.addText(item.val, { x:x+0.2, y:y+0.35, w:3.4, h:0.35,
        fontSize:10, color:C.dark, fontFace:"Microsoft JhengHei", margin:0 });
      if (item.fee) {
        s.addText(item.fee, { x:x+0.2, y:y+0.52, w:3.4, h:0.25,
          fontSize:9, color:C.gold, margin:0 });
      }
    });
  });

  addFooter(s, 7, 13);
}

// ═══════════════════════════════════════════════════════════════
// SLIDE 8 — 7天方案 Day 1-4
// ═══════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.midnight };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.3, h:0.08, fill:{color:C.gold} });
  sectionTag(s, "7 天方案", 0.5, 0.4);
  s.addText("7-Day Itinerary · Days 1–4", {
    x:2.0, y:0.4, w:6, h:0.4,
    fontSize:26, bold:true, color:C.white, fontFace:"Microsoft JhengHei", margin:0
  });

  const days = [
    { day:"D1", theme:"抵達 · 中山路初探", emoji:"🛬",
      content:"抵達廈門 → 入住中山路 → 中山路步行街 → 八市海鮮市場",
      tips:"推薦：黃則和花生湯 + 肉燕" },
    { day:"D2", theme:"鼓浪嶼（上）", emoji:"🏝️",
      content:"東渡碼頭乘船 → 龍頭路 → 風琴博物館 → 菽莊花園 → 日光岩登頂",
      tips:"提前預訂船票！日落時港仔後沙灘" },
    { day:"D3", theme:"鼓浪嶼（下）· 鐵路公園", emoji:"📸",
      content:"再次上島（遊客少的早晨）→ 國際刻字館 → 蟲洞書店 → 返回 → 鐵路公園",
      tips:"推薦：島上私房菜" },
    { day:"D4", theme:"南普陀 · 厦大 · 環島路", emoji:"🎓",
      content:"南普陀寺祈福+登五老峰 → 厦門大學（預約）→ 芙蓉隧道 → 環島路騎行",
      tips:"厦大需提前在官方系統預約！" },
  ];

  days.forEach((d, i) => {
    const x = 0.4 + i * 3.15;
    s.addShape(pres.shapes.RECTANGLE, { x, y:1.0, w:3.0, h:5.9,
      fill:{color:C.deepBlue}, shadow:makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y:1.0, w:3.0, h:0.9, fill:{color:C.teal} });
    s.addText(`${d.emoji} ${d.day}`, { x:x+0.1, y:1.05, w:2.8, h:0.4,
      fontSize:16, bold:true, color:C.white, margin:0 });
    s.addText(d.theme, { x:x+0.1, y:1.5, w:2.8, h:0.35,
      fontSize:11, color:C.lightTeal, fontFace:"Microsoft JhengHei", margin:0 });
    s.addShape(pres.shapes.RECTANGLE, { x:x+0.15, y:2.0, w:2.7, h:0.03,
      fill:{color:C.gold} });
    s.addText(d.content, { x:x+0.15, y:2.15, w:2.7, h:2.5,
      fontSize:10.5, color:C.white, fontFace:"Microsoft JhengHei", margin:0 });
    s.addShape(pres.shapes.RECTANGLE, { x:x+0.15, y:4.75, w:2.7, h:0.03,
      fill:{color:C.gold, transparency:50} });
    s.addText(`💡 ${d.tips}`, { x:x+0.15, y:4.85, w:2.7, h:0.8,
      fontSize:9.5, color:C.gold, fontFace:"Microsoft JhengHei", margin:0 });
  });

  addFooter(s, 8, 13);
}

// ═══════════════════════════════════════════════════════════════
// SLIDE 9 — 7天方案 Day 5-7
// ═══════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.midnight };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.3, h:0.08, fill:{color:C.gold} });
  sectionTag(s, "7 天方案", 0.5, 0.4);
  s.addText("7-Day Itinerary · Days 5–7", {
    x:2.0, y:0.4, w:6, h:0.4,
    fontSize:26, bold:true, color:C.white, fontFace:"Microsoft JhengHei", margin:0
  });

  const days = [
    { day:"D5", theme:"園林植物園 · 沙坡尾", emoji:"🌿",
      content:"園林植物園（雨林世界+多肉）→ 沙坡尾文創 → 頂澳仔貓街 → 白鷺洲公園",
      tips:"植物園07:00-09:00最佳（有霧氣）" },
    { day:"D6", theme:"集美學村 · 十里長堤", emoji:"🚝",
      content:"地鐵1號線海上列車 → 集美學村 → 鱷園 → 十里長堤日落",
      tips:"地鐵1號線日落時分段超美！拍照聖地" },
    { day:"D7", theme:"最後巡禮 · 回程", emoji:"✈️",
      content:"自然醒 → 曾厝垵最後採買 → 伴手禮：南普陀素餅、餡餅 → 返程",
      tips:"記得帶上南普陀素餅！必備伴手禮" },
  ];

  days.forEach((d, i) => {
    const x = 0.4 + i * 4.2;
    s.addShape(pres.shapes.RECTANGLE, { x, y:1.0, w:4.0, h:5.9,
      fill:{color:C.deepBlue}, shadow:makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y:1.0, w:4.0, h:0.9, fill:{color:C.teal} });
    s.addText(`${d.emoji} ${d.day}`, { x:x+0.15, y:1.05, w:3.7, h:0.4,
      fontSize:18, bold:true, color:C.white, margin:0 });
    s.addText(d.theme, { x:x+0.15, y:1.5, w:3.7, h:0.35,
      fontSize:12, color:C.lightTeal, fontFace:"Microsoft JhengHei", margin:0 });
    s.addShape(pres.shapes.RECTANGLE, { x:x+0.2, y:2.0, w:3.6, h:0.03,
      fill:{color:C.gold} });
    s.addText(d.content, { x:x+0.2, y:2.15, w:3.6, h:2.5,
      fontSize:11, color:C.white, fontFace:"Microsoft JhengHei", margin:0 });
    s.addShape(pres.shapes.RECTANGLE, { x:x+0.2, y:4.75, w:3.6, h:0.03,
      fill:{color:C.gold, transparency:50} });
    s.addText(`💡 ${d.tips}`, { x:x+0.2, y:4.85, w:3.6, h:0.8,
      fontSize:10, color:C.gold, fontFace:"Microsoft JhengHei", margin:0 });
  });

  // Summary box
  s.addShape(pres.shapes.RECTANGLE, { x:0.4, y:7.0, w:12.5, h:0.0, fill:{color:C.white} });
  s.addText("💰 7天人均預算：經濟型 ≈ 12,000 TWD ｜ 舒適型 ≈ 24,000 TWD ｜ 輕奢型 ≈ 35,000+ TWD", {
    x:0.4, y:6.9, w:12.5, h:0.3,
    fontSize:11, color:C.gold, bold:true, align:"center", margin:0
  });

  addFooter(s, 9, 13);
}

// ═══════════════════════════════════════════════════════════════
// SLIDE 10 — 14天方案
// ═══════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.3, h:0.08, fill:{color:C.deepBlue} });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:0.08, h:7.5, fill:{color:C.teal} });
  sectionTag(s, "14 天方案");
  s.addText("14-Day Complete Itinerary", {
    x:2.0, y:0.4, w:6, h:0.4,
    fontSize:26, bold:true, color:C.midnight, fontFace:"Microsoft JhengHei", margin:0
  });

  // Phase markers
  const phases = [
    { label:"Phase 1", title:"精華深度（Day 1-7）", color:C.deepBlue },
    { label:"Phase 2", title:"島外延伸（Day 8-11）", color:C.teal },
    { label:"Phase 3", title:"互動體驗（Day 12-14）", color:C.gold },
  ];
  phases.forEach((p, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x:0.5+i*4.2, y:1.05, w:3.9, h:0.5,
      fill:{color:p.color} });
    s.addText(`${p.label}: ${p.title}`, { x:0.5+i*4.2, y:1.05, w:3.9, h:0.5,
      fontSize:12, bold:true, color:C.white, align:"center", valign:"middle",
      fontFace:"Microsoft JhengHei", margin:0 });
  });

  const phase1 = [
    { day:"D1-3", content:"鼓浪嶼深度遊（住島上1晚）", emoji:"🏝️" },
    { day:"D4-5", content:"南普陀 + 厦大 + 環島路 + 園林植物園", emoji:"🎓" },
    { day:"D6-7", content:"集美學村 + 十里長堤 + 老城巡禮", emoji:"🚝" },
  ];
  const phase2 = [
    { day:"D8", content:"八市 + 沙坡尾藝術日", emoji:"🎨" },
    { day:"D9", content:"集美完整日（補完嘉庚建築）", emoji:"🏛️" },
    { day:"D10", content:"南靖土樓一日遊（四菜一湯）", emoji:"🏔️" },
    { day:"D11", content:"雲水謠古鎮深度遊", emoji:"🌾" },
  ];
  const phase3 = [
    { day:"D12", content:"島內歷史日（鐵路公園+華僑博物院+胡里山炮台）", emoji:"⚔️" },
    { day:"D13", content:"互動體驗日：帆船出海 / 溫泉 / 科技館", emoji:"⛵" },
    { day:"D14", content:"最後巡禮 + 回程", emoji:"✈️" },
  ];

  function dayList(slide, items, startX, startY, color) {
    items.forEach((item, i) => {
      const y = startY + i * 0.85;
      slide.addShape(pres.shapes.RECTANGLE, { x:startX, y, w:3.9, h:0.72,
        fill:{color:C.lightGray} });
      slide.addShape(pres.shapes.RECTANGLE, { x:startX, y, w:0.06, h:0.72, fill:{color:color} });
      slide.addText(`${item.emoji} ${item.day}`, { x:startX+0.15, y:y+0.05, w:0.9, h:0.3,
        fontSize:10, bold:true, color:color, margin:0 });
      slide.addText(item.content, { x:startX+1.1, y:y+0.1, w:2.7, h:0.55,
        fontSize:9.5, color:C.dark, fontFace:"Microsoft JhengHei", margin:0 });
    });
  }

  dayList(s, phase1, 0.5, 1.7, C.deepBlue);
  dayList(s, phase2, 4.7, 1.7, C.teal);
  dayList(s, phase3, 8.9, 1.7, C.gold);

  // Budget summary
  s.addShape(pres.shapes.RECTANGLE, { x:0.5, y:5.4, w:12.3, h:0.7,
    fill:{color:C.midnight} });
  s.addText("💰 14天人均預算：經濟型 ≈ 25,000 TWD ｜ 舒適型 ≈ 50,000 TWD ｜ 輕奢型 ≈ 80,000+ TWD", {
    x:0.5, y:5.4, w:12.3, h:0.7,
    fontSize:13, bold:true, color:C.gold, align:"center", valign:"middle",
    fontFace:"Microsoft JhengHei", margin:0
  });

  addFooter(s, 10, 13);
}

// ═══════════════════════════════════════════════════════════════
// SLIDE 11 — 費用預估
// ═══════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.3, h:0.08, fill:{color:C.deepBlue} });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:0.08, h:7.5, fill:{color:C.teal} });
  sectionTag(s, "費用預估");
  s.addText("Budget Estimates · 2人總計", {
    x:2.0, y:0.4, w:6, h:0.4,
    fontSize:26, bold:true, color:C.midnight, fontFace:"Microsoft JhengHei", margin:0
  });

  const budgetData = [
    { item:"機票 / 船票", level7:"7,000-12,000", level14:"7,000-12,000", note:"TWD/人" },
    { item:"住宿", level7:"5,200-12,900", level14:"11,200-28,000", note:"TWD（6晚/13晚）" },
    { item:"餐飲", level7:"4,800-9,000", level14:"9,600-18,000", note:"TWD" },
    { item:"交通", level7:"1,500-3,000", level14:"4,800-9,000", note:"TWD" },
    { item:"門票+活動", level7:"3,000-6,000", level14:"12,000-18,000", note:"TWD" },
    { item:"土樓/雲水謠", level7:"—", level14:"3,400-5,200", note:"TWD（2人）" },
    { item:"伴手禮/其他", level7:"2,200-4,300", level14:"4,300-8,600", note:"TWD" },
  ];

  // Table header
  s.addShape(pres.shapes.RECTANGLE, { x:0.5, y:1.1, w:12.3, h:0.55,
    fill:{color:C.deepBlue} });
  const headers = ["項目", "7天合計（TWD）", "14天合計（TWD）", "備註"];
  const colWidths = [3.5, 3.5, 3.5, 1.8];
  let cx = 0.5;
  headers.forEach((h, i) => {
    s.addText(h, { x:cx, y:1.1, w:colWidths[i], h:0.55,
      fontSize:11, bold:true, color:C.white, align:"center", valign:"middle",
      fontFace:"Microsoft JhengHei", margin:0 });
    cx += colWidths[i];
  });

  // Table rows
  budgetData.forEach((row, i) => {
    const y = 1.65 + i * 0.62;
    const bgColor = i % 2 === 0 ? C.lightGray : C.white;
    s.addShape(pres.shapes.RECTANGLE, { x:0.5, y, w:12.3, h:0.62, fill:{color:bgColor} });
    cx = 0.5;
    [row.item, row.level7, row.level14, row.note].forEach((cell, j) => {
      const isHighlight = j === 1 || j === 2;
      s.addText(cell, { x:cx, y, w:colWidths[j], h:0.62,
        fontSize:10.5, bold:isHighlight, color:isHighlight?C.deepBlue:C.dark,
        align:"center", valign:"middle", fontFace:"Microsoft JhengHei", margin:0 });
      cx += colWidths[j];
    });
  });

  // Summary cards
  const summaryData = [
    { label:"經濟型 7天", val:"≈ 24,000", unit:"TWD（2人）/ 人均 ≈ 12,000", color:C.teal },
    { label:"舒適型 7天", val:"≈ 48,000", unit:"TWD（2人）/ 人均 ≈ 24,000", color:C.deepBlue },
    { label:"經濟型 14天", val:"≈ 49,000", unit:"TWD（2人）/ 人均 ≈ 24,500", color:C.teal },
    { label:"舒適型 14天", val:"≈ 99,000", unit:"TWD（2人）/ 人均 ≈ 49,500", color:C.deepBlue },
  ];
  summaryData.forEach((item, i) => {
    const x = 0.5 + i * 3.15;
    s.addShape(pres.shapes.RECTANGLE, { x, y:6.0, w:3.0, h:1.0,
      fill:{color:C.lightTeal}, shadow:makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y:6.0, w:3.0, h:0.3, fill:{color:item.color} });
    s.addText(item.label, { x, y:6.0, w:3.0, h:0.3,
      fontSize:9, bold:true, color:C.white, align:"center", valign:"middle", margin:0 });
    s.addText(item.val, { x, y:6.35, w:3.0, h:0.4,
      fontSize:16, bold:true, color:item.color, align:"center", margin:0 });
    s.addText(item.unit, { x, y:6.75, w:3.0, h:0.2,
      fontSize:7.5, color:C.gray, align:"center", margin:0 });
  });

  addFooter(s, 11, 13);
}

// ═══════════════════════════════════════════════════════════════
// SLIDE 12 — 實用 Tips
// ═══════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.3, h:0.08, fill:{color:C.deepBlue} });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:0.08, h:7.5, fill:{color:C.teal} });
  sectionTag(s, "實用 Tips");
  s.addText("行前準備 · 避坑提醒 · 伴手禮", {
    x:2.0, y:0.4, w:8, h:0.4,
    fontSize:26, bold:true, color:C.midnight, fontFace:"Microsoft JhengHei", margin:0
  });

  const sections = [
    {
      title:"✅ 行前準備",
      color:C.deepBlue,
      items:[
        "台胞證確認有效期，提前申請一次簽",
        "支付寶/微信支付實名認證開通",
        "淘寶買大陸門號卡或開通行動漫遊",
        "厦大、鼓浪嶼船票在官方平台提前預訂",
        "輕裝出行，海島早晚溫差帶薄外套",
      ]
    },
    {
      title:"⚠️ 避坑提醒",
      color:"C0392B",
      items:[
        "鼓浪嶼船票只信「廈門輪渡」公眾號，拒絕黃牛",
        "厦大門票免費，勿買任何「代預約」",
        "機場、火車站堅持用滴滴，避開黑車",
        "八市買海鮮要先問價，選透明標價店家",
        "路上拉客的私人導遊勿輕信，淘寶正規預訂",
      ]
    },
    {
      title:"🎁 伴手禮推薦",
      color:C.gold,
      items:[
        "南普陀素餅（寺內有門市）",
        "鼓浪嶼餡餅（黃金香/陳記）",
        "閩北茶：鐵觀音/岩茶",
        "手工牛軋糖（中山路老店）",
        "桂圓乾（當地特產）",
      ]
    },
  ];

  sections.forEach((sec, i) => {
    const x = 0.5 + i * 4.2;
    s.addShape(pres.shapes.RECTANGLE, { x, y:1.0, w:3.9, h:6.0,
      fill:{color:C.lightGray}, shadow:makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y:1.0, w:3.9, h:0.55, fill:{color:sec.color} });
    s.addText(sec.title, { x, y:1.05, w:3.9, h:0.45,
      fontSize:13, bold:true, color:C.white, align:"center", valign:"middle",
      fontFace:"Microsoft JhengHei", margin:0 });
    sec.items.forEach((item, j) => {
      const y = 1.7 + j * 1.0;
      s.addShape(pres.shapes.RECTANGLE, { x:x+0.1, y, w:3.7, h:0.85,
        fill:{color:C.white}, shadow:makeShadow() });
      s.addText(item, { x:x+0.2, y, w:3.5, h:0.85,
        fontSize:10, color:C.dark, valign:"middle", fontFace:"Microsoft JhengHei", margin:0 });
    });
  });

  addFooter(s, 12, 13);
}

// ═══════════════════════════════════════════════════════════════
// SLIDE 13 — Closing
// ═══════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.midnight };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.3, h:0.15, fill:{color:C.gold} });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:0.08, h:7.5, fill:{color:C.teal} });
  s.addText("祝您旅途愉快！", {
    x:0, y:2.0, w:13.3, h:1.2,
    fontSize:52, bold:true, color:C.white, align:"center",
    fontFace:"Microsoft JhengHei", margin:0
  });
  s.addText("廈門，一座來了就不想走的海上花園", {
    x:0, y:3.3, w:13.3, h:0.6,
    fontSize:22, color:C.teal, align:"center",
    fontFace:"Microsoft JhengHei", margin:0
  });
  s.addShape(pres.shapes.RECTANGLE, { x:4, y:4.2, w:5.3, h:0.03,
    fill:{color:C.gold} });
  s.addText("🏝️ 鼓浪嶼  ·  🌊 環島路  ·  🏛️ 南普陀  ·  🎓 厦大  ·  🌿 園林植物園", {
    x:0, y:4.4, w:13.3, h:0.5,
    fontSize:13, color:C.lightTeal, align:"center", margin:0
  });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:7.1, w:13.3, h:0.4, fill:{color:C.deepBlue} });
  s.addText("📅 攻略版本 2026-04-19  ·  OpenClaw 智能旅遊攻略  ·  請以出行前最新資訊為準", {
    x:0, y:7.1, w:13.3, h:0.4,
    fontSize:10, color:C.white, align:"center", valign:"middle", margin:0
  });
}

// Save
await pres.writeFile({ fileName: "廈門旅遊攻略.pptx" });
console.log("✅ 廈門旅遊攻略.pptx created!");
