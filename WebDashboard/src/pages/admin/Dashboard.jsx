import React from 'react';
import { useData } from '../../context/DataContext';
import { FileWarning, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
        <div>
            <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
            {trend && <p className={`text-xs mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '+' : ''}{trend}% from last week
            </p>}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600`}>
            <Icon size={24} />
        </div>
    </div>
);

export const Dashboard = () => {
    const { reports, loading } = useData();

    if (loading) return <div>Loading...</div>;

    const totalReports = reports.length;
    const verified = reports.filter(r => r.status === 'Verified').length;
    const pending = reports.filter(r => r.status === 'Pending').length;
    const critical = reports.filter(r => r.severity === 'Critical').length;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Administrator Overview</h2>
                <p className="text-slate-500">Welcome back! Here's what's happening on the roads.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Reports" value={totalReports} icon={FileWarning} color="blue" trend={12} />
                <StatCard title="Verified Hazards" value={verified} icon={CheckCircle2} color="green" trend={5} />
                <StatCard title="Critical Issues" value={critical} icon={AlertTriangle} color="red" trend={-2} />
                <StatCard title="Pending Review" value={pending} icon={Clock} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {reports.slice(0, 5).map((report) => (
                            <div key={report.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border-l-4"
                                style={{ borderColor: report.severity === 'Critical' ? '#ef4444' : '#eab308' }}
                            >
                                <div className="flex-1">
                                    <p className="font-medium text-slate-800">{report.type} reported in {report.location.address}</p>
                                    <p className="text-xs text-slate-500">{new Date(report.timestamp).toLocaleString()}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-semibold
                             ${report.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}
                        `}>
                                    {report.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl text-white">
                    <h3 className="font-bold mb-4">System Status</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>IoT Sensor Uptime</span>
                                <span className="text-green-400">98.5%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '98.5%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>AI Recognition Accuracy</span>
                                <span className="text-brand-400">94.2%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div className="bg-brand-500 h-2 rounded-full" style={{ width: '94.2%' }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-slate-800/50 rounded-lg">
                        <p className="text-sm text-slate-300">
                            <span className="font-bold text-white">Note:</span> Heavy rain detected in Sector 5. Expect increased pothole reports.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
