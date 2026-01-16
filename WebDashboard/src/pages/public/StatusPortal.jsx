import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Search, MapPin, Calendar, Clock, Star, MessageSquare } from 'lucide-react';

export const StatusPortal = () => {
    const { reports, addFeedback } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResult, setSearchResult] = useState(null);

    // Mock "My Reports" - in reality would filter by logged in user
    // Here we just search by ID or LOCATION just for demo
    const handleSearch = () => {
        const found = reports.find(r => r.id === searchTerm || r.location.address.toLowerCase().includes(searchTerm.toLowerCase()));
        setSearchResult(found || null);
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

        if (submitted) return <div className="text-green-600 text-sm font-bold bg-green-50 p-3 rounded">Thank you for your feedback!</div>;

        return (
            <form onSubmit={handleSubmit} className="mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-bold text-sm text-slate-700 mb-2">Rate the repair quality</h4>
                <div className="flex gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setRating(star)} className={`text-xl ${rating >= star ? 'text-yellow-400' : 'text-slate-300'}`}>★</button>
                    ))}
                </div>
                <textarea
                    className="w-full text-sm border rounded p-2 mb-2"
                    placeholder="Any comments?"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                />
                <button type="submit" className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded hover:bg-brand-700">Submit Feedback</button>
            </form>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-20 px-4">
            <div className="text-center mb-10 max-w-lg">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Track Your Report</h1>
                <p className="text-slate-500">Enter your Report ID or Location to check the status of your reported pothole.</p>
            </div>

            <div className="w-full max-w-xl bg-white p-2 rounded-xl shadow-lg flex gap-2 mb-10 border border-slate-200">
                <input
                    type="text"
                    placeholder="Try 'Patia' or 'r-101'..."
                    className="flex-1 px-4 py-3 outline-none text-slate-700 placeholder:text-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                    onClick={handleSearch}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-6 rounded-lg font-bold transition-colors flex items-center gap-2">
                    <Search size={18} />
                    Search
                </button>
            </div>

            {searchResult ? (
                <div className="w-full max-w-xl bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="h-2 bg-brand-500 w-full"></div>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <MapPin className="text-brand-500" size={20} />
                                    {searchResult.location.address}
                                </h2>
                                <p className="text-sm text-slate-400 ml-7">Report ID: {searchResult.id}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide
                                ${searchResult.status === 'Verified' ? 'bg-green-50 text-green-600 border-green-200' :
                                    searchResult.status === 'Resolved' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                        searchResult.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                                            'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                {searchResult.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <span className="text-xs text-slate-400 block mb-1">Reported On</span>
                                <div className="flex items-center gap-2 font-medium text-slate-700">
                                    <Calendar size={16} />
                                    {new Date(searchResult.timestamp).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <span className="text-xs text-slate-400 block mb-1">Est. Completion</span>
                                <div className="flex items-center gap-2 font-medium text-slate-700">
                                    <Clock size={16} />
                                    {searchResult.estimatedCompletionDate ? new Date(searchResult.estimatedCompletionDate).toLocaleDateString() : 'Not scheduled'}
                                </div>
                            </div>
                        </div>

                        {searchResult.status === 'Resolved' && !searchResult.userFeedback && (
                            <FeedbackForm reportId={searchResult.id} />
                        )}

                        {searchResult.userFeedback && (
                            <div className="bg-green-50/50 p-4 rounded-lg border border-green-100">
                                <div className="flex items-center gap-2 text-green-700 font-bold mb-1">
                                    <Star size={16} className="fill-green-700" />
                                    <span>rated {searchResult.userFeedback.rating}/5</span>
                                </div>
                                <p className="text-sm text-green-800 italic">"{searchResult.userFeedback.comment}"</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : searchTerm && (
                <div className="text-slate-400">No report found matching "{searchTerm}"</div>
            )}
        </div>
    );
};
