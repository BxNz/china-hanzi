const STORAGE_KEY = 'hanzi-custom-words';
let customWords = [];

function loadWords(){
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    customWords = Array.isArray(saved) ? saved : [];
  } catch (error) {
    customWords = [];
  }
}

function saveWords(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customWords));
}

function renderWords(){
  const list = document.getElementById('savedWords');
  const count = document.getElementById('savedCount');
  count.textContent = `${customWords.length} คำ`;
  list.innerHTML = '';

  if (customWords.length === 0) {
    list.innerHTML = '<div class="empty-state">ยังไม่มีคำที่เพิ่ม ลองเพิ่มคำแรกของคุณ</div>';
    return;
  }

  customWords.forEach((word, index) => {
    const item = document.createElement('div');
    item.className = 'saved-item';
    item.innerHTML = `
      <span class="saved-hanzi"></span>
      <div class="saved-info">
        <div class="saved-pinyin"></div>
        <div class="saved-meaning"></div>
      </div>
      <button class="delete-btn" type="button" data-index="${index}">ลบ</button>`;
    item.querySelector('.saved-hanzi').textContent = word.h;
    item.querySelector('.saved-pinyin').textContent = word.p || 'ยังไม่ได้เพิ่ม pinyin';
    item.querySelector('.saved-meaning').textContent = word.t || 'ยังไม่ได้เพิ่มความหมาย';
    list.appendChild(item);
  });
}

function setStatus(message){
  document.getElementById('formStatus').textContent = message;
}

document.getElementById('wordForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const word = {
    h: form.hanzi.value.trim(),
    p: form.pinyin.value.trim(),
    t: form.meaning.value.trim() || 'คำที่เพิ่มเอง',
    l: form.level.value ? Number(form.level.value) : null
  };

  customWords = customWords.filter(saved => saved.h !== word.h);
  customWords.unshift(word);
  saveWords();
  renderWords();
  form.reset();
  setStatus(`เพิ่ม ${word.h} แล้ว พร้อมใช้ในหน้า “ฝึกเขียน”`);
  form.hanzi.focus();
});

document.getElementById('savedWords').addEventListener('click', (event) => {
  const button = event.target.closest('.delete-btn');
  if (!button) return;
  customWords.splice(Number(button.dataset.index), 1);
  saveWords();
  renderWords();
  setStatus('ลบคำออกจากรายการแล้ว');
});

document.getElementById('clearWords').addEventListener('click', () => {
  if (customWords.length === 0) return;
  customWords = [];
  saveWords();
  renderWords();
  setStatus('ล้างคำที่เพิ่มไว้ทั้งหมดแล้ว');
});

loadWords();
renderWords();
