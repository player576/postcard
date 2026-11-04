const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Підключення до Neon Postgres через рядок середовища Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Інициалізація таблиці листівок із колонкою для коду
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS postcards (
      id SERIAL PRIMARY KEY,
      receiver TEXT NOT NULL,
      code VARCHAR(4) NOT NULL,
      pages TEXT[] NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
initDB().catch(console.error);

// API: Зберегти листівку (з адмінки)
app.post('/api/save-card', async (req, res) => {
  const { receiver, code, pages } = req.body;
  
  if (!receiver || !code || !pages) {
    return res.json({ success: false, message: 'Усі поля обов\'язкові для заповнення!' });
  }

  try {
    await pool.query(
      'INSERT INTO postcards (receiver, code, pages) VALUES ($1, $2, $3)',
      [receiver.trim(), code.trim(), pages]
    );
    res.json({ success: true }); // <--- ОБЯЗАТЕЛЬНО должен возвращаться JSON
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Помилка бази даних при збереженні.' });
  }
});

// API: Отримати листівку за ім'ям та кодом (з головної сторінки)
app.post('/api/get-card', async (req, res) => {
  const { name, code } = req.body;

  if (!name || !code) {
    return res.json({ success: false, message: 'Введіть і ім\'я, і секретний код!' });
  }

  try {
    const result = await pool.query(
      'SELECT pages FROM postcards WHERE LOWER(receiver) = LOWER($1) AND code = $2',
      [name.trim(), code.trim()]
    );

    if (result.rows.length > 0) {
      res.json({ success: true, pages: result.rows[0].pages });
    } else {
      res.json({ success: false, message: 'Листівку не знайдено або введено невірний код!' });
    }
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Помилка сервера при пошуку листівки.' });
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
