import React from 'react';
import { useData } from '../../context/DataContext';
import { MapComponent } from '../../components/map/MapComponent';

export const AdminMap = () => {
    const { reports } = useData();

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Live Heatmap</h2>
                <p className="text-slate-500">Visualizing road damage intensity across the region.</p>
            </div>

            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                <MapComponent reports={reports} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <h4 className="font-bold text-red-800">Critical Zones</h4>
                    <p className="text-sm text-red-600">3 areas require immediate attention.</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <h4 className="font-bold text-orange-800">Warning Zones</h4>
                    <p className="text-sm text-orange-600">detected uneven surfaces near schools.</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h4 className="font-bold text-green-800">Repair Progress</h4>
                    <p className="text-sm text-green-600">45% of verified potholes repaired this month.</p>
                </div>
            </div>
        </div>
    )
}
