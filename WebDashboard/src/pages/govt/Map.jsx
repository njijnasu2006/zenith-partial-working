import React from 'react';
import { useData } from '../../context/DataContext';
import { MapComponent } from '../../components/map/MapComponent';

export const GovtMap = () => {
    const { reports } = useData();

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Geographic Insights</h2>
                <p className="text-slate-500">Plan routes for repair crews based on density.</p>
            </div>

            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                <MapComponent reports={reports} />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <h4 className="font-bold text-blue-900">Suggestion</h4>
                <p className="text-sm text-blue-700">High density of 'High' severity potholes in Patia. Recommend deploying Crew A to this sector first.</p>
            </div>
        </div>
    )
}
