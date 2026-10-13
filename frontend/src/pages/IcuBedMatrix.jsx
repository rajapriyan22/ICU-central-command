import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import BedCard from '../components/common/BedCard';
import BedAssignmentModal from '../components/bed/BedAssignmentModal';
import BedReleaseModal from '../components/bed/BedReleaseModal';
import { BedService } from '../services/api';

export default function IcuBedMatrix() {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [activeUnitTab, setActiveUnitTab] = useState('ICU');
  const [selectedFloor, setSelectedFloor] = useState('All Floors');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [selectedBedForModal, setSelectedBedForModal] = useState(null);

  useEffect(() => {
    fetchBeds();
  }, [activeUnitTab, selectedFloor, selectedStatus, searchQuery]);

  const fetchBeds = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await BedService.getAll({
        unitType: activeUnitTab,
        floor: selectedFloor,
        status: selectedStatus,
        search: searchQuery
      });
      setBeds(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch ICU beds');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bedId, newStatus, cleaningEstMinutes = 0) => {
    try {
      await BedService.updateStatus(bedId, { status: newStatus, cleaningEstMinutes });
      fetchBeds();
    } catch (err) {
      alert(err.message || 'Failed to update bed status');
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

  // Group beds by Ward
  const groupedBeds = beds.reduce((acc, bed) => {
    const wardName = bed.wardName || 'ICU Ward';
    if (!acc[wardName]) acc[wardName] = [];
    acc[wardName].push(bed);
    return acc;
  }, {});

  const unitTabs = ['ICU', 'Med-Surg', 'ER', 'Telemetry', 'All Wards'];

  return (
    <div className="p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ICU Bed Matrix</h1>
          <p className="text-xs text-slate-500 font-medium">Real-time view of all ICU beds and their status</p>
        </div>
        <button
          onClick={() => openAssignModal()}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 self-start sm:self-auto transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Assign Patient</span>
        </button>
      </div>

      {/* Unit Tabs & Filter Controls Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Unit Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-100/70 p-1 rounded-xl">
            {unitTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveUnitTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeUnitTab === tab
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Status Legend */}
          <div className="flex items-center gap-4 text-xs font-bold shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-slate-600">Occupied</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-600">Cleaning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-600">Maintenance</span>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns & Bed Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Floor Filter */}
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-blue-500"
            >
              <option value="All Floors">All Floors</option>
              <option value="1st Floor">1st Floor</option>
              <option value="2nd Floor">2nd Floor</option>
              <option value="3rd Floor">3rd Floor</option>
              <option value="Ground Floor">Ground Floor</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-blue-500"
            >
              <option value="All Status">All Status</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="OCCUPIED">OCCUPIED</option>
              <option value="CLEANING">CLEANING</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
            </select>
          </div>

          {/* Search Beds Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search beds..."
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-8 pr-3 py-2 outline-none focus:border-blue-500 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Main Bed Grid Area */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-xs font-semibold">Updating ICU Bed Grid...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{error}</span>
        </div>
      ) : Object.keys(groupedBeds).length === 0 ? (
        <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
          <p className="text-sm font-bold text-slate-700">No ICU beds matched your filters</p>
          <p className="text-xs mt-1">Try resetting search query or selecting "All Wards".</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedBeds).map(([wardName, wardBeds]) => (
            <div key={wardName} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                  <span>{wardName}</span>
                  <span className="text-xs font-normal text-slate-400">({wardBeds.length} beds)</span>
                </h2>
              </div>

              {/* Visual Bed Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {wardBeds.map((bed) => (
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
          ))}
        </div>
      )}

      {/* Modals */}
      <BedAssignmentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        preselectedBed={selectedBedForModal}
        onSuccess={fetchBeds}
      />

      <BedReleaseModal
        isOpen={isReleaseModalOpen}
        onClose={() => setIsReleaseModalOpen(false)}
        bed={selectedBedForModal}
        onSuccess={fetchBeds}
      />
    </div>
  );
}
