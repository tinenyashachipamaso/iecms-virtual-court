const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve public folder
app.use(express.static('public'));

// Serve the local Zego library from node_modules
app.use('/libs', express.static(path.join(__dirname, 'node_modules', '@zegocloud', 'zego-uikit-prebuilt')));

app.use(express.json());

app.post('/create-session', (req, res) => {
    const { caseNumber } = req.body;
    const roomID = uuidv4();
    const joinLink = `${req.protocol}://${req.get('host')}/room.html?roomID=${roomID}`;
    res.json({ link: joinLink });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));