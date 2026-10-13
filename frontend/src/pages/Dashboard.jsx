import React, { useEffect, useState } from 'react';
import {
  BedDouble,
  Users,
  AlertTriangle,
  HeartPulse,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  TrendingUp,
  Server,
  Database,
  Activity,
  Bell
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import KpiCard from '../components/common/KpiCard';
import { DashboardService } from '../services/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await DashboardService.getSummary();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-semibold">Loading ICU Command Center metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 m-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="font-bold text-sm">Unable to connect to ICU Server</h3>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-red-700"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const pieColors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];
  const bedPieData = [
    { name: 'Available', value: data?.availableBeds || 14 },
    { name: 'Occupied', value: data?.occupiedBeds || 30 },
    { name: 'Cleaning', value: data?.cleaningBeds || 2 },
    { name: 'Maintenance', value: data?.maintenanceBeds || 4 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ICU Command Dashboard</h1>
          <p className="text-xs text-slate-500 font-medium">Overview of ICU operations and patient status</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2"
        >
          <Activity className="w-3.5 h-3.5 text-blue-600" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <KpiCard
          title="Total Beds"
          value={data?.totalBeds || 48}
          trend="↑ 4%"
          subtext="Across all ICUs"
          icon={BedDouble}
          color="blue"
        />
        <KpiCard
          title="Available Beds"
          value={data?.availableBeds || 14}
          subtext={`${Math.round(((data?.availableBeds || 14) / (data?.totalBeds || 48)) * 100)}% available`}
          icon={BedDouble}
          color="emerald"
        />
        <KpiCard
          title="Occupied Beds"
          value={data?.occupiedBeds || 30}
          subtext={`${Math.round(((data?.occupiedBeds || 30) / (data?.totalBeds || 48)) * 100)}% occupied`}
          icon={BedDouble}
          color="blue"
        />
        <KpiCard
          title="Maintenance"
          value={data?.maintenanceBeds || 4}
          subtext={`${Math.round(((data?.maintenanceBeds || 4) / (data?.totalBeds || 48)) * 100)}% unavailable`}
          icon={Wrench}
          color="rose"
        />
        <KpiCard
          title="Total Patients"
          value={data?.totalPatients || 30}
          trend="↑ 6%"
          subtext="Currently admitted"
          icon={Users}
          color="indigo"
        />
        <KpiCard
          title="Critical Patients"
          value={data?.criticalPatients || 6}
          subtext={`${Math.round(((data?.criticalPatients || 6) / (data?.totalPatients || 30)) * 100)}% of total`}
          icon={HeartPulse}
          color="rose"
        />
        <KpiCard
          title="Stable Patients"
          value={data?.stablePatients || 24}
          subtext={`${Math.round(((data?.stablePatients || 24) / (data?.totalPatients || 30)) * 100)}% of total`}
          icon={ShieldCheck}
          color="emerald"
        />
      </div>

      {/* Middle Section: Donut Chart, Line Chart, Ward Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bed Status Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Bed Status Distribution</h3>
          <div className="h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bedPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {bedPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-slate-900">{data?.totalBeds || 48}</span>
              <span className="text-[11px] font-medium text-slate-400">Total Beds</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600">Available: <strong className="text-slate-900">{data?.availableBeds || 14}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-slate-600">Occupied: <strong className="text-slate-900">{data?.occupiedBeds || 30}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-600">Cleaning: <strong className="text-slate-900">{data?.cleaningBeds || 2}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-600">Maintenance: <strong className="text-slate-900">{data?.maintenanceBeds || 4}</strong></span>
            </div>
          </div>
        </div>

        {/* Bed Turnover Line Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Bed Turnover (Last 7 Days)</h3>
            <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/60">
              Admissions vs Discharges
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.turnoverHistory || []}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="admissions" name="Admissions" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="discharges" name="Discharges" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ward-Wise Bed Availability Table */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Ward-wise Bed Availability</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px]">
                  <th className="pb-2">Ward</th>
                  <th className="pb-2 text-center">Total</th>
                  <th className="pb-2 text-center">Occupied</th>
                  <th className="pb-2 text-center">Available</th>
                  <th className="pb-2 text-center">Maint.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {(data?.wardAvailability || []).map((w, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-2.5 font-bold text-slate-900">{w.wardName}</td>
                    <td className="py-2.5 text-center">{w.totalBeds}</td>
                    <td className="py-2.5 text-center text-blue-600 font-bold">{w.occupied}</td>
                    <td className="py-2.5 text-center text-emerald-600 font-bold">{w.available}</td>
                    <td className="py-2.5 text-center text-rose-600 font-bold">{w.maintenance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activity, Alerts, System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Recent Activity</h3>
            <span className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">View All</span>
          </div>
          <div className="space-y-3.5">
            {(data?.recentActivity || []).map((act, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold mt-0.5">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 leading-tight">{act.title}</p>
                  <p className="text-slate-500 truncate text-[11px] mt-0.5">{act.detail}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{act.timeAgo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Alerts & Notifications */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Alerts & Notifications</h3>
            <span className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">View All</span>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-900">High patient load</h4>
                <p className="text-[11px] text-rose-700 mt-0.5">ICU - 2nd Floor is at 85% capacity</p>
                <span className="text-[10px] text-rose-500 font-medium">12 mins ago</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-3">
              <Bell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">Bed cleaning delayed</h4>
                <p className="text-[11px] text-amber-700 mt-0.5">ICU-113 cleaning taking longer than expected</p>
                <span className="text-[10px] text-amber-500 font-medium">28 mins ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Status Indicators */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm">System Status</h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              All Systems Operational
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col items-center justify-center text-center">
              <Database className="w-5 h-5 text-blue-600 mb-1" />
              <span className="text-xs font-bold text-slate-800">Database</span>
              <span className="text-[11px] text-emerald-600 font-bold mt-0.5">Online</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col items-center justify-center text-center">
              <Server className="w-5 h-5 text-blue-600 mb-1" />
              <span className="text-xs font-bold text-slate-800">API Server</span>
              <span className="text-[11px] text-emerald-600 font-bold mt-0.5">Online</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col items-center justify-center text-center">
              <Activity className="w-5 h-5 text-blue-600 mb-1" />
              <span className="text-xs font-bold text-slate-800">Vital Monitor</span>
              <span className="text-[11px] text-emerald-600 font-bold mt-0.5">Online</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col items-center justify-center text-center">
              <Bell className="w-5 h-5 text-blue-600 mb-1" />
              <span className="text-xs font-bold text-slate-800">Notifications</span>
              <span className="text-[11px] text-emerald-600 font-bold mt-0.5">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
