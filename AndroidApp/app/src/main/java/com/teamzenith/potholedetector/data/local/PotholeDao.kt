package com.teamzenith.potholedetector.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface PotholeDao {
    @Query("SELECT * FROM pothole_reports ORDER BY timestamp DESC")
    fun getAllReports(): Flow<List<PotholeReport>>

    @Query("SELECT * FROM pothole_reports WHERE isSynced = 0")
    suspend fun getUnsyncedReports(): List<PotholeReport>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReport(report: PotholeReport)
    
    @Query("DELETE FROM pothole_reports")
    suspend fun clearAll()
    @Query("SELECT EXISTS(SELECT 1 FROM pothole_reports WHERE externalId = :externalId)")
    suspend fun existsByExternalId(externalId: String): Boolean
}
