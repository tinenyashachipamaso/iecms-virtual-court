const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve all files in root directory
app.use(express.static(__dirname));

// Force correct MIME type for CSS
app.get('/style.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(path.join(__dirname, 'style.css'));
});

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(express.json());

app.post('/create-session', (req, res) => {
    const { caseNumber } = req.body;
    const roomID = uuidv4();
    res.json({ link: `${req.protocol}://${req.get('host')}/room.html?roomID=${roomID}` });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));