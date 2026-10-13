import React, { useState } from 'react';
import { BarChart3, Download, Calendar, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function AnalyticsAndReports() {
  const [timeframe, setTimeframe] = useState('7 Days');

  const occupancyTrend = [
    { date: 'Sep 11', occupancy: 72, admissions: 8, discharges: 10 },
    { date: 'Sep 12', occupancy: 68, admissions: 6, discharges: 5 },
    { date: 'Sep 13', occupancy: 75, admissions: 12, discharges: 14 },
    { date: 'Sep 14', occupancy: 78, admissions: 10, discharges: 7 },
    { date: 'Sep 15', occupancy: 82, admissions: 14, discharges: 12 },
    { date: 'Sep 16', occupancy: 80, admissions: 11, discharges: 15 },
    { date: 'Sep 17', occupancy: 85, admissions: 10, discharges: 13 },
  ];

  const handleExport = () => {
    alert('Generating ICU Central Command Analytics Report (PDF/CSV)... Download started!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics & Reports</h1>
          <p className="text-xs text-slate-500 font-medium">Hospital ICU utilization, turnover metrics, and operational performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 text-xs font-semibold">
            {['Today', '7 Days', '30 Days', 'Custom'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeframe === tf ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bed Occupancy Rate Trend */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">ICU Occupancy Rate Trend (%)</h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Avg: 78.5%</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyTrend}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip />
                <Area type="monotone" dataKey="occupancy" name="Occupancy Rate %" stroke="#2563EB" fill="#DBEAFE" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Admissions vs Discharges Bar Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Admissions vs Discharges Volume</h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Turnover Rate: 1.25</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyTrend}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="admissions" name="Admissions" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="discharges" name="Discharges" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
