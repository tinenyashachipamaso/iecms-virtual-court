const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API to generate a unique meeting link
app.post('/create-session', (req, res) => {
    const { caseNumber } = req.body;
    const roomID = uuidv4(); // Generates a random secure ID like "1b9d6bcd-bbfd-4b2d..."

    // Construct the URL to join
    const host = req.get('host');
    const protocol = req.protocol;
    // Note: Render provides HTTPS automatically.
    const joinLink = `${protocol}://${host}/room.html?roomID=${roomID}&case=${encodeURIComponent(caseNumber)}`;

    res.json({ link: joinLink });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});