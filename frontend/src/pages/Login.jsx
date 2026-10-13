import React, { useState } from 'react';
import { PlusSquare, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Stethoscope, HeartPulse } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await login(usernameOrEmail, password);
      if (res.success) {
        const role = res.role ? res.role.toUpperCase() : 'ADMIN';
        if (role === 'DOCTOR') navigate('/doctor');
        else if (role === 'NURSE') navigate('/nurse');
        else navigate('/admin');
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (role) => {
    if (role === 'ADMIN') {
      setUsernameOrEmail('admin');
      setPassword('Admin@123');
    } else if (role === 'DOCTOR') {
      setUsernameOrEmail('doctor1');
      setPassword('Doctor@123');
    } else {
      setUsernameOrEmail('nurse1');
      setPassword('Nurse@123');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">
            <PlusSquare className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ICU Central Command</h1>
          <p className="text-xs text-slate-500 font-medium">Care. Monitor. Coordinate.</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Username or Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
                placeholder="admin / doctor1 / nurse1"
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 3 Role Quick Login Buttons */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-2.5">
          <p className="text-[11px] font-semibold text-slate-400">Select Role for Fast Sign-In</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => setDemoCredentials('ADMIN')}
              className="p-2.5 bg-purple-50 border border-purple-200/80 hover:bg-purple-100 text-purple-800 rounded-xl font-bold text-center flex flex-col items-center gap-1 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span className="text-[10px]">Admin</span>
            </button>
            <button
              onClick={() => setDemoCredentials('DOCTOR')}
              className="p-2.5 bg-blue-50 border border-blue-200/80 hover:bg-blue-100 text-blue-800 rounded-xl font-bold text-center flex flex-col items-center gap-1 transition-all"
            >
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <span className="text-[10px]">Doctor</span>
            </button>
            <button
              onClick={() => setDemoCredentials('NURSE')}
              className="p-2.5 bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-center flex flex-col items-center gap-1 transition-all"
            >
              <HeartPulse className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px]">Nurse</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
