package com.teamzenith.potholedetector.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.teamzenith.potholedetector.data.local.PotholeReport
import com.teamzenith.potholedetector.ui.viewmodel.CitizenViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CitizenHomeScreen(
    onNavigateToReport: () -> Unit,
    onNavigateToDashboard: () -> Unit,
    viewModel: CitizenViewModel = hiltViewModel()
) {
    val reports by viewModel.reports.collectAsState()
    val isSyncing by viewModel.isSyncing.collectAsState()
    val bluetoothStatus by viewModel.bluetoothStatus.collectAsState()
    
    var showBluetoothDialog by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(false) }
    var deviceNameInput by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf("Zenith_Node_01") }

    if (showBluetoothDialog) {
        AlertDialog(
            onDismissRequest = { showBluetoothDialog = false },
            title = { Text("Connect to ESP32") },
            text = {
                Column {
                    Text("Enter Bluetooth Device Name:")
                    OutlinedTextField(
                        value = deviceNameInput,
                        onValueChange = { deviceNameInput = it },
                        singleLine = true
                    )
                    Spacer(Modifier.height(8.dp))
                    Text("Status: $bluetoothStatus", style = MaterialTheme.typography.bodySmall)
                }
            },
            confirmButton = {
                Button(onClick = {
                    viewModel.connectBluetooth(deviceNameInput)
                    showBluetoothDialog = false
                }) {
                    Text(if (bluetoothStatus == "Disconnected" || bluetoothStatus.startsWith("Error")) "Connect" else "Disconnect")
                }
            },
            dismissButton = {
                TextButton(onClick = { showBluetoothDialog = false }) {
                    Text("Close")
                }
            }
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Pothole Detector") },
                actions = {
                    // Bluetooth Button
                    IconButton(onClick = { showBluetoothDialog = true }) {
                         // Color code status
                         val tint = when {
                             bluetoothStatus == "Connected" -> Color.Green
                             bluetoothStatus == "Connecting..." -> Color.Yellow
                             bluetoothStatus.startsWith("Error") -> Color.Red
                             else -> MaterialTheme.colorScheme.onSurface
                         }
                         Icon(androidx.compose.material.icons.filled.Share, contentDescription = "Bluetooth", tint = tint)
                    }

                    IconButton(onClick = onNavigateToDashboard) {
                        Icon(Icons.Default.AdminPanelSettings, contentDescription = "Authority Dashboard")
                    }
                    IconButton(onClick = { viewModel.refreshData() }) {
                        if (isSyncing) {
                            CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color.White)
                        } else {
                            Icon(Icons.Default.Refresh, contentDescription = "Sync")
                        }
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = onNavigateToReport) {
                Icon(Icons.Default.Add, contentDescription = "Report Pothole")
            }
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            // Status Bar
            if (bluetoothStatus == "Connected") {
                Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer), modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)) {
                     Row(modifier = Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
                          Icon(androidx.compose.material.icons.filled.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                          Spacer(Modifier.width(8.dp))
                          Text("Connected to $deviceNameInput", style = MaterialTheme.typography.bodySmall)
                     }
                }
            }

            Text(
                "Recent Detections",
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(reports) { report ->
                    ReportItem(report)
                }
                if (reports.isEmpty()) {
                    item {
                        Text("No potholes detected yet.", style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
        }
    }
}

@Composable
fun ReportItem(report: PotholeReport) {
    val severityColor = when (report.severity) {
        "Critical" -> Color(0xFFD32F2F) // Red
        "High" -> Color(0xFFF57C00)     // Orange
        "Medium" -> Color(0xFFFBC02D)   // Yellow
        "Low" -> Color(0xFF388E3C)      // Green
        else -> Color.Gray
    }

    Card(
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    color = severityColor.copy(alpha = 0.1f),
                    shape = MaterialTheme.shapes.small,
                    modifier = Modifier.padding(end = 8.dp)
                ) {
                    Text(
                        text = report.severity,
                        style = MaterialTheme.typography.labelLarge,
                        color = severityColor,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
                Text(
                    text = report.type,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.outline
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            if (report.description != null) {
                 // Simple markdown parser for **bold**
                 val parts = report.description.split("**")
                 val annotatedString = androidx.compose.ui.text.buildAnnotatedString {
                     parts.forEachIndexed { index, part ->
                         if (index % 2 == 1) { // Inside **
                             withStyle(style = androidx.compose.ui.text.SpanStyle(fontWeight = androidx.compose.ui.text.font.FontWeight.Bold)) {
                                 append(part)
                             }
                         } else {
                             append(part)
                         }
                     }
                 }
                 Text(text = annotatedString, style = MaterialTheme.typography.bodyMedium)
                 Spacer(modifier = Modifier.height(8.dp))
            }

            Divider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
            Spacer(modifier = Modifier.height(8.dp))

            Column {
                 Row(verticalAlignment = Alignment.CenterVertically) {
                     Icon(
                         imageVector = androidx.compose.material.icons.Icons.Default.AccessTime, 
                         contentDescription = null,
                         modifier = Modifier.size(14.dp),
                         tint = MaterialTheme.colorScheme.outline
                     )
                     Spacer(modifier = Modifier.width(4.dp))
                     Text(
                        text = java.util.Date(report.timestamp).toString(), 
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.outline
                     )
                 }
                 Spacer(modifier = Modifier.height(4.dp))
                 Row(verticalAlignment = Alignment.CenterVertically) {
                     Icon(
                         imageVector = androidx.compose.material.icons.Icons.Default.LocationOn, 
                         contentDescription = null,
                         modifier = Modifier.size(14.dp),
                         tint = MaterialTheme.colorScheme.outline
                     )
                     Spacer(modifier = Modifier.width(4.dp))
                     Text(
                        text = "${String.format("%.5f", report.latitude)}, ${String.format("%.5f", report.longitude)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.outline
                    )
                 }
            }
        }
    }
}
