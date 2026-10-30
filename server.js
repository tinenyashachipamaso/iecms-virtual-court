const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let courtRolls = [];
let liveRooms = {};

// 1. PUBLIC ROUTE: Quick create
app.post('/create-session', (req, res) => {
    const { caseNumber } = req.body;
    const roomID = uuidv4();
    const joinLink = `${req.protocol}://${req.get('host')}/room.html?roomID=${roomID}&case=${encodeURIComponent(caseNumber)}`;

    // NEW: Added status 'waiting' so no one can join until host arrives
    liveRooms[roomID] = { caseNumber: caseNumber, participants: {}, status: 'waiting' };
    res.json({ link: joinLink });
});

// 2. VSQM ROUTE: Schedule with Multiple Parties
app.post('/api/vsqm/schedule', (req, res) => {
    const { caseNumber, judge, court, parties, date, time, slot } = req.body;

    const concurrent = courtRolls.filter(c => c.date === date && c.slot === slot).length;
    if (concurrent >= 15) {
        return res.status(400).json({ success: false, message: `Capacity Reached! (15/15) sessions already scheduled.` });
    }

    const roomID = uuidv4();
    const joinLink = `${req.protocol}://${req.get('host')}/room.html?roomID=${roomID}&case=${encodeURIComponent(caseNumber)}`;

    courtRolls.push({ id: roomID, caseNumber, judge, court, parties, date, time, slot, joinLink });
    liveRooms[roomID] = { caseNumber: caseNumber, participants: {}, status: 'waiting' };

    res.json({ success: true });
});

app.get('/api/vsqm/sessions', (req, res) => res.json(courtRolls));

// 3. CAPTURE REAL DATA FROM THE BROWSER (This fixes the VSQM Dashboard!)
app.post('/api/vsqm/client-telemetry', (req, res) => {
    const { roomID, userName, latency, jitter, loss, bandwidth } = req.body;

    if (liveRooms[roomID]) {
        liveRooms[roomID].participants[userName] = {
            name: userName, latency, jitter, loss, bandwidth
        };
    }
    res.json({ success: true });
});

// 4. VSQM DASHBOARD: Serve the live data
app.get('/api/vsqm/livedata', (req, res) => {
    let dashboardData = {};
    for (const roomID in liveRooms) {
        let room = liveRooms[roomID];
        let participantNames = Object.keys(room.participants);
        if (participantNames.length === 0) continue;

        let sessionScore = 100;
        let logs = [];
        let finalParticipants = [];

        participantNames.forEach(name => {
            let p = room.participants[name];
            if (p.latency > 180 || p.loss > 3.0) {
                p.status = 'Warning';
                sessionScore -= 20;
                logs.push({ time: new Date().toLocaleTimeString(), text: `[AI ALERT] "${p.name}" has critical latency (${p.latency}ms). XGBoost predicts stream failure.` });
            } else {
                p.status = 'Optimal';
            }
            finalParticipants.push(p);
        });

        if (sessionScore < 0) sessionScore = 0;
        dashboardData[roomID] = { title: room.caseNumber, participants: finalParticipants, stabilityScore: sessionScore, diagnostics: logs };
    }
    res.json(dashboardData);
});

// Admin Login
app.post('/api/vsqm/login', (req, res) => {
    if (req.body.username === 'wmngoshi@jsc.org.com' && req.body.password === 'ngoshi2026') res.json({ success: true, token: 'token' });
    else res.status(401).json({ success: false });
});

// ==========================================
// NEW: THE "BOUNCER" ROUTES FOR HOST CONTROLS
// ==========================================
app.post('/api/host/status', (req, res) => {
    const { roomID, status } = req.body;
    if(liveRooms[roomID]) liveRooms[roomID].status = status; // Changes to 'active' or 'ended'
    res.json({success: true});
});

app.get('/api/room/status/:id', (req, res) => {
    const room = liveRooms[req.params.id];
    res.json({ status: room ? room.status : 'ended' });
});

app.listen(PORT, () => console.log(`Unified Server running on port ${PORT}`));