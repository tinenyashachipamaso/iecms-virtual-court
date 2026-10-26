const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// --- IN-MEMORY DATABASE ---
let courtRolls = []; // Stores all scheduled cases

// 1. SCHEDULING API: Schedule a case and enforce the 15 concurrent limit
app.post('/api/schedule', (req, res) => {
    const { caseNumber, judge, court, parties, date, slot } = req.body;

    // Check how many sessions are already scheduled for this Date and Slot
    const concurrentSessions = courtRolls.filter(c => c.date === date && c.slot === slot).length;

    if (concurrentSessions >= 15) {
        return res.status(400).json({ success: false, message: `Capacity Reached: The ${slot} slot on ${date} already has 15 concurrent sessions.` });
    }

    const roomID = uuidv4();
    const host = req.get('host');
    const protocol = req.protocol;
    const joinLink = `${protocol}://${host}/room.html?roomID=${roomID}&case=${encodeURIComponent(caseNumber)}`;

    const newCase = { id: roomID, caseNumber, judge, court, parties, date, slot, joinLink, status: 'Scheduled' };
    courtRolls.push(newCase);

    res.json({ success: true, case: newCase });
});

// 2. SESSIONS API: Get all scheduled cases
app.get('/api/sessions', (req, res) => {
    res.json(courtRolls);
});

// 3. VSQM API: Secure Login
app.post('/api/vsqm/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'jsc2026') {
        res.json({ success: true, token: 'secure-vsqm-token-888' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid Credentials' });
    }
});

// 4. VSQM API: PARTICIPANT-LEVEL Telemetry Simulation
app.get('/api/vsqm/telemetry/:id', (req, res) => {
    // Simulating 3 participants in the court
    const participants = [
        { name: "Hon. Judge Ngoshi", role: "Presiding", latency: Math.floor(Math.random() * 20) + 20, loss: 0 },
        { name: "Tapiwa Chirinda", role: "Plaintiff Counsel", latency: Math.floor(Math.random() * 30) + 40, loss: 0 },
        { name: "Wilson", role: "Defendant", latency: Math.floor(Math.random() * 300) + 50, loss: (Math.random() * 5).toFixed(1) } // Wilson has bad internet!
    ];

    let sessionHealth = 98;
    let nlpLog = `[${new Date().toLocaleTimeString()}] AI Check: All network nodes stable.`;

    // Check Wilson's connection specifically (Predictive Modeling logic)
    const wilson = participants[2];
    if (wilson.latency > 200 || wilson.loss > 3) {
        sessionHealth = Math.floor(Math.random() * 30) + 40; // Health drops
        nlpLog = `<span style="color:#e94560;">[PREDICTIVE ALERT] ${wilson.name} (${wilson.role}) is experiencing severe packet loss (${wilson.loss}%) and high latency (${wilson.latency}ms). High risk of dropping out of the session. Recommend immediate audio-only fallback.</span>`;
    }

    res.json({ participants, sessionHealth, nlpLog });
});

app.listen(PORT, () => {
    console.log(`Unified Server running on port ${PORT}`);
});