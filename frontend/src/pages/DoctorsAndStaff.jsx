import React, { useEffect, useState } from 'react';
import { Stethoscope, Phone, Mail, UserCheck, Plus, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { DoctorService } from '../services/api';

export default function DoctorsAndStaff() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Doctor Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    department: '',
    status: 'AVAILABLE',
    phone: '',
    email: '',
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data = await DoctorService.getAll();
      setDoctors(data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const handleOpenModal = () => {
    setFormData({
      name: '',
      specialization: '',
      department: '',
      status: 'AVAILABLE',
      phone: '',
      email: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleAddDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Doctor Name is required.');
      return;
    }
    if (!formData.specialization.trim()) {
      setFormError('Specialization is required.');
      return;
    }
    if (!formData.department.trim()) {
      setFormError('Department is required.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      const newDoctorPayload = {
        name: formData.name.trim(),
        specialization: formData.specialization.trim(),
        department: formData.department.trim(),
        status: formData.status,
        phone: formData.phone.trim() || '+1-555-0101',
        email: formData.email.trim() || undefined,
        assignedPatientsCount: 0,
      };

      const savedDoctor = await DoctorService.create(newDoctorPayload);

      // Update doctors roster in place immediately
      setDoctors((prev) => [savedDoctor, ...prev]);

      // Show success message
      setSuccessMessage(`Dr. ${savedDoctor.name} added successfully!`);
      setTimeout(() => setSuccessMessage(''), 4000);

      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create doctor:', err);
      setFormError(err.message || 'Failed to save doctor to backend MySQL database.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Doctors & ICU Staff</h1>
          <p className="text-xs text-slate-500 font-medium">Attending intensivists, pulmonologists, and ICU specialists roster</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Doctor
        </button>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs font-semibold text-slate-500">Loading Doctor Roster...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div key={doc.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-sm border border-blue-200">
                    {doc.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{doc.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{doc.specialization}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  doc.status === 'ON_DUTY' ? 'bg-emerald-100 text-emerald-700' :
                  doc.status === 'AVAILABLE' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {doc.status}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                  <span>Department: <strong>{doc.department}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Assigned Patients: <strong>{doc.assignedPatientsCount ?? 0} Patients</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{doc.phone || '+1-555-0101'}</span>
                </div>
                {doc.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{doc.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Doctor Interactive Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base">Add New ICU Doctor</h2>
                  <p className="text-[11px] text-slate-400 font-medium">Persist doctor details into MySQL roster</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDoctorSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Doctor Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Dr. Test Doctor"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Specialization <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    placeholder="e.g. Cardiologist"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="e.g. Cardiology ICU"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none transition-all"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="ON_DUTY">ON_DUTY</option>
                    <option value="ON_CALL">ON_CALL</option>
                    <option value="OFF_DUTY">OFF_DUTY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1-555-0199"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="doctor@hospital.org"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  {submitting ? 'Saving to Database...' : 'Save Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
