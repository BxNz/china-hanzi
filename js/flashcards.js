const VOCAB = [
  {
    id: "s1",
    cat: "shop",
    hanzi: "商店",
    pinyin: "shāngdiàn",
    thai: "ร้านค้า",
  },
  {
    id: "s2",
    cat: "shop",
    hanzi: "超市",
    pinyin: "chāoshì",
    thai: "ซูเปอร์มาร์เก็ต",
  },
  {
    id: "s3",
    cat: "shop",
    hanzi: "收银台",
    pinyin: "shōuyíntái",
    thai: "เคาน์เตอร์แคชเชียร์",
  },
  {
    id: "s4",
    cat: "shop",
    hanzi: "收银员",
    pinyin: "shōuyínyuán",
    thai: "พนักงานแคชเชียร์",
  },
  { id: "s5", cat: "shop", hanzi: "顾客", pinyin: "gùkè", thai: "ลูกค้า" },
  { id: "s6", cat: "shop", hanzi: "商品", pinyin: "shāngpǐn", thai: "สินค้า" },
  {
    id: "s7",
    cat: "shop",
    hanzi: "库存",
    pinyin: "kùcún",
    thai: "สต๊อกสินค้า",
  },
  { id: "s8", cat: "shop", hanzi: "价格", pinyin: "jiàgé", thai: "ราคา" },
  {
    id: "s9",
    cat: "shop",
    hanzi: "打折 / 折扣",
    pinyin: "dǎzhé / zhékòu",
    thai: "ส่วนลด",
  },
  { id: "s10", cat: "shop", hanzi: "会员", pinyin: "huìyuán", thai: "สมาชิก" },
  { id: "s11", cat: "shop", hanzi: "促销", pinyin: "cùxiāo", thai: "โปรโมชัน" },
  {
    id: "s12",
    cat: "shop",
    hanzi: "退货",
    pinyin: "tuìhuò",
    thai: "คืนสินค้า",
  },
  {
    id: "s13",
    cat: "shop",
    hanzi: "换货",
    pinyin: "huànhuò",
    thai: "เปลี่ยนสินค้า",
  },
  {
    id: "p1",
    cat: "pos",
    hanzi: "收银系统",
    pinyin: "shōuyín xìtǒng",
    thai: "ระบบแคชเชียร์/POS",
  },
  { id: "p2", cat: "pos", hanzi: "支付", pinyin: "zhīfù", thai: "การชำระเงิน" },
  { id: "p3", cat: "pos", hanzi: "现金", pinyin: "xiànjīn", thai: "เงินสด" },
  { id: "p4", cat: "pos", hanzi: "刷卡", pinyin: "shuākǎ", thai: "รูดบัตร" },
  {
    id: "p5",
    cat: "pos",
    hanzi: "扫码支付",
    pinyin: "sǎomǎ zhīfù",
    thai: "จ่ายผ่านสแกนคิวอาร์โค้ด",
  },
  {
    id: "p6",
    cat: "pos",
    hanzi: "条形码 / 条码",
    pinyin: "tiáoxíngmǎ / tiáomǎ",
    thai: "บาร์โค้ด",
  },
  {
    id: "p7",
    cat: "pos",
    hanzi: "扫描枪",
    pinyin: "sǎomiáoqiāng",
    thai: "เครื่องสแกนบาร์โค้ด",
  },
  {
    id: "p8",
    cat: "pos",
    hanzi: "小票 / 收据",
    pinyin: "xiǎopiào / shōujù",
    thai: "ใบเสร็จ",
  },
  {
    id: "p9",
    cat: "pos",
    hanzi: "发票",
    pinyin: "fāpiào",
    thai: "ใบกำกับภาษี",
  },
  {
    id: "p10",
    cat: "pos",
    hanzi: "总金额",
    pinyin: "zǒng jīn'é",
    thai: "ยอดรวมทั้งหมด",
  },
  { id: "p11", cat: "pos", hanzi: "找零", pinyin: "zhǎolíng", thai: "เงินทอน" },
  { id: "p12", cat: "pos", hanzi: "订单", pinyin: "dìngdān", thai: "ออเดอร์" },
  { id: "p13", cat: "pos", hanzi: "交易", pinyin: "jiāoyì", thai: "ธุรกรรม" },
  {
    id: "p14",
    cat: "pos",
    hanzi: "结账",
    pinyin: "jiézhàng",
    thai: "เช็คบิล/ปิดการขาย",
  },
  { id: "i1", cat: "itqa", hanzi: "系统", pinyin: "xìtǒng", thai: "ระบบ" },
  {
    id: "i2",
    cat: "itqa",
    hanzi: "软件",
    pinyin: "ruǎnjiàn",
    thai: "ซอฟต์แวร์",
  },
  { id: "i3", cat: "itqa", hanzi: "测试", pinyin: "cèshì", thai: "การทดสอบ" },
  {
    id: "i4",
    cat: "itqa",
    hanzi: "测试用例",
    pinyin: "cèshì yònglì",
    thai: "เทสต์เคส",
  },
  {
    id: "i5",
    cat: "itqa",
    hanzi: "漏洞 / 错误",
    pinyin: "lòudòng / cuòwù",
    thai: "บั๊ก/ข้อผิดพลาด",
  },
  {
    id: "i6",
    cat: "itqa",
    hanzi: "修复",
    pinyin: "xiūfù",
    thai: "แก้ไข (bug)",
  },
  {
    id: "i7",
    cat: "itqa",
    hanzi: "功能",
    pinyin: "gōngnéng",
    thai: "ฟังก์ชัน",
  },
  {
    id: "i8",
    cat: "itqa",
    hanzi: "界面",
    pinyin: "jièmiàn",
    thai: "หน้าจอ/UI",
  },
  { id: "i9", cat: "itqa", hanzi: "更新", pinyin: "gēngxīn", thai: "อัปเดต" },
  { id: "i10", cat: "itqa", hanzi: "版本", pinyin: "bǎnběn", thai: "เวอร์ชัน" },
  { id: "i11", cat: "itqa", hanzi: "报告", pinyin: "bàogào", thai: "รายงาน" },
  {
    id: "i12",
    cat: "itqa",
    hanzi: "需求",
    pinyin: "xūqiú",
    thai: "ความต้องการ (requirement)",
  },
  { id: "k1", cat: "kcc", hanzi: "门店", pinyin: "méndiàn", thai: "สาขาร้าน" },
  {
    id: "k2",
    cat: "kcc",
    hanzi: "总部",
    pinyin: "zǒngbù",
    thai: "สำนักงานใหญ่ (Web Admin)",
  },
  {
    id: "k3",
    cat: "kcc",
    hanzi: "门店管理",
    pinyin: "méndiàn guǎnlǐ",
    thai: "การจัดการสาขา",
  },
  {
    id: "k4",
    cat: "kcc",
    hanzi: "权限",
    pinyin: "quánxiàn",
    thai: "สิทธิ์การใช้งาน",
  },
  {
    id: "k5",
    cat: "kcc",
    hanzi: "角色",
    pinyin: "juésè",
    thai: "บทบาทผู้ใช้ (role)",
  },
  {
    id: "k6",
    cat: "kcc",
    hanzi: "老挝基普",
    pinyin: "Lǎowō Jīpǔ",
    thai: "เงินกีบลาว (LAK)",
  },
  {
    id: "k7",
    cat: "kcc",
    hanzi: "汇率",
    pinyin: "huìlǜ",
    thai: "อัตราแลกเปลี่ยน",
  },
  {
    id: "k8",
    cat: "kcc",
    hanzi: "多语言",
    pinyin: "duōyǔyán",
    thai: "หลายภาษา",
  },
  {
    id: "k9",
    cat: "kcc",
    hanzi: "库存预警",
    pinyin: "kùcún yùjǐng",
    thai: "แจ้งเตือนสต๊อก",
  },
  {
    id: "k10",
    cat: "kcc",
    hanzi: "临期商品",
    pinyin: "línqī shāngpǐn",
    thai: "สินค้าใกล้หมดอายุ",
  },
  {
    id: "k11",
    cat: "kcc",
    hanzi: "清仓",
    pinyin: "qīngcāng",
    thai: "เคลียร์สต๊อก",
  },
  {
    id: "k12",
    cat: "kcc",
    hanzi: "班次",
    pinyin: "bāncì",
    thai: "กะการทำงาน (shift)",
  },
  {
    id: "k13",
    cat: "kcc",
    hanzi: "收银箱 / 钱箱",
    pinyin: "shōuyínxiāng / qiánxiāng",
    thai: "ลิ้นชักเก็บเงิน",
  },
  { id: "k14", cat: "kcc", hanzi: "积分", pinyin: "jīfēn", thai: "คะแนนสะสม" },
  {
    id: "k15",
    cat: "kcc",
    hanzi: "兑换",
    pinyin: "duìhuàn",
    thai: "แลก/แลกคะแนน",
  },
  {
    id: "k16",
    cat: "kcc",
    hanzi: "拆分付款",
    pinyin: "chāifēn fùkuǎn",
    thai: "แบ่งจ่าย (split payment)",
  },
  {
    id: "k17",
    cat: "kcc",
    hanzi: "作废",
    pinyin: "zuòfèi",
    thai: "ยกเลิกรายการ (void)",
  },
  {
    id: "k18",
    cat: "kcc",
    hanzi: "授权",
    pinyin: "shòuquán",
    thai: "อนุมัติสิทธิ์",
  },
  {
    id: "k19",
    cat: "kcc",
    hanzi: "采购入库单",
    pinyin: "cǎigòu rùkùdān",
    thai: "ใบรับสินค้าเข้าคลัง (GRN)",
  },
  {
    id: "k20",
    cat: "kcc",
    hanzi: "应付账款",
    pinyin: "yìngfù zhàngkuǎn",
    thai: "บัญชีเจ้าหนี้ (AP)",
  },
  { id: "k21", cat: "kcc", hanzi: "成本", pinyin: "chéngběn", thai: "ต้นทุน" },
  {
    id: "e1",
    cat: "sent",
    hanzi: "这个功能有问题。",
    pinyin: "Zhège gōngnéng yǒu wèntí.",
    thai: "ฟังก์ชันนี้มีปัญหา",
  },
  {
    id: "e2",
    cat: "sent",
    hanzi: "我在测试收银系统。",
    pinyin: "Wǒ zài cèshì shōuyín xìtǒng.",
    thai: "ตอนนี้กำลังทดสอบระบบ POS",
  },
  {
    id: "e3",
    cat: "sent",
    hanzi: "可以帮我确认一下吗？",
    pinyin: "Kěyǐ bāng wǒ quèrèn yíxià ma?",
    thai: "ช่วยยืนยันให้หน่อยได้ไหม",
  },
  {
    id: "e4",
    cat: "sent",
    hanzi: "这个漏洞什么时候能修复？",
    pinyin: "Zhège lòudòng shénme shíhòu néng xiūfù?",
    thai: "บั๊กนี้จะแก้ไขเสร็จเมื่อไหร่",
  },
  {
    id: "e5",
    cat: "sent",
    hanzi: "请再说一次，我没听懂。",
    pinyin: "Qǐng zài shuō yícì, wǒ méi tīngdǒng.",
    thai: "พูดอีกครั้งได้ไหม ผมยังไม่เข้าใจ",
  },
  {
    id: "e6",
    cat: "sent",
    hanzi: "这个需求文档我已经发给你了。",
    pinyin: "Zhège xūqiú wénjiàn wǒ yǐjīng fāgěi nǐ le.",
    thai: "เอกสาร requirement นี้ส่งให้แล้วนะ",
  },
  {
    id: "e7",
    cat: "sent",
    hanzi: "测试报告里发现了几个问题。",
    pinyin: "Cèshì bàogào lǐ fāxiànle jǐ gè wèntí.",
    thai: "ในรายงานทดสอบพบปัญหาหลายจุด",
  },
  {
    id: "e8",
    cat: "sent",
    hanzi: "这个流程图对不对？",
    pinyin: "Zhège liúchéngtú duì bú duì?",
    thai: "flow diagram นี้ถูกต้องไหม",
  },
  {
    id: "e9",
    cat: "sent",
    hanzi: "我们下周开会讨论一下。",
    pinyin: "Wǒmen xiàzhōu kāihuì tǎolùn yíxià.",
    thai: "สัปดาห์หน้าประชุมคุยกันนะ",
  },
];

const CATS = [
  { id: "all", label: "ทั้งหมด" },
  { id: "shop", label: "ร้านค้า" },
  { id: "pos", label: "POS" },
  { id: "itqa", label: "IT/QA" },
  { id: "kcc", label: "KCC_POS" },
  { id: "sent", label: "ประโยค" },
];

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