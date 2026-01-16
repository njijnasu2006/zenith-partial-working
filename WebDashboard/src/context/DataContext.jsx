import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [reports, setReports] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock Data Initialization
    useEffect(() => {
        // Simulate fetching initial data
        const mockReports = [
            {
                id: 'r-101',
                userId: 'u-1',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                location: { lat: 20.2961, lng: 85.8245, address: 'Patia, Bhubaneswar' },
                severity: 'High',
                type: 'Pothole',
                status: 'Verified',
                imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400',
                description: 'Large pothole near the junction.',
                source: 'IoT-verified',
                estimatedCompletionDate: null,
                userFeedback: null
            },
            {
                id: 'r-102',
                userId: 'u-2',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                location: { lat: 20.3000, lng: 85.8300, address: 'KIIT Square' },
                severity: 'Medium',
                type: 'Uneven Road',
                status: 'Pending',
                imageUrl: 'https://images.unsplash.com/photo-1584448082946-b747d93a206c?auto=format&fit=crop&q=80&w=400',
                description: 'Bumpy road section.',
                source: 'User Report',
                estimatedCompletionDate: null,
                userFeedback: null
            },
            {
                id: 'r-103',
                userId: 'u-3',
                timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                location: { lat: 20.2900, lng: 85.8200, address: 'Jayadev Vihar' },
                severity: 'Critical',
                type: 'Pothole',
                status: 'Pending',
                imageUrl: 'https://images.unsplash.com/photo-1626885093721-a4a0f448c6e5?auto=format&fit=crop&q=80&w=400',
                description: 'Deep pothole, dangerous for bikers.',
                source: 'IoT-verified',
                estimatedCompletionDate: null,
                userFeedback: null
            },
            {
                id: 'r-104',
                userId: 'u-4',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
                location: { lat: 20.2950, lng: 85.8250, address: 'Master Canteen' },
                severity: 'High',
                type: 'Pothole',
                status: 'Resolved',
                imageUrl: 'https://images.unsplash.com/photo-1584448082946-b747d93a206c?auto=format&fit=crop&q=80&w=400',
                description: 'Fixed yesterday.',
                source: 'User Report',
                estimatedCompletionDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                userFeedback: { rating: 5, comment: 'Great job, fixed very quickly!' }
            }
        ];

        setReports(mockReports);
        setLoading(false);
    }, []);

    const addReport = (newReport) => {
        const reportWithMeta = {
            ...newReport,
            id: `r-${Date.now()}`,
            timestamp: new Date().toISOString(),
            status: 'Pending',
            estimatedCompletionDate: null,
            userFeedback: null
        };
        setReports(prev => [reportWithMeta, ...prev]);
    };

    const updateReportStatus = (id, newStatus, additionalData = {}) => {
        setReports(prev => prev.map(r =>
            r.id === id ? { ...r, status: newStatus, ...additionalData } : r
        ));
    };

    const addFeedback = (id, feedback) => {
        setReports(prev => prev.map(r =>
            r.id === id ? { ...r, userFeedback: feedback } : r
        ));
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
