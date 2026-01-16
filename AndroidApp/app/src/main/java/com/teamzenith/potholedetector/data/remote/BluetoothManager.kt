package com.teamzenith.potholedetector.data.remote

import android.annotation.SuppressLint
import android.bluetooth.*
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanFilter
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.Context
import android.util.Log
import com.google.gson.Gson
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
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
    
    // ESP32 BLE UUIDs
    private val SERVICE_UUID = UUID.fromString("4fafc201-1fb5-459e-8fcc-c5c9c331914b")
    private val CHARACTERISTIC_UUID = UUID.fromString("beb5483e-36e1-4688-b7f5-ea07361b26a8")
    private val CCCD_UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb") // Standard Client Config

    @SuppressLint("MissingPermission")
    fun connectAndListen(deviceName: String): Flow<Esp32RawEvent> = callbackFlow {
        if (bluetoothAdapter == null || !bluetoothAdapter!!.isEnabled) {
            close(Exception("Bluetooth disabled"))
            return@callbackFlow
        }

        val scanner = bluetoothAdapter!!.bluetoothLeScanner
        if (scanner == null) {
             close(Exception("BLE Scanner unavailable"))
             return@callbackFlow
        }

        var gatt: BluetoothGatt? = null
        
        // Callback for GATT events
        val gattCallback = object : BluetoothGattCallback() {
            override fun onConnectionStateChange(g: BluetoothGatt, status: Int, newState: Int) {
                if (newState == BluetoothProfile.STATE_CONNECTED) {
                    Log.d("BLE", "Connected to $deviceName")
                    g.discoverServices()
                } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                    Log.d("BLE", "Disconnected")
                    close(Exception("Device disconnected"))
                }
            }

            override fun onServicesDiscovered(g: BluetoothGatt, status: Int) {
                if (status == BluetoothGatt.GATT_SUCCESS) {
                    val service = g.getService(SERVICE_UUID)
                    if (service != null) {
                        val characteristic = service.getCharacteristic(CHARACTERISTIC_UUID)
                        if (characteristic != null) {
                            // 1. Enable local notifications
                            g.setCharacteristicNotification(characteristic, true)
                            
                            // 2. Write to CCCD descriptor to enable remote notifications
                            val descriptor = characteristic.getDescriptor(CCCD_UUID)
                            if (descriptor != null) {
                                descriptor.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
                                g.writeDescriptor(descriptor)
                            }
                        }
                    }
                }
            }

            override fun onCharacteristicChanged(g: BluetoothGatt, characteristic: BluetoothGattCharacteristic) {
                // Handle notification
                val data = characteristic.value
                if (data != null && data.isNotEmpty()) {
                    val jsonString = String(data)
                    try {
                        val gson = Gson()
                        val event = gson.fromJson(jsonString, Esp32RawEvent::class.java)
                        trySend(event)
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
            }
        }

        // Scan Callback
        val scanCallback = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult) {
                val device = result.device
                if (device.name == deviceName) {
                    // Stop scanning
                    scanner.stopScan(this)
                    
                    // Connect
                    Log.d("BLE", "Found device, connecting...")
                    gatt = device.connectGatt(context, false, gattCallback)
                }
            }
            
            override fun onScanFailed(errorCode: Int) {
                close(Exception("Scan failed with code $errorCode"))
            }
        }

        // Start Scan
        // Match only by name if possible, but name filters can be tricky if adv packet doesn't have it initially.
        // For simplicity, we scan everything and filter in callback, but adding a filter is better practice.
        // We'll scan broadly and check name in callback to be safe against partial advertising packets.
        scanner.startScan(scanCallback)

        awaitClose {
            scanner.stopScan(scanCallback)
            gatt?.close()
        }
    }
}
