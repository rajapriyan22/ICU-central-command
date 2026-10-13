import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Stethoscope,
  Building2,
  BedDouble,
  HeartPulse,
  Activity
} from 'lucide-react';
import {
  PatientService,
  DoctorService,
  WardService,
  BedService,
  BedAssignmentService
} from '../services/api';

export default function AddPatientModal({ isOpen, onClose, onSuccess, existingPatients = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    patientId: '',
    age: '',
    gender: 'M',
    conditionStatus: 'STABLE',
    diagnosis: '',
    equipmentRequired: 'Ventilator',
    assignedDoctorId: '',
    wardId: '',
    bedId: '',
    notes: '',
  });

  const [doctors, setDoctors] = useState([]);
  const [wards, setWards] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadFormData();
    }
  }, [isOpen]);

  const generateUniquePatientId = (currentPatients = existingPatients) => {
    // Generate a random P1xxx - P9xxx that does not collide with existing list
    const existingIds = new Set(
      currentPatients.map((p) => (p.patientId || '').toUpperCase())
    );
    let candidate = '';
    let attempts = 0;
    do {
      const num = Math.floor(1000 + Math.random() * 9000);
      candidate = `P${num}`;
      attempts++;
    } while (existingIds.has(candidate) && attempts < 100);
    return candidate;
  };

  const loadFormData = async () => {
    try {
      setLoadingOptions(true);
      setError('');

      const autoId = generateUniquePatientId(existingPatients);

      // Reset form defaults with auto-generated ID
      setFormData({
        name: '',
        patientId: autoId,
        age: '',
        gender: 'M',
        conditionStatus: 'STABLE',
        diagnosis: '',
        equipmentRequired: 'Ventilator',
        assignedDoctorId: '',
        wardId: '',
        bedId: '',
        notes: '',
      });

      const [docs, wds, bds] = await Promise.all([
        DoctorService.getAll().catch(() => []),
        WardService.getAll().catch(() => []),
        BedService.getAll({ status: 'AVAILABLE' }).catch(() => [])
      ]);

      setDoctors(docs);
      setWards(wds);
      setAvailableBeds(bds);

      if (docs.length > 0) {
        setFormData((prev) => ({ ...prev, assignedDoctorId: docs[0].id.toString() }));
      }
    } catch (err) {
      console.error('Error loading modal reference data:', err);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleWardChange = async (selectedWardId) => {
    setFormData((prev) => ({
      ...prev,
      wardId: selectedWardId,
      bedId: '', // reset selected bed
    }));

    try {
      const selectedWard = wards.find((w) => w.id.toString() === selectedWardId);
      const beds = await BedService.getAll({
        status: 'AVAILABLE',
        unitType: selectedWard ? selectedWard.unitType : undefined,
      });

      // Filter to exact ward if selected
      const filtered = selectedWardId
        ? beds.filter((b) => b.wardId?.toString() === selectedWardId || b.wardName === selectedWard?.name)
        : beds;

      setAvailableBeds(filtered);
    } catch (err) {
      console.error('Failed to filter available beds:', err);
    }
  };

  const handleRegenerateId = () => {
    const freshId = generateUniquePatientId(existingPatients);
    setFormData((prev) => ({ ...prev, patientId: freshId }));
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Client-Side Validations
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setError('Patient full name is required.');
      return;
    }

    const trimmedPatientId = formData.patientId.trim().toUpperCase();
    if (!trimmedPatientId) {
      setError('Patient ID / MRN is required.');
      return;
    }

    // Check duplicate ID against currently loaded patients
    const duplicate = existingPatients.some(
      (p) => (p.patientId || '').toUpperCase() === trimmedPatientId
    );
    if (duplicate) {
      setError(`Patient ID '${trimmedPatientId}' is already registered in the system. Please choose another.`);
      return;
    }

    const parsedAge = parseInt(formData.age, 10);
    if (isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 130) {
      setError('Please provide a valid age between 1 and 130.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // 2. Prepare payload for Spring Boot Patient REST API
      const patientPayload = {
        name: trimmedName,
        patientId: trimmedPatientId,
        age: parsedAge,
        gender: formData.gender,
        conditionStatus: formData.conditionStatus,
        diagnosis: formData.diagnosis.trim() || 'Intensive Care Monitoring',
        equipmentRequired: formData.equipmentRequired || 'Standard Monitor',
        notes: formData.notes.trim() || undefined,
      };

      const doctorIdParam = formData.assignedDoctorId ? parseInt(formData.assignedDoctorId, 10) : undefined;

      // 3. Save Patient to MySQL via Spring Boot API
      const savedPatient = await PatientService.create(patientPayload, doctorIdParam);

      // 4. Optional: If user selected an available bed, perform bed assignment immediately
      if (formData.bedId && savedPatient?.id) {
        try {
          await BedAssignmentService.assign({
            patientId: savedPatient.id,
            bedId: parseInt(formData.bedId, 10),
            notes: formData.notes.trim() || `Admitted to ICU bed from Patient Directory`,
          });
        } catch (bedAssignError) {
          console.warn('Patient created but bed assignment failed:', bedAssignError);
        }
      }

      // 5. Notify parent component to refetch Patient Directory immediately
      if (onSuccess) {
        onSuccess(savedPatient);
      }

      onClose();
    } catch (err) {
      console.error('Failed to save patient:', err);
      setError(err.message || 'Failed to save patient to hospital database. Please verify input.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 relative max-h-[92vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Admit New ICU Patient
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Register clinical profile & assign ICU care unit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Row 1: Patient Name & Patient ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Patient Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Ramesh Patel"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">
                  Patient ID / MRN <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleRegenerateId}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                >
                  <Sparkles className="w-3 h-3" /> Auto-ID
                </button>
              </div>
              <input
                type="text"
                required
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                placeholder="e.g. P1008"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none transition-all font-mono font-bold"
              />
            </div>
          </div>

          {/* Row 2: Age, Gender, Condition Status */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Age <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                max="130"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 52"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none transition-all font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Gender <span className="text-rose-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-3 py-2.5 text-slate-800 outline-none transition-all font-semibold"
              >
                <option value="M">Male (M)</option>
                <option value="F">Female (F)</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Condition Status <span className="text-rose-500">*</span>
              </label>
              <select
                name="conditionStatus"
                value={formData.conditionStatus}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-2.5 py-2.5 text-slate-800 outline-none transition-all font-bold"
              >
                <option value="STABLE">STABLE</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="GUARDED">GUARDED</option>
              </select>
            </div>
          </div>

          {/* Row 3: Primary Diagnosis & Equipment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Primary Diagnosis
              </label>
              <input
                type="text"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                placeholder="e.g. Acute Respiratory Distress Syndrome"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Equipment Required
              </label>
              <select
                name="equipmentRequired"
                value={formData.equipmentRequired}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-3 py-2.5 text-slate-800 outline-none transition-all font-medium"
              >
                <option value="Ventilator">Ventilator</option>
                <option value="Oxygen Support">Oxygen Support</option>
                <option value="BiPAP">BiPAP</option>
                <option value="Cardiac Telemetry">Cardiac Telemetry</option>
                <option value="Standard Monitor">Standard Monitor</option>
                <option value="None">None</option>
              </select>
            </div>
          </div>

          {/* Row 4: Attending Doctor Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Attending Intensivist / Doctor
            </label>
            <div className="relative">
              <select
                name="assignedDoctorId"
                value={formData.assignedDoctorId}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none transition-all font-semibold"
              >
                <option value="">-- Select Attending Doctor (Optional) --</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} • {doc.specialization} ({doc.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 5: Ward & ICU Bed Assignment (Workflow Consistency) */}
          <div className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-100 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
              <BedDouble className="w-4 h-4 text-blue-600" />
              <span>ICU Ward & Bed Assignment</span>
              <span className="text-[10px] text-slate-400 font-normal">(Optional during admission)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-600 text-[11px] mb-1">
                  Target Ward
                </label>
                <select
                  value={formData.wardId}
                  onChange={(e) => handleWardChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-medium"
                >
                  <option value="">All ICU Wards</option>
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.floor})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 text-[11px] mb-1">
                  Assign Available Bed
                </label>
                <select
                  name="bedId"
                  value={formData.bedId}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-medium"
                >
                  <option value="">-- Assign Bed Later (Unassigned) --</option>
                  {availableBeds.map((bed) => (
                    <option key={bed.id} value={bed.id}>
                      {bed.bedNumber} ({bed.wardName || 'ICU'}) - {bed.equipment || 'Ready'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {formData.bedId && (
              <p className="text-[11px] text-blue-700 font-medium">
                ✓ Bed will be marked <strong className="font-bold">OCCUPIED</strong> and assigned immediately.
              </p>
            )}
          </div>

          {/* Row 6: Admission Clinical Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Admission Notes / Triage Instructions
            </label>
            <textarea
              rows="2"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter special clinical instructions, allergies, or emergency triage notes..."
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-800 outline-none transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Admitting Patient...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Save & Admit Patient</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
