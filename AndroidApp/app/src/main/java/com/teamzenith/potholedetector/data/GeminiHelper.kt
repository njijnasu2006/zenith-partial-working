package com.teamzenith.potholedetector.data

import android.graphics.Bitmap
import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.content
import javax.inject.Inject

data class PotholeAnalysis(val severity: String, val description: String)

class GeminiHelper @Inject constructor(
    private val generativeModel: GenerativeModel
) {
    suspend fun analyzePotholeImage(bitmap: Bitmap): PotholeAnalysis {
        val prompt = "Analyze this image for road damage. Is there a pothole? implementation_planIf yes, classify severity as Low, Medium, High, or Critical. Provide a short description."
        
        return try {
            val response = generativeModel.generateContent(
                content {
                    image(bitmap)
                    text(prompt)
                }
            )
            
            // Simple parsing logic (Robust parsing needed in production)
            val text = response.text ?: "No description"
            val severity = when {
                text.contains("Critical", ignoreCase = true) -> "Critical"
                text.contains("High", ignoreCase = true) -> "High"
                text.contains("Medium", ignoreCase = true) -> "Medium"
                else -> "Low"
            }
            
            PotholeAnalysis(severity, text)
        } catch (e: Exception) {
            PotholeAnalysis("Unknown", "Error analyzing image: ${e.message}")
        }
    }
}
