import React, { useState } from 'react';
import { Settings as SettingsIcon, Building2, Bell, Monitor, Shield, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [hospitalName, setHospitalName] = useState('Multi Speciality Hospital ICU Command');
  const [notificationEmail, setNotificationEmail] = useState('admin@hospital.com');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-500 font-medium">Hospital workspace configurations and alert preferences</p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl">
          ✅ Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hospital Info */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Hospital Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Facility Name</label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Command Center Location</label>
              <input
                type="text"
                defaultValue="Central Tower - Floor 3"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium outline-none"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
            <Bell className="w-4 h-4 text-blue-600" />
            <span>Notification & Emergency Alert Settings</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Critical Capacity Alerts</p>
                <p className="text-slate-500">Notify when ward occupancy exceeds 85%</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600" />
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div>
                <p className="font-bold text-slate-800">Bed Cleaning Delay Warnings</p>
                <p className="text-slate-500">Trigger alert if bed cleaning exceeds 45 minutes</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
