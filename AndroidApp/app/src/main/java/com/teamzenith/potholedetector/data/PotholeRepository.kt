package com.teamzenith.potholedetector.data

import android.graphics.Bitmap
import com.teamzenith.potholedetector.data.local.PotholeDao
import com.teamzenith.potholedetector.data.local.PotholeReport
import com.teamzenith.potholedetector.data.remote.Esp32Api
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PotholeRepository @Inject constructor(
    private val dao: PotholeDao,
    private val esp32Api: Esp32Api,
    private val geminiHelper: GeminiHelper
) {
    val allReports: Flow<List<PotholeReport>> = dao.getAllReports()

    // ESP32: Poll for new events and save them locally
    suspend fun syncWithEsp32(lat: Double, lng: Double) {
        try {
            val response = esp32Api.getEvents()
            response.events.forEach { event ->
                val externalId = "esp32_${response.device}_${event.time_s}_${event.dip}"
                
                // Deduplication check
                if (!dao.existsByExternalId(externalId)) {
                    // Map 'dip' to severity. Assuming negative dip means depth.
                    val depth = kotlin.math.abs(event.dip)
                    val severity = when {
                        depth > 20 -> "Critical"
                        depth > 14 -> "High"
                        depth > 10 -> "Medium"
                        else -> "Low"
                    }

                    val report = PotholeReport(
                        type = "Auto",
                        severity = severity,
                        latitude = lat, // Use phone's GPS location
                        longitude = lng,
                        timestamp = System.currentTimeMillis(), // Use current time of sync
                        externalId = externalId,
                        isSynced = true // Auto reports are "synced" from device
                    )
                    dao.insertReport(report)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    // Manual Report with Gemini Analysis and Media
    suspend fun createManualReport(
        bitmap: Bitmap?, // Null if video or no image
        imageUri: String?, // URI for image or video
        mediaType: String, // "IMAGE" or "VIDEO"
        lat: Double, 
        lng: Double
    ) {
        var severity = "Medium"
        var description = "Manual Report"

        // 1. Analyze with Gemini if it is an image
        if (mediaType == "IMAGE" && bitmap != null) {
            try {
                val analysis = geminiHelper.analyzePotholeImage(bitmap)
                severity = analysis.severity
                description = analysis.description
            } catch (e: Exception) {
                // Fallback if analysis fails
                description = "Analysis failed: ${e.message}"
            }
        } else if (mediaType == "VIDEO") {
            description = "Video Report"
            // Future: Upload video to Gemini 1.5 Pro for analysis
        }
        
        // 2. Save to Local DB
        val report = PotholeReport(
            type = "Manual",
            severity = severity,
            latitude = lat,
            longitude = lng,
            description = description,
            imageUrl = imageUri, 
            mediaType = mediaType,
            isSynced = false
        )
        dao.insertReport(report)
    }
}
