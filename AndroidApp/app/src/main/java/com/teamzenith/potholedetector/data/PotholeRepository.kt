package com.teamzenith.potholedetector.data

import android.graphics.Bitmap
import com.teamzenith.potholedetector.data.local.PotholeDao
import com.teamzenith.potholedetector.data.local.PotholeReport
// Esp32Api import removed
import com.teamzenith.potholedetector.data.remote.BackendApi
import com.teamzenith.potholedetector.data.remote.BackendReportRequest
import com.teamzenith.potholedetector.data.remote.LocationData
import android.util.Base64
import java.io.ByteArrayOutputStream
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.tasks.await

import com.teamzenith.potholedetector.data.remote.AppBluetoothManager
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.onEach

@Singleton
class PotholeRepository @Inject constructor(
    private val dao: PotholeDao,
    private val backendApi: BackendApi,
    private val bluetoothManager: AppBluetoothManager,
    private val geminiHelper: GeminiHelper,
    private val fusedLocationClient: com.google.android.gms.location.FusedLocationProviderClient,
    @dagger.hilt.android.qualifiers.ApplicationContext private val context: android.content.Context
) {
    val allReports: Flow<List<PotholeReport>> = dao.getAllReports()


    // Bluetooth: Stream events in real-time
    @Suppress("MissingPermission") // Checked in ViewModel mainly, but simplified check here
    suspend fun startBluetoothSync(deviceName: String) {
        try {
            bluetoothManager.connectAndListen(deviceName).collect { event ->
                 // Use PHONE timestamp for uniqueness. ESP32 time_s resets on power cycle.
                 val uniqueId = System.currentTimeMillis()
                 val externalId = "bt_${deviceName}_${uniqueId}_${event.dip}"
                 
                 // Deduplication check (should pass now mostly)
                 if (!dao.existsByExternalId(externalId)) {
                        
                        // FETCH CURRENT LOCATION NOW
                        var currentLat = 0.0
                        var currentLng = 0.0
                        try {
                             if (androidx.core.content.ContextCompat.checkSelfPermission(
                                    context,
                                    android.Manifest.permission.ACCESS_FINE_LOCATION
                                ) == android.content.pm.PackageManager.PERMISSION_GRANTED
                             ) {
                                 // Try last known first for speed
                                 val lastLoc = fusedLocationClient.lastLocation.await()
                                 if (lastLoc != null) {
                                     currentLat = lastLoc.latitude
                                     currentLng = lastLoc.longitude
                                 } else {
                                     // Fallback to fresh request (might be slower)
                                     val priority = com.google.android.gms.location.Priority.PRIORITY_HIGH_ACCURACY
                                     val token = com.google.android.gms.tasks.CancellationTokenSource().token
                                     val freshLoc = fusedLocationClient.getCurrentLocation(priority, token).await()
                                     currentLat = freshLoc?.latitude ?: 0.0
                                     currentLng = freshLoc?.longitude ?: 0.0
                                 }
                             }
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }

                        val depth = kotlin.math.abs(event.dip)
                        val severity = when {
                            depth > 20 -> "Critical"
                            depth > 14 -> "High"
                            depth > 10 -> "Medium"
                            else -> "Low"
                        }

                        // 1. Save Local
                        val report = PotholeReport(
                            type = "Auto-BT",
                            severity = severity,
                            latitude = currentLat,
                            longitude = currentLng,
                            timestamp = uniqueId,
                            externalId = externalId,
                            isSynced = false 
                        )
                        dao.insertReport(report)

                        // 2. Upload to Backend (Live Analytics)
                        try {
                            val backendReport = BackendReportRequest(
                                userId = "user_android_bt",
                                location = LocationData(currentLat, currentLng, "Bluetooth Detected"),
                                severity = severity,
                                imageUrl = null,
                                description = "Auto-detected via Bluetooth (Dip: ${event.dip})",
                                type = "Pothole"
                            )
                            val response = backendApi.submitReport(backendReport)
                            if (!response.isSuccessful) {
                                android.util.Log.e("BackendSync", "Failed: ${response.code()} ${response.message()}")
                            } else {
                                android.util.Log.d("BackendSync", "Success: ${response.body()?.id}")
                            }
                        } catch (e: Exception) {
                            e.printStackTrace()
                            android.util.Log.e("BackendSync", "Exception: ${e.message}")
                        }
                 }
            }
        } catch (e: Exception) {
            e.printStackTrace()
            throw e // Re-throw to let UI know
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
        var type = "Pothole"

        // 1. Analyze with Gemini if it is an image
        if (mediaType == "IMAGE" && bitmap != null) {
            try {
                val analysis = geminiHelper.analyzePotholeImage(bitmap)
                severity = analysis.severity
                type = analysis.type
                // Append Priority to description to show it without DB migration
                description = "${analysis.description} [Priority: ${analysis.priority}]"
            } catch (e: Exception) {
                // Fallback if analysis fails
                description = "Analysis failed: ${e.message}"
            }
        } else if (mediaType == "VIDEO") {
            description = "Video Report"
            // Future: Upload video to Gemini 1.5 Pro for analysis
        }

        // 2. Prepare Base64 Image
        val base64Image = if (bitmap != null) {
            "data:image/jpeg;base64," + bitmapToBase64(bitmap)
        } else {
            null
        }

        // 3. Send to Backend (Fire and Forget / or await)
        try {
            val backendReport = BackendReportRequest(
                userId = "user_android_${System.currentTimeMillis()}", // Unique-ish ID
                location = LocationData(lat, lng, "Unknown Address"),
                severity = severity,
                imageUrl = base64Image,
                description = description,
                type = type
            )
            backendApi.submitReport(backendReport)
        } catch (e: Exception) {
            e.printStackTrace() // Don't fail the local save if network fails
        }
        
        // 2. Save to Local DB
        val report = PotholeReport(
            type = type,
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

    private fun bitmapToBase64(bitmap: Bitmap): String {
        val outputStream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, 70, outputStream)
        return Base64.encodeToString(outputStream.toByteArray(), Base64.NO_WRAP)
    }
}
