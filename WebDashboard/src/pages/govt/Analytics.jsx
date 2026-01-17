import React from 'react';
import { useData } from '../../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const Analytics = () => {
    const { reports } = useData();

    // Data prep for charts
    const typeData = [
        { name: 'Pothole', value: reports.filter(r => r.type === 'Pothole').length },
        { name: 'Uneven Road', value: reports.filter(r => r.type === 'Uneven Road').length },
        { name: 'Water Logging', value: reports.filter(r => r.type === 'Water Logging').length },
    ];

    const severityData = [
        { name: 'Medium', value: reports.filter(r => r.severity === 'Medium').length },
        { name: 'High', value: reports.filter(r => r.severity === 'High').length },
        { name: 'Critical', value: reports.filter(r => r.severity === 'Critical').length },
    ];

    const COLORS = ['#0ea5e9', '#f59e0b', '#ef4444']; // Blue, Orange, Red

    // Calculate Trend Data (Last 7 Days)
    const trendData = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateString = d.toLocaleDateString();

        const count = reports.filter(r => {
            const rDate = new Date(r.timestamp).toLocaleDateString();
            return rDate === dateString;
        }).length;
        console.log(`DATE: ${dateString}, COUNT: ${count}, DAY: ${i + 1}`);
        return { date: dateString, count, label: `Day ${i + 1}` };
    });

    const maxCount = Math.max(...trendData.map(d => d.count), 1); // Avoid div by 0

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Analytics & Insights</h2>
                <p className="text-slate-500">Data-driven decisions for road infrastructure.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Damage Distribution Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[400px]">
                    <h3 className="font-bold text-slate-800 -mt-2">Damage Type Distribution</h3>
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
                    <h3 className="font-bold text-slate-800 -mt-2">Severity Breakdown</h3>
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
                <h3 className="font-bold text-slate-800 mb-4">Last 7 Days Activity</h3>
                <div className="h-64 flex items-end justify-between gap-2 px-10 pb-4 border-b border-l border-slate-200">
                    {trendData.map((data, i) => (
                        <div key={i} className="w-10 h-full bg-slate-100 rounded-t hover:bg-brand-100 transition-colors relative group tooltip-container">
                            <div
                                className="absolute bottom-0 w-full bg-indigo-500 rounded-t transition-all duration-500 group-hover:bg-indigo-600"
                                style={{ height: `${(data.count / maxCount) * 100}%` }}
                            ></div>
                            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 whitespace-nowrap">{data.date.split('/')[0]}/{data.date.split('/')[1]}</span>

                            {/* Tooltip */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                {data.count} Reports
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
