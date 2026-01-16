import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [reports, setReports] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Base URL - change this if accessing from another device
    const BASE_URL = 'http://localhost:3000';
    const API_URL = `${BASE_URL}/reports`;

    const fetchReports = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setReports(data);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    // Initial Fetch & Real-time Updates
    useEffect(() => {
        fetchReports();

        // Connect to Socket.io
        const socket = io(BASE_URL);

        socket.on('connect', () => {
            console.log('Connected to real-time analytics server');
        });

        // Listen for updates from server
        socket.on('reports_updated', (updatedReports) => {
            console.log('Real-time update received');
            setReports(updatedReports);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const addReport = async (newReport) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newReport)
            });
            if (response.ok) {
                fetchReports(); // Refresh list
            }
        } catch (error) {
            console.error("Failed to add report", error);
        }
    };

    const updateReportStatus = async (id, newStatus, additionalData = {}) => {
        try {
            await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, ...additionalData })
            });
            // Update local state immediately for better UX
            setReports(prev => prev.map(r =>
                r.id === id ? { ...r, status: newStatus, ...additionalData } : r
            ));
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const addFeedback = async (id, feedback) => {
        try {
            await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userFeedback: feedback })
            });
            setReports(prev => prev.map(r =>
                r.id === id ? { ...r, userFeedback: feedback } : r
            ));
        } catch (error) {
            console.error("Failed to submit feedback", error);
        }
    };

    const value = {
        reports,
        users,
        loading,
        addReport,
        updateReportStatus,
        addFeedback
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
