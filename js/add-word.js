let customWords = [];
let isDbOnline = false;
let isAuthenticated = false;
let searchQuery = '';

const dbBadge = document.getElementById('dbBadge');

function getApiEndpoint(path) {
  const inViewFolder = window.location.pathname.replace(/\\/g, '/').includes('/view/');
  const prefix = inViewFolder ? '../api/' : 'api/';
  return prefix + path;
}

async function checkDbStatus() {
  try {
    const res = await fetch(getApiEndpoint('health.php'));
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'online') {
        isDbOnline = true;
        if (dbBadge) {
          dbBadge.className = 'db-badge online';
          dbBadge.textContent = `DB Online (${data.db} Mode - ${data.totalWords} คำ ในระบบ)`;
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
      dbBadge.textContent = `ฐานข้อมูลไม่พร้อมใช้งาน: ${err.message}`;
    }
  }

  setEditingEnabled(isAuthenticated && isDbOnline);
}

async function loadWords() {
  await checkDbStatus();

  if (!isDbOnline) {
    customWords = [];
    renderWords();
    return;
  }

  try {
    const response = await fetch(getApiEndpoint('words.php'));
    if (!response.ok) throw new Error('ไม่สามารถโหลดคำศัพท์ได้');
    customWords = await response.json();
  } catch (error) {
    customWords = [];
  }
  renderWords();
}

function setEditingEnabled(enabled) {
  document.querySelectorAll('#wordForm input, #wordForm select, #wordForm button, .delete-btn')
    .forEach(control => { control.disabled = !enabled; });
}

function setAuthenticated(user) {
  isAuthenticated = Boolean(user);
  document.getElementById('loginPanel').hidden = isAuthenticated;
  document.getElementById('managementPanel').hidden = !isAuthenticated;
  document.getElementById('accountName').textContent = user ? (user.name || user.username) : '';
  setEditingEnabled(isAuthenticated && isDbOnline);
}

async function initializeAuth() {
  try {
    const response = await fetch(getApiEndpoint('session.php'), { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      setAuthenticated(data.user);
      await loadWords();
      return;
    }
  } catch (error) {
    document.getElementById('loginStatus').textContent = 'ไม่สามารถเชื่อมต่อระบบได้';
  }
  setAuthenticated(null);
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
      <button class="delete-btn" type="button" data-id="${wordId}" data-hanzi="${encodeURIComponent(word.h)}" ${isDbOnline ? '' : 'disabled'}>ลบ</button>`;

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

document.getElementById('loginForm')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.getElementById('loginStatus');
  status.textContent = '';

  try {
    const response = await fetch(getApiEndpoint('login.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: form.username.value.trim(), password: form.password.value })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
    form.reset();
    setAuthenticated(data.user);
    await loadWords();
  } catch (error) {
    status.textContent = error.message;
  }
});

document.getElementById('logoutButton')?.addEventListener('click', async () => {
  try {
    const response = await fetch(getApiEndpoint('logout.php'), { method: 'POST' });
    if (!response.ok) throw new Error('ไม่สามารถออกจากระบบได้');
    document.getElementById('loginStatus').textContent = '';
  } catch (error) {
    document.getElementById('loginStatus').textContent = error.message;
  } finally {
    customWords = [];
    renderWords();
    setAuthenticated(null);
  }
});

// Handle Form Submit (Add/Update word)
document.getElementById('wordForm')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!isAuthenticated || !isDbOnline) return;
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

  try {
    const response = await fetch(getApiEndpoint('words.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wordObj)
    });

    const data = await response.json();
    if (response.status === 401) {
      setAuthenticated(null);
      document.getElementById('loginStatus').textContent = data.error || 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง';
      return;
    }
    if (!response.ok) throw new Error(data.error || 'บันทึกคำไม่สำเร็จ');
    setStatus(`บันทึก "${hanziVal}" ลง ${data.db || 'DB'} สำเร็จ`);
    form.reset();
    form.hanzi.focus();
    await loadWords();
  } catch (error) {
    setStatus(error.message, true);
  }
});

// Handle Delete word
document.getElementById('savedWords')?.addEventListener('click', async (event) => {
  const button = event.target.closest('.delete-btn');
  if (!button) return;
  if (!isAuthenticated || !isDbOnline) return;

  const wordId = button.dataset.id;
  const hanzi = decodeURIComponent(button.dataset.hanzi);

  try {
    const deleteUrl = wordId ? getApiEndpoint(`words.php?id=${wordId}`) : getApiEndpoint(`words.php?hanzi=${encodeURIComponent(hanzi)}`);
    const response = await fetch(deleteUrl, { method: 'DELETE' });
    const data = await response.json();
    if (response.status === 401) {
      setAuthenticated(null);
      document.getElementById('loginStatus').textContent = data.error || 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง';
      return;
    }
    if (!response.ok) throw new Error(data.error || 'ลบคำไม่สำเร็จ');
    setStatus(`ลบคำว่า "${hanzi}" ออกจากฐานข้อมูลแล้ว`);
    await loadWords();
  } catch (error) {
    setStatus(error.message, true);
  }
});

// Handle Search input
document.getElementById('searchWordInput')?.addEventListener('input', (e) => {
  searchQuery = e.target.value.trim();
  renderWords();
});

initializeAuth();
