let VOCAB = [];

function getApiEndpoint(path) {
  const inViewFolder = window.location.pathname.replace(/\\/g, '/').includes('/view/');
  const prefix = inViewFolder ? '../api/' : 'api/';
  return prefix + path;
}

async function safeJsonResponse(response, fallback = null) {
  if (!response) return fallback;

  const text = await response.text();
  if (!text || !text.trim()) return fallback;

  try {
    return JSON.parse(text);
  } catch (error) {
    console.warn('Non-JSON API response received:', text.slice(0, 200));
    return fallback;
  }
}

async function loadVocabFromDb() {
  try {
    const res = await fetch(getApiEndpoint('words.php'));
    if (res.ok) {
      const dbWords = await safeJsonResponse(res, []);
      if (Array.isArray(dbWords) && dbWords.length > 0) {
        VOCAB = dbWords.map((word, index) => ({
          id: word.id ? `db-${word.id}` : `vocab-${index}`,
          cat: word.cat || (word.l ? `hsk${word.l}` : 'custom'),
          hanzi: word.h || word.hanzi || '',
          pinyin: word.p || word.pinyin || '',
          thai: word.t || word.meaning || '',
        }));
        return;
      }
    }
  } catch (err) {
    console.warn('⚠️ Fetching vocab from DB failed, falling back to static json/vocab.json:', err);
  }

  // Fallback to static json/vocab.json
  try {
    const jsonPath = window.location.pathname.replace(/\\/g, '/').includes('/view/') ? '../json/vocab.json' : 'json/vocab.json';
    const res = await fetch(jsonPath);
    if (res.ok) {
      const list = await safeJsonResponse(res, []);
      VOCAB = Array.isArray(list) ? list.map((item, index) => ({
        id: `json-${index}`,
        cat: item.cat || (item.l ? `hsk${item.l}` : 'custom'),
        hanzi: item.h || '',
        pinyin: item.p || '',
        thai: item.t || '',
      })) : [];
    }
  } catch (e) {
    console.error('Failed to load vocab.json', e);
  }
}

const CATEGORY_STORAGE_KEY = "hanzi-custom-categories";
const BASE_CATS = [
  { id: "all", label: "ทั้งหมด" },
  { id: "shop", label: "ร้านค้า" },
  { id: "pos", label: "POS" },
  { id: "itqa", label: "IT/QA" },
  { id: "kcc", label: "KCC_POS" },
  { id: "sent", label: "ประโยค" },
  { id: "custom", label: "คำของฉัน" },
];
let CATS = [...BASE_CATS, ...loadCustomCategories()];

function loadCustomCategories() {
  try {
    const categories = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY) || "[]");
    if (!Array.isArray(categories)) return [];
    const reservedIds = new Set(BASE_CATS.map((category) => category.id));
    return categories.filter((category) =>
      category &&
      /^[a-z0-9_-]+$/.test(category.id) &&
      category.label &&
      !reservedIds.has(category.id),
    );
  } catch (error) {
    return [];
  }
}

let known = {};
let activeCat = "all";
let onlyUnknown = false;
let order = [];
let idx = 0;
let flipped = false;

const els = {
  chips: document.getElementById("chips"),
  tag: document.getElementById("tag"),
  hanzi: document.getElementById("hanzi"),
  pinyin: document.getElementById("pinyin"),
  thai: document.getElementById("thai"),
  hanziBack: document.getElementById("hanzi-back"),
  catLabel: document.getElementById("cat-label"),
  posCur: document.getElementById("pos-cur"),
  posTotal: document.getElementById("pos-total"),
  knownCount: document.getElementById("known-count"),
  progressFill: document.getElementById("progress-fill"),
  stageHolder: document.getElementById("stage-holder"),
};

async function loadProgress() {
  try {
    const res = await window.storage.get("vocab-progress", false);
    if (res && res.value) known = JSON.parse(res.value);
  } catch (e) {
    known = {};
  }
}
async function saveProgress() {
  try {
    await window.storage.set("vocab-progress", JSON.stringify(known), false);
  } catch (e) {}
}

function currentList() {
  let list = VOCAB.filter((v) => activeCat === "all" || v.cat === activeCat);
  if (onlyUnknown) list = list.filter((v) => !known[v.id]);
  return list;
}

function buildChips() {
  els.chips.innerHTML = "";
  CATS.forEach((c) => {
    const b = document.createElement("button");
    b.className = "chip" + (c.id === activeCat ? " active" : "");
    b.textContent = c.label;
    b.onclick = () => {
      activeCat = c.id;
      idx = 0;
      resetOrder();
      buildChips();
      render();
    };
    els.chips.appendChild(b);
  });
}

async function hasAuthenticatedSession() {
  try {
    const response = await fetch(getApiEndpoint("session.php"), { cache: "no-store" });
    const data = await safeJsonResponse(response, {});
    return response.ok && data.authenticated === true;
  } catch (error) {
    return false;
  }
}

function setCategoryFormAccess(isAuthenticated) {
  const form = document.getElementById("categoryForm");
  form.querySelectorAll("label, button").forEach((control) => {
    control.hidden = !isAuthenticated;
  });
  form.querySelectorAll("input, button").forEach((control) => {
    control.disabled = !isAuthenticated;
  });
  document.getElementById("categoryStatus").textContent = isAuthenticated
    ? ""
    : "กรุณาเข้าสู่ระบบก่อนเพิ่มหมวด";
  document.getElementById("categoryLoginLink").hidden = isAuthenticated;
}

document.getElementById("categoryForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const isAuthenticated = await hasAuthenticatedSession();
  setCategoryFormAccess(isAuthenticated);
  if (!isAuthenticated) return;

  const id = form.elements.categoryId.value.trim().toLowerCase();
  const label = form.elements.categoryLabel.value.trim();
  const status = document.getElementById("categoryStatus");

  if (!/^[a-z0-9_-]+$/.test(id)) {
    status.textContent = "รหัสหมวดใช้ได้เฉพาะ a-z, 0-9, _ และ -";
    return;
  }
  if (!label) {
    status.textContent = "กรุณากรอกชื่อเมนู";
    return;
  }
  if (CATS.some((category) => category.id === id)) {
    status.textContent = "มีรหัสหมวดนี้แล้ว";
    return;
  }

  const category = { id, label };
  const customCategories = loadCustomCategories();
  customCategories.push(category);
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(customCategories));
  CATS = [...BASE_CATS, ...customCategories];
  form.reset();
  status.textContent = `เพิ่มเมนู ${label} แล้ว`;
  activeCat = id;
  idx = 0;
  buildChips();
  resetOrder();
  render();
});

function resetOrder() {
  order = currentList().map((v, i) => i);
}

function shuffleOrder() {
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  idx = 0;
  flipped = false;
  render();
}

function catLabelOf(id) {
  return (CATS.find((c) => c.id === id) || {}).label || "";
}

function render() {
  const list = currentList();
  if (order.length !== list.length) resetOrder();

  if (list.length === 0) {
    els.stageHolder.innerHTML =
      '<div class="empty">ไม่มีคำในหมวดนี้แล้ว ลองสลับตัวกรองดูนะ</div>';
    els.posCur.textContent = "0";
    els.posTotal.textContent = "0";
    els.progressFill.style.width = "0%";
    updateKnownCount(list);
    return;
  }
  if (idx >= list.length) idx = 0;
  if (idx < 0) idx = list.length - 1;

  const card = list[order[idx]];
  els.tag.classList.toggle("flipped", flipped);
  els.hanzi.textContent = card.hanzi;
  els.pinyin.textContent = card.pinyin;
  els.thai.textContent = card.thai;
  els.hanziBack.textContent = card.hanzi;
  els.catLabel.textContent = catLabelOf(card.cat);

  els.posCur.textContent = String(idx + 1);
  els.posTotal.textContent = String(list.length);
  els.progressFill.style.width =
    Math.round(((idx + 1) / list.length) * 100) + "%";
  updateKnownCount(list);
  if (autoSpeak && card.id !== lastAutoId) {
    lastAutoId = card.id;
    speakCurrent();
  }
}

function updateKnownCount(list) {
  const total =
    currentList().length === 0 && onlyUnknown
      ? VOCAB.filter((v) => activeCat === "all" || v.cat === activeCat).length
      : list.length;
  const base = VOCAB.filter((v) => activeCat === "all" || v.cat === activeCat);
  const knownN = base.filter((v) => known[v.id]).length;
  els.knownCount.textContent = knownN + " / " + base.length;
}

function next() {
  idx++;
  flipped = false;
  render();
}
function prev() {
  idx--;
  flipped = false;
  render();
}

document.getElementById("tag").addEventListener("click", (e) => {
  if (e.target.closest("button")) return;
  flipped = !flipped;
  els.tag.classList.toggle("flipped", flipped);
});

document.getElementById("btn-next").onclick = next;
document.getElementById("btn-prev").onclick = prev;
document.getElementById("btn-shuffle").onclick = shuffleOrder;

document.getElementById("btn-know").onclick = () => {
  const list = currentList();
  const card = list[order[idx]];
  if (card) {
    known[card.id] = true;
    saveProgress();
  }
  next();
};
document.getElementById("btn-unknow").onclick = () => {
  const list = currentList();
  const card = list[order[idx]];
  if (card) {
    delete known[card.id];
    saveProgress();
  }
  next();
};

document.getElementById("filter-unknown").onchange = (e) => {
  onlyUnknown = e.target.checked;
  idx = 0;
  resetOrder();
  render();
};

document.getElementById("btn-reset").onclick = () => {
  known = {};
  saveProgress();
  render();
};

async function init() {
  await loadProgress();
  await loadVocabFromDb();
  setCategoryFormAccess(await hasAuthenticatedSession());
  buildChips();
  resetOrder();
  render();
}
init();

// auto speak
let autoSpeak = false;
let zhVoice = null;
let lastAutoId = null;

function pickZhVoice() {
  if (!("speechSynthesis" in window)) return;
  const voices = speechSynthesis.getVoices();
  zhVoice =
    voices.find((v) => v.lang === "zh-CN") ||
    voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("zh")) ||
    null;
}
if ("speechSynthesis" in window) {
  pickZhVoice();
  speechSynthesis.onvoiceschanged = pickZhVoice;
}

function speakCurrent() {
  if (!("speechSynthesis" in window)) return;
  const list = currentList();
  const card = list[order[idx]];
  if (!card) return;
  const text = card.hanzi.split(" / ")[0];
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "zh-CN";
  if (zhVoice) utter.voice = zhVoice;
  utter.rate = 0.9;
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

document.getElementById("auto-speak").onchange = (e) => {
  autoSpeak = e.target.checked;
  if (autoSpeak) {
    lastAutoId = null;
    render();
  }
};

const speakBtns = [
  document.getElementById("btn-speak-front"),
  document.getElementById("btn-speak-back"),
];
if (!("speechSynthesis" in window)) {
  speakBtns.forEach((b) => {
    if (b) {
      b.disabled = true;
      b.textContent = "เบราว์เซอร์นี้เล่นเสียงไม่ได้";
    }
  });
} else {
  speakBtns.forEach(
    (b) => b && b.addEventListener("click", (e) => {
      e.stopPropagation();
      speakCurrent();
    }),
  );
}