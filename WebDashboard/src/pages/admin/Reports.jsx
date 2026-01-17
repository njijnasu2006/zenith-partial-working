import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Check, X, Maximize2 } from 'lucide-react';

export const Reports = () => {
    const { reports, updateReportStatus } = useData();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredReports = reports.filter(report => {
        const query = searchQuery.toLowerCase();
        const address = report.location?.address?.toLowerCase() || '';
        const type = report.type?.toLowerCase() || '';
        const status = report.status?.toLowerCase() || '';

        return address.includes(query) || type.includes(query) || status.includes(query);
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Manage Reports</h2>
                    <p className="text-slate-500">Verify user submissions and AI detections.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search location..."
                        className="px-4 py-2 border rounded-lg text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <select className="px-4 py-2 border rounded-lg text-sm bg-white">
                        <option>All Status</option>
                        <option>Pending</option>
                        <option>Verified</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Evidence</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location & Time</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type / Severity</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredReports.map((report) => (
                            <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    {report.imageUrl ? (
                                        <div className="relative group w-16 h-16 rounded overflow-hidden cursor-pointer">
                                            <a href={report.imageUrl} target='_blank' rel='noopener noreferrer'>
                                                <img src={report.imageUrl} alt="Pothole" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Maximize2 className="text-white w-4 h-4" />
                                                </div>
                                            </a>
                                        </div>
                                    ) : (
                                        <img src="/sensor.avif" alt="Pothole" className="size-12 mx-2 object-cover" />
                                    )}
                                </td>
                                <td className="p-4">
                                    <p className="font-medium text-slate-800 text-sm w-[200px]">{report.location.address}</p>
                                    <p className="text-xs text-slate-500 mt-1">{new Date(report.timestamp).toLocaleDateString()}, {new Date(report.timestamp).toLocaleTimeString()}</p>
                                    <p className="text-[10px] text-brand-600 font-mono mt-1 w-24 truncate">{report.location.lat}, {report.location.lng}</p>
                                </td>
                                <td className="p-4">
                                    <span className="block text-sm font-medium text-slate-700">{report.type}</span>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                                ${report.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                                            report.severity === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {report.severity}
                                    </span>
                                    <div className="text-[10px] text-slate-400 mt-1">Source: {report.source}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border
                                ${report.status === 'Verified' ? 'bg-green-50 text-green-600 border-green-200' :
                                            report.status === 'Resolved' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                        {report.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {report.status === 'Pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => updateReportStatus(report.id, 'Verified')}
                                                className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200" title="Verify">
                                                <Check size={16} />
                                            </button>
                                            <button
                                                onClick={() => updateReportStatus(report.id, 'Ignored')}
                                                className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Ignore">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                    {report.status === 'Verified' && (
                                        <span className="text-xs text-slate-400">Escalated to Govt</span>
                                    )}
                                    {(report.status === 'Resolved' || report.status === 'Ignored') && (
                                        <button
                                            onClick={() => updateReportStatus(report.id, 'Pending')}
                                            className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs hover:bg-slate-200 border border-slate-300">
                                            Reopen
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
