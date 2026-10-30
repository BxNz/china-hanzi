const queryInput = document.getElementById('wordQuery');
const resultsList = document.getElementById('wordResults');
const resultStatus = document.getElementById('resultStatus');
let vocabulary = [];

function normalizeSearchText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim();
}

function showMessage(message) {
  resultsList.replaceChildren();
  const item = document.createElement('li');
  item.className = 'empty-results';
  item.textContent = message;
  resultsList.appendChild(item);
}

function renderResults() {
  const query = normalizeSearchText(queryInput.value);
  const matches = vocabulary.filter((word) => {
    if (!query) return true;
    return [word.hanzi, word.pinyin, word.meaning]
      .some((value) => normalizeSearchText(value).includes(query));
  });

  resultsList.replaceChildren();
  if (matches.length === 0) {
    resultStatus.textContent = 'ไม่พบคำศัพท์';
    showMessage('ไม่พบคำที่ตรงกัน ลองค้นด้วยคำจีน พินอิน หรือความหมายอื่น');
    return;
  }

  resultStatus.textContent = `พบ ${matches.length.toLocaleString('th-TH')} คำ`;
  const fragment = document.createDocumentFragment();
  matches.forEach((word) => {
    const item = document.createElement('li');
    item.className = 'word-result';

    const hanzi = document.createElement('span');
    hanzi.className = 'word-hanzi';
    hanzi.lang = 'zh';
    hanzi.textContent = word.hanzi || '—';

    const pinyin = document.createElement('span');
    pinyin.className = 'word-pinyin';
    pinyin.textContent = word.pinyin || '—';

    const meaning = document.createElement('span');
    meaning.className = 'word-meaning';
    meaning.textContent = word.meaning || 'ไม่มีความหมาย';

    const level = document.createElement('span');
    level.className = 'word-level';
    level.textContent = word.level ? `HSK ${word.level}` : 'คำเพิ่มเติม';

    item.append(hanzi, pinyin, meaning, level);
    fragment.appendChild(item);
  });
  resultsList.appendChild(fragment);
}

function normalizeWord(word) {
  return {
    hanzi: word.h || word.hanzi || '',
    pinyin: word.p || word.pinyin || '',
    meaning: word.t || word.meaning || '',
    level: word.l || word.level || ''
  };
}

async function loadVocabulary() {
  try {
    const response = await fetch('../api/words.php');
    if (!response.ok) throw new Error(`Vocabulary request failed: ${response.status}`);
    const words = await response.json();
    if (!Array.isArray(words)) throw new Error('Vocabulary response is not a list');
    if (words.length > 0) {
      vocabulary = words.map(normalizeWord);
      renderResults();
      return;
    }
  } catch (error) {
    console.warn('Could not load vocabulary from the database; trying the static vocabulary file.', error);
  }

  try {
    const response = await fetch('../json/vocab.json');
    if (!response.ok) throw new Error(`Vocabulary file request failed: ${response.status}`);
    const words = await response.json();
    if (!Array.isArray(words)) throw new Error('Vocabulary file is not a list');
    vocabulary = words.map(normalizeWord);
    renderResults();
  } catch (error) {
    console.error('Failed to load vocabulary.', error);
    resultStatus.textContent = 'โหลดคำศัพท์ไม่สำเร็จ';
    showMessage('โหลดคำศัพท์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
  }
}

queryInput.addEventListener('input', renderResults);
loadVocabulary();
