package com.teamzenith.potholedetector.ui.screens

import android.view.MotionEvent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.hilt.navigation.compose.hiltViewModel
import com.teamzenith.potholedetector.ui.viewmodel.AuthorityViewModel
import org.osmdroid.config.Configuration
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuthorityDashboardScreen(
    onBack: () -> Unit,
    viewModel: AuthorityViewModel = hiltViewModel()
) {
    val reports by viewModel.allReports.collectAsState()
    val context = LocalContext.current
    
    // Initialize OSMDroid config
    LaunchedEffect(Unit) {
        Configuration.getInstance().load(context, androidx.preference.PreferenceManager.getDefaultSharedPreferences(context))
        Configuration.getInstance().userAgentValue = context.packageName
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Authority Dashboard") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding)) {
            // Stats Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.primaryContainer)
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceAround
            ) {
                Column {
                    Text("Total Reports", style = MaterialTheme.typography.labelMedium)
                    Text(text = reports.size.toString(), style = MaterialTheme.typography.titleLarge)
                }
                Column {
                    Text("Critical", style = MaterialTheme.typography.labelMedium)
                    Text(
                        text = reports.count { it.severity == "Critical" }.toString(), 
                        style = MaterialTheme.typography.titleLarge,
                        color = Color.Red
                    )
                }
            }
            
            // OpenStreetMap View
            AndroidView(
                modifier = Modifier.fillMaxSize(),
                factory = { ctx ->
                    MapView(ctx).apply {
                        setTileSource(TileSourceFactory.MAPNIK)
                        setMultiTouchControls(true)
                        controller.setZoom(15.0)
                        controller.setCenter(GeoPoint(28.7041, 77.1025)) 
                    }
                },
                update = { mapView ->
                    mapView.overlays.clear()
                    
                    reports.forEach { report ->
                        val marker = Marker(mapView)
                        marker.position = GeoPoint(report.latitude, report.longitude)
                        marker.title = "${report.severity} Severity"
                        marker.snippet = report.description ?: "Detected automatically"
                        // Note: Default OSM marker is used. Custom icons can be set here.
                        mapView.overlays.add(marker)
                    }
                    mapView.invalidate()
                }
            )
        }
    }
}
