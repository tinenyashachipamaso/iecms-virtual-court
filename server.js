const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve everything in the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

// Explicitly serve the library file to be safe
app.get('/zego-uikit-prebuilt.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'zego-uikit-prebuilt.js'));
});

app.post('/create-session', (req, res) => {
    const { caseNumber } = req.body;
    const roomID = uuidv4();
    const joinLink = `${req.protocol}://${req.get('host')}/room.html?roomID=${roomID}`;
    res.json({ link: joinLink });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));