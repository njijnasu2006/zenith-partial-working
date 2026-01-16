import React from 'react';
import { useData } from '../../context/DataContext';
import { Hammer, Clock, CheckCircle2 } from 'lucide-react';

export const Tracker = () => {
    const { reports, updateReportStatus } = useData();

    // Filter for reports that have been VERIFIED by admin. Only verified reports go to government.
    const verifiedReports = reports.filter(r => r.status !== 'Ignored' && r.status !== 'Pending');

    // Group by status
    const todo = verifiedReports.filter(r => r.status === 'Verified');
    const inProgress = verifiedReports.filter(r => r.status === 'In Progress');
    const completed = verifiedReports.filter(r => r.status === 'Resolved');

    const Card = ({ report, actionLabel, onAction }) => (
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-3">
            <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                ${report.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    {report.severity}
                </span>
                <span className="text-xs text-slate-400">{new Date(report.timestamp).toLocaleDateString()}</span>
            </div>
            <p className="font-medium text-slate-800 text-sm mb-1">{report.location.address}</p>
            <p className="text-xs text-slate-500 mb-3">{report.type}</p>

            {onAction && (
                <div className="flex flex-col gap-2">
                    {actionLabel === 'Start Repair →' && (
                        <div className="w-full">
                            <label className="text-[10px] text-slate-500 mb-1 block">Est. Completion:</label>
                            <input
                                type="date"
                                className="w-full text-xs border rounded p-1 mb-2 bg-slate-50"
                                id={`date-${report.id}`}
                            />
                        </div>
                    )}
                    <button
                        onClick={() => {
                            if (actionLabel === 'Start Repair →') {
                                const dateInput = document.getElementById(`date-${report.id}`);
                                if (!dateInput?.value) {
                                    alert('Please select an estimated completion date.');
                                    return;
                                }
                                onAction(report.id, { estimatedCompletionDate: dateInput.value });
                            } else {
                                onAction(report.id);
                            }
                        }}
                        className="w-full py-1.5 bg-slate-100 hover:bg-brand-50 text-brand-600 text-xs font-medium rounded transition-colors"
                    >
                        {actionLabel}
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Repair Tracker</h2>
                <p className="text-slate-500">Track maintenance tasks and crew assignments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* To Do / Backlog */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 min-h-[500px]">
                    <div className="flex items-center gap-2 mb-4 text-slate-600 font-bold">
                        <Clock size={18} />
                        <span>To Assign ({todo.length})</span>
                    </div>
                    {todo.map(r => (
                        <Card
                            key={r.id}
                            report={r}
                            actionLabel="Start Repair →"
                            onAction={(id, data) => updateReportStatus(id, 'In Progress', data)}
                        />
                    ))}
                    {todo.length === 0 && <div className="text-xs text-slate-400 text-center py-10">No pending repairs</div>}
                </div>

                {/* In Progress */}
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 min-h-[500px]">
                    <div className="flex items-center gap-2 mb-4 text-blue-700 font-bold">
                        <Hammer size={18} />
                        <span>Work In Progress ({inProgress.length})</span>
                    </div>
                    {inProgress.map(r => (
                        <Card key={r.id} report={r} actionLabel="Mark Complete ✓" onAction={(id) => updateReportStatus(id, 'Resolved')} />
                    ))}
                    {inProgress.length === 0 && <div className="text-xs text-slate-400 text-center py-10">No active repairs</div>}
                </div>

                {/* Completed */}
                <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 min-h-[500px]">
                    <div className="flex items-center gap-2 mb-4 text-green-700 font-bold">
                        <CheckCircle2 size={18} />
                        <span>Completed ({completed.length})</span>
                    </div>
                    {completed.map(r => (
                        <Card key={r.id} report={r} />
                    ))}
                    {completed.length === 0 && <div className="text-xs text-slate-400 text-center py-10">No recent completions</div>}
                </div>

            </div>
        </div>
    );
};
