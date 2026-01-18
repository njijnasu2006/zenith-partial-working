import React from 'react';
import { useData } from '../../context/DataContext';
import { MapComponent } from '../../components/map/MapComponent';

export const GovtMap = () => {
    const { reports } = useData();

    // Logic for Reactive Suggestions
    const getDynamicSuggestion = () => {
        const activeReports = reports.filter(r => r.status === 'Verified' || r.status === 'Pending');

        if (activeReports.length === 0) {
            return {
                title: "All Clear",
                text: "No active road issues detected. Great job on maintenance!",
                color: "green"
            };
        }

        // Group by locality (assuming first part of address is sector)
        const sectorStats = activeReports.reduce((acc, r) => {
            const sector = r.location.address.split(',')[0].trim();
            if (!acc[sector]) acc[sector] = { count: 0, weight: 0, highSeverity: false };

            acc[sector].count += 1;
            const weight = r.severity === 'Critical' ? 3 : (r.severity === 'High' ? 2 : 1);
            acc[sector].weight += weight;
            if (r.severity === 'Critical' || r.severity === 'High') acc[sector].highSeverity = true;

            return acc;
        }, {});

        // Find hottest sector
        const hottestSector = Object.entries(sectorStats).sort((a, b) => b[1].weight - a[1].weight)[0];
        const [sectorName, stats] = hottestSector;

        if (stats.weight > 5) {
            return {
                title: "Urgent Attention Required",
                text: `High density of urgent issues in ${sectorName}. Recommend prioritizing Crew A to this sector today.`,
                color: "red"
            };
        }

        return {
            title: "Optimization Suggestion",
            text: `Detected multiple issues in ${sectorName}. Routing repairs consecutively could save 20% fuel costs.`,
            color: "blue"
        };
    };

    const suggestion = getDynamicSuggestion();
    const wipReports = reports.filter(r => r.status === 'In Progress');
    const completedReports = reports.filter(r => r.status === 'Resolved');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Geographic Insights</h2>
                    <p className="text-slate-500">Plan routes for repair crews based on density.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* AI Suggestion Box */}
                <div className={`p-4 rounded-xl border transition-all duration-500 shadow-sm
                    ${suggestion.color === 'red' ? 'bg-red-50 border-red-100' :
                        suggestion.color === 'green' ? 'bg-green-50 border-green-100' :
                            'bg-blue-50 border-blue-100'}`}>
                    <h4 className={`font-bold text-sm uppercase tracking-wider mb-1 ${suggestion.color === 'red' ? 'text-red-900' :
                        suggestion.color === 'green' ? 'text-green-900' :
                            'text-blue-900'}`}>AI Strategy</h4>
                    <p className={`text-sm leading-relaxed ${suggestion.color === 'red' ? 'text-red-700' :
                        suggestion.color === 'green' ? 'text-green-700' :
                            'text-blue-700'}`}>{suggestion.text}</p>
                </div>

                {/* WIP Box */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Work In Progress</h4>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-brand-600">{wipReports.length}</span>
                        <span className="text-sm text-slate-500 font-medium">Active Tasks</span>
                    </div>
                    <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-brand-500 h-full rounded-full" style={{ width: `${(wipReports.length / (reports.length || 1)) * 100}%` }}></div>
                    </div>
                </div>

                {/* Completed Box */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Completed Tasks</h4>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-green-600">{completedReports.length}</span>
                        <span className="text-sm text-slate-500 font-medium">Repaired</span>
                    </div>
                    <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{ width: `${(completedReports.length / (reports.length || 1)) * 100}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                <MapComponent reports={reports} />
            </div>
        </div>
    )
}
