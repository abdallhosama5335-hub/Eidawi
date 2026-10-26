const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const W = 800, H = 450, FLOOR = 400;
const GRAVITY = 0.6, JUMP = -11.5, SPEED = 4;

// الشخصيات
const SKINS = [
  { name: "كلاسيكي", cost: 0, body: "#ffffff", eye: "#222", glow: null },
  { name: "ذهبي", cost: 5, body: "#f5c542", eye: "#333", glow: "#f5c542" },
  { name: "نيون", cost: 8, body: "#39ff88", eye: "#052", glow: "#39ff88" },
  { name: "بنفسجي", cost: 12, body: "#b07cff", eye: "#fff", glow: "#b07cff" },
  { name: "ناري", cost: 18, body: "#ff5a1f", eye: "#fff", glow: "#ff5a1f" }
];

// المستويات: [x, y, w, h] لكل عنصر
// solids: أرضيات ثابتة | fakes: منصات تنهار | spikes: شوك ظاهر
// hidden: شوك يظهر عند الاقتراب | falls: كتل تسقط عند المرور
// movers: كتل متحركة | decoy: هدف مزيف يقتل
const LEVELS = [
  {
    name: "المدينة الليلية", bg: ["#1d2350", "#080a1c"], ground: "#2e3a6e",
    start: [40, 340], goal: [742, 340],
    solids: [[0, 400, 800, 50], [200, 330, 120, 16], [420, 300, 120, 16], [610, 350, 130, 16]],
    spikes: [[300, 384, 60, 16]],
    hidden: [[520, 384, 40, 16]],
    coins: [[240, 300], [460, 260]],
    decoy: [560, 340]
  },
  {
    name: "الصحراء", bg: ["#f9b15c", "#7a3d12"], ground: "#b5651d",
    start: [40, 340], goal: [742, 340],
    solids: [[0, 400, 250, 50], [330, 400, 470, 50], [160, 320, 100, 16], [520, 330, 110, 16]],
    spikes: [[400, 384, 70, 16]],
    movers: [[600, 370, 30, 30, 460, 740, 2.5]],
    coins: [[180, 290], [570, 300]],
    decoy: [240, 340]
  },
  {
    name: "الكهف الجليدي", bg: ["#8fdcff", "#11324f"], ground: "#3d7ea6",
    start: [40, 340], goal: [742, 340],
    solids: [[0, 400, 800, 50]],
    fakes: [[150, 330, 100, 16], [300, 290, 100, 16], [450, 330, 100, 16], [620, 300, 90, 16]],
    spikes: [[260, 384, 50, 16], [560, 384, 40, 16]],
    hidden: [[700, 384, 40, 16], [380, 384, 40, 16]],
    falls: [[640, 0, 40, 40, 600]],
    coins: [[200, 260], [500, 300], [660, 260]],
    decoy: [400, 340]
  },
  {
    name: "البركان", bg: ["#2b0a0a", "#ff7b2e"], ground: "#4a1a12",
    start: [40, 340], goal: [742, 340],
    solids: [[0, 400, 300, 50], [380, 400, 420, 50], [120, 320, 90, 16], [300, 270, 90, 16], [500, 320, 80, 16]],
    spikes: [[200, 384, 50, 16], [600, 384, 60, 16]],
    movers: [[400, 370, 30, 30, 380, 560, 3], [320, 230, 30, 30, 300, 400, 2]],
    falls: [[680, 0, 40, 40, 620]],
    coins: [[160, 290], [340, 240], [530, 290]],
    decoy: [520, 340]
  },
  {
    name: "الفضاء (قاسٍ جدًا)", bg: ["#06021a", "#2a0b57"], ground: "#5b2bb0",
    start: [40, 340], goal: [742, 340],
    solids: [[0, 400, 100, 50], [180, 400, 70, 50], [330, 400, 70, 50], [480, 400, 320, 50]],
    fakes: [[100, 330, 80, 16], [250, 300, 80, 16], [400, 330, 80, 16]],
    movers: [[20, 370, 30, 30, 0, 90, 4], [180, 370, 30, 30, 180, 250, 3.5], [340, 370, 30, 30, 330, 480, 3.5]],
    hidden: [[200, 384, 30, 16], [500, 384, 40, 16], [620, 384, 40, 16]],
    spikes: [[360, 384, 30, 16]],
    falls: [[660, 0, 40, 40, 600]],
    coins: [[140, 280], [290, 250], [440, 280], [560, 250]],
    decoy: [520, 340]
  },
  {
    name: "الغابة", bg: ["#1f4d2b", "#0a1f10"], ground: "#2f6b3a",
    start: [40, 340], goal: [742, 340],
    solids: [[0, 400, 200, 50], [260, 400, 540, 50], [120, 320, 80, 16], [400, 330, 90, 16]],
    fakes: [[480, 300, 80, 16], [620, 260, 80, 16]],
    spikes: [[300, 384, 40, 16]],
    movers: [[180, 370, 30, 30, 120, 260, 2.5]],
    coins: [[150, 290], [430, 300], [650, 220]],
    decoy: [350, 340]
  },
  {
    name: "المحيط", bg: ["#0b4f6c", "#01182b"], ground: "#1b6e8c",
    start: [40, 340], goal: [742, 340],
    solids: [[0, 400, 120, 50], [180, 400, 100, 50], [340, 400, 460, 50], [90, 310, 80, 16], [260, 300, 70, 16], [440, 320, 80, 16]],
    hidden: [[400, 384, 40, 16], [700, 384, 40, 16]],
    movers: [[20, 370, 30, 30, 0, 130, 3]],
    coins: [[130, 270], [300, 250], [480, 290]],
    decoy: [600, 340]
  },
  {
    name: "المصنع", bg: ["#3a3f48", "#14161b"], ground: "#5a606b",
    start: [40, 340], goal: [742, 340],
    solids: [[0, 400, 800, 50]],
    fakes: [[120, 330, 90, 16], [260, 300, 90, 16], [400, 270, 90, 16], [540, 300, 90, 16]],
    falls: [[330, 0, 40, 40, 300]],
    spikes: [[200, 384, 40, 16], [620, 384, 40, 16]],
    hidden: [[700, 384, 40, 16]],
    coins: [[150, 290], [300, 250], [440, 240], [570, 260]],
    decoy: [660, 340]
  },
  {
    name: "القمر", bg: ["#2c2c3a", "#0a0a12"], ground: "#6c6c86",
    start: [40, 340], goal: [742, 340],
    solids: [[0, 400, 100, 50], [170, 400, 90, 50], [330, 400, 90, 50], [500, 400, 300, 50]],
    fakes: [[100, 340, 70, 16], [260, 320, 70, 16], [420, 340, 80, 16]],
    movers: [[30, 370, 30, 30, 0, 95, 3.5], [360, 370, 30, 30, 330, 500, 3]],
    hidden: [[250, 384, 40, 16], [600, 384, 40, 16]],
    spikes: [[190, 384, 40, 16]],
    coins: [[130, 300], [290, 280], [460, 300]],
    decoy: [720, 340]
  },
  {
    name: "القلعة المظلمة (قاسٍ جدًا)", bg: ["#1a0f2e", "#05020d"], ground: "#3b2a5c",
    start: [40, 340], goal: [742, 340],
    solids: [[0, 400, 90, 50], [150, 400, 60, 50], [270, 400, 60, 50], [390, 400, 60, 50], [520, 400, 280, 50]],
    fakes: [[90, 340, 60, 16], [210, 320, 60, 16], [330, 340, 60, 16], [450, 300, 70, 16]],
    hidden: [[170, 384, 40, 16], [300, 384, 30, 16], [400, 384, 40, 16], [700, 384, 40, 16]],
    movers: [[600, 370, 30, 30, 520, 780, 4], [130, 370, 30, 30, 90, 150, 3]],
    falls: [[560, 0, 40, 40, 540], [740, 0, 40, 40, 700]],
    spikes: [[460, 384, 40, 16]],
    coins: [[120, 290], [240, 280], [360, 290], [480, 250]],
    decoy: [640, 340]
  },
  {
    name: "الغابة الليلية", bg: ["#0d2b1f", "#020a07"], ground: "#1e5a40",
    start: [40, 340], goal: [742, 340],
    solids: [[0, 400, 150, 50], [230, 400, 570, 50], [80, 300, 70, 16], [330, 320, 90, 16], [520, 320, 80, 16]],
    fakes: [[160, 330, 50, 16], [430, 290, 70, 16]],
    movers: [[300, 370, 30, 30, 240, 400, 3]],
    spikes: [[120, 384, 20, 16]],
    hidden: [[380, 384, 40, 16], [650, 384, 40, 16]],
    falls: [[470, 0, 40, 40, 440]],
    coins: [[100, 270], [360, 280], [560, 280], [700, 340]],
    decoy: [620, 340]
  },
  {
    name: "الصحراء العميقة", bg: ["#c4783a", "#4d2208"], ground: "#8c4a1c",
    start: [40, 340], goal: [742, 340],
    solids: [[0, 400, 110, 50], [190, 400, 90, 50], [360, 400, 440, 50]],
    fakes: [[120, 320, 70, 16], [300, 300, 60, 16], [400, 320, 80, 16]],
    movers: [[20, 370, 30, 30, 0, 100, 3.5], [210, 370, 30, 30, 190, 280, 3]],
    spikes: [[360, 384, 50, 16], [600, 384, 50, 16]],
    hidden: [[700, 384, 40, 16]],
    falls: [[700, 0, 40, 40, 650]],
    coins: [[150, 280], [320, 250], [500, 290]],
    decoy: [560, 340]
  },
  {
    name: "المتاهة الزرقاء", bg: ["#0e2a4a", "#020813"], ground: "#1f5f9a",
    start: [40, 340], goal: [742, 340],
    solids: [[0, 400, 90, 50], [160, 400, 70, 50], [300, 400, 70, 50], [440, 400, 360, 50]],
    fakes: [[80, 340, 80, 16], [220, 320, 80, 16], [360, 340, 80, 16]],
    movers: [[30, 370, 30, 30, 0, 110, 3.5], [400, 370, 30, 30, 380, 470, 3.5]],
    hidden: [[170, 384, 40, 16], [320, 384, 40, 16], [500, 384, 40, 16], [690, 384, 40, 16]],
    coins: [[120, 300], [260, 260], [400, 290], [580, 280]],
    decoy: [560, 340]
  },
  {
    name: "المدينة المحترقة", bg: ["#4a0e0e", "#0c0202"], ground: "#7a1d1d",
    start: [40, 340], goal: [742, 340],
    solids: [[0, 400, 130, 50], [200, 400, 600, 50]],
    fakes: [[110, 330, 80, 16], [260, 300, 70, 16], [400, 330, 70, 16], [540, 300, 70, 16]],
    falls: [[360, 0, 40, 40, 330], [600, 0, 40, 40, 560]],
    movers: [[210, 370, 30, 30, 200, 420, 4]],
    spikes: [[300, 384, 30, 16], [480, 384, 40, 16]],
    hidden: [[640, 384, 40, 16], [700, 384, 40, 16]],
    coins: [[160, 260], [300, 250], [440, 280], [580, 250]],
    decoy: [520, 340]
  },
  {
    name: "العرش الأخير (قاسٍ جدًا)", bg: ["#000000", "#3a0040"], ground: "#4b0a5e",
    start: [40, 340], goal: [742, 340],
    solids: [[0, 400, 70, 50], [130, 400, 50, 50], [240, 400, 50, 50], [350, 400, 50, 50], [460, 400, 50, 50], [570, 400, 230, 50]],
    fakes: [[70, 340, 60, 16], [180, 320, 60, 16], [290, 340, 60, 16], [400, 320, 60, 16], [510, 340, 60, 16]],
    movers: [[20, 370, 30, 30, 0, 70, 4], [140, 370, 30, 30, 130, 240, 4], [260, 370, 30, 30, 240, 350, 4], [380, 370, 30, 30, 350, 460, 4], [500, 370, 30, 30, 460, 570, 4]],
    hidden: [[140, 384, 30, 16], [250, 384, 30, 16], [360, 384, 30, 16], [470, 384, 30, 16], [600, 384, 40, 16]],
    falls: [[600, 0, 40, 40, 540]],
    coins: [[100, 290], [210, 250], [320, 290], [430, 250], [540, 290]],
    decoy: [700, 340]
  }
];

// الحفظ
function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : JSON.parse(v);
  } catch { return fallback; }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// الحالة
let tokens = load("tokens", 0);
let owned = load("owned", [0]);
let equipped = load("equipped", 0);
let level = 0, deaths = 0, pending = 0, running = false;
let p, solids, fakes, spikes, hidden, falls, movers, coins, decoy, goal;
let message = { text: "", time: 0 };
const keys = { left: false, right: false };
let jumpQueued = false;

const overlay = document.getElementById("overlay");
const ovTitle = document.getElementById("ov-title");
const ovText = document.getElementById("ov-text");
const ovBtn = document.getElementById("ov-btn");
const shop = document.getElementById("shop");

const rect = (r) => ({ x: r[0], y: r[1], w: r[2], h: r[3] });
const overlapping = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function loadLevel(i) {
  const L = LEVELS[i];
  p = { x: L.start[0], y: L.start[1], w: 24, h: 24, vx: 0, vy: 0, ground: false, dir: 1 };
  solids = L.solids.map(rect);
  fakes = (L.fakes || []).map(r => ({ ...rect(r), timer: 0, vy: 0, gone: false, touched: false }));
  spikes = (L.spikes || []).map(rect);
  hidden = (L.hidden || []).map(r => ({ ...rect(r), active: false }));
  falls = (L.falls || []).map(r => ({ ...rect(r), trig: r[4], vy: 0, falling: false }));
  movers = (L.movers || []).map(r => ({ ...rect(r), min: r[4], max: r[5], sp: r[6], dir: 1 }));
  coins = (L.coins || []).map(c => ({ x: c[0], y: c[1], got: false }));
  decoy = { x: L.decoy[0], y: L.decoy[1], w: 24, h: 60 };
  goal = { x: L.goal[0], y: L.goal[1], w: 24, h: 60 };
  pending = 0;
}

function showOverlay(title, text, btnText) {
  ovTitle.textContent = title;
  ovText.textContent = text;
  ovBtn.textContent = btnText;
  overlay.classList.remove("hidden");
  running = false;
}

function startLevel() {
  loadLevel(level);
  if ((level + 1) % 5 === 0) showMessage("مستوى قاسٍ جدًا!");
  overlay.classList.add("hidden");
  running = shop.classList.contains("hidden");
}

function showMessage(text) {
  message.text = text;
  message.time = 100;
}

function die(text) {
  deaths++;
  showMessage(text);
  loadLevel(level);
}

function win() {
  const earned = pending + 1;
  tokens += earned;
  save("tokens", tokens);

  const finished = level === LEVELS.length - 1;
  showOverlay(
    finished ? "أنهيت كل المستويات!" : "أحسنت! المستوى مجتاز",
    `ربحت ${earned} توكن. ${finished ? "ابدأ من جديد للعب مرة أخرى." : "استعد للمستوى التالي، فالفخاخ أصعب."}`,
    finished ? "ابدأ من جديد" : "المستوى التالي"
  );
  level = finished ? 0 : level + 1;
}

// المنطق
function platforms() {
  return solids.concat(fakes.filter(f => !f.gone));
}

function update() {
  p.vx = ((keys.right ? 1 : 0) - (keys.left ? 1 : 0)) * SPEED;
  if (p.vx) p.dir = Math.sign(p.vx);

  if (jumpQueued && p.ground) { p.vy = JUMP; p.ground = false; }
  jumpQueued = false;

  p.vy += GRAVITY;
  const list = platforms();

  // الحركة الأفقية
  p.x += p.vx;
  for (const s of list) {
    if (overlapping(p, s)) p.x = p.vx > 0 ? s.x - p.w : s.x + s.w;
  }
  p.x = Math.max(0, Math.min(W - p.w, p.x));

  // الحركة العمودية
  p.y += p.vy;
  p.ground = false;
  for (const s of list) {
    if (!overlapping(p, s)) continue;
    if (p.vy > 0) { p.y = s.y - p.h; p.ground = true; s.touched = true; }
    else { p.y = s.y + s.h; }
    p.vy = 0;
  }

  // المنصات المزيفة تنهار بعد الوقوف عليها
  for (const f of fakes) {
    if (f.touched) f.timer++;
    f.touched = false;
    if (f.timer > 18 && !f.gone) {
      f.vy += GRAVITY;
      f.y += f.vy;
      if (f.y > H) f.gone = true;
    }
  }

  // الكتل المتحركة
  for (const m of movers) {
    m.x += m.sp * m.dir;
    if (m.x < m.min || m.x + m.w > m.max) m.dir *= -1;
  }

  // الكتل الساقطة
  for (const f of falls) {
    if (!f.falling && p.x + p.w > f.trig) f.falling = true;
    if (f.falling && f.y + f.h < FLOOR) {
      f.vy += GRAVITY * 1.5;
      f.y = Math.min(f.y + f.vy, FLOOR - f.h);
    }
  }

  // الشوك المخفي يظهر عند الاقتراب
  for (const h of hidden) {
    if (!h.active && Math.abs(p.x - h.x) < 110) h.active = true;
  }

  // جمع العملات
  for (const c of coins) {
    if (!c.got && Math.hypot(p.x + 12 - c.x, p.y + 12 - c.y) < 18) {
      c.got = true;
      pending++;
    }
  }

  // الخطر والنهاية
  const deadly = [...spikes, ...hidden.filter(h => h.active), ...movers, ...falls];
  if (deadly.some(d => overlapping(p, d))) return die("ضربتك الفخاخ!");
  if (overlapping(p, decoy)) return die("كان هذا فخًا!");
  if (p.y > H) return die("سقطت في الهاوية!");
  if (overlapping(p, goal)) return win();
}

// الرسم
function drawSpikes(s) {
  ctx.fillStyle = "#ff4d6d";
  ctx.beginPath();
  for (let x = s.x; x < s.x + s.w; x += 12) {
    ctx.moveTo(x, s.y + s.h);
    ctx.lineTo(x + 6, s.y);
    ctx.lineTo(x + 12, s.y + s.h);
  }
  ctx.fill();
}

function drawFlag(f) {
  ctx.fillStyle = "#ddd";
  ctx.fillRect(f.x + 10, f.y, 3, f.h);
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.moveTo(f.x + 13, f.y);
  ctx.lineTo(f.x + 24, f.y + 10);
  ctx.lineTo(f.x + 13, f.y + 20);
  ctx.fill();
}

function drawPlayer() {
  const s = SKINS[equipped];
  if (s.glow) { ctx.shadowColor = s.glow; ctx.shadowBlur = 16; }
  ctx.fillStyle = s.body;
  ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.shadowBlur = 0;
  ctx.fillStyle = s.eye;
  const ex = p.dir > 0 ? p.x + 14 : p.x + 4;
  ctx.fillRect(ex, p.y + 7, 5, 6);
}

function draw() {
  const L = LEVELS[level];
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, L.bg[0]);
  g.addColorStop(1, L.bg[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // المنصات (المزيفة تبدو تمامًا مثل الحقيقية)
  ctx.fillStyle = L.ground;
  for (const s of platforms()) ctx.fillRect(s.x, s.y, s.w, s.h);

  spikes.forEach(drawSpikes);
  hidden.filter(h => h.active).forEach(drawSpikes);

  ctx.fillStyle = "#ff9f1c";
  for (const m of movers) ctx.fillRect(m.x, m.y, m.w, m.h);

  ctx.fillStyle = "#e63946";
  for (const f of falls) ctx.fillRect(f.x, f.y, f.w, f.h);

  drawFlag(goal);
  drawFlag(decoy);

  ctx.fillStyle = "#ffd166";
  for (const c of coins) {
    if (c.got) continue;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPlayer();

  if (message.time > 0) {
    message.time--;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px Tajawal, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(message.text, W / 2, 50);
  }
}

// الواجهة
const levelNameEl = document.getElementById("level-name");
const deathsEl = document.getElementById("deaths");
const tokensEl = document.getElementById("tokens");
const pendingEl = document.getElementById("pending");

function updateHud() {
  levelNameEl.textContent = `المستوى ${level + 1}: ${LEVELS[level].name}`;
  deathsEl.textContent = deaths;
  tokensEl.textContent = tokens;
  pendingEl.textContent = pending;
}

function renderShop() {
  const box = document.getElementById("skins");
  box.innerHTML = "";
  SKINS.forEach((s, i) => {
    const card = document.createElement("div");
    card.className = "skin";
    card.innerHTML = `<span class="swatch" style="background:${s.body};box-shadow:0 0 12px ${s.glow || "transparent"}"></span><strong>${s.name}</strong>`;

    const btn = document.createElement("button");
    btn.className = "btn btn-small";
    if (equipped === i) {
      btn.textContent = "مختارة";
      btn.disabled = true;
    } else if (owned.includes(i)) {
      btn.textContent = "اختيار";
    } else {
      btn.textContent = `شراء (${s.cost} توكن)`;
      btn.disabled = tokens < s.cost;
    }
    btn.addEventListener("click", () => buySkin(i));

    card.appendChild(btn);
    box.appendChild(card);
  });
}

function buySkin(i) {
  if (!owned.includes(i)) {
    if (tokens < SKINS[i].cost) return;
    tokens -= SKINS[i].cost;
    owned.push(i);
    save("tokens", tokens);
    save("owned", owned);
  }
  equipped = i;
  save("equipped", equipped);
  renderShop();
}

document.getElementById("shop-toggle").addEventListener("click", () => {
  shop.classList.toggle("hidden");
  if (!shop.classList.contains("hidden")) {
    renderShop();
    running = false;
  } else {
    running = overlay.classList.contains("hidden");
  }
});

ovBtn.addEventListener("click", startLevel);

// لوحة المفاتيح
const KEY_MAP = { ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right" };
const JUMP_KEYS = ["Space", "ArrowUp", "KeyW"];

window.addEventListener("keydown", (e) => {
  if (KEY_MAP[e.code] || JUMP_KEYS.includes(e.code)) e.preventDefault();
  if (KEY_MAP[e.code]) keys[KEY_MAP[e.code]] = true;
  if (JUMP_KEYS.includes(e.code) && !e.repeat) jumpQueued = true;
  if (e.code === "KeyR" && running) { showMessage("أعدت المحاولة"); loadLevel(level); }
});

window.addEventListener("keyup", (e) => {
  if (KEY_MAP[e.code]) keys[KEY_MAP[e.code]] = false;
});

// أزرار الجوال
document.querySelectorAll(".touch").forEach((btn) => {
  const k = btn.dataset.key;
  btn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (k === "jump") jumpQueued = true;
    else keys[k] = true;
  });
  const release = () => { if (k !== "jump") keys[k] = false; };
  btn.addEventListener("pointerup", release);
  btn.addEventListener("pointerleave", release);
  btn.addEventListener("pointercancel", release);
});

// الحلقة الرئيسية
function frame() {
  if (running) {
    update();
    if (!running) { /* تم إيقاف اللعب بعد الفوز */ }
  }
  draw();
  updateHud();
  requestAnimationFrame(frame);
}

// البداية
loadLevel(0);
showOverlay(
  "فخ المستوى",
  "تحرك بالأسهم أو A و D، واقفز بالمسافة أو W. احذر: ليس كل ما تراه حقيقيًا! اجمع العملات لتربح توكنات تفتح شخصيات جديدة.",
  "ابدأ اللعب"
);
requestAnimationFrame(frame);
