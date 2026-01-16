package com.teamzenith.potholedetector.data.remote

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface BackendApi {
    @POST("/reports")
    suspend fun submitReport(@Body report: BackendReportRequest): Response<BackendReportResponse>
}
