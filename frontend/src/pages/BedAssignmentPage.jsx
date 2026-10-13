import React, { useState, useEffect } from 'react';
import { UserPlus, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { PatientService, WardService, BedService, BedAssignmentService } from '../services/api';

export default function BedAssignmentPage() {
  const [patients, setPatients] = useState([]);
  const [wards, setWards] = useState([]);
  const [beds, setBeds] = useState([]);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pts, wds, bds] = await Promise.all([
        PatientService.getAll(),
        WardService.getAll(),
        BedService.getAll({ status: 'AVAILABLE' })
      ]);
      setPatients(pts);
      setWards(wds);
      setBeds(bds);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedPatient || !selectedBed) {
      setError('Please select both a patient and an available bed.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      await BedAssignmentService.assign({
        patientId: selectedPatient.id,
        bedId: selectedBed.id,
        notes
      });

      setSuccessMsg(`Successfully assigned ${selectedPatient.name} to bed ${selectedBed.bedNumber}!`);
      setSelectedPatient(null);
      setSelectedBed(null);
      setNotes('');
      loadData();
    } catch (err) {
      setError(err.message || 'Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bed Assignment Workflow</h1>
        <p className="text-xs text-slate-500 font-medium">Assign admitted patients to available ICU beds</p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Workflow Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Select Patient */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
            <span>Select Patient</span>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {patients.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPatient(p)}
                className={`p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                  selectedPatient?.id === p.id
                    ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <p className="font-bold text-slate-900">{p.name}</p>
                <p className="text-[11px] text-slate-500">PID: {p.patientId} • {p.conditionStatus}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Select Ward */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span>
            <span>Select Ward</span>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            <div
              onClick={() => setSelectedWard(null)}
              className={`p-3 rounded-xl border cursor-pointer text-xs font-bold ${
                !selectedWard ? 'border-blue-600 bg-blue-50/80' : 'border-slate-200'
              }`}
            >
              All Wards
            </div>
            {wards.map((w) => (
              <div
                key={w.id}
                onClick={() => setSelectedWard(w)}
                className={`p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                  selectedWard?.id === w.id
                    ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <p className="font-bold text-slate-900">{w.name}</p>
                <p className="text-[11px] text-slate-500">{w.floor} • Capacity {w.capacity}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Select Available Bed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">3</span>
            <span>Select Available Bed</span>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {beds
              .filter((b) => !selectedWard || b.wardId === selectedWard.id)
              .map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBed(b)}
                  className={`p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                    selectedBed?.id === b.id
                      ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold text-slate-900">{b.bedNumber}</p>
                  <p className="text-[11px] text-slate-500">{b.wardName} • {b.equipment}</p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Summary & Confirmation */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs space-y-1">
          <p className="font-bold text-slate-900 text-sm">Assignment Summary</p>
          <p className="text-slate-600">
            Patient: <strong className="text-blue-600">{selectedPatient ? selectedPatient.name : 'None selected'}</strong> →
            Bed: <strong className="text-emerald-600">{selectedBed ? selectedBed.bedNumber : 'None selected'}</strong>
          </p>
        </div>
        <button
          onClick={handleAssign}
          disabled={!selectedPatient || !selectedBed || loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Confirm Assignment'}
        </button>
      </div>
    </div>
  );
}
