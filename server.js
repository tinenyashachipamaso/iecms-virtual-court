const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const app = express();

// Define the Port for Render
const PORT = process.env.PORT || 3000;

// Serve all files from the 'public' folder
// This handles index.html, room.html, style.css, and zego-uikit-prebuilt.js automatically
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

// Explicitly serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to generate meeting links
app.post('/create-session', (req, res) => {
    const { caseNumber } = req.body;
    const roomID = uuidv4();

    // Construct URL pointing to the room.html file
    const joinLink = `${req.protocol}://${req.get('host')}/room.html?roomID=${roomID}`;
    res.json({ link: joinLink });
});

// Start the server
app.listen(PORT, () => {
    console.log(`IECMS Server running on port ${PORT}`);
});