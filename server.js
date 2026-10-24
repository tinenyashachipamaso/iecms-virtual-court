const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

app.post('/create-session', (req, res) => {
    const { caseNumber } = req.body;
    const roomID = uuidv4();
    // Ensure the link points correctly to the room.html in the public folder
    const joinLink = `${req.protocol}://${req.get('host')}/room.html?roomID=${roomID}`;
    res.json({ link: joinLink });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));