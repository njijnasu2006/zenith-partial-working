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

    fun refreshData() {
        viewModelScope.launch {
            _isSyncing.value = true
            try {
                // Check permissions (assuming granted for now as per instructions to just fix it)
                if (androidx.core.content.ContextCompat.checkSelfPermission(
                        context,
                        android.Manifest.permission.ACCESS_FINE_LOCATION
                    ) == android.content.pm.PackageManager.PERMISSION_GRANTED
                ) {
                    val priority = com.google.android.gms.location.Priority.PRIORITY_HIGH_ACCURACY
                    val token = com.google.android.gms.tasks.CancellationTokenSource().token
                    
                    fusedLocationClient.getCurrentLocation(priority, token).addOnSuccessListener { location ->
                        viewModelScope.launch {
                            val lat = location?.latitude ?: 0.0
                            val lng = location?.longitude ?: 0.0
                            repository.syncWithEsp32(lat, lng)
                            _isSyncing.value = false
                        }
                    }.addOnFailureListener {
                        viewModelScope.launch {
                            repository.syncWithEsp32(0.0, 0.0)
                            _isSyncing.value = false
                        }
                    }
                } else {
                    // Fallback if permission not granted
                    repository.syncWithEsp32(0.0, 0.0)
                    _isSyncing.value = false
                }
            } catch (e: Exception) {
                e.printStackTrace()
                _isSyncing.value = false
            }
        }
    }
}
