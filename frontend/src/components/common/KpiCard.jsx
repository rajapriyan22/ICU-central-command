import React from 'react';

export default function KpiCard({ title, value, subtext, icon: Icon, color = 'blue', trend }) {
  const colorStyles = {
    blue: {
      iconBg: 'bg-blue-50 text-blue-600',
      badge: 'bg-blue-100/70 text-blue-700',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600',
      badge: 'bg-emerald-100/70 text-emerald-700',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600',
      badge: 'bg-amber-100/70 text-amber-700',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600',
      badge: 'bg-rose-100/70 text-rose-700',
    },
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600',
      badge: 'bg-indigo-100/70 text-indigo-700',
    }
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-xl ${style.iconBg}`}>
          <Icon className="w-5 h-5 shrink-0" />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mt-1">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h2>
        {trend && (
          <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${style.badge}`}>
            {trend}
          </span>
        )}
      </div>

      {subtext && (
        <p className="text-[11px] text-slate-400 font-medium mt-1.5">{subtext}</p>
      )}
    </div>
  );
}
