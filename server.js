const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Подключение к Neon через переменную окружения из Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Создание таблицы при старте
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS postcards (
      id SERIAL PRIMARY KEY,
      title TEXT,
      message TEXT,
      recipient TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
initDB().catch(console.error);

// API для открыток
app.get('/api/postcards', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM postcards ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

app.post('/api/postcards', async (req, res) => {
  const { title, message, recipient } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO postcards (title, message, recipient) VALUES ($1, $2, $3) RETURNING *',
      [title, message, recipient]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сохранения');
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
