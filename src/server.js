const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'vocab.db');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from root directory
app.use(express.static(__dirname));

let db = null;

// Helper function to save SQLite DB state to disk
function saveDb() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error('❌ Failed to save SQLite DB to disk:', err.message);
  }
}

// Helper function to convert SQLite query results into array of key-value objects
function queryAll(sql, params = []) {
  if (!db) return [];
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  } catch (err) {
    console.error('❌ SQL Query error:', err.message, sql);
    return [];
  }
}

// Helper function to fetch a single row object
function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// Helper function to run mutating SQL statements (INSERT/UPDATE/DELETE) and auto-save
function runSql(sql, params = []) {
  if (!db) throw new Error('Database not initialized');
  db.run(sql, params);
  saveDb();
}

// Initialize SQLite Database with WASM engine
async function initDatabase() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const filebuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(filebuffer);
    console.log('✅ Loaded existing SQLite database from:', DB_PATH);
  } else {
    db = new SQL.Database();
    console.log('✅ Created new SQLite database in memory.');
  }

  // Create tables if not exist
  db.run(`
    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hanzi TEXT UNIQUE NOT NULL,
      pinyin TEXT,
      meaning TEXT,
      level INTEGER,
      category TEXT DEFAULT 'general',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  saveDb();

  // Seed data if empty
  const countRow = queryOne('SELECT COUNT(*) AS count FROM words');
  const count = countRow ? countRow.count : 0;
  if (count === 0) {
    console.log('🌱 Database is empty. Seeding initial vocabulary from json/vocab.json...');
    seedInitialVocab();
  } else {
    console.log(`📊 SQLite Database active with ${count} vocabulary words.`);
  }
}

// Seed initial vocabulary from json/vocab.json into SQLite table
function seedInitialVocab() {
  const jsonPath = path.join(__dirname, 'json', 'vocab.json');
  if (!fs.existsSync(jsonPath)) {
    console.warn('⚠️ json/vocab.json not found. Skipping seeding.');
    return;
  }

  try {
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const vocabList = JSON.parse(rawData);

    let insertedCount = 0;
    for (const item of vocabList) {
      if (item.h) {
        try {
          db.run(
            `INSERT OR IGNORE INTO words (hanzi, pinyin, meaning, level, category) VALUES (?, ?, ?, ?, ?)`,
            [item.h, item.p || '', item.t || '', item.l || null, item.cat || 'general']
          );
          insertedCount++;
        } catch (e) {
          // ignore duplicate
        }
      }
    }
    saveDb();
    console.log(`🎉 Successfully seeded ${insertedCount} words into SQLite database!`);
  } catch (parseErr) {
    console.error('❌ Error parsing json/vocab.json:', parseErr.message);
  }
}

// API Routes

// 1. Health check & DB status
app.get('/api/health', (req, res) => {
  const row = queryOne('SELECT COUNT(*) AS count FROM words');
  res.json({
    status: 'online',
    db: 'SQLite (sql.js WASM)',
    dbPath: DB_PATH,
    totalWords: row ? row.count : 0
  });
});

// 2. GET /api/words - Fetch vocabulary words from SQLite DB
app.get('/api/words', (req, res) => {
  const { level, search, limit } = req.query;
  let sql = 'SELECT id, hanzi AS h, pinyin AS p, meaning AS t, level AS l, category AS cat, created_at FROM words WHERE 1=1';
  const params = [];

  if (level && level !== 'all') {
    if (level === 'custom') {
      sql += ' AND level IS NULL';
    } else {
      sql += ' AND level = ?';
      params.push(Number(level));
    }
  }

  if (search) {
    sql += ' AND (hanzi LIKE ? OR pinyin LIKE ? OR meaning LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  sql += ' ORDER BY id DESC';

  if (limit) {
    sql += ' LIMIT ?';
    params.push(Number(limit));
  }

  const rows = queryAll(sql, params);
  res.json(rows);
});

// 3. POST /api/words - Insert or update word in SQLite DB
app.post('/api/words', (req, res) => {
  const { hanzi, pinyin, meaning, level, category } = req.body;

  if (!hanzi || !hanzi.trim()) {
    return res.status(400).json({ error: 'ตัวอักษรจีน (hanzi) จำเป็นต้องระบุ' });
  }

  const cleanHanzi = hanzi.trim();
  const cleanPinyin = pinyin ? pinyin.trim() : '';
  const cleanMeaning = meaning ? meaning.trim() : 'คำที่เพิ่มเอง';
  const parsedLevel = (level !== undefined && level !== null && level !== '') ? Number(level) : null;
  const cleanCategory = category ? category.trim() : 'custom';

  try {
    // Check if word exists
    const existing = queryOne('SELECT id FROM words WHERE hanzi = ?', [cleanHanzi]);
    if (existing) {
      runSql(
        `UPDATE words SET pinyin = ?, meaning = ?, level = ?, category = ? WHERE hanzi = ?`,
        [cleanPinyin, cleanMeaning, parsedLevel, cleanCategory, cleanHanzi]
      );
    } else {
      runSql(
        `INSERT INTO words (hanzi, pinyin, meaning, level, category) VALUES (?, ?, ?, ?, ?)`,
        [cleanHanzi, cleanPinyin, cleanMeaning, parsedLevel, cleanCategory]
      );
    }

    const updatedRow = queryOne('SELECT id, hanzi AS h, pinyin AS p, meaning AS t, level AS l, category AS cat, created_at FROM words WHERE hanzi = ?', [cleanHanzi]);

    res.status(200).json({
      message: 'บันทึกคำศัพท์ลง SQLite DB เรียบร้อยแล้ว',
      word: updatedRow
    });
  } catch (err) {
    console.error('❌ Error saving word:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETE /api/words/:id - Delete a word by ID
app.delete('/api/words/:id', (req, res) => {
  const { id } = req.params;
  const numId = Number(id);
  const existing = queryOne('SELECT id FROM words WHERE id = ?', [numId]);

  if (!existing) {
    return res.status(404).json({ error: 'ไม่พบคำศัพท์ที่ต้องการลบ' });
  }

  try {
    runSql('DELETE FROM words WHERE id = ?', [numId]);
    res.json({ message: 'ลบคำศัพท์เรียบร้อยแล้ว', deletedId: numId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE /api/words/by-hanzi/:hanzi - Delete word by hanzi text
app.delete('/api/words/by-hanzi/:hanzi', (req, res) => {
  const hanzi = decodeURIComponent(req.params.hanzi);
  const existing = queryOne('SELECT id FROM words WHERE hanzi = ?', [hanzi]);

  if (!existing) {
    return res.status(404).json({ error: 'ไม่พบคำศัพท์ที่ต้องการลบ' });
  }

  try {
    runSql('DELETE FROM words WHERE hanzi = ?', [hanzi]);
    res.json({ message: 'ลบคำศัพท์เรียบร้อยแล้ว', hanzi });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Express Server after Database is initialized
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Hanzi SQLite Database Server running at http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Failed to initialize database:', err);
});
