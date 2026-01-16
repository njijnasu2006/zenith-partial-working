# Zenith AI - Web Dashboard

## Overview
This is the Admin and Government Dashboard for the Zenith PotHole Detection System.
It allows administrators to verify pothole reports and government officials to track repairs and view analytics.

## Tech Stack
- **Framework**: React + Vite
- **Styling**: Tailwind CSS
- **Maps**: Leaflet + OpenStreetMap
- **Charts**: Recharts
- **Icons**: Lucide React

## Setup
1. `npm install`
2. `npm run dev`

## Mock Authentication
- **Admin Portal**: Login as Admin to verify reports.
- **Government Portal**: Login as Government to view repair tracker.

## Data Integration
The dashboard uses a simulated backend (`src/context/DataContext.jsx`).
To integrate with the real Mobile App:
1. The Mobile App should POST JSON data to your backend API.
2. The Dashboard should fetch from that API.

### Expected JSON Format from App
```json
{
  "userId": "u-123",
  "location": {
    "lat": 20.296,
    "lng": 85.824,
    "address": "Patia, Bhubaneswar"
  },
  "severity": "High",
  "type": "Pothole",
  "image": "base64_or_url",
  "timestamp": "2026-01-16T10:00:00Z",
  "sensorData": {
    "vibration_peak": 4.5
  }
}
```
