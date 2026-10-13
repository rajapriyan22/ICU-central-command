import React, { useEffect, useState } from 'react';
import { X, User, HeartPulse, Building2, Stethoscope, Clock, ShieldCheck, Activity } from 'lucide-react';
import { PatientService, VitalService } from '../services/api';

export default function PatientDetailsModal({ isOpen, onClose, patientId }) {
  const [details, setDetails] = useState(null);
  const [vitals, setVitals] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && patientId) {
      loadData();
    }
  }, [isOpen, patientId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [det, vit] = await Promise.all([
        PatientService.getDetails(patientId),
        VitalService.getLatest(patientId).catch(() => null)
      ]);
      setDetails(det);
      setVitals(vit);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !patientId) return null;

  const p = details?.patient;
  const bed = details?.assignedBed;
  const ward = details?.assignedWard;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{p?.name || 'Patient Profile'}</h3>
              <p className="text-xs text-slate-400 font-medium">PID: {p?.patientId} • {p?.age}Y • {p?.gender}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-500">Loading Clinical Profile...</div>
        ) : (
          <div className="space-y-6">
            {/* Clinical Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 font-medium text-[10px] uppercase block">Condition</span>
                <span className={`font-bold text-xs mt-0.5 inline-block ${
                  p?.conditionStatus === 'CRITICAL' ? 'text-rose-600' : 'text-emerald-600'
                }`}>{p?.conditionStatus}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 font-medium text-[10px] uppercase block">Bed & Ward</span>
                <span className="font-bold text-slate-900 text-xs mt-0.5 block">{bed ? `${bed.bedNumber} (${ward?.name})` : 'Unassigned'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 font-medium text-[10px] uppercase block">Doctor</span>
                <span className="font-bold text-slate-900 text-xs mt-0.5 block">{p?.assignedDoctor?.name || 'Dr. Raja Priyan'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 font-medium text-[10px] uppercase block">Equipment</span>
                <span className="font-bold text-slate-900 text-xs mt-0.5 block truncate">{p?.equipmentRequired || 'Standard'}</span>
              </div>
            </div>

            {/* Vitals Telemetry Card */}
            {vitals && (
              <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3 shadow-md">
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Activity className="w-4 h-4" /> Live Telemetry Vitals
                  </span>
                  <span className="text-[10px] text-slate-400">DEMO STREAM</span>
                </div>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Heart Rate</span>
                    <span className="text-base font-extrabold text-emerald-400">{vitals.heartRate} bpm</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">SpO2</span>
                    <span className="text-base font-extrabold text-blue-400">{vitals.spo2}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">BP</span>
                    <span className="text-base font-extrabold text-amber-400">{vitals.bloodPressure}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Temp</span>
                    <span className="text-base font-extrabold text-rose-400">{vitals.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Resp Rate</span>
                    <span className="text-base font-extrabold text-indigo-400">{vitals.respiratoryRate}/m</span>
                  </div>
                </div>
              </div>
            )}

            {/* Diagnosis & Clinical Notes */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 text-sm">Diagnosis & Admission Details</h4>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-slate-700">
                <p><strong>Primary Diagnosis:</strong> {p?.diagnosis || 'Intensive monitoring'}</p>
                <p><strong>Clinical Notes:</strong> {p?.notes || 'Patient responding to medication protocol.'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
