let VOCAB = [];
let currentLevel = "all";
let currentMode = "normal";
let currentWord = null;

function pickWord(){
  const pool = currentLevel === "all" ? VOCAB : VOCAB.filter(w => w.l === Number(currentLevel));
  if (!pool || pool.length === 0) return;
  const w = pool[Math.floor(Math.random() * pool.length)];
  currentWord = w;
  renderWord(w);
}

function renderWord(w){
  document.getElementById('hanzi').textContent = w.h;
  document.getElementById('pinyin').textContent = w.p;
  document.getElementById('meaning').textContent = w.t;
  document.getElementById('levelBadge').textContent = 'HSK ' + w.l;
  updateModeView();
  buildGrids(w.h);
}

function updateModeView(){
  const card = document.getElementById('practiceCard');
  card.classList.toggle('pinyin-only', currentMode === 'pinyin');
}

function buildGrids(chars){
  const container = document.getElementById('grids');
  container.innerHTML = '';
  const showTrace = currentMode === 'normal' && document.getElementById('traceToggle').checked;
  [...chars].forEach(ch => {
    const cell = document.createElement('div');
    cell.className = 'cell';

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class','guides');
    svg.setAttribute('viewBox','0 0 100 100');
    const lines = [ [50,0,50,100],[0,50,100,50],[0,0,100,100],[100,0,0,100] ];
    lines.forEach(l => {
      const line = document.createElementNS(svgNS,'line');
      line.setAttribute('x1',l[0]); line.setAttribute('y1',l[1]);
      line.setAttribute('x2',l[2]); line.setAttribute('y2',l[3]);
      line.setAttribute('stroke','#C9BFA4');
      line.setAttribute('stroke-width','1');
      line.setAttribute('stroke-dasharray','3,3');
      svg.appendChild(line);
    });
    cell.appendChild(svg);

    if (showTrace){
      const trace = document.createElement('div');
      trace.className = 'trace';
      trace.textContent = ch;
      cell.appendChild(trace);
    }

    const canvas = document.createElement('canvas');
    cell.appendChild(canvas);
    container.appendChild(cell);
    setupDrawing(cell, canvas);
  });
}

function setupDrawing(cell, canvas){
  function resize(){
    const rect = cell.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2,2);
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1F2430';
  }
  resize();
  const ctx = canvas.getContext('2d');
  let drawing = false;

  function pos(e){
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }
  function start(e){
    e.preventDefault();
    drawing = true;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }
  function move(e){
    if(!drawing) return;
    e.preventDefault();
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
  function end(){ drawing = false; }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);
  canvas.addEventListener('touchstart', start, {passive:false});
  canvas.addEventListener('touchmove', move, {passive:false});
  canvas.addEventListener('touchend', end);
}

function attachUI(){
  document.getElementById('levelBtns').addEventListener('click', (e) => {
    const btn = e.target.closest('.lvl-btn');
    if(!btn) return;
    document.querySelectorAll('.lvl-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentLevel = btn.dataset.lvl;
    pickWord();
  });

  document.getElementById('modeBtns').addEventListener('click', (e) => {
    const btn = e.target.closest('.mode-btn');
    if(!btn) return;
    currentMode = btn.dataset.mode;
    document.querySelectorAll('.mode-btn').forEach(b => {
      const active = b === btn;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    updateModeView();
    buildGrids(currentWord.h);
  });

  document.getElementById('randomBtn').addEventListener('click', pickWord);
  document.getElementById('traceToggle').addEventListener('change', () => buildGrids(currentWord.h));
  document.getElementById('clearBtn').addEventListener('click', () => buildGrids(currentWord.h));
}

function startApp(){
  if (!VOCAB || VOCAB.length === 0) return;
  currentLevel = 'all';
  currentWord = VOCAB[0];
  attachUI();
  renderWord(currentWord);
}

fetch('vocab.json')
  .then(r => r.json())
  .then(data => { VOCAB = data; startApp(); })
  .catch(err => { console.error('Failed to load vocab.json', err); });
