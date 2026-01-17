const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'reports.json');

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for base64 images

// Create HTTP Server & Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity (or limit to dashboard URL)
        methods: ["GET", "POST", "PATCH"]
    }
});

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Helper to read data
const readData = () => {
    if (!fs.existsSync(DATA_FILE)) {
        // Initialize with the mock data we had in the dashboard
        const initialData = [
        ];
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
        return initialData;
    }
    return JSON.parse(fs.readFileSync(DATA_FILE));
};

// Helper to write data
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// --- Routes ---

// 1. Get All Reports (for Dashboard)
app.get('/reports', (req, res) => {
    const reports = readData();
    res.json(reports);
});

// 2. Submit Report (from Android App)
app.post('/reports', (req, res) => {
    try {
        const newReport = req.body;
        console.log('Received new report from:', newReport.userId || 'Unknown');

        // Validation (basic)
        if (!newReport.location || !newReport.type) {
            return res.status(400).json({ error: 'Missing location or type' });
        }

        const reports = readData();

        // Add server-side metadata
        const reportWithMeta = {
            ...newReport,
            id: `r-${Date.now()}`,
            timestamp: new Date().toISOString(),
            status: 'Pending', // Default status
            estimatedCompletionDate: null,
            userFeedback: null
        };

        reports.unshift(reportWithMeta); // Add to top
        writeData(reports);

        // Notify all clients
        io.emit('reports_updated', reports);

        res.status(201).json({ message: 'Report submitted successfully', id: reportWithMeta.id });
    } catch (error) {
        console.error('Error saving report:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 3. Update Report (for Dashboard Admin/Govt)
app.patch('/reports/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    let reportsData = readData();

    const index = reportsData.findIndex(r => r.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Report not found' });
    }

    // Merge updates
    reportsData[index] = { ...reportsData[index], ...updates };
    writeData(reportsData);

    // Notify all clients
    io.emit('reports_updated', reportsData);

    res.json(reportsData[index]);
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`To connect from phone, find your PC IP (e.g., 192.168.x.x)`);
});
