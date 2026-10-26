const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Memory array to hold active sessions for the VSQM dashboard
let activeSessions = [];

// 1. ROUTE: Create a new video session (Used by the IECMS side)
app.post('/create-session', (req, res) => {
    const { caseNumber } = req.body;
    const roomID = uuidv4();

    const host = req.get('host');
    const protocol = req.protocol;
    const joinLink = `${protocol}://${host}/room.html?roomID=${roomID}&case=${encodeURIComponent(caseNumber)}`;

    // Save this session to our Big Data memory array
    activeSessions.push({ caseNumber, roomID, status: 'Active' });

    res.json({ link: joinLink });
});

// 2. ROUTE: Send active sessions to the VSQM Dashboard
app.get('/api/vsqm/sessions', (req, res) => {
    res.json(activeSessions);
});

// 3. ROUTE: Simulate Real-Time Telemetry Data (Your XGBoost predictive logic)
app.get('/api/vsqm/telemetry', (req, res) => {
    // Generate simulated network stats (Latency, Jitter, Packet Loss)
    const latency = Math.floor(Math.random() * (280 - 50 + 1) + 50);
    const jitter = Math.floor(Math.random() * 30);
    const packetLoss = (Math.random() * 6).toFixed(1);

    // Predictive Stability Score based on your Chapter 1 rules
    let stabilityScore = 98;
    if (latency > 200 || packetLoss > 4) {
        stabilityScore = Math.floor(Math.random() * (65 - 40) + 40); // Drop to Danger zone
    } else if (latency > 150) {
        stabilityScore = Math.floor(Math.random() * (85 - 70) + 70); // Warning zone
    }

    res.json({ latency, jitter, packetLoss, stabilityScore });
});

app.listen(PORT, () => {
    console.log(`VSQM Server running on port ${PORT}`);
});