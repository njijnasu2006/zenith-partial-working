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

const db = require('./database');

// --- Routes ---

// 1. Get All Reports (for Dashboard)
app.get('/reports', async (req, res) => {
    try {
        const reports = await db.getAllReports();
        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Database Error' });
    }
});

// Helper to get road name from coordinates (Reverse Geocoding)
const getRoadName = async (lat, lng) => {
    try {
        // Using Nominatim (OpenStreetMap)
        // IMPORTANT: Requires User-Agent header
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${Number(lat).toFixed(4)}&lon=${Number(lng).toFixed(4)}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'ZenithPotholeDetector/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`Nominatim API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.display_name || "Unknown Address";
    } catch (error) {
        console.error("Geocoding failed:", error.message);
        return "Unknown Address";
    }
};

// ... existing code ...

// 2. Submit Report (from Android App)
app.post('/reports', async (req, res) => {
    try {
        const newReport = req.body;
        console.log('Received new report from:', newReport.userId || 'Unknown');

        // Validation (basic)
        if (!newReport.location || !newReport.type) {
            return res.status(400).json({ error: 'Missing location or type' });
        }

        // Automatic Reverse Geocoding
        let address = "Unknown Address";
        if (newReport.location.lat && newReport.location.lng) {
            address = await getRoadName(newReport.location.lat, newReport.location.lng);
            console.log(`Resolved address: ${address}`);
        }

        // Auto-Reject Invalid Reports
        let initialStatus = 'Pending';
        if (newReport.type === 'Invalid' || newReport.severity === 'Invalid') {
            initialStatus = 'Rejected';
        }

        // Add server-side metadata
        const reportWithMeta = {
            ...newReport,
            location: {
                ...newReport.location,
                address: address // Override/Set address
            },
            id: `r-${Date.now()}`,
            timestamp: new Date().toISOString(),
            status: initialStatus, // Default or Rejected
        };

        // Save to DB
        await db.createReport(reportWithMeta);

        // Notify all clients
        // Fetch fresh list to ensure sync
        const reports = await db.getAllReports();
        io.emit('reports_updated', reports);

        res.status(201).json({ message: 'Report submitted successfully', id: reportWithMeta.id });
    } catch (error) {
        console.error('Error saving report:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 3. Update Report (for Dashboard Admin/Govt)
app.patch('/reports/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const updatedReport = await db.updateReport(id, updates);

        if (!updatedReport) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Notify all clients
        const reports = await db.getAllReports();
        io.emit('reports_updated', reports);

        res.json(updatedReport);
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({ error: 'Database Error' });
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`To connect from phone, find your PC IP (e.g., 192.168.x.x)`);
});
