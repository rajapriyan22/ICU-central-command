import React from 'react';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Forbidden() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const role = user?.role ? user.role.toUpperCase() : 'USER';
  const defaultHome = role === 'DOCTOR' ? '/doctor' : role === 'NURSE' ? '/nurse' : '/admin';

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200/80 shadow-xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center font-bold">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">403 Access Denied</h1>
        <p className="text-xs text-slate-500 font-medium">
          You do not have permission to access this page. Your account (<strong className="text-slate-800">{user?.fullName}</strong>) is assigned to role <strong className="text-rose-600">{role}</strong>.
        </p>

        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <button
            onClick={() => navigate(defaultHome)}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
          >
            <Home className="w-4 h-4" /> My Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
