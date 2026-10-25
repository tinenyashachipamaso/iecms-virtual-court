const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Point to the public folder
const publicPath = path.join(__dirname, 'public');

// 2. Serve static files from the public folder
app.use(express.static(publicPath));

// 3. Explicitly route the root URL to index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.use(express.json());

// 4. API to generate link
app.post('/create-session', (req, res) => {
    const { caseNumber } = req.body;
    const roomID = uuidv4();
    // Links to room.html which is inside public/
    const joinLink = `${req.protocol}://${req.get('host')}/room.html?roomID=${roomID}`;
    res.json({ link: joinLink });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Serving files from: ${publicPath}`);
});