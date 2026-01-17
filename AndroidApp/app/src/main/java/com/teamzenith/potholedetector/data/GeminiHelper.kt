package com.teamzenith.potholedetector.data

import android.graphics.Bitmap
import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.content
import javax.inject.Inject

data class PotholeAnalysis(
    val type: String, // "Pothole", "Uneven Road", "Water Logging", "Invalid"
    val severity: String, 
    val description: String,
    val priority: String // "High", "Medium", "Low"
)

class GeminiHelper @Inject constructor(
    private val generativeModel: GenerativeModel
) {
    suspend fun analyzePotholeImage(bitmap: Bitmap): PotholeAnalysis {
        val prompt = """
            Analyze this image.
            Return a pure JSON object (no markdown formatting) with the following fields:
            - "type": "Pothole", "Uneven Road", "Water Logging", or "Invalid"
            - "severity": "Low", "Medium", "High", "Critical", or "Invalid"
            - "priority": "Low", "Medium", "High"
            - "description": "1-sentence description"

            Rules:
            1. Classify the image into one of these types:
               - "Pothole": A hole in the road surface.
               - "Uneven Road": Rough surface, cracks, not a distinct hole.
               - "Water Logging": Water accumulation on the road.
               - "Invalid": Not a road image (e.g., hand, face, indoor).
            2. If "type" is "Invalid", set "severity" to "Invalid".
            3. Return ONLY the JSON string.
        """.trimIndent()
        
        return try {
            val response = generativeModel.generateContent(
                content {
                    image(bitmap)
                    text(prompt)
                }
            )
            
            val text = response.text ?: "{}"
            
            // Clean up code blocks if present (e.g. ```json ... ```)
            val jsonString = text.replace("```json", "").replace("```", "").trim()
            
            val jsonObject = org.json.JSONObject(jsonString)
            val type = jsonObject.optString("type", "Pothole")
            val severity = jsonObject.optString("severity", "Medium")
            val priority = jsonObject.optString("priority", "Medium")
            val description = jsonObject.optString("description", "No description available")
            
            PotholeAnalysis(type, severity, description, priority)
        } catch (e: Exception) {
            PotholeAnalysis("Unknown", "Unknown", "Error parsing AI response: ${e.message}", "Low")
        }
    }
}
