const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Включаем чтение JSON в запросах
app.use(express.json());

// Раздаем статические файлы (наши html страницы) из папки public
app.use(express.static(path.join(__dirname, 'public')));

// Переменные для хранения данных открытки в памяти сервера
let cardData = {
    receiver: "",
    pages: []
};

// Маршрут для сохранения открытки (от админа)
app.post('/api/save-card', (req, res) => {
    const { receiver, pages } = req.body;
    if (!receiver || !pages || pages.length === 0) {
        return res.status(400).json({ success: false, message: "Неповні дані" });
    }
    
    cardData.receiver = receiver.trim().toLowerCase();
    cardData.pages = pages;
    
    res.json({ success: true, message: "Листівку успішно збережено на сервері!" });
});

// Маршрут для получения открытки (для пользователя)
app.post('/api/get-card', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ success: false, message: "Ім'я обов'язкове" });
    }

    if (name.trim().toLowerCase() === cardData.receiver) {
        res.json({ success: true, pages: cardData.pages, originalName: cardData.receiver });
    } else {
        res.json({ success: false, message: "Для цього імені немає листівок." });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
