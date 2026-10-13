import React, { useEffect, useState } from 'react';
import { Building2, BedDouble, CheckCircle2, AlertCircle, Wrench, Users, Plus } from 'lucide-react';
import { WardService } from '../services/api';

export default function BedAndWards() {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWards();
  }, []);

  const fetchWards = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await WardService.getAvailability();
      setWards(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch ward data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-semibold text-xs">
        Loading Ward Availability...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bed & Wards</h1>
          <p className="text-xs text-slate-500 font-medium">Real-time ward capacity and bed distribution summary</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Ward
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Ward Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wards.map((ward, idx) => {
          const occupancyRate = Math.round((ward.occupied / ward.totalBeds) * 100) || 0;
          return (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{ward.wardName}</h3>
                    <span className="text-xs font-semibold text-slate-400">{ward.totalBeds} Total Beds</span>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  occupancyRate >= 80 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {occupancyRate}% Occupied
                </span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                  <div style={{ width: `${(ward.occupied / ward.totalBeds) * 100}%` }} className="bg-blue-600 h-full"></div>
                  <div style={{ width: `${(ward.available / ward.totalBeds) * 100}%` }} className="bg-emerald-500 h-full"></div>
                  <div style={{ width: `${(ward.maintenance / ward.totalBeds) * 100}%` }} className="bg-rose-500 h-full"></div>
                </div>
              </div>

              {/* Stats Breakdown */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs text-center font-medium">
                <div className="p-2 bg-blue-50/50 rounded-xl border border-blue-100/60">
                  <span className="block font-bold text-blue-700 text-sm">{ward.occupied}</span>
                  <span className="text-slate-500 text-[11px]">Occupied</span>
                </div>
                <div className="p-2 bg-emerald-50/50 rounded-xl border border-emerald-100/60">
                  <span className="block font-bold text-emerald-700 text-sm">{ward.available}</span>
                  <span className="text-slate-500 text-[11px]">Available</span>
                </div>
                <div className="p-2 bg-rose-50/50 rounded-xl border border-rose-100/60">
                  <span className="block font-bold text-rose-700 text-sm">{ward.maintenance}</span>
                  <span className="text-slate-500 text-[11px]">Maintenance</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
