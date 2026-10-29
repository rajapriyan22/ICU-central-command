import React, { useEffect, useState, useRef } from 'react';
import { Activity, Radio, Wifi, WifiOff, Clock } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { VitalService } from '../services/api';

export default function LiveVitalMonitor() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streamStatus, setStreamStatus] = useState('CONNECTING'); // CONNECTING, STREAMING, POLLING, DISCONNECTED
  const eventSourceRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    // Initial fetch to immediately populate UI
    fetchVitalsFallback();

    // Setup Server-Sent Events (SSE) Stream
    setupSseStream();

    return () => {
      cleanupStreamAndPolling();
    };
  }, []);

  const cleanupStreamAndPolling = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const setupSseStream = () => {
    try {
      let token = null;
      try {
        const user = JSON.parse(localStorage.getItem('icu_user'));
        if (user && user.token) {
          token = user.token;
        }
      } catch (e) {
        // Ignore parse error
      }

      let cleanBase = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
      if (!cleanBase.endsWith('/api')) cleanBase = `${cleanBase}/api`;
      let streamUrl = `${cleanBase}/vitals/stream`;

      if (token) {
        streamUrl += `?access_token=${encodeURIComponent(token)}`;
      }

      const es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      es.onopen = () => {
        setStreamStatus('STREAMING');
        setLoading(false);
        // Clear fallback polling if active
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };

      es.onmessage = (event) => {
        try {
          if (event.data) {
            const parsedData = JSON.parse(event.data);
            setData(parsedData);
            setStreamStatus('STREAMING');
            setLoading(false);
          }
        } catch (e) {
          console.error('Error parsing SSE event payload:', e);
        }
      };

      es.onerror = (err) => {
        console.warn('SSE Stream connection interrupted or failed. Switching to Polling Fallback.', err);
        es.close();
        eventSourceRef.current = null;
        setStreamStatus('POLLING');

        // Start fallback polling if not already running
        if (!pollingIntervalRef.current) {
          pollingIntervalRef.current = setInterval(fetchVitalsFallback, 3000);
        }
      };
    } catch (err) {
      console.error('EventSource initialization failed:', err);
      setStreamStatus('POLLING');
      if (!pollingIntervalRef.current) {
        pollingIntervalRef.current = setInterval(fetchVitalsFallback, 3000);
      }
    }
  };

  const fetchVitalsFallback = async () => {
    try {
      const res = await VitalService.getLiveDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed fallback vitals fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate dynamic telemetry waveform points for sparkline visual effect based on current HR
  const generateWaveform = (base, variance) => {
    return Array.from({ length: 15 }, (_, i) => ({
      x: i,
      y: (base || 75) + Math.floor(Math.sin(i * 0.8) * (variance || 8)) + (Math.random() * 4 - 2)
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Live Vital Telemetry</h1>
            {/* DEMO / SIMULATION BADGE PRESERVED */}
            <span className="bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
              <Radio className="w-3 h-3 text-amber-600 animate-pulse" />
              DEMO / SIMULATION DATA
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Real-time simulated telemetry stream for ICU patient vital signs</p>
        </div>

        {/* Dynamic Connection / Stream Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border bg-white shadow-xs">
          {streamStatus === 'STREAMING' ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-slate-700 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-emerald-600" /> SSE Live Stream Active
              </span>
            </>
          ) : streamStatus === 'POLLING' ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-slate-700 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-amber-600" /> Live Polling Active
              </span>
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 animate-pulse"></span>
              <span className="text-slate-500 flex items-center gap-1">
                <WifiOff className="w-3.5 h-3.5 text-slate-400" /> Connecting Stream...
              </span>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs font-semibold text-slate-500">Connecting to Vital Telemetry Nodes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(data?.patients || []).map((p, idx) => {
            const hrData = generateWaveform(p.heartRate, 10);
            const isCritical = p.condition === 'CRITICAL';
            const timeStr = p.recordedAt ? new Date(p.recordedAt).toLocaleTimeString() : 'Live';

            return (
              <div
                key={p.patientId || idx}
                className={`bg-slate-900 text-white rounded-2xl p-5 shadow-lg border transition-all duration-300 ${
                  isCritical ? 'border-rose-500/50 ring-2 ring-rose-500/20' : 'border-slate-800'
                }`}
              >
                {/* Patient Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <span>{p.patientName}</span>
                      <span className="text-xs text-slate-400 font-mono font-normal">({p.patientCode})</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">{p.age}Y • {p.gender} • {p.equipment || 'Monitor'}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    isCritical ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {p.condition}
                  </span>
                </div>

                {/* Live Vitals Telemetry Numbers */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Heart Rate</span>
                    <span className="text-xl font-black text-emerald-400 tracking-tight transition-all duration-300">
                      {p.heartRate} <span className="text-[10px] font-normal text-slate-400">bpm</span>
                    </span>
                  </div>
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">SpO2</span>
                    <span className="text-xl font-black text-blue-400 tracking-tight transition-all duration-300">
                      {p.spo2}%
                    </span>
                  </div>
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">BP</span>
                    <span className="text-sm font-black text-amber-400 tracking-tight leading-7 transition-all duration-300">
                      {p.bloodPressure}
                    </span>
                  </div>
                </div>

                {/* Live Sparkline ECG Waveform */}
                <div className="h-16 w-full bg-slate-950/60 rounded-xl p-1 border border-slate-800 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hrData}>
                      <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                      <Line
                        type="monotone"
                        dataKey="y"
                        stroke={isCritical ? '#F43F5E' : '#10B981'}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Footer Timestamp */}
                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" /> Updated {timeStr}
                  </span>
                  <span className="text-slate-500">Live Node Telemetry</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
