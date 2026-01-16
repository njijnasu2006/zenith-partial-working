package com.teamzenith.potholedetector.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.Date

@Entity(tableName = "pothole_reports")
data class PotholeReport(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val type: String, // "Auto", "Manual"
    val severity: String, // "Low", "Medium", "High", "Critical" (Gemini output or Vibration data)
    val latitude: Double,
    val longitude: Double,
    val timestamp: Long = System.currentTimeMillis(),
    val imageUrl: String? = null, // Path to local image or video
    val mediaType: String = "IMAGE", // "IMAGE" or "VIDEO"
    val description: String? = null, // Gemini analysis
    val isSynced: Boolean = false,
    val externalId: String? = null, // "esp32_<time_s>" or similar for deduplication
    val userConfirmationCount: Int = 1
)
