import React from 'react';
import { useData } from '../../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

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

        return {
            name: `${d.getDate()}/${d.getMonth() + 1}`,
            count,
            fullDate: dateString
        };
    });

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
                <h3 className="font-bold text-slate-800 mb-6">Last 7 Days Activity Trend</h3>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#6366f1"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorCount)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
