package com.teamzenith.potholedetector.data.local

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(entities = [PotholeReport::class], version = 1, exportSchema = false)
abstract class PotholeDatabase : RoomDatabase() {
    abstract fun potholeDao(): PotholeDao
}
