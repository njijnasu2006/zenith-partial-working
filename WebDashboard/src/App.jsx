import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';

import { Dashboard as AdminDashboard } from './pages/admin/Dashboard';
import { Reports as AdminReports } from './pages/admin/Reports';
import { AdminMap } from './pages/admin/Map';
import { Tracker as GovtTracker } from './pages/govt/Tracker';
import { Analytics as GovtAnalytics } from './pages/govt/Analytics';
import { GovtMap } from './pages/govt/Map';
import { StatusPortal } from './pages/public/StatusPortal';

function App() {
  const [role, setRole] = useState(null); // 'admin' or 'government' or null

  return (
    <Router>
      <DataProvider>
        <Routes>
          <Route path="/" element={<Login setRole={setRole} />} />
          <Route path="/track" element={<StatusPortal />} />

          <Route path="/admin/*" element={
            role === 'admin' ? (
              <MainLayout role="admin" setRole={setRole}>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="map" element={<AdminMap />} />
                  <Route path="*" element={<Navigate to="dashboard" />} />
                </Routes>
              </MainLayout>
            ) : <Navigate to="/" />
          } />

          <Route path="/govt/*" element={
            role === 'government' ? (
              <MainLayout role="government" setRole={setRole}>
                <Routes>
                  <Route path="tracker" element={<GovtTracker />} />
                  <Route path="analytics" element={<GovtAnalytics />} />
                  <Route path="map" element={<GovtMap />} />
                  <Route path="*" element={<Navigate to="tracker" />} />
                </Routes>
              </MainLayout>
            ) : <Navigate to="/" />
          } />

        </Routes>
      </DataProvider>
    </Router>
  );
}

export default App;
