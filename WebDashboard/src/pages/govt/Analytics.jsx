import React from 'react';
import { useData } from '../../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const Analytics = () => {
    const { reports } = useData();

    // Data prep for charts
    const typeData = [
        { name: 'Pothole', value: reports.filter(r => r.type === 'Pothole').length },
        { name: 'Uneven Road', value: reports.filter(r => r.type === 'Uneven Road').length },
        { name: 'Waterlogging', value: reports.filter(r => r.type === 'Waterlogging').length },
    ];

    const severityData = [
        { name: 'Medium', value: reports.filter(r => r.severity === 'Medium').length },
        { name: 'High', value: reports.filter(r => r.severity === 'High').length },
        { name: 'Critical', value: reports.filter(r => r.severity === 'Critical').length },
    ];

    const COLORS = ['#0ea5e9', '#f59e0b', '#ef4444']; // Blue, Orange, Red

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Analytics & Insights</h2>
                <p className="text-slate-500">Data-driven decisions for road infrastructure.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Damage Distribution Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[400px]">
                    <h3 className="font-bold text-slate-800 mb-4">Damage Type Distribution</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={typeData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Severity Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[400px]">
                    <h3 className="font-bold text-slate-800 mb-4">Severity Breakdown</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={severityData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {severityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4">Monthly Repair Trends</h3>
                <div className="h-64 flex items-end justify-between gap-2 px-10 pb-4 border-b border-l border-slate-200">
                    {/* Mock Trend Bars */}
                    {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
                        <div key={i} className="w-10 bg-slate-100 rounded-t hover:bg-brand-100 transition-colors relative group">
                            <div className="absolute bottom-0 w-full bg-brand-500 rounded-t transition-all duration-500 group-hover:bg-brand-600" style={{ height: `${h}%` }}></div>
                            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-400">Day {i + 1}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
