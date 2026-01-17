package com.teamzenith.potholedetector.data.remote

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothSocket
import android.content.Context
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.isActive
import java.io.IOException
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton
import dagger.hilt.android.qualifiers.ApplicationContext

@Singleton
class AppBluetoothManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val bluetoothAdapter: BluetoothAdapter? by lazy {
        val manager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        manager.adapter
    }
    
    // Standard UUID for SPP (Serial Port Profile)
    private val SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")

    @SuppressLint("MissingPermission")
    fun connectAndListen(deviceName: String): Flow<Esp32RawEvent> = flow {
        if (bluetoothAdapter == null || !bluetoothAdapter!!.isEnabled) {
            throw Exception("Bluetooth disabled")
        }

        // 1. Find the Paired Device
        val device = bluetoothAdapter!!.bondedDevices.find { it.name == deviceName }
            ?: throw Exception("Device '$deviceName' not paired. Please pair in Settings.")

        // 2. Connect
        var socket: BluetoothSocket? = null
        try {
            socket = device.createRfcommSocketToServiceRecord(SPP_UUID)
            socket.connect()
            
            // 3. Listen Loop
            val inputStream = socket.inputStream
            val reader = inputStream.bufferedReader()
            val gson = Gson()

            while (kotlin.coroutines.coroutineContext.isActive) {
                if (inputStream.available() > 0 || reader.ready()) {
                    val line = reader.readLine()
                    if (line != null && line.isNotEmpty()) {
                        try {
                            // Parse JSON: {"dip": -14.5, "time_s": 1205}
                            val event = gson.fromJson(line, Esp32RawEvent::class.java)
                            emit(event)
                        } catch (e: Exception) {
                            // Ignore parse errors (partial lines etc)
                            e.printStackTrace()
                        }
                    }
                }
            }
        } catch (e: IOException) {
            throw Exception("Connection failed: ${e.message}")
        } finally {
            try {
                socket?.close()
            } catch (e: Exception) { e.printStackTrace() }
        }
    }.flowOn(Dispatchers.IO)
}
