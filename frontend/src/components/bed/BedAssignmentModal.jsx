import React, { useState, useEffect } from 'react';
import { X, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { PatientService, WardService, BedService, BedAssignmentService } from '../../services/api';

export default function BedAssignmentModal({ isOpen, onClose, preselectedBed, onSuccess }) {
  const [patients, setPatients] = useState([]);
  const [wards, setWards] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedWardId, setSelectedWardId] = useState('');
  const [selectedBedId, setSelectedBedId] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      const [ptsData, wdsData, bedsData] = await Promise.all([
        PatientService.getAll(),
        WardService.getAll(),
        BedService.getAll({ status: 'AVAILABLE' })
      ]);

      setPatients(ptsData);
      setWards(wdsData);
      setAvailableBeds(bedsData);

      if (preselectedBed) {
        setSelectedBedId(preselectedBed.id.toString());
        if (preselectedBed.wardId) {
          setSelectedWardId(preselectedBed.wardId.toString());
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load options');
    } finally {
      setLoading(false);
    }
  };

  const handleWardChange = async (wardIdStr) => {
    setSelectedWardId(wardIdStr);
    setSelectedBedId('');
    try {
      const beds = await BedService.getAll({
        status: 'AVAILABLE',
        unitType: wardIdStr ? wards.find(w => w.id.toString() === wardIdStr)?.unitType : null
      });
      setAvailableBeds(beds);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedBedId) {
      setError('Please select both a Patient and an Available Bed.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await BedAssignmentService.assign({
        patientId: parseInt(selectedPatientId),
        bedId: parseInt(selectedBedId),
        notes
      });

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Bed assignment failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Assign ICU Bed</h3>
              <p className="text-xs text-slate-400 font-medium">Associate patient to available hospital bed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Workflow Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Select Patient */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              1. Select Patient *
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.patientId}) - {p.conditionStatus}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Filter by Ward */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              2. Filter Ward (Optional)
            </label>
            <select
              value={selectedWardId}
              onChange={(e) => handleWardChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
            >
              <option value="">All Wards</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.floor})
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: Select Bed */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              3. Select Available Bed *
            </label>
            <select
              value={selectedBedId}
              onChange={(e) => setSelectedBedId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
            >
              <option value="">-- Choose Bed --</option>
              {availableBeds.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bedNumber} ({b.wardName || 'ICU'}) - {b.equipment || 'Standard'}
                </option>
              ))}
            </select>
          </div>

          {/* Step 4: Assignment Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              4. Clinical Notes / Instructions
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter ventilator requirements or admission instructions..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
            ></textarea>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{loading ? 'Assigning...' : 'Confirm Assignment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
