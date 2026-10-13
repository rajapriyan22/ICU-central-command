import React, { useState } from 'react';
import { X, LogOut, AlertTriangle, CheckCircle } from 'lucide-react';
import { BedAssignmentService } from '../../services/api';

export default function BedReleaseModal({ isOpen, onClose, bed, onSuccess }) {
  const [targetStatus, setTargetStatus] = useState('CLEANING');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !bed) return null;

  const handleRelease = async () => {
    try {
      setLoading(true);
      setError('');
      await BedAssignmentService.releaseByBedId(bed.id, targetStatus);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to release bed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Release Bed {bed.bedNumber}</h3>
              <p className="text-xs text-slate-400 font-medium">Discharge patient & update bed workflow</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 mb-4 space-y-1">
          <p className="text-xs font-semibold text-slate-700">
            Patient: <span className="text-slate-900 font-bold">{bed.patientName || 'Assigned Patient'}</span>
          </p>
          <p className="text-xs text-slate-500">
            PID: {bed.patientCode || 'P1000'} | Ward: {bed.wardName}
          </p>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Set Post-Release Bed State
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTargetStatus('CLEANING')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                targetStatus === 'CLEANING'
                  ? 'border-amber-500 bg-amber-50/70 text-amber-800 ring-2 ring-amber-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              🧹 Send to Cleaning (Default)
              <p className="text-[10px] font-normal text-slate-500 mt-1">Triggers 30m sanitization timer</p>
            </button>
            <button
              type="button"
              onClick={() => setTargetStatus('AVAILABLE')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                targetStatus === 'AVAILABLE'
                  ? 'border-emerald-500 bg-emerald-50/70 text-emerald-800 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              ✅ Immediate Available
              <p className="text-[10px] font-normal text-slate-500 mt-1">Ready for instant admission</p>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
            Cancel
          </button>
          <button
            onClick={handleRelease}
            disabled={loading}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{loading ? 'Releasing...' : 'Confirm Release'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
