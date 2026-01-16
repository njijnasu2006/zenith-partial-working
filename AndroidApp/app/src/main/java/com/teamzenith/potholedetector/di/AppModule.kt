package com.teamzenith.potholedetector.di

import android.content.Context
import androidx.room.Room
import com.teamzenith.potholedetector.data.local.PotholeDatabase
import com.teamzenith.potholedetector.data.remote.Esp32Api
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

    @Provides
    @Singleton
    fun provideEsp32Api(): Esp32Api {
        // ESP32 AP default IP is typically 192.168.4.1
        return Retrofit.Builder()
            .baseUrl("http://192.168.4.1") 
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(Esp32Api::class.java)
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
