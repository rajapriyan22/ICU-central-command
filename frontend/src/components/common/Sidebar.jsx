import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Grid,
  Building2,
  UserPlus,
  Activity,
  Bell,
  BarChart3,
  Stethoscope,
  Settings,
  ShieldCheck,
  LogOut,
  PlusSquare,
  FileText,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useAlerts();
  const navigate = useNavigate();

  const role = user?.role ? user.role.toUpperCase() : 'ADMIN';

  const alertBadgeText = unreadCount > 0 ? String(unreadCount) : null;

  // Navigation menus per role
  const adminNav = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Patient Directory', path: '/patients', icon: Users },
    { name: 'ICU Bed Matrix', path: '/bed-matrix', icon: Grid },
    { name: 'Bed & Wards', path: '/wards', icon: Building2 },
    { name: 'Bed Assignment', path: '/bed-assignment', icon: UserPlus },
    { name: 'Live Vital Monitor', path: '/vitals', icon: Activity },
    { name: 'Alerts & Events', path: '/alerts', icon: Bell, badge: alertBadgeText },
    { name: 'Analytics & Reports', path: '/analytics', icon: BarChart3 },
    { name: 'Doctors & Staff', path: '/doctors', icon: Stethoscope },
    { name: 'User Management', path: '/users', icon: ShieldCheck },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const doctorNav = [
    { name: 'Dashboard', path: '/doctor', icon: LayoutDashboard },
    { name: 'My Patients', path: '/patients', icon: Users },
    { name: 'Patient Details', path: '/patients', icon: FileText },
    { name: 'Live Vital Monitor', path: '/vitals', icon: Activity },
    { name: 'Clinical Alerts', path: '/alerts', icon: Bell, badge: alertBadgeText },
    { name: 'Profile', path: '/settings', icon: UserCheck },
  ];

  const nurseNav = [
    { name: 'Dashboard', path: '/nurse', icon: LayoutDashboard },
    { name: 'ICU Bed Matrix', path: '/bed-matrix', icon: Grid },
    { name: 'Patient Directory', path: '/patients', icon: Users },
    { name: 'Bed Assignment', path: '/bed-assignment', icon: UserPlus },
    { name: 'Patient Details', path: '/patients', icon: FileText },
    { name: 'Live Vital Monitor', path: '/vitals', icon: Activity },
    { name: 'Alerts & Events', path: '/alerts', icon: Bell, badge: alertBadgeText },
    { name: 'Profile', path: '/settings', icon: UserCheck },
  ];

  const navItems = role === 'DOCTOR' ? doctorNav : role === 'NURSE' ? nurseNav : adminNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeColor = () => {
    if (role === 'ADMIN') return 'bg-purple-100 text-purple-700 border-purple-200';
    if (role === 'DOCTOR') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 shrink-0 z-30 shadow-xs">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
            <PlusSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm leading-snug tracking-tight">
              ICU Central Command
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Care. Monitor. Coordinate.</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={`${item.path}-${idx}`}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Footer with Logout */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs border border-slate-700 shadow-xs shrink-0">
            {getInitials(user?.fullName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">
              {user?.fullName || 'User'}
            </p>
            <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${getRoleBadgeColor()}`}>
              {role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
