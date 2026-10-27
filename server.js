const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the HTML/CSS files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API endpoint to generate a unique meeting link
app.post('/create-session', (req, res) => {
    const { caseNumber } = req.body;
    
    // Generate a secure, random Room ID
    const roomID = uuidv4(); 
    
    // Create the full URL 
    const host = req.get('host');
    const protocol = req.protocol;
    // Render uses HTTPS automatically
    const joinLink = `${protocol}://${host}/room.html?roomID=${roomID}&case=${encodeURIComponent(caseNumber)}`;

    res.json({ link: joinLink });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});