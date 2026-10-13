import React from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { useAlerts } from '../context/AlertContext';

export default function AlertsAndEvents() {
  const { alerts, loading, filter, setFilter, markAsRead } = useAlerts();

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Alerts & Events Log</h1>
          <p className="text-xs text-slate-500 font-medium">Operational warnings, bed maintenance events, and system alerts</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none"
        >
          <option value="ALL">All Categories</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="WARNING">WARNING</option>
          <option value="INFORMATION">INFORMATION</option>
        </select>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs font-semibold text-slate-500">Loading Operational Alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 p-8 text-slate-500">
          <p className="text-sm font-semibold text-slate-700">No alerts found</p>
          <p className="text-xs text-slate-400 mt-1">There are currently no alerts matching the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-all ${
                a.isRead
                  ? 'bg-slate-50/70 border-slate-200/80 text-slate-500 opacity-80'
                  : a.category === 'CRITICAL'
                  ? 'bg-rose-50/60 border-rose-100 text-rose-900'
                  : a.category === 'WARNING'
                  ? 'bg-amber-50/60 border-amber-100 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl mt-0.5 ${
                  a.isRead ? 'bg-slate-200 text-slate-500' :
                  a.category === 'CRITICAL' ? 'bg-rose-100 text-rose-600' :
                  a.category === 'WARNING' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {a.isRead ? <CheckCircle2 className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm leading-tight">{a.title}</h3>
                    {a.isRead && (
                      <span className="bg-slate-200/80 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        Read
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{a.description}</p>
                  <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                    {a.timestamp ? new Date(a.timestamp).toLocaleString() : 'Recently'}
                  </span>
                </div>
              </div>

              {!a.isRead ? (
                <button
                  onClick={() => markAsRead(a.id)}
                  className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 active:scale-95 text-slate-700 rounded-lg text-xs font-semibold shrink-0 transition-all shadow-xs"
                >
                  Mark Read
                </button>
              ) : (
                <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Acknowledged</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
