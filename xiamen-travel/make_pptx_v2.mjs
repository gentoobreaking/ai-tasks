import pptxgen from "pptxgenjs";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "廈門旅遊攻略";
pres.author = "OpenClaw 寶寶";

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
    x, y, w:1.5, h:0.28,
    fill:{color:C.gold}, rectRadius:0.04
  });
  slide.addText(text, {
    x, y, w:1.5, h:0.28,
    fontSize:9, bold:true, color:C.dark,
    align:"center", valign:"middle", margin:0
  });
}

function titleSlide(pres, text, subtitle="") {
  const s = pres.addSlide();
  s.background = { color: C.midnight };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.3, h:0.15, fill:{color:C.gold} });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:0.08, h:7.5, fill:{color:C.teal} });
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
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:7.1, w:13.3, h:0.4, fill:{color:C.deepBlue} });
  s.addText("🏝️ 廈門 · 2026  |  OpenClaw 智能旅遊攻略", {
    x:0, y:7.1, w:13.3, h:0.4,
    fontSize:11, color:C.white, align:"center", valign:"middle", margin:0
  });
  return s;
}

// ═══════════════ SLIDE 1 — Cover ═══════════════
titleSlide(pres, "廈門深度旅遊攻略", "7 天 × 14 天　·　1人專屬方案　·　吃住交通費用全指南");

// ═══════════════ SLIDE 2 — TOC ═══════════════
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
    fontSize:13, color:C.gray, charSpacing:4, margin:0
  });
  const tocLeft = [
    { num:"01", title:"小三通交通", sub:"套票/分段訂·來回詳細說明" },
    { num:"02", title:"景點地圖", sub:"必去景點·島內/島外" },
    { num:"03", title:"美食地圖", sub:"必吃小吃·推薦餐廳" },
    { num:"04", title:"住宿推薦", sub:"精選飯店民宿名稱與地址" },
  ];
  const tocRight = [
    { num:"05", title:"交通攻略", sub:"高鐵·捷運·輪渡" },
    { num:"06", title:"7 天方案", sub:"每日行程·精華深度遊" },
    { num:"07", title:"14 天方案", sub:"完整探索·土樓延伸" },
    { num:"08", title:"費用預估", sub:"1人單項明細·三級預算" },
  ];
  tocLeft.forEach((item, i) => {
    const y = 1.7 + i * 1.3;
    s.addShape(pres.shapes.RECTANGLE, { x:0.5, y, w:5.8, h:1.0, fill:{color:C.white}, shadow:makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x:0.5, y, w:0.06, h:1.0, fill:{color:C.deepBlue} });
    s.addText(item.num, { x:0.7, y:y+0.1, w:0.6, h:0.4, fontSize:20, bold:true, color:C.deepBlue, margin:0 });
    s.addText(item.title, { x:1.35, y:y+0.1, w:3, h:0.4, fontSize:16, bold:true, color:C.dark, fontFace:"Microsoft JhengHei", margin:0 });
    s.addText(item.sub, { x:1.35, y:y+0.55, w:4.5, h:0.3, fontSize:11, color:C.gray, margin:0 });
  });
  tocRight.forEach((item, i) => {
    const y = 1.7 + i * 1.3;
    s.addShape(pres.shapes.RECTANGLE, { x:6.8, y, w:5.8, h:1.0, fill:{color:C.white}, shadow:makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x:6.8, y, w:0.06, h:1.0, fill:{color:C.teal} });
    s.addText(item.num, { x:7.0, y:y+0.1, w:0.6, h:0.4, fontSize:20, bold:true, color:C.teal, margin:0 });
    s.addText(item.title, { x:7.65, y:y+0.1, w:3, h:0.4, fontSize:16, bold:true, color:C.dark, fontFace:"Microsoft JhengHei", margin:0 });
    s.addText(item.sub, { x:7.65, y:y+0.55, w:4.5, h:0.3, fontSize:11, color:C.gray, margin:0 });
  });
  addFooter(s, 2, 13);
}

// ═══════════════ SLIDE 3 — 小三通交通（NEW）═══════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.3, h:0.08, fill:{color:C.deepBlue} });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:0.08, h:7.5, fill:{color:C.teal} });
  sectionTag(s, "小三通交通");
  s.addText("厦金來回詳細方案", {
    x:2.1, y:0.4, w:6, h:0.4,
    fontSize:26, bold:true, color:C.midnight, fontFace:"Microsoft JhengHei", margin:0
  });

  // 方式一：套票
  s.addShape(pres.shapes.RECTANGLE, { x:0.5, y:0.95, w:5.9, h:5.85,
    fill:{color:C.lightTeal}, shadow:makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x:0.5, y:0.95, w:5.9, h:0.55, fill:{color:C.deepBlue} });
  s.addText("🚢 方式一：套票（推薦）", {
    x:0.5, y:0.95, w:5.9, h:0.55,
    fontSize:13, bold:true, color:C.white, align:"center", valign:"middle",
    fontFace:"Microsoft JhengHei", margin:0
  });

  const tickets = [
    { label:"台灣本島 → 金門", val:"立榮/華信國內線機票" },
    { label:"金門機場 → 水頭碼頭", val:"接駁巴士 + 行李直送" },
    { label:"金門水頭 → 厦門五通", val:"船票（約30分鐘）" },
    { label:"KKday 套票（單程）", val:"含台灣本島→金門機票+接送+船票", fee:"3,600–3,800 TWD" },
    { label:"KKday 套票（來回）", val:"含機票+接送+船票，KKday 143059", fee:"7,200–7,600 TWD" },
    { label:"去哪買", val:"旅行社/淘寶（提前預訂）" },
  ];
  tickets.forEach((item, i) => {
    const y = 1.65 + i * 0.75;
    s.addShape(pres.shapes.RECTANGLE, { x:0.65, y, w:5.6, h:0.65,
      fill:{color:C.white}, shadow:makeShadow() });
    s.addText(item.label, { x:0.8, y:y+0.05, w:2.0, h:0.28,
      fontSize:10, bold:true, color:C.deepBlue, margin:0 });
    s.addText(item.val, { x:0.8, y:y+0.33, w:5.3, h:0.28,
      fontSize:10, color:C.dark, fontFace:"Microsoft JhengHei", margin:0 });
  });
  // 套票 highlight
  s.addShape(pres.shapes.RECTANGLE, { x:0.65, y:5.35, w:5.6, h:0.35,
    fill:{color:C.gold} });
  s.addText("💰 來回套票：KKday 143059 ≈ 7,200–7,600 TWD（單程 3,600–3,800 TWD）", {
    x:0.65, y:5.35, w:5.6, h:0.35,
    fontSize:11, bold:true, color:C.dark, align:"center", valign:"middle",
    fontFace:"Microsoft JhengHei", margin:0
  });

  // 方式二：自訂分段
  s.addShape(pres.shapes.RECTANGLE, { x:6.9, y:0.95, w:5.9, h:5.85,
    fill:{color:C.lightGray}, shadow:makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x:6.9, y:0.95, w:5.9, h:0.55, fill:{color:C.teal} });
  s.addText("⛴️ 方式二：自行分段訂", {
    x:6.9, y:0.95, w:5.9, h:0.55,
    fontSize:13, bold:true, color:C.white, align:"center", valign:"middle",
    fontFace:"Microsoft JhengHei", margin:0
  });

  const diy = [
    { label:"台灣本島 → 金門", val:"立榮/華信機票（自行購買）", fee:"1,500-2,500 TWD" },
    { label:"金門水頭 → 厦門五通", val:"船票（單程）", fee:"130-180 CNY" },
    { label:"厦門五通 → 金門水頭", val:"船票（回程）", fee:"130-180 CNY" },
    { label:"來回船票合計", val:"", fee:"260-360 CNY" },
  ];
  diy.forEach((item, i) => {
    const y = 1.65 + i * 0.9;
    s.addShape(pres.shapes.RECTANGLE, { x:7.05, y, w:5.6, h:0.78,
      fill:{color:C.white}, shadow:makeShadow() });
    s.addText(item.label, { x:7.2, y:y+0.05, w:3.5, h:0.3,
      fontSize:10, bold:true, color:C.teal, margin:0 });
    if (item.val) {
      s.addText(item.val, { x:7.2, y:y+0.33, w:3.5, h:0.28,
        fontSize:9.5, color:C.gray, margin:0 });
    }
    s.addText(item.fee, { x:10.7, y:y+0.1, w:1.8, h:0.3,
      fontSize:10, bold:true, color:C.gold, align:"right", margin:0 });
  });

  // 船班時間表
  s.addShape(pres.shapes.RECTANGLE, { x:7.05, y:5.35, w:5.6, h:1.35,
    fill:{color:C.midnight} });
  s.addText("⏰ 厦金航線參考時刻（厦門五通 → 金門水頭）", {
    x:7.15, y:5.4, w:5.4, h:0.28,
    fontSize:9, bold:true, color:C.gold, margin:0
  });
  s.addText("08:30 / 09:00 / 10:00 / 11:00 / 12:30 / 14:00\n15:30 / 16:30 / 17:00 / 17:30", {
    x:7.15, y:5.7, w:5.4, h:0.5,
    fontSize:10, color:C.white, fontFace:"Microsoft JhengHei", margin:0
  });
  s.addText("⚠️ 2026-04-13停航中，出行前至 ticket.wujiangferry.com.tw 確認", {
    x:7.15, y:6.22, w:5.4, h:0.4,
    fontSize:8.5, color:"FF6B6B", margin:0
  });

  addFooter(s, 3, 13);
}

// ═══════════════ SLIDE 4 — 景點 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.3, h:0.08, fill:{color:C.deepBlue} });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:0.08, h:7.5, fill:{color:C.teal} });
  sectionTag(s, "景點地圖");
  s.addText("景點地圖", {
    x:2.1, y:0.4, w:4, h:0.4,
    fontSize:28, bold:true, color:C.midnight, fontFace:"Microsoft JhengHei", margin:0
  });

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
    s.addShape(pres.shapes.OVAL, { x:0.75, y:y+0.1, w:0.18, h:0.18, fill:{color:C.deepBlue} });
    s.addText(a.name, { x:1.05, y:y, w:2.2, h:0.3, fontSize:12, bold:true, color:C.dark, fontFace:"Microsoft JhengHei", margin:0 });
    s.addText(a.desc, { x:1.05, y:y+0.28, w:3.8, h:0.25, fontSize:9.5, color:C.gray, fontFace:"Microsoft JhengHei", margin:0 });
    s.addText(a.fee, { x:4.85, y:y+0.12, w:1.5, h:0.25, fontSize:9, color:C.gold, align:"right", margin:0 });
  });

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
    s.addShape(pres.shapes.OVAL, { x:7.05, y:y+0.1, w:0.18, h:0.18, fill:{color:C.teal} });
    s.addText(a.name, { x:7.35, y:y, w:2.5, h:0.3, fontSize:12, bold:true, color:C.dark, fontFace:"Microsoft JhengHei", margin:0 });
    s.addText(a.desc, { x:7.35, y:y+0.28, w:4.0, h:0.25, fontSize:9.5, color:C.gray, fontFace:"Microsoft JhengHei", margin:0 });
    s.addText(a.fee, { x:11.4, y:y+0.12, w:1.3, h:0.25, fontSize:9, color:C.gold, align:"right", margin:0 });
  });

  addFooter(s, 4, 13);
}

// ═══════════════ SLIDE 5 — 美食 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.3, h:0.08, fill:{color:C.deepBlue} });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:0.08, h:7.5, fill:{color:C.teal} });
  sectionTag(s, "美食地圖");
  s.addText("必吃美食 · 在地餐廳", {
    x:2.1, y:0.4, w:6, h:0.4,
    fontSize:26, bold:true, color:C.midnight, fontFace:"Microsoft JhengHei", margin:0
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
    s.addShape(pres.shapes.RECTANGLE, { x, y, w:3.0, h:2.7, fill:{color:C.lightTeal}, shadow:makeShadow() });
    s.addText(f.emoji, { x:x+0.15, y:y+0.1, w:0.5, h:0.5, fontSize:24, margin:0 });
    s.addText(f.name, { x:x+0.15, y:y+0.65, w:2.7, h:0.35, fontSize:14, bold:true, color:C.dark, fontFace:"Microsoft JhengHei", margin:0 });
    s.addText(f.desc, { x:x+0.15, y:y+1.05, w:2.7, h:0.7, fontSize:10, color:C.gray, fontFace:"Microsoft JhengHei", margin:0 });
    s.addShape(pres.shapes.RECTANGLE, { x:x+0.15, y:y+1.85, w:2.7, h:0.3, fill:{color:C.deepBlue, transparency:85} });
    s.addText(`💰 ${f.price} CNY/人`, { x:x+0.15, y:y+1.85, w:1.5, h:0.3, fontSize:10, bold:true, color:C.deepBlue, valign:"middle", margin:0 });
    s.addText(`📍 ${f.loc}`, { x:x+1.6, y:y+1.85, w:1.25, h:0.3, fontSize:8.5, color:C.teal, valign:"middle", align:"right", margin:0 });
  });

  addFooter(s, 5, 13);
}

// ═══════════════ SLIDE 6 — 住宿（飯店名稱）═══════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.3, h:0.08, fill:{color:C.deepBlue} });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:0.08, h:7.5, fill:{color:C.teal} });
  sectionTag(s, "住宿推薦");
  s.addText("精選飯店民宿（含名稱、地址與房價）", {
    x:2.1, y:0.4, w:9, h:0.4,
    fontSize:24, bold:true, color:C.midnight, fontFace:"Microsoft JhengHei", margin:0
  });

  // 3 zones
  const zones = [
    {
      zone:"中山路片區", emoji:"🏨", items:[
        { name:"中山路步行街海景美居飯店 ⭐4星", addr:"思明區中山路（近鼓浪嶼碼頭）", price:"≈900-1,500 TWD/晚" },
        { name:"鹭島時光客棧", addr:"中山路，步行10分鐘至八市/碼頭", price:"300-500 CNY/晚" },
        { name:"YES青年旅舍", addr:"大同路371号，近中山路步行街", price:"49 CNY 起/床位" },
      ]
    },
    {
      zone:"曾厝垵片區", emoji:"🏖️", items:[
        { name:"YOLO有樂民宿（網紅款）", addr:"曾厝垵社247號（近海邊）", price:"150+ CNY/人均" },
        { name:"海天雅苑客棧", addr:"曾厝垵文青街後段（近沙灘）", price:"118-268 CNY/晚" },
        { name:"廈門山豆几民宿", addr:"曾厝垵文創村內（步行5分鐘到海）", price:"158 CNY/晚" },
      ]
    },
    {
      zone:"環島路/海景", emoji:"🌅", items:[
        { name:"青青民宿（獨棟海景別墅）", addr:"濱海街道曾厝垵前田公交站附近", price:"160 CNY/晚（雙人）" },
        { name:"夏栀民宿", addr:"曾厝垵（8分鐘到海邊）", price:"100 CNY/晚" },
        { name:"廈門花田厝青年旅館", addr:"環島路曾厝垵社370號", price:"150 CNY/標準間" },
      ]
    },
  ];

  zones.forEach((z, i) => {
    const x = 0.5 + i * 4.2;
    s.addShape(pres.shapes.RECTANGLE, { x, y:0.95, w:3.9, h:6.0,
      fill:{color:C.lightGray}, shadow:makeShadow() });
    const barColor = i===0 ? C.deepBlue : i===1 ? C.teal : C.gold;
    s.addShape(pres.shapes.RECTANGLE, { x, y:0.95, w:3.9, h:0.55, fill:{color:barColor} });
    s.addText(`${z.emoji} ${z.zone}`, { x, y:0.98, w:3.9, h:0.5,
      fontSize:13, bold:true, color:C.white, align:"center", valign:"middle",
      fontFace:"Microsoft JhengHei", margin:0 });
    z.items.forEach((item, j) => {
      const y = 1.65 + j * 1.7;
      s.addShape(pres.shapes.RECTANGLE, { x:x+0.1, y, w:3.7, h:1.55,
        fill:{color:C.white}, shadow:makeShadow() });
      s.addText(item.name, { x:x+0.2, y:y+0.05, w:3.5, h:0.45,
        fontSize:9.5, bold:true, color:C.dark, fontFace:"Microsoft JhengHei", margin:0 });
      s.addText(`📍 ${item.addr}`, { x:x+0.2, y:y+0.52, w:3.5, h:0.45,
        fontSize:8.5, color:C.gray, fontFace:"Microsoft JhengHei", margin:0 });
      s.addText(`💰 ${item.price}`, { x:x+0.2, y:y+1.0, w:3.5, h:0.35,
        fontSize:9.5, bold:true, color:barColor, fontFace:"Microsoft JhengHei", margin:0 });
    });
  });

  // booking tip
  s.addShape(pres.shapes.RECTANGLE, { x:0.5, y:7.0, w:12.3, h:0.0, fill:{color:C.white} });
  s.addText("📌 訂房平台：攜程 Ctrip · Trip.com · 木鳥民宿 · Booking.com｜節假日建議提前2-4週預訂", {
    x:0.5, y:6.9, w:12.3, h:0.3,
    fontSize:9.5, color:C.teal, align:"center", margin:0
  });

  addFooter(s, 6, 13);
}

// ═══════════════ SLIDE 7 — 交通攻略 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.3, h:0.08, fill:{color:C.deepBlue} });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:0.08, h:7.5, fill:{color:C.teal} });
  sectionTag(s, "交通攻略");
  s.addText("外部交通 · 市内交通 · 鼓浪嶼輪渡", {
    x:2.1, y:0.4, w:9, h:0.4,
    fontSize:26, bold:true, color:C.midnight, fontFace:"Microsoft JhengHei", margin:0
  });

  const transport = [
    {
      title:"🛫 外部交通",
      color:C.deepBlue,
      items:[
        { label:"小三通套票（KKday，推薦）", val:"KKday 產品143059，含來回機票+接送+船票", fee:"7,200–7,600 TWD" },
        { label:"直飛", val:"台北→高崎機場（1.5hr）", fee:"2,500-4,000 TWD/單程" },
        { label:"高崎機場", val:"島內，捷運1號線直達市區", fee:"" },
      ]
    },
    {
      title:"🚇 市内交通",
      color:C.teal,
      items:[
        { label:"捷運", val:"1/2/3號線覆蓋核心景點", fee:"2-7 CNY/程" },
        { label:"BRT", val:"快速公交，覆蓋島內主幹線", fee:"1-4 CNY/程" },
        { label:"共享單車", val:"環島路騎行最佳", fee:"1-3 CNY/30分" },
        { label:"滴滴/出租", val:"島內短程，避開高峰期", fee:"10-40 CNY/程" },
      ]
    },
    {
      title:"⛴️ 鼓浪嶼輪渡",
      color:C.gold,
      items:[
        { label:"購票", val:"微信搜「廈門輪渡」公眾號", fee:"" },
        { label:"航線", val:"厦鼓碼頭（東渡）出發", fee:"" },
        { label:"船票", val:"往返35 CNY（普通艙）", fee:"35 CNY往返" },
        { label:"提前預訂", val:"節假日5天，平日1-2天", fee:"" },
        { label:"⚠️", val:"千萬不要找黃牛！", fee:"" },
      ]
    },
  ];

  transport.forEach((col, i) => {
    const x = 0.5 + i * 4.2;
    s.addShape(pres.shapes.RECTANGLE, { x, y:1.0, w:3.9, h:5.8,
      fill:{color:C.lightGray}, shadow:makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y:1.0, w:3.9, h:0.55, fill:{color:col.color} });
    s.addText(col.title, { x, y:1.05, w:3.9, h:0.45,
      fontSize:13, bold:true, color:C.white, align:"center", valign:"middle",
      fontFace:"Microsoft JhengHei", margin:0 });
    col.items.forEach((item, j) => {
      const y = 1.7 + j * 1.0;
      s.addShape(pres.shapes.RECTANGLE, { x:x+0.1, y, w:3.7, h:0.88,
        fill:{color:C.white}, shadow:makeShadow() });
      s.addText(item.label, { x:x+0.2, y:y+0.05, w:3.4, h:0.3,
        fontSize:10, bold:true, color:col.color, margin:0 });
      s.addText(item.val, { x:x+0.2, y:y+0.37, w:3.4, h:0.28,
        fontSize:9.5, color:C.dark, fontFace:"Microsoft JhengHei", margin:0 });
      if (item.fee) {
        s.addText(item.fee, { x:x+0.2, y:y+0.65, w:3.4, h:0.2,
          fontSize:9, bold:true, color:C.gold, margin:0 });
      }
    });
  });

  addFooter(s, 7, 13);
}

// ═══════════════ SLIDE 8 — 7天方案 D1-D4 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: C.midnight };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.3, h:0.08, fill:{color:C.gold} });
  sectionTag(s, "7 天方案", 0.5, 0.4);
  s.addText("7-Day Itinerary · Days 1–4", {
    x:2.1, y:0.4, w:6, h:0.4,
    fontSize:26, bold:true, color:C.white, fontFace:"Microsoft JhengHei", margin:0
  });

  const days = [
    { day:"D1", theme:"抵達 · 中山路初探", emoji:"🛬",
      content:"抵達厦門 → 入住中山路 → 中山路步行街 → 八市海鮮市場",
      tips:"推薦：黃則和花生湯 + 肉燕" },
    { day:"D2", theme:"鼓浪嶼（上）", emoji:"🏝️",
      content:"東渡碼頭乘船 → 龍頭路 → 風琴博物館 → 菽莊花園 → 日光岩登頂",
      tips:"提前預訂船票！日落時港仔後沙灘" },
    { day:"D3", theme:"鼓浪嶼（下）· 鐵路公園", emoji:"📸",
      content:"早晨漫步小巷 → 國際刻字館 → 蟲洞書店 → 返回 → 鐵路公園",
      tips:"推薦：堂宴老廈門私房菜" },
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
    s.addShape(pres.shapes.RECTANGLE, { x:x+0.15, y:2.0, w:2.7, h:0.03, fill:{color:C.gold} });
    s.addText(d.content, { x:x+0.15, y:2.15, w:2.7, h:2.5,
      fontSize:10.5, color:C.white, fontFace:"Microsoft JhengHei", margin:0 });
    s.addShape(pres.shapes.RECTANGLE, { x:x+0.15, y:4.75, w:2.7, h:0.03, fill:{color:C.gold, transparency:50} });
    s.addText(`💡 ${d.tips}`, { x:x+0.15, y:4.85, w:2.7, h:0.8,
      fontSize:9.5, color:C.gold, fontFace:"Microsoft JhengHei", margin:0 });
  });

  addFooter(s, 8, 13);
}

// ═══════════════ SLIDE 9 — 7天方案 D5-D7 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: C.midnight };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.3, h:0.08, fill:{color:C.gold} });
  sectionTag(s, "7 天方案", 0.5, 0.4);
  s.addText("7-Day Itinerary · Days 5–7", {
    x:2.1, y:0.4, w:6, h:0.4,
    fontSize:26, bold:true, color:C.white, fontFace:"Microsoft JhengHei", margin:0
  });

  const days = [
    { day:"D5", theme:"園林植物園 · 沙坡尾", emoji:"🌿",
      content:"園林植物園（雨林世界+多肉）→ 沙坡尾文創 → 頂澳仔貓街 → 白鷺洲公園",
      tips:"植物園07:00-09:00最佳" },
    { day:"D6", theme:"集美學村 · 十里長堤", emoji:"🚝",
      content:"地鐵1號線海上列車 → 集美學村 → 鱷園 → 十里長堤日落",
      tips:"地鐵1號線日落時分段超美" },
    { day:"D7", theme:"最後巡禮 · 回程", emoji:"✈️",
      content:"曾厝垵最後採買 → 伴手禮：南普陀素餅 → 返程",
      tips:"記得帶南普陀素餅！" },
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
    s.addShape(pres.shapes.RECTANGLE, { x:x+0.2, y:2.0, w:3.6, h:0.03, fill:{color:C.gold} });
    s.addText(d.content, { x:x+0.2, y:2.15, w:3.6, h:2.5,
      fontSize:11, color:C.white, fontFace:"Microsoft JhengHei", margin:0 });
    s.addShape(pres.shapes.RECTANGLE, { x:x+0.2, y:4.75, w:3.6, h:0.03, fill:{color:C.gold, transparency:50} });
    s.addText(`💡 ${d.tips}`, { x:x+0.2, y:4.85, w:3.6, h:0.8,
      fontSize:10, color:C.gold, fontFace:"Microsoft JhengHei", margin:0 });
  });

  s.addText("💰 7天1人預算：經濟型 ≈ 16,400 TWD ｜ 舒適型 ≈ 34,100 TWD ｜ 輕奢型 ≈ 51,000+ TWD", {
    x:0.4, y:6.9, w:12.5, h:0.3,
    fontSize:11, color:C.gold, bold:true, align:"center", margin:0
  });

  addFooter(s, 9, 13);
}

// ═══════════════ SLIDE 10 — 14天方案 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.3, h:0.08, fill:{color:C.deepBlue} });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:0.08, h:7.5, fill:{color:C.teal} });
  sectionTag(s, "14 天方案");
  s.addText("14-Day Complete Itinerary", {
    x:2.1, y:0.4, w:6, h:0.4,
    fontSize:26, bold:true, color:C.midnight, fontFace:"Microsoft JhengHei", margin:0
  });

  const phases = [
    { label:"Phase 1", title:"精華深度（Day 1-7）", color:C.deepBlue },
    { label:"Phase 2", title:"島外延伸（Day 8-11）", color:C.teal },
    { label:"Phase 3", title:"互動體驗（Day 12-14）", color:C.gold },
  ];
  phases.forEach((p, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x:0.5+i*4.2, y:1.05, w:3.9, h:0.5, fill:{color:p.color} });
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
    { day:"D12", content:"島內歷史日（鐵路公園+胡里山炮台）", emoji:"⚔️" },
    { day:"D13", content:"互動體驗日：帆船出海 / 溫泉 / 科技館", emoji:"⛵" },
    { day:"D14", content:"最後巡禮 + 回程", emoji:"✈️" },
  ];

  function dayList(slide, items, startX, startY, color) {
    items.forEach((item, i) => {
      const y = startY + i * 0.85;
      slide.addShape(pres.shapes.RECTANGLE, { x:startX, y, w:3.9, h:0.72, fill:{color:C.lightGray} });
      slide.addShape(pres.shapes.RECTANGLE, { x:startX, y, w:0.06, h:0.72, fill:{color:color} });
      slide.addText(`${item.emoji} ${item.day}`, { x:startX+0.15, y:y+0.05, w:0.9, h:0.3, fontSize:10, bold:true, color:color, margin:0 });
      slide.addText(item.content, { x:startX+1.1, y:y+0.1, w:2.7, h:0.55, fontSize:9.5, color:C.dark, fontFace:"Microsoft JhengHei", margin:0 });
    });
  }

  dayList(s, phase1, 0.5, 1.7, C.deepBlue);
  dayList(s, phase2, 4.7, 1.7, C.teal);
  dayList(s, phase3, 8.9, 1.7, C.gold);

  s.addShape(pres.shapes.RECTANGLE, { x:0.5, y:5.4, w:12.3, h:0.7, fill:{color:C.midnight} });
  s.addText("💰 14天1人預算：經濟型 ≈ 30,900 TWD ｜ 舒適型 ≈ 73,400 TWD ｜ 輕奢型 ≈ 96,000+ TWD", {
    x:0.5, y:5.4, w:12.3, h:0.7,
    fontSize:13, bold:true, color:C.gold, align:"center", valign:"middle",
    fontFace:"Microsoft JhengHei", margin:0
  });

  addFooter(s, 10, 13);
}

// ═══════════════ SLIDE 11 — 費用預估（1人版）═══════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.3, h:0.08, fill:{color:C.deepBlue} });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:0.08, h:7.5, fill:{color:C.teal} });
  sectionTag(s, "費用預估");
  s.addText("Budget Estimates · 1人單項明細", {
    x:2.1, y:0.4, w:7, h:0.4,
    fontSize:26, bold:true, color:C.midnight, fontFace:"Microsoft JhengHei", margin:0
  });

  // Table header
  s.addShape(pres.shapes.RECTANGLE, { x:0.5, y:1.1, w:12.3, h:0.55, fill:{color:C.deepBlue} });
  const headers = ["項目", "7天合計（1人 TWD）", "14天合計（1人 TWD）", "說明"];
  const colWidths = [3.0, 3.5, 3.5, 2.3];
  let cx = 0.5;
  headers.forEach((h, i) => {
    s.addText(h, { x:cx, y:1.1, w:colWidths[i], h:0.55,
      fontSize:11, bold:true, color:C.white, align:"center", valign:"middle",
      fontFace:"Microsoft JhengHei", margin:0 });
    cx += colWidths[i];
  });

  const budgetData = [
    { item:"小三通來回（KKday 套票）", level7:"≈ 7,200–7,600", level14:"≈ 7,200–7,600", note:"KKday 143059，單程3,600-3,800 TWD" },
    { item:"住宿", level7:"≈ 3,900-13,000", level14:"≈ 8,400-28,000", note:"青旅150 CNY起/飯店500+TWD" },
    { item:"餐飲", level7:"≈ 2,200-4,400", level14:"≈ 4,800-9,600", note:"1人小吃為主" },
    { item:"市内交通", level7:"≈ 800-2,200", level14:"≈ 3,000-7,200", note:"捷運+滴滴為主" },
    { item:"門票+活動", level7:"≈ 1,300-3,900", level14:"≈ 5,500-17,000", note:"含土樓/雲水謠" },
    { item:"伴手禮/其他", level7:"≈ 1,000-2,000", level14:"≈ 2,000-4,000", note:"素餅、餡餅" },
  ];

  budgetData.forEach((row, i) => {
    const y = 1.65 + i * 0.62;
    const bgColor = i % 2 === 0 ? C.lightGray : C.white;
    s.addShape(pres.shapes.RECTANGLE, { x:0.5, y, w:12.3, h:0.62, fill:{color:bgColor} });
    cx = 0.5;
    [row.item, row.level7, row.level14, row.note].forEach((cell, j) => {
      const isHighlight = j === 1 || j === 2;
      s.addText(cell, { x:cx, y, w:colWidths[j], h:0.62,
        fontSize:10, bold:isHighlight, color:isHighlight?C.deepBlue:C.dark,
        align:"center", valign:"middle", fontFace:"Microsoft JhengHei", margin:0 });
      cx += colWidths[j];
    });
  });

  // Summary cards
  const summaryData = [
    { label:"經濟型 7天", val:"≈ 16,400", unit:"TWD（1人）/ 日均 ≈ 2,300", color:C.teal },
    { label:"舒適型 7天", val:"≈ 34,100", unit:"TWD（1人）/ 日均 ≈ 4,900", color:C.deepBlue },
    { label:"經濟型 14天", val:"≈ 30,900", unit:"TWD（1人）/ 日均 ≈ 2,200", color:C.teal },
    { label:"舒適型 14天", val:"≈ 73,400", unit:"TWD（1人）/ 日均 ≈ 5,200", color:C.deepBlue },
  ];
  summaryData.forEach((item, i) => {
    const x = 0.5 + i * 3.15;
    s.addShape(pres.shapes.RECTANGLE, { x, y:5.65, w:3.0, h:1.25,
      fill:{color:C.lightTeal}, shadow:makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y:5.65, w:3.0, h:0.35, fill:{color:item.color} });
    s.addText(item.label, { x, y:5.65, w:3.0, h:0.35,
      fontSize:9.5, bold:true, color:C.white, align:"center", valign:"middle", margin:0 });
    s.addText(item.val, { x, y:6.05, w:3.0, h:0.5,
      fontSize:18, bold:true, color:item.color, align:"center", margin:0 });
    s.addText(item.unit, { x, y:6.55, w:3.0, h:0.3,
      fontSize:8, color:C.gray, align:"center", margin:0 });
  });

  addFooter(s, 11, 13);
}

// ═══════════════ SLIDE 12 — Tips ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.3, h:0.08, fill:{color:C.deepBlue} });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:0.08, h:7.5, fill:{color:C.teal} });
  sectionTag(s, "實用 Tips");
  s.addText("行前準備 · 避坑提醒 · 伴手禮", {
    x:2.1, y:0.4, w:8, h:0.4,
    fontSize:26, bold:true, color:C.midnight, fontFace:"Microsoft JhengHei", margin:0
  });

  const sections = [
    {
      title:"✅ 行前準備",
      color:C.deepBlue,
      items:[
        "台胞證確認有效期，提前申請一次簽",
        "支付寶/微信支付實名認證開通",
        "小三通建議 KKday 購買來回套票（KKday 143059，單程 3,600–3,800 TWD）",
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
      s.addShape(pres.shapes.RECTANGLE, { x:x+0.1, y, w:3.7, h:0.88,
        fill:{color:C.white}, shadow:makeShadow() });
      s.addText(item, { x:x+0.2, y, w:3.5, h:0.88,
        fontSize:10, color:C.dark, valign:"middle", fontFace:"Microsoft JhengHei", margin:0 });
    });
  });

  addFooter(s, 12, 13);
}

// ═══════════════ SLIDE 13 — Closing ═══════════════
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
  s.addShape(pres.shapes.RECTANGLE, { x:4, y:4.2, w:5.3, h:0.03, fill:{color:C.gold} });
  s.addText("🏝️ 鼓浪嶼  ·  🌊 環島路  ·  🏛️ 南普陀  ·  🎓 厦大  ·  🌿 園林植物園", {
    x:0, y:4.4, w:13.3, h:0.5,
    fontSize:13, color:C.lightTeal, align:"center", margin:0
  });
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:7.1, w:13.3, h:0.4, fill:{color:C.deepBlue} });
  s.addText("📅 攻略版本 2026-04-19（更新版）·  OpenClaw 智能旅遊攻略  ·  請以出行前最新資訊為準", {
    x:0, y:7.1, w:13.3, h:0.4,
    fontSize:10, color:C.white, align:"center", valign:"middle", margin:0
  });
}

await pres.writeFile({ fileName: "廈門旅遊攻略.pptx" });
console.log("✅ 廈門旅遊攻略.pptx (v2) created!");
