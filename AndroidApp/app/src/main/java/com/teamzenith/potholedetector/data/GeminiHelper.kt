package com.teamzenith.potholedetector.data

import android.graphics.Bitmap
import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.content
import javax.inject.Inject

data class PotholeAnalysis(
    val severity: String, 
    val description: String,
    val priority: String // "High", "Medium", "Low"
)

class GeminiHelper @Inject constructor(
    private val generativeModel: GenerativeModel
) {
    suspend fun analyzePotholeImage(bitmap: Bitmap): PotholeAnalysis {
        val prompt = """
            Analyze this road image.
            1. Is there a pothole?
            2. Estimate severity: Low, Medium, High, or Critical.
            3. Recommend repair priority: Low, Medium, or High.
            4. Provide a 1-sentence description.
            
            Return ONLY logic based on this format:
            Severity: [Value]
            Priority: [Value]
            Description: [Text]
        """.trimIndent()
        
        return try {
            val response = generativeModel.generateContent(
                content {
                    image(bitmap)
                    text(prompt)
                }
            )
            
            val text = response.text ?: ""
            
            // Simple keyword parsing
            val severity = when {
                text.contains("Critical", ignoreCase = true) -> "Critical"
                text.contains("High", ignoreCase = true) -> "High"
                text.contains("Medium", ignoreCase = true) -> "Medium"
                else -> "Low"
            }
            
            val priority = when {
                severity == "Critical" || severity == "High" -> "High"
                severity == "Medium" -> "Medium"
                else -> "Low"
            }
            
            PotholeAnalysis(severity, text, priority)
        } catch (e: Exception) {
            PotholeAnalysis("Unknown", "Error: ${e.message}", "Low")
        }
    }
}
