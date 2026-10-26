const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// --- MEMORY: Array to hold active sessions for VSQM ---
let activeSessions = [];

// 1. IECMS ROUTE: Create the session
app.post('/create-session', (req, res) => {
    const { caseNumber } = req.body;
    const roomID = uuidv4(); 
    
    const host = req.get('host');
    const protocol = req.protocol;
    const joinLink = `${protocol}://${host}/room.html?roomID=${roomID}&case=${encodeURIComponent(caseNumber)}`;

    // Save this session to memory so the VSQM dashboard can see it
    activeSessions.push({ caseNumber, roomID, status: 'Active' });

    res.json({ link: joinLink });
});

// 2. VSQM ROUTE: Secure Login Verification
app.post('/api/vsqm/login', (req, res) => {
    const { username, password } = req.body;
    // IT Admin Credentials for the Judiciary
    if (username === 'admin' && password === 'jsc2026') {
        res.json({ success: true, token: 'secure-vsqm-token-888' });
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized: Invalid Credentials' });
    }
});

// 3. VSQM ROUTE: Send active sessions to the dashboard
app.get('/api/vsqm/sessions', (req, res) => {
    res.json(activeSessions);
});

// 4. VSQM ROUTE: Real-Time Telemetry Data Generator (Mimics XGBoost)
app.get('/api/vsqm/telemetry', (req, res) => {
    const latency = Math.floor(Math.random() * (300 - 50 + 1) + 50); // 50ms to 300ms
    const jitter = Math.floor(Math.random() * 40);
    const packetLoss = (Math.random() * 8).toFixed(1);
    
    let stabilityScore = 98;
    if (latency > 200 || packetLoss > 4) {
        stabilityScore = Math.floor(Math.random() * (70 - 40) + 40); // Danger zone
    }
    
    res.json({ latency, jitter, packetLoss, stabilityScore });
});

app.listen(PORT, () => {
    console.log(`VSQM Server running on port ${PORT}`);
});