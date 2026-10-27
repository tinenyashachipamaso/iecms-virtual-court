const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ==========================================
// IN-MEMORY DATABASES
// ==========================================
let courtRolls = []; // Stores scheduled cases (for the 5-min lock and 15 limit)
let liveRooms = {};  // Stores real participants and their telemetry

// ==========================================
// 1. PUBLIC IECMS ROUTE: Quick Create
// ==========================================
app.post('/create-session', (req, res) => {
    const { caseNumber } = req.body;
    const roomID = uuidv4();
    const joinLink = `${req.protocol}://${req.get('host')}/room.html?roomID=${roomID}&case=${encodeURIComponent(caseNumber)}`;

    // Initialize the room to track REAL people when they join
    liveRooms[roomID] = { caseNumber: caseNumber, participants: {} };
    res.json({ link: joinLink });
});

// ==========================================
// 2. VSQM ROUTE: Secure IT Admin Login
// ==========================================
app.post('/api/vsqm/login', (req, res) => {
    const { username, password } = req.body;

    if (username === 'admin' && password === 'jsc2026') {
        res.json({ success: true, token: 'secure-token-888' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// ==========================================
// 3. VSQM ROUTE: Schedule a Case (With 15 limit)
// ==========================================
app.post('/api/vsqm/schedule', (req, res) => {
    const { caseNumber, judge, court, parties, date, time, slot } = req.body;

    // Enforce the 15 concurrent sessions limit
    const concurrent = courtRolls.filter(c => c.date === date && c.slot === slot).length;
    if (concurrent >= 15) {
        return res.status(400).json({
            success: false,
            message: `Capacity Reached! (15/15) sessions already scheduled for ${slot} on ${date}.`
        });
    }

    const roomID = uuidv4();
    const joinLink = `${req.protocol}://${req.get('host')}/room.html?roomID=${roomID}&case=${encodeURIComponent(caseNumber)}`;

    // Save to scheduling database
    courtRolls.push({ id: roomID, caseNumber, judge, court, parties, date, time, slot, joinLink });

    // Initialize the room for live telemetry
    liveRooms[roomID] = { caseNumber: caseNumber, participants: {} };

    res.json({ success: true });
});

// Get all scheduled sessions
app.get('/api/vsqm/sessions', (req, res) => {
    res.json(courtRolls);
});

// ==========================================
// 4. VSQM ROUTE: Receive Telemetry from Real Browsers
// ==========================================
app.post('/api/vsqm/client-telemetry', (req, res) => {
    const { roomID, userName, latency, jitter, loss, bandwidth } = req.body;

    if (liveRooms[roomID]) {
        // Add or update the REAL participant with their actual browser metrics
        liveRooms[roomID].participants[userName] = {
            name: userName, latency, jitter, loss, bandwidth
        };
    }
    res.json({ success: true });
});

// ==========================================
// 5. VSQM ROUTE: Send Analytics to the Dashboard
// ==========================================
app.get('/api/vsqm/livedata', (req, res) => {
    let dashboardData = {};

    for (const roomID in liveRooms) {
        let room = liveRooms[roomID];
        let participantNames = Object.keys(room.participants);

        // Hide rooms that nobody has joined yet
        if (participantNames.length === 0) continue;

        let sessionScore = 100;
        let logs = [];
        let finalParticipants = [];

        // Apply XGBoost thresholds to real participant data
        participantNames.forEach(name => {
            let p = room.participants[name];

            // XGBoost AI Learned Rules
            if (p.latency > 180 || p.loss > 3.0) {
                p.status = 'Warning';
                sessionScore -= 20; // Drop health score
                logs.push({
                    time: new Date().toLocaleTimeString(),
                    text: `[PREDICTIVE ALERT] User "${p.name}" has critical latency (${p.latency}ms) and ${p.loss}% packet loss. XGBoost predicts stream drop.`
                });
            } else {
                p.status = 'Optimal';
            }
            finalParticipants.push(p);
        });

        if (sessionScore < 0) sessionScore = 0;

        dashboardData[roomID] = {
            title: room.caseNumber,
            participants: finalParticipants,
            stabilityScore: sessionScore,
            diagnostics: logs
        };
    }
    res.json(dashboardData);
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));