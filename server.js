const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000; // Render uses 10000

// Tell the server that ALL your files are in the 'public' folder
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

app.use(express.json());

// When someone visits the home page, send index.html from the public folder
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.post('/create-session', (req, res) => {
    const { caseNumber } = req.body;
    const roomID = uuidv4();
    // Link to room.html which is inside 'public'
    const joinLink = `${req.protocol}://${req.get('host')}/room.html?roomID=${roomID}`;
    res.json({ link: joinLink });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Looking for files in: ${publicPath}`);
});