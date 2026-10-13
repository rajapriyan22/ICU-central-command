import React, { useState, useEffect } from 'react';
import { Search, Bell, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';

export default function Header({ globalSearch, setGlobalSearch }) {
  const { user } = useAuth();
  const { unreadCount } = useAlerts();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const role = user?.role ? user.role.toUpperCase() : '';

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Search Input */}
      <div className="relative w-96">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={globalSearch || ''}
          onChange={(e) => setGlobalSearch && setGlobalSearch(e.target.value)}
          placeholder="Search patients, beds, or wards..."
          className="w-full bg-slate-100/80 border border-transparent focus:border-blue-500 focus:bg-white text-xs font-medium rounded-xl pl-10 pr-4 py-2 outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Right Header Controls */}
      <div className="flex items-center gap-5">
        {/* Live Updating Indicator */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span>Live Updating</span>
          <span className="text-slate-400 font-mono text-[11px] ml-1">{currentTime}</span>
        </div>

        {/* Date Display */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentDate}</span>
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => navigate('/alerts')}
          title="View Operational Alerts"
          className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Badge Display */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {getInitials(user?.fullName)}
          </div>
          <div className="hidden lg:block text-left leading-tight">
            <p className="text-xs font-bold text-slate-900">{user?.fullName || 'Hospital User'}</p>
            <p className="text-[10px] text-slate-500 font-medium">
              {role} • {user?.department || 'ICU Operations'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
