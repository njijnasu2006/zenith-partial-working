package com.teamzenith.potholedetector.ui.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.android.gms.location.LocationServices
import com.teamzenith.potholedetector.data.PotholeRepository
import com.teamzenith.potholedetector.data.local.PotholeReport
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import javax.inject.Inject

@HiltViewModel
class CitizenViewModel @Inject constructor(
    private val repository: PotholeRepository,
    @ApplicationContext private val context: Context
) : ViewModel() {

    val reports: StateFlow<List<PotholeReport>> = repository.allReports
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _isSyncing = MutableStateFlow(false)
    val isSyncing: StateFlow<Boolean> = _isSyncing

    private val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)

    private val _bluetoothStatus = MutableStateFlow("Disconnected")
    val bluetoothStatus: StateFlow<String> = _bluetoothStatus
    
    private var bluetoothJob: kotlinx.coroutines.Job? = null

    fun connectBluetooth(deviceName: String) {
        if (bluetoothJob?.isActive == true) {
            bluetoothJob?.cancel()
            _bluetoothStatus.value = "Disconnected"
            return
        }

        bluetoothJob = viewModelScope.launch {
            _bluetoothStatus.value = "Connecting..."
            try {
                if (androidx.core.content.ContextCompat.checkSelfPermission(
                        context,
                        android.Manifest.permission.ACCESS_FINE_LOCATION
                    ) == android.content.pm.PackageManager.PERMISSION_GRANTED
                ) {
                     // Check if GPS is enabled maybe? For now just start sync.
                     // Location is now fetched inside repository independently.
                     
                     _bluetoothStatus.value = "Connected" // Optimistic
                     repository.startBluetoothSync(deviceName) 
                } else {
                     _bluetoothStatus.value = "Error: Loction Permission Missing"
                }

            } catch (e: Exception) {
                e.printStackTrace()
                _bluetoothStatus.value = "Error: ${e.message}"
            }
        }
    }
    
    // Extension removed, using library import directly

    fun refreshData() {
        viewModelScope.launch {
            _isSyncing.value = true
            // Bluetooth sync IS the data source now.
            // We could just trigger a location update or check backend, but for now just idle.
            kotlinx.coroutines.delay(1000)
            _isSyncing.value = false
        }
    }
}
