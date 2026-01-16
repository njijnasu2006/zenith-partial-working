import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, UserCog, Building2 } from 'lucide-react';

export const Login = ({ setRole }) => {
    const navigate = useNavigate();

    const handleLogin = (role) => {
        setRole(role);
        if (role === 'admin') {
            navigate('/admin/dashboard');
        } else {
            navigate('/govt/tracker');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-brand-600/20 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-md p-8">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl shadow-xl shadow-brand-500/20 mb-6">
                        <ShieldAlert className="text-white w-10 h-10" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Zenith AI</h1>
                    <p className="text-slate-400 text-lg">Intelligent Pothole Detection System</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => handleLogin('admin')}
                        className="group w-full bg-slate-800/50 hover:bg-slate-800 border-2 border-slate-700 hover:border-brand-500 p-6 rounded-xl transition-all duration-300 flex items-center justify-between backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center group-hover:bg-brand-500/20 group-hover:text-brand-400 transition-colors">
                                <UserCog size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="text-white font-bold text-lg">Admin Portal</h3>
                                <p className="text-slate-400 text-sm">Verify reports & manage users</p>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            →
                        </div>
                    </button>

                    <button
                        onClick={() => handleLogin('government')}
                        className="group w-full bg-slate-800/50 hover:bg-slate-800 border-2 border-slate-700 hover:border-brand-500 p-6 rounded-xl transition-all duration-300 flex items-center justify-between backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center group-hover:bg-brand-500/20 group-hover:text-brand-400 transition-colors">
                                <Building2 size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="text-white font-bold text-lg">Government Portal</h3>
                                <p className="text-slate-400 text-sm">Track repairs & analytics</p>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            →
                        </div>
                    </button>
                </div>

                <p className="text-center text-slate-500 mt-8 text-sm">
                    <a href="/track" className="text-brand-400 hover:text-brand-300 underline underline-offset-4">Track a Report (Public)</a>
                    <span className="mx-2">•</span>
                    Secure Access • Mock Environment
                </p>
            </div>
        </div>
    );
};
