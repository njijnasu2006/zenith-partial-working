package com.teamzenith.potholedetector.ui.viewmodel

import android.graphics.Bitmap
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.teamzenith.potholedetector.data.PotholeRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ReportViewModel @Inject constructor(
    private val repository: PotholeRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<ReportUiState>(ReportUiState.Idle)
    val uiState: StateFlow<ReportUiState> = _uiState

    fun submitReport(
        bitmap: Bitmap?,
        uri: String?,
        mediaType: String,
        lat: Double, 
        lng: Double
    ) {
        viewModelScope.launch {
            _uiState.value = ReportUiState.Analyzing
            try {
                repository.createManualReport(bitmap, uri, mediaType, lat, lng)
                _uiState.value = ReportUiState.Success
            } catch (e: Exception) {
                _uiState.value = ReportUiState.Error(e.message ?: "Unknown error")
            }
        }
    }
    
    fun resetState() {
        _uiState.value = ReportUiState.Idle
    }
}

sealed class ReportUiState {
    object Idle : ReportUiState()
    object Analyzing : ReportUiState()
    object Success : ReportUiState()
    data class Error(val message: String) : ReportUiState()
}
