import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Map,
    FileWarning,
    Hammer,
    BarChart3,
    LogOut,
    ShieldAlert
} from 'lucide-react';
import { clsx } from 'clsx';

const SidebarItem = ({ to, icon: Icon, label }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive
                    ? "bg-brand-600 text-white shadow-md"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </NavLink>
    );
};

export const MainLayout = ({ children, role, setRole }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
                <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                    <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                        <ShieldAlert className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Zenith AI</h1>
                        <p className="text-xs text-slate-400 uppercase tracking-widest">{role} Portal</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-4">
                    {role === 'admin' ? (
                        <>
                            <SidebarItem to="/admin/dashboard" icon={LayoutDashboard} label="Overview" />
                            <SidebarItem to="/admin/reports" icon={FileWarning} label="Manage Reports" />
                            <SidebarItem to="/admin/map" icon={Map} label="Live Map" />
                        </>
                    ) : (
                        <>
                            <SidebarItem to="/govt/tracker" icon={Hammer} label="Repair Tracker" />
                            <SidebarItem to="/govt/analytics" icon={BarChart3} label="Analytics" />
                            <SidebarItem to="/govt/map" icon={Map} label="Geo Insights" />
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={() => setRole(role === 'admin' ? 'government' : 'admin')}
                        className="w-full mb-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm py-2 px-4 rounded transition-colors"
                    >
                        Switch to {role === 'admin' ? 'Government' : 'Admin'}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-slate-50 relative">
                <div className="max-w-7xl mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};
