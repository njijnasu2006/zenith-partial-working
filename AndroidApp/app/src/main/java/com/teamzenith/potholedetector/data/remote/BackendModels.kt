package com.teamzenith.potholedetector.data.remote

data class BackendReportRequest(
    val userId: String,
    val location: LocationData,
    val type: String = "Pothole",
    val severity: String,
    val imageUrl: String?, // Base64
    val description: String?,
    val source: String = "Mobile App"
)

data class LocationData(
    val lat: Double,
    val lng: Double,
    val address: String = "Unknown" // We might not have reverse geocoding yet
)

data class BackendReportResponse(
    val message: String,
    val id: String?
)
