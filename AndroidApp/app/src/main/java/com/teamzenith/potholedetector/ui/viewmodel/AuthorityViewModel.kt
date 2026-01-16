package com.teamzenith.potholedetector.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.teamzenith.potholedetector.data.PotholeRepository
import com.teamzenith.potholedetector.data.local.PotholeReport
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

@HiltViewModel
class AuthorityViewModel @Inject constructor(
    repository: PotholeRepository
) : ViewModel() {

    // In a real app, we would perform strict clustering here or on the backend.
    // For this offline-first demo, we strictly read from the DB.
    val allReports: StateFlow<List<PotholeReport>> = repository.allReports
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val criticalReports: StateFlow<List<PotholeReport>> = repository.allReports
        .map { list -> list.filter { it.severity == "Critical" || it.severity == "High" } }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}
