import React, { useEffect, useState } from 'react';
import { Grid, BedDouble, Brush, Wrench, UserPlus, Clock, Bell, AlertTriangle } from 'lucide-react';
import KpiCard from '../components/common/KpiCard';
import BedCard from '../components/common/BedCard';
import BedAssignmentModal from '../components/bed/BedAssignmentModal';
import BedReleaseModal from '../components/bed/BedReleaseModal';
import { DashboardService, BedService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function NurseDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [selectedBedForModal, setSelectedBedForModal] = useState(null);

  useEffect(() => {
    fetchNurseData();
  }, [user]);

  const fetchNurseData = async () => {
    try {
      setLoading(true);
      setError('');
      const username = user?.username || 'nurse1';
      const res = await DashboardService.getNurseDashboard(username);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load Nurse Dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bedId, newStatus, cleaningEstMinutes = 0) => {
    try {
      await BedService.updateStatus(bedId, { status: newStatus, cleaningEstMinutes });
      fetchNurseData();
    } catch (err) {
      alert(err.message);
    }
  };

  const openAssignModal = (bed = null) => {
    setSelectedBedForModal(bed);
    setIsAssignModalOpen(true);
  };

  const openReleaseModal = (bed) => {
    setSelectedBedForModal(bed);
    setIsReleaseModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-semibold text-xs flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p>Loading Nurse Station & ICU Operations...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center font-bold text-xl border border-white/20">
            <Grid className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{user?.fullName || data?.nurseName || 'Nurse Staff'}</h1>
              <span className="bg-emerald-400/30 text-emerald-200 border border-emerald-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                NURSE STATION
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-1 font-medium">
              {(user?.department || data?.department || 'ICU - 1st Floor')} • {(user?.shift || data?.shift || 'Morning Shift')}
            </p>
          </div>
        </div>

        <button
          onClick={() => openAssignModal()}
          className="px-5 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <UserPlus className="w-4 h-4 text-emerald-700" />
          <span>+ Quick Bed Assignment</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <KpiCard
          title="Total ICU Beds"
          value={data?.totalIcuBeds || 48}
          subtext="Assigned floor capacity"
          icon={BedDouble}
          color="blue"
        />
        <KpiCard
          title="Available Beds"
          value={data?.availableBedsCount || 16}
          subtext="Ready for admission"
          icon={BedDouble}
          color="emerald"
        />
        <KpiCard
          title="Occupied Beds"
          value={data?.occupiedBedsCount || 26}
          subtext="Active patient monitoring"
          icon={BedDouble}
          color="blue"
        />
        <KpiCard
          title="Cleaning Beds"
          value={data?.cleaningBedsCount || 2}
          subtext="Sanitization in progress"
          icon={Brush}
          color="amber"
        />
        <KpiCard
          title="Maintenance"
          value={data?.maintenanceBedsCount || 4}
          subtext="Tech repair / calibration"
          icon={Wrench}
          color="rose"
        />
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Shift Bed Board Preview */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Grid className="w-4 h-4 text-emerald-600" />
              <span>Shift Bed Status Board</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">{data?.myIcuBeds?.length || 0} Beds Loaded</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {(data?.myIcuBeds || []).slice(0, 12).map((bed) => (
              <BedCard
                key={bed.id}
                bed={bed}
                onAssign={openAssignModal}
                onRelease={openReleaseModal}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        </div>

        {/* Right Col: Bed Cleaning Countdown & Alerts */}
        <div className="space-y-6">
          {/* Bed Cleaning Monitors */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Brush className="w-4 h-4 text-amber-600" />
              <span>Bed Cleaning Countdown</span>
            </h3>

            <div className="space-y-3">
              {(data?.cleaningMonitors || []).map((c, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{c.bedNumber} ({c.wardName})</span>
                    <span className="px-2 py-0.5 rounded bg-amber-200/80 text-amber-800 font-bold text-[10px] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {c.estMinutesRemaining}m left
                    </span>
                  </div>
                  <button
                    onClick={() => handleUpdateStatus(c.bedId, 'AVAILABLE', 0)}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-xs"
                  >
                    Mark Sanitization Complete
                  </button>
                </div>
              ))}
              {(!data?.cleaningMonitors || data.cleaningMonitors.length === 0) && (
                <p className="text-xs text-slate-400 font-medium text-center py-4">No beds currently in cleaning cycle.</p>
              )}
            </div>
          </div>

          {/* Operational Alerts */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <span>Operational Alerts</span>
            </h3>

            <div className="space-y-3">
              {(data?.operationalAlerts || []).slice(0, 3).map((a, i) => (
                <div key={i} className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900 space-y-1">
                  <p className="font-bold">{a.title}</p>
                  <p className="text-[11px] text-blue-700">{a.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BedAssignmentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        preselectedBed={selectedBedForModal}
        onSuccess={fetchNurseData}
      />

      <BedReleaseModal
        isOpen={isReleaseModalOpen}
        onClose={() => setIsReleaseModalOpen(false)}
        bed={selectedBedForModal}
        onSuccess={fetchNurseData}
      />
    </div>
  );
}
