package com.teamzenith.potholedetector.data.remote

import retrofit2.http.GET

interface Esp32Api {
    @GET("/status")
    suspend fun getStatus(): Esp32StatusResponse

    @GET("/events")
    suspend fun getEvents(): Esp32SyncResponse
}

data class Esp32StatusResponse(val status: String, val uptime: Long)

data class Esp32SyncResponse(
    val device: String,
    val count: Int,
    val events: List<Esp32RawEvent>
)

data class Esp32RawEvent(
    val time_s: Long,
    val dip: Double
)
