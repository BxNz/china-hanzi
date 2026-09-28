const STORAGE_KEY = 'hanzi-custom-words';
let customWords = [];
let isDbOnline = false;
let searchQuery = '';

const dbBadge = document.getElementById('dbBadge');

function getApiEndpoint(path) {
  const inViewFolder = window.location.pathname.replace(/\\/g, '/').includes('/view/');
  const prefix = inViewFolder ? '../api/' : 'api/';
  return prefix + path;
}

// Check DB Connection Status
async function checkDbStatus() {
  try {
    const res = await fetch(getApiEndpoint('health.php'));
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'online') {
        isDbOnline = true;
        if (dbBadge) {
          dbBadge.className = 'db-badge online';
          dbBadge.innerHTML = `🟢 DB Online (${data.db} Mode - ${data.totalWords} คำ ในระบบ)`;
        }
      } else {
        throw new Error(data.error || 'DB health check failed');
      }
    } else {
      let errMsg = 'ไม่สามารถเชื่อมต่อ DB ได้';
      try {
        const errData = await res.json();
        if (errData.error) errMsg = errData.error;
      } catch (e) {}
      throw new Error(errMsg);
    }
  } catch (err) {
    isDbOnline = false;
    if (dbBadge) {
      dbBadge.className = 'db-badge offline';
      dbBadge.innerHTML = `🟡 โหมด Offline (ใช้ LocalStorage ในเครื่อง): ${err.message}`;
    }
  }
}

// Load words from MySQL DB or LocalStorage fallback
async function loadWords() {
  await checkDbStatus();

  if (isDbOnline) {
    try {
      const res = await fetch(getApiEndpoint('words.php'));
      if (res.ok) {
        customWords = await res.json();
        renderWords();
        return;
      }
    } catch (err) {
      console.warn('⚠️ Fetching from DB failed, falling back to LocalStorage:', err);
    }
  }

  // Fallback to localStorage
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    customWords = Array.isArray(saved) ? saved : [];
  } catch (error) {
    customWords = [];
  }
  renderWords();
}

function saveLocalBackup() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customWords));
}

function renderWords() {
  const list = document.getElementById('savedWords');
  const count = document.getElementById('savedCount');

  // Filter words if search query present
  const filteredWords = searchQuery
    ? customWords.filter(w => 
        (w.h && w.h.includes(searchQuery)) ||
        (w.p && w.p.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (w.t && w.t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : customWords;

  if (count) {
    count.textContent = searchQuery 
      ? `พบ ${filteredWords.length} จาก ${customWords.length} คำ`
      : `${customWords.length} คำ`;
  }

  if (!list) return;
  list.innerHTML = '';

  if (filteredWords.length === 0) {
    list.innerHTML = searchQuery
      ? `<div class="empty-state">ไม่พบคำศัพท์ที่ตรงกับ "${searchQuery}"</div>`
      : '<div class="empty-state">ยังไม่มีคำที่เพิ่ม ลองเพิ่มคำแรกของคุณ</div>';
    return;
  }

  filteredWords.forEach((word) => {
    const item = document.createElement('div');
    item.className = 'saved-item';
    const lvlText = word.l ? `HSK ${word.l}` : 'คำเพิ่มเอง';
    const wordId = word.id || '';
    
    item.innerHTML = `
      <div class="saved-left">
        <span class="saved-hanzi"></span>
        <span class="saved-badge">${lvlText}</span>
      </div>
      <div class="saved-info">
        <div class="saved-pinyin"></div>
        <div class="saved-meaning"></div>
      </div>
      <button class="delete-btn" type="button" data-id="${wordId}" data-hanzi="${encodeURIComponent(word.h)}">ลบ</button>`;

    item.querySelector('.saved-hanzi').textContent = word.h;
    item.querySelector('.saved-pinyin').textContent = word.p || 'ยังไม่ได้เพิ่ม pinyin';
    item.querySelector('.saved-meaning').textContent = word.t || 'ยังไม่ได้เพิ่มความหมาย';
    list.appendChild(item);
  });
}

function setStatus(message, isError = false) {
  const statusEl = document.getElementById('formStatus');
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.style.color = isError ? '#cf222e' : '#1f883d';
  }
}

// Handle Form Submit (Add/Update word)
document.getElementById('wordForm')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const hanziVal = form.hanzi.value.trim();
  const pinyinVal = form.pinyin.value.trim();
  const meaningVal = form.meaning.value.trim() || 'คำที่เพิ่มเอง';
  const levelVal = form.level.value ? Number(form.level.value) : null;

  if (!hanziVal) {
    setStatus('กรุณากรอกตัวอักษรจีน', true);
    return;
  }

  const wordObj = {
    hanzi: hanziVal,
    pinyin: pinyinVal,
    meaning: meaningVal,
    level: levelVal
  };

  if (isDbOnline) {
    try {
      const response = await fetch(getApiEndpoint('words.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wordObj)
      });

      if (response.ok) {
        const resData = await response.json();
        const dbName = resData.db || 'DB';
        setStatus(`✅ บันทึก "${hanziVal}" ลง ${dbName} สำเร็จ!`);
        form.reset();
        form.hanzi.focus();
        await loadWords(); // refresh list & db badge count
        return;
      } else {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save');
      }
    } catch (err) {
      console.error('❌ Failed to save word to DB:', err);
      setStatus(`⚠️ บันทึกลง DB ไม่สำเร็จ: ${err.message}`, true);
    }
  }

  // LocalStorage Fallback
  const fallbackWord = { h: hanziVal, p: pinyinVal, t: meaningVal, l: levelVal };
  customWords = customWords.filter(saved => saved.h !== hanziVal);
  customWords.unshift(fallbackWord);
  saveLocalBackup();
  renderWords();
  form.reset();
  setStatus(`เพิ่ม "${hanziVal}" ไว้ใน LocalStorage เรียบร้อย`);
  form.hanzi.focus();
});

// Handle Delete word
document.getElementById('savedWords')?.addEventListener('click', async (event) => {
  const button = event.target.closest('.delete-btn');
  if (!button) return;

  const wordId = button.dataset.id;
  const hanzi = decodeURIComponent(button.dataset.hanzi);

  if (isDbOnline) {
    try {
      let deleteUrl = wordId ? getApiEndpoint(`words.php?id=${wordId}`) : getApiEndpoint(`words.php?hanzi=${encodeURIComponent(hanzi)}`);
      const res = await fetch(deleteUrl, { method: 'DELETE' });
      if (res.ok) {
        setStatus(`ลบคำว่า "${hanzi}" ออกจาก MySQL DB แล้ว`);
        await loadWords();
        return;
      }
    } catch (err) {
      console.error('❌ Failed to delete word from DB:', err);
    }
  }

  // LocalStorage fallback
  customWords = customWords.filter(w => w.h !== hanzi);
  saveLocalBackup();
  renderWords();
  setStatus(`ลบคำว่า "${hanzi}" ออกจากรายการแล้ว`);
});

// Handle Search input
document.getElementById('searchWordInput')?.addEventListener('input', (e) => {
  searchQuery = e.target.value.trim();
  renderWords();
});

// Initial load
loadWords();
