import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Search, MapPin, Calendar, Clock, Star, ArrowRight, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';

export const StatusPortal = () => {
    const { reports, addFeedback } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState(null); // Array or null
    const [selectedReport, setSelectedReport] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        const term = searchTerm.toLowerCase();
        const found = reports.filter(r =>
            r.id.toLowerCase() === term ||
            r.location.address.toLowerCase().includes(term) ||
            r.type.toLowerCase().includes(term)
        );

        setSearchResults(found);
        setSelectedReport(null); // Reset selection
    };

    const StatusTimeline = ({ status }) => {
        const steps = ['Pending', 'Verified', 'Resolved'];
        const currentStep = steps.indexOf(status) === -1 ? 0 : steps.indexOf(status);
        const isRejected = status === 'Rejected' || status === 'Ignored';

        if (isRejected) {
            return (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
                    <AlertTriangle />
                    <div>
                        <span className="font-bold">Report Rejected</span>
                        <p className="text-sm text-red-600">This report was marked as invalid or duplicate.</p>
                    </div>
                </div>
            )
        }

        return (
            <div className="w-full py-6">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10" />
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-600 -z-10 transition-all duration-500"
                        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    />

                    {steps.map((step, idx) => {
                        const isCompleted = idx <= currentStep;
                        return (
                            <div key={step} className="flex flex-col items-center bg-white px-2">
                                {isCompleted ? (
                                    <CheckCircle2 className="text-brand-600 fill-white" size={24} />
                                ) : (
                                    <Circle className="text-slate-300 fill-white" size={24} />
                                )}
                                <span className={`text-xs mt-2 font-medium ${isCompleted ? 'text-brand-700' : 'text-slate-400'}`}>
                                    {step}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    };

    const FeedbackForm = ({ reportId }) => {
        const [rating, setRating] = useState(5);
        const [comment, setComment] = useState('');
        const [submitted, setSubmitted] = useState(false);

        const handleSubmit = (e) => {
            e.preventDefault();
            addFeedback(reportId, { rating, comment });
            setSubmitted(true);
        };

        if (submitted) return <div className="text-green-600 text-sm font-bold bg-green-50 p-3 rounded text-center">Thank you for your feedback!</div>;

        return (
            <form onSubmit={handleSubmit} className="mt-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-4">Rate the repair quality</h4>
                <div className="flex gap-2 mb-4 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setRating(star)} className={`text-3xl transition-colors ${rating >= star ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-200'}`}>★</button>
                    ))}
                </div>
                <textarea
                    className="w-full text-sm border border-slate-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="Any comments on the repair work?"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={3}
                />
                <button type="submit" className="w-full py-2.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-all shadow-sm">Submit Feedback</button>
            </form>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-20 px-4 pb-20">
            <div className="text-center mb-10 max-w-lg">
                <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Citizen Portal</h1>
                <p className="text-slate-500 text-lg">Track the status of reported road defects in real-time.</p>
            </div>

            <form onSubmit={handleSearch} className="w-full max-w-2xl bg-white p-2 rounded-2xl shadow-xl shadow-brand-900/5 flex gap-2 mb-12 border border-slate-100 items-center">
                <Search className="ml-4 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Enter Report ID (e.g., r-123) or Location (e.g., Patia)..."
                    className="flex-1 px-2 py-3 outline-none text-slate-700 placeholder:text-slate-400 text-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                    type='submit'
                    className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95">
                    Search
                </button>
            </form>

            {/* Results List */}
            {!selectedReport && searchResults && (
                <div className="w-full max-w-2xl">
                    <h3 className="text-slate-400 font-medium mb-4 text-sm uppercase tracking-wider">{searchResults.length} Reports Found</h3>
                    <div className="space-y-3">
                        {searchResults.map(report => (
                            <div
                                key={report.id}
                                onClick={() => setSelectedReport(report)}
                                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group flex justify-between items-center"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden">
                                        {report.imageUrl ? (
                                            <img src={report.imageUrl} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300"><MapPin size={20} /></div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 group-hover:text-brand-700 transition-colors">{report.location.address}</h4>
                                        <p className="text-sm text-slate-500">{report.type} • {new Date(report.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold border uppercase tracking-wide
                                        ${report.status === 'Verified' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                            report.status === 'Resolved' ? 'bg-green-50 text-green-600 border-green-200' :
                                                report.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                                                    'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                        {report.status}
                                    </span>
                                    <ArrowRight className="text-slate-300 group-hover:text-brand-500 transition-colors" />
                                </div>
                            </div>
                        ))}
                        {searchResults.length === 0 && (
                            <div className="text-center py-10 text-slate-400">No reports found matching your search.</div>
                        )}
                    </div>
                </div>
            )}

            {/* Detailed View */}
            {selectedReport && (
                <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
                        <div>
                            <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-white text-sm mb-2 flex items-center gap-1">← Back to results</button>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                {selectedReport.type} Report
                            </h2>
                            <p className="text-slate-400 text-sm opacity-80">ID: {selectedReport.id}</p>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-lg
                            ${selectedReport.status === 'Resolved' ? 'bg-green-500 text-white' :
                                selectedReport.status === 'Verified' ? 'bg-blue-500 text-white' :
                                    'bg-yellow-500 text-black'}`}>
                            {selectedReport.status}
                        </div>
                    </div>

                    <div className="p-8">
                        <StatusTimeline status={selectedReport.status} />

                        <div className="mt-8 grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Location</label>
                                    <p className="text-slate-800 font-medium text-lg leading-snug mt-1">{selectedReport.location.address}</p>
                                    <p className="text-xs text-brand-600 font-mono mt-1">{selectedReport.location.lat}, {selectedReport.location.lng}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Severity</label>
                                        <p className={`font-bold mt-1 ${selectedReport.severity === 'Critical' ? 'text-red-600' :
                                            selectedReport.severity === 'High' ? 'text-orange-600' : 'text-yellow-600'
                                            }`}>{selectedReport.severity}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Date</label>
                                        <p className="font-medium text-slate-700 mt-1">{new Date(selectedReport.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {selectedReport.description && (
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">Description</label>
                                        <p className="text-sm text-slate-700 italic">"{selectedReport.description}"</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner group relative">
                                    {selectedReport.imageUrl ? (
                                        <a href={selectedReport.imageUrl} target="_blank" rel="noreferrer">
                                            <img src={selectedReport.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Evidence" />
                                        </a>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                            <MapPin size={32} className="mb-2 opacity-50" />
                                            <span className="text-xs">No Image Available</span>
                                        </div>
                                    )}
                                </div>
                                {selectedReport.estimatedCompletionDate && selectedReport.status !== 'Resolved' && (
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
                                        <Clock size={16} />
                                        <span>Estimated Repair: <strong>{new Date(selectedReport.estimatedCompletionDate).toLocaleDateString()}</strong></span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedReport.status === 'Resolved' && !selectedReport.userFeedback && (
                            <div className="mt-8 border-t border-slate-100 pt-6">
                                <FeedbackForm reportId={selectedReport.id} />
                            </div>
                        )}

                        {selectedReport.userFeedback && (
                            <div className="mt-8 bg-green-50/50 p-6 rounded-xl border border-green-100 text-center">
                                <div className="inline-flex items-center gap-2 text-green-700 font-bold mb-2 bg-white px-4 py-1 rounded-full shadow-sm">
                                    <Star size={16} className="fill-green-700" />
                                    <span>Rated {selectedReport.userFeedback.rating}/5</span>
                                </div>
                                <p className="text-green-800 italic">"{selectedReport.userFeedback.comment}"</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
