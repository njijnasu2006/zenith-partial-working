package com.teamzenith.potholedetector

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.teamzenith.potholedetector.ui.screens.AuthorityDashboardScreen
import com.teamzenith.potholedetector.ui.screens.CitizenHomeScreen
import com.teamzenith.potholedetector.ui.screens.ReportPotholeScreen
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme { // TODO: Custom Theme
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    PotholeAppNavigation()
                }
            }
        }
    }
}

@Composable
fun PotholeAppNavigation() {
    val navController = rememberNavController()
    
    NavHost(navController = navController, startDestination = "citizen_home") {
        composable("citizen_home") {
            CitizenHomeScreen(
                onNavigateToReport = { navController.navigate("report_pothole") },
                onNavigateToDashboard = { navController.navigate("authority_dashboard") }
            )
        }
        composable("report_pothole") {
            ReportPotholeScreen(onBack = { navController.popBackStack() })
        }
        composable("authority_dashboard") {
            AuthorityDashboardScreen(onBack = { navController.popBackStack() })
        }
    }
}
