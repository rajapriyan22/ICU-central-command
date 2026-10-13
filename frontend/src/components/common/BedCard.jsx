import React, { useState } from 'react';
import { BedDouble, User, Brush, Wrench, MoreHorizontal, CheckCircle2, UserPlus, LogOut } from 'lucide-react';

export default function BedCard({ bed, onAssign, onRelease, onUpdateStatus }) {
  const [showMenu, setShowMenu] = useState(false);

  const statusConfig = {
    AVAILABLE: {
      bg: 'bg-emerald-50/70 border-emerald-100',
      pillBg: 'bg-emerald-100 text-emerald-700',
      icon: BedDouble,
      label: 'AVAILABLE',
      text: 'Ready for admission',
      color: 'emerald'
    },
    OCCUPIED: {
      bg: 'bg-blue-50/70 border-blue-100',
      pillBg: 'bg-blue-100 text-blue-700',
      icon: User,
      label: 'OCCUPIED',
      color: 'blue'
    },
    CLEANING: {
      bg: 'bg-amber-50/70 border-amber-100',
      pillBg: 'bg-amber-100 text-amber-700',
      icon: Brush,
      label: 'CLEANING',
      text: bed.cleaningEstMinutes ? `Cleaning in progress (${bed.cleaningEstMinutes}m)` : 'Cleaning in progress',
      color: 'amber'
    },
    MAINTENANCE: {
      bg: 'bg-rose-50/70 border-rose-100',
      pillBg: 'bg-rose-100 text-rose-700',
      icon: Wrench,
      label: 'MAINTENANCE',
      text: 'Under maintenance',
      color: 'rose'
    }
  };

  const currentStatus = statusConfig[bed.status] || statusConfig.AVAILABLE;
  const StatusIcon = currentStatus.icon;

  return (
    <div className={`relative bg-white rounded-2xl p-4 border transition-all hover:shadow-md ${currentStatus.bg}`}>
      {/* Card Top Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-800 text-base tracking-tight">{bed.bedNumber}</h3>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Quick Context Dropdown Menu */}
          {showMenu && (
            <div
              className="absolute right-0 top-7 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20 text-xs font-medium text-slate-700"
              onMouseLeave={() => setShowMenu(false)}
            >
              {bed.status === 'AVAILABLE' && (
                <button
                  onClick={() => { setShowMenu(false); onAssign && onAssign(bed); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-blue-600 font-semibold"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Assign Patient
                </button>
              )}
              {bed.status === 'OCCUPIED' && (
                <button
                  onClick={() => { setShowMenu(false); onRelease && onRelease(bed); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-rose-600 font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" /> Release / Discharge Bed
                </button>
              )}
              {bed.status !== 'AVAILABLE' && (
                <button
                  onClick={() => { setShowMenu(false); onUpdateStatus && onUpdateStatus(bed.id, 'AVAILABLE'); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-emerald-600"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark Available
                </button>
              )}
              {bed.status !== 'CLEANING' && (
                <button
                  onClick={() => { setShowMenu(false); onUpdateStatus && onUpdateStatus(bed.id, 'CLEANING', 30); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-amber-600"
                >
                  <Brush className="w-3.5 h-3.5" /> Send to Cleaning
                </button>
              )}
              {bed.status !== 'MAINTENANCE' && (
                <button
                  onClick={() => { setShowMenu(false); onUpdateStatus && onUpdateStatus(bed.id, 'MAINTENANCE'); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-rose-600"
                >
                  <Wrench className="w-3.5 h-3.5" /> Mark Maintenance
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Pill Badge */}
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-3 ${currentStatus.pillBg}`}>
        <StatusIcon className="w-3.5 h-3.5 shrink-0" />
        <span>{currentStatus.label}</span>
      </div>

      {/* Card Content based on status */}
      {bed.status === 'OCCUPIED' ? (
        <div className="space-y-1.5 pt-1">
          <p className="font-bold text-slate-900 text-sm">{bed.patientName || 'Assigned Patient'}</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <span>PID: <strong className="text-slate-700">{bed.patientCode || 'P1000'}</strong></span>
            <span>•</span>
            <span>{bed.patientGender || 'M'}</span>
            <span>•</span>
            <span>{bed.patientAge ? `${bed.patientAge}Y` : '45Y'}</span>
          </div>
          {bed.equipment && (
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span className="bg-white/80 px-2 py-0.5 rounded border border-slate-200/80 text-slate-700">
                {bed.equipment}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="pt-2 pb-1">
          <p className="text-xs text-slate-500 font-medium">{currentStatus.text}</p>
        </div>
      )}
    </div>
  );
}
