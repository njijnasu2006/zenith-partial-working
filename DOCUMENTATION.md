# Zenith System Documentation

This document outlines the technical architecture, setup, and components of the Zenith Pothole Detector project.

## System Overview

The system consists of three main components:
1.  **Android Client**: For data collection and reporting.
2.  **Node.js Backend**: Central server for logic, storage, and API.
3.  **React Dashboard**: Frontend for administration and public status tracking.

## Technical Stack

-   **Mobile**: Kotlin, Jetpack Compose, Gemini AI SDK (client-side analysis).
-   **Backend**: Node.js, Express, Socket.io (real-time updates).
-   **Frontend**: React, Tailwind CSS, Recharts (analytics), Lucide React (icons).
-   **External APIs**:
    -   Google Gemini Flash 1.5 (Image Analysis).
    -   OpenStreetMap Nominatim (Reverse Geocoding).

## Component Details

### 1. Android Application
The app follows MVVM architecture.
-   **GeminiHelper**: Handles interaction with the AI model. It creates a prompt instructing the model to return a strict JSON response with `type`, `severity`, and `description`.
-   **Repository**: Manages data flow. It converts the AI response into a `BackendReportRequest` and posts it to the server.
-   **Offline/Online**: Currently assumes online connectivity for reporting. Bluetooth services run in the background to listen for triggers from ESP32 hardware.
-   **Permissions**: Requests Location (Fine/Coarse), Camera, and Bluetooth permissions at runtime.

### 2. Backend Server (`server.js`)
A lightweight Express server.
-   **Data Persistence**: Uses a flat file `reports.json` for simplicity during the prototype phase.
-   **Endpoints**:
    -   `GET /reports`: Fetches all reports.
    -   `POST /reports`: Accepts new reports.
        -   **Logic**:
            1.  Receives JSON body.
            2.  Checks `type` and `severity`. If "Invalid", sets status to "Rejected".
            3.  Calls `getRoadName()` to resolve lat/long to an address.
            4.  Saves to disk and emits socket event.
    -   `PATCH /reports/:id`: Updates status (e.g., pending -> verified).

### 3. Web Dashboard
Built with Vite and React.
-   **Context API**: `DataContext` manages the global state of reports and handles API calls.
-   **Pages**:
    -   **Admin/Map**: Renders markers and heatmap. Calculates stats on the fly (Critical Zones, Repair Progress).
    -   **Admin/Reports**: Tabular view with search and filters. Allows status updates.
    -   **Public/Status**: A search portal for citizens. Features a visual timeline component and detailed report view.

## Setup Instructions

### Prerequisites
-   Node.js v20+
-   Android Studio Koala or newer
-   Gemini API Key

### Running the Backend
1.  Navigate to `/Backend`.
2.  Run `npm install`.
3.  Start with `node server.js`.
4.  Server runs on port 3000.

### Running the Dashboard
1.  Navigate to `/WebDashboard`.
2.  Run `npm install`.
3.  Start with `npm run dev`.

### Running the App
1.  Open `/AndroidApp` in Android Studio.
2.  Add `GEMINI_API_KEY` to `local.properties`.
3.  Sync Gradle and Run on device/emulator.

## Known Issues / TODOs
-   Video upload is currently disabled in the gallery picker.
-   Backend storage is not database-backed (SQLite/MongoDB recommended for production).
-   Authentication is mocked for the dashboard.
