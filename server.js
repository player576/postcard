const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Явно отдаем файлы из папки public
app.use(express.static(path.join(__dirname, 'public')));

let cardData = {
    receiver: "",
    pages: []
};

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Страница админа
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.post('/api/save-card', (req, res) => {
    const { receiver, pages } = req.body;
    if (!receiver || !pages || pages.length === 0) {
        return res.status(400).json({ success: false, message: "Неповні дані" });
    }
    cardData.receiver = receiver.trim().toLowerCase();
    cardData.pages = pages;
    res.json({ success: true });
});

app.post('/api/get-card', (req, res) => {
    const { name } = req.body;
    if (name && name.trim().toLowerCase() === cardData.receiver) {
        res.json({ success: true, pages: cardData.pages });
    } else {
        res.json({ success: false, message: "Для цього імені немає листівок." });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен`);
});
