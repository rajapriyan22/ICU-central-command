import React, { useEffect, useState } from 'react';
import { Users, HeartPulse, ShieldCheck, AlertTriangle, Activity, Stethoscope, FileText, CheckCircle2 } from 'lucide-react';
import KpiCard from '../components/common/KpiCard';
import { DashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PatientDetailsModal from './PatientDetailsModal';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchDoctorData();
  }, [user]);

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      setError('');
      const username = user?.username || 'doctor1';
      const res = await DashboardService.getDoctorDashboard(username);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load Doctor Dashboard');
    } finally {
      setLoading(false);
    }
  };

  const openPatientDetails = (id) => {
    setSelectedPatientId(id);
    setIsDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-semibold text-xs flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p>Loading Doctor Clinical Workspace...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center font-bold text-xl border border-white/20">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{user?.fullName || data?.doctorName || 'Doctor Staff'}</h1>
              <span className="bg-blue-500/30 text-blue-200 border border-blue-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                DOCTOR WORKSPACE
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-1 font-medium">
              {(user?.specialization || data?.specialization || 'Intensive Care Medicine')} • {(user?.department || data?.department || 'Critical Care')}
            </p>
          </div>
        </div>

        <button
          onClick={fetchDoctorData}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Refresh Clinical Vitals</span>
        </button>
      </div>

      {/* Doctor KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          title="My Assigned Patients"
          value={data?.totalAssignedPatients || 6}
          subtext="Under active care"
          icon={Users}
          color="blue"
        />
        <KpiCard
          title="Critical Patients"
          value={data?.criticalPatientsCount || 2}
          trend="ATTENTION"
          subtext="Requires close monitoring"
          icon={HeartPulse}
          color="rose"
        />
        <KpiCard
          title="Stable Patients"
          value={data?.stablePatientsCount || 3}
          subtext="Responding to protocol"
          icon={ShieldCheck}
          color="emerald"
        />
        <KpiCard
          title="Guarded Patients"
          value={data?.guardedPatientsCount || 1}
          subtext="Under observation"
          icon={AlertTriangle}
          color="amber"
        />
      </div>

      {/* Main Clinical Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Attention List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Critical Attention Required</span>
              </h3>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                {data?.criticalPatientsCount || 2} Patients
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(data?.criticalAttentionList || []).map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-rose-50/60 border border-rose-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                      CRITICAL
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">PID: {p.patientId} • Bed: <strong>{p.assignedBedNumber}</strong> ({p.assignedWardName})</p>
                  <p className="text-xs text-slate-700"><strong>Diagnosis:</strong> {p.diagnosis}</p>
                  <div className="pt-2 flex items-center justify-between border-t border-rose-200/60">
                    <span className="text-[11px] font-semibold text-slate-500">Equip: {p.equipment || 'Ventilator'}</span>
                    <button
                      onClick={() => openPatientDetails(p.id)}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs"
                    >
                      View Patient File
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Assigned Patients Grid */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">My Assigned Patients Roster</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Patient</th>
                    <th className="px-4 py-2.5">Bed / Ward</th>
                    <th className="px-4 py-2.5">Condition</th>
                    <th className="px-4 py-2.5">Diagnosis</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {(data?.myPatients || []).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {p.name} <span className="text-slate-400 font-normal">({p.patientId})</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-blue-600">{p.assignedBedNumber}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.conditionStatus === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {p.conditionStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 truncate max-w-xs">{p.diagnosis}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openPatientDetails(p.id)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md font-semibold hover:bg-blue-100"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Vital Trends & Clinical Alerts */}
        <div className="space-y-6">
          {/* Vital Trend Previews */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Vital Telemetry Previews</span>
            </h3>
            <div className="space-y-3">
              {(data?.vitalTrendPreviews || []).slice(0, 4).map((v, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900 text-white space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{v.patientName}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">{v.patientCode}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center text-[11px] pt-1">
                    <div>
                      <span className="text-slate-400 block text-[9px]">HR</span>
                      <strong className="text-emerald-400">{v.heartRate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">SpO2</span>
                      <strong className="text-blue-400">{v.spo2}%</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">BP</span>
                      <strong className="text-amber-400">{v.bloodPressure}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Temp</span>
                      <strong className="text-rose-400">{v.temperature}°C</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Alerts */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Clinical Alerts Feed</h3>
            <div className="space-y-3">
              {(data?.clinicalAlerts || []).slice(0, 3).map((a, i) => (
                <div key={i} className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-900 space-y-1">
                  <p className="font-bold">{a.title}</p>
                  <p className="text-[11px] text-rose-700">{a.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Details Modal */}
      <PatientDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        patientId={selectedPatientId}
      />
    </div>
  );
}
