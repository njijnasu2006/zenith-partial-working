const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const KEY_DB = path.join(__dirname, 'reports.sqlite');

// Initialize Database
const db = new sqlite3.Database(KEY_DB, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeschema();
    }
});

function initializeschema() {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        userId TEXT,
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        description TEXT,
        latitude REAL,
        longitude REAL,
        address TEXT,
        imageUrl TEXT,
        timestamp TEXT,
        status TEXT DEFAULT 'Pending'
    )
    `;

    db.run(createTableQuery, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Reports table ready.');
        }
    });
}

/**
 * Get all reports
 * @returns {Promise<Array>}
 */
const getAllReports = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM reports ORDER BY timestamp DESC", [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                // Parse JSON fields if necessary (none currently, but good practice)
                // Also reconstruct the nested 'location' object for compatibility with frontend
                const reports = rows.map(row => ({
                    ...row,
                    location: {
                        lat: row.latitude,
                        lng: row.longitude,
                        address: row.address
                    }
                }));
                resolve(reports);
            }
        });
    });
};

/**
 * Create a new report
 * @param {Object} report 
 * @returns {Promise<Object>}
 */
const createReport = (report) => {
    return new Promise((resolve, reject) => {
        const query = `
        INSERT INTO reports (id, userId, type, severity, description, latitude, longitude, address, imageUrl, timestamp, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            report.id,
            report.userId || 'Anonymous',
            report.type,
            report.severity,
            report.description || '',
            report.location?.lat || 0,
            report.location?.lng || 0,
            report.location?.address || 'Unknown',
            report.imageUrl || '',
            report.timestamp,
            report.status
        ];

        db.run(query, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ ...report });
            }
        });
    });
};

/**
 * Update report status
 * @param {String} id 
 * @param {Object} updates 
 * @returns {Promise<Object>}
 */
const updateReport = (id, updates) => {
    return new Promise((resolve, reject) => {
        // Dynamic update query
        const fields = Object.keys(updates).map((key) => `${key} = ?`).join(', ');
        if (!fields) return resolve(null); // No updates

        const query = `UPDATE reports SET ${fields} WHERE id = ?`;
        const params = [...Object.values(updates), id];

        db.run(query, params, function (err) {
            if (err) {
                reject(err);
            } else {
                // Return updated report (need to fetch it)
                db.get("SELECT * FROM reports WHERE id = ?", [id], (err, row) => {
                    if (err || !row) reject(err || new Error('Report not found after update'));
                    else {
                        const report = {
                            ...row,
                            location: {
                                lat: row.latitude,
                                lng: row.longitude,
                                address: row.address
                            }
                        };
                        resolve(report);
                    }
                });
            }
        });
    });
};

module.exports = {
    getAllReports,
    createReport,
    updateReport
};
