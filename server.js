const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.use(express.json());
app.post('/create-session', (req, res) => {
    const { caseNumber } = req.body;
    res.json({ link: `${req.protocol}://${req.get('host')}/room.html?roomID=${uuidv4()}&case=${encodeURIComponent(caseNumber)}` });
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));