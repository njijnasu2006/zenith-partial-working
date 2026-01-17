# Product Requirements Document: Zenith Pothole Detection System

**Version:** 1.0
**Date:** 2026-01-17
**Status:** In Development

## 1. Introduction

The Zenith Pothole Detection System is designed to address the issue of poor road maintenance by empowering citizens to report road defects and providing authorities with tools to manage and repair them. The system uses AI to validate reports and filters out spam or irrelevant data automatically.

## 2. Problem Statement

Current methods of reporting road damage are slow and bureaucratic. Authorities lack a centralized view of road conditions, leading to inefficient resource allocation. There is also a lot of noise in public reporting channels, with people submitting invalid or duplicate complaints.

## 3. Goals and Objectives

-   Reduce the time between pothole reporting and repair.
-   Automate the verification of reports to save manual effort.
-   Provide a transparent way for citizens to track their reports.
-   Give authorities a map-based dashboard to visualize critical zones.

## 4. Feature Requirements

### 4.1. Mobile Application (Citizen/User Side)
-   **Platform**: Android
-   **Core Features**:
    -   **Report Defect**: Capture image using camera or select from gallery.
    -   **AI Analysis**: Automatically detect if the image contains a Pothole, Uneven Road, or Water Logging. Non-road images must be rejected.
    -   **Location Tagging**: Auto-capture GPS coordinates.
    -   **Severity Assessment**: AI should estimate severity (Low, Medium, High, Critical).
    -   **Bluetooth Integration**: Connect to external hardware sensors (ESP32) for automated vibration-based detection (optional/beta).

### 4.2. Backend & API
-   **Platform**: Node.js (Express)
-   **Core Features**:
    -   **REST API**: Endpoints to submit and retrieve reports.
    -   **Data Storage**: JSON-based local storage (for prototype phase).
    -   **Reverse Geocoding**: Automatically convert GPS lat/long to a readable address (e.g., street name) using Nominatim.
    -   **Auto-Rejection**: Server must block reports classified as "Invalid" by the AI to prevent dashboard clutter.

### 4.3. Web Dashboard (Authority/Admin Side)
-   **Platform**: React
-   **Core Features**:
    -   **Live Map**: Heatmap visualization of defects.
    -   **Report Management**: Table view to Verify, Ignore, or Resolve reports.
    -   **Search & Filter**: Find reports by location, type, or status.
    -   **Statistics**: Real-time counts of critical zones and repair progress.

### 4.4. Public Status Portal
-   **Core Features**:
    -   Allow citizens to search for their report by ID or Location name.
    -   Display status timeline (Pending -> Verified -> Resolved).
    -   Show evidence image and repair estimates.

## 5. Non-Functional Requirements

-   **Accuracy**: The AI model should have a low false-positive rate for non-road images.
-   **Performance**: Dashboard should load reports instantly. Reverse geocoding should happen asynchronously or quickly during submission.
-   **Usability**: The app must be simple enough for non-technical users.

## 6. Future Scope

-   Integration with municipal work order systems.
-   Advanced fleet tracking for repair trucks.
-   Crowdsourced verification (users voting on reports).
