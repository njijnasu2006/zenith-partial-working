package com.teamzenith.potholedetector.di

import android.content.Context
import androidx.room.Room
import com.teamzenith.potholedetector.data.local.PotholeDatabase
// Esp32Api import removed
import com.teamzenith.potholedetector.data.remote.BackendApi
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import javax.inject.Singleton
import com.google.ai.client.generativeai.GenerativeModel
import com.teamzenith.potholedetector.BuildConfig

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): PotholeDatabase {
        return Room.databaseBuilder(
            context,
            PotholeDatabase::class.java,
            "pothole_db"
        ).fallbackToDestructiveMigration()
        .build()
    }

    @Provides
    @Singleton
    fun provideDao(db: PotholeDatabase) = db.potholeDao()

    // Esp32Api removed (Using Bluetooth only)

    @Provides
    @Singleton
    fun provideBackendApi(): BackendApi {
        // USE YOUR PC IP HERE for real device (e.g., "http://192.168.1.5:3000")
        // Use "http://10.0.2.2:3000" for Android Emulator
        val baseUrl = "http://192.168.136.209:3000"
        
        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(BackendApi::class.java)
    }

    @Provides
    @Singleton
    fun provideFusedLocationClient(@ApplicationContext context: Context): com.google.android.gms.location.FusedLocationProviderClient {
        return com.google.android.gms.location.LocationServices.getFusedLocationProviderClient(context)
    }

    @Provides
    @Singleton
    fun provideGenerativeModel(): GenerativeModel {
        // In a real app, API key should be safer. Here passing a placeholder or BuildConfig.
        // Assuming BuildConfig.GEMINI_API_KEY is available if we set it in local.properties
        // For now, we'll placeholder it to avoid build errors if key is missing, 
        // relying on the user to provide it.
        return GenerativeModel(
            modelName = "gemini-2.5-flash", 
            apiKey = BuildConfig.GEMINI_API_KEY // Ensure this is set in local.properties or env var
        )
    }
}
