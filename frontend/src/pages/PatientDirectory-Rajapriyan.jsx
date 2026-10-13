import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Eye, AlertCircle, Filter, CheckCircle2, X } from 'lucide-react';
import { PatientService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PatientDetailsModal from './PatientDetailsModal';
import AddPatientModal from './AddPatientModal';

export default function PatientDirectory() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const userRole = user?.role ? user.role.toUpperCase() : '';
  const canAddPatient = ['ADMIN', 'DOCTOR', 'NURSE'].includes(userRole);

  useEffect(() => {
    fetchPatients();
  }, [statusFilter, searchQuery]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await PatientService.getAll({
        status: statusFilter,
        search: searchQuery
      });
      setPatients(data);
    } catch (err) {
      setError(err.message || 'Failed to load patient directory');
    } finally {
      setLoading(false);
    }
  };

  const openDetails = (id) => {
    setSelectedPatientId(id);
    setIsDetailsOpen(true);
  };

  const handlePatientAdded = (newPatient) => {
    const patientName = newPatient?.name || 'Patient';
    const patientCode = newPatient?.patientId ? ` (${newPatient.patientId})` : '';
    setSuccessMsg(`✓ ${patientName}${patientCode} admitted and registered in ICU database successfully!`);
    fetchPatients();
    setTimeout(() => {
      setSuccessMsg('');
    }, 5000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Directory</h1>
          <p className="text-xs text-slate-500 font-medium">Full clinical registry of admitted ICU patients</p>
        </div>
        {canAddPatient && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 self-start sm:self-auto transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Patient</span>
          </button>
        )}
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between gap-2 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg('')}
            className="text-emerald-600 hover:text-emerald-800 p-1 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, or diagnosis..."
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-blue-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500"
          >
            <option value="ALL">All Conditions</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="STABLE">STABLE</option>
            <option value="GUARDED">GUARDED</option>
          </select>
        </div>
      </div>

      {/* Table List */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs font-semibold">
          Loading Patient Registry...
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-5 py-3">Patient ID</th>
                  <th className="px-5 py-3">Patient Name</th>
                  <th className="px-5 py-3">Age / Gender</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Diagnosis</th>
                  <th className="px-5 py-3">Assigned Doctor</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{p.patientId}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{p.name}</td>
                    <td className="px-5 py-3.5">{p.age}Y • {p.gender}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        p.conditionStatus === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-700'
                          : p.conditionStatus === 'STABLE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {p.conditionStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 truncate max-w-xs">{p.diagnosis || 'Intensive Care Monitoring'}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{p.assignedDoctor?.name || 'Dr. Raja Priyan'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => openDetails(p.id)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      <PatientDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        patientId={selectedPatientId}
      />

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handlePatientAdded}
        existingPatients={patients}
      />
    </div>
  );
}
