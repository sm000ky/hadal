import React, { useEffect, useState } from 'react';
import { OceanZone } from '../lib/types';
import { Thermometer, Waves } from 'lucide-react';

interface CockpitHUDProps {
  depthMeters: number;
  zone: OceanZone;
  onManualPing: () => void;
}

export const CockpitHUD: React.FC<CockpitHUDProps> = ({
  depthMeters,
  zone,
}) => {
  // Pressure: 1 ATM at 0m, adds 1 ATM every 10m
  const pressureAtm = (1.0 + depthMeters * 0.0987).toFixed(1);
  const metricTonsPerSqCm = ((1.0 + depthMeters * 0.0987) * 0.001033).toFixed(2);

  // Temperature: 28.2°C at surface, drops to 1.2°C at bottom
  const fraction = Math.min(1, Math.max(0, depthMeters / 10994));
  const tempC = (28.2 * Math.pow(0.042, fraction)).toFixed(1);

  // Micro jitter on telemetry (simulates acoustic ranging Doppler noise)
  const [jitter, setJitter] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setJitter(Math.floor(Math.random() * 9));
    }, 90);
    return () => clearInterval(interval);
  }, []);

  const getZoneColor = () => {
    switch (zone) {
      case 'EPIPELAGIC': return 'text-sky-400 border-sky-500/40 bg-sky-950/30';
      case 'MESOPELAGIC': return 'text-indigo-400 border-indigo-500/40 bg-indigo-950/30';
      case 'BATHYPELAGIC': return 'text-blue-400 border-blue-500/40 bg-blue-950/30';
      case 'ABYSSOPELAGIC': return 'text-purple-400 border-purple-500/40 bg-purple-950/30';
      case 'HADALPELAGIC': return 'text-amber-400 border-amber-500/40 bg-amber-950/30 animate-pulse';
    }
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-20 p-4 sm:p-8 font-mono text-xs select-none">
      {/* Top Telemetry Rail (Corner Pinned — Leaves center and lower frame 100% clean) */}
      <div className="flex items-start justify-between w-full">
        {/* Top Left: Depth Readout */}
        <div className="space-y-1.5 pointer-events-auto">
          <div className="flex items-center gap-2 text-white/50 text-[10px] sm:text-[11px] tracking-widest uppercase">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>HYDROSTATIC DEPTH</span>
          </div>
          
          <div className="flex items-baseline gap-1 text-white">
            <span className="text-2xl sm:text-4xl font-mono font-light tracking-tighter">
              -{Math.floor(depthMeters).toLocaleString()}
            </span>
            <span className="text-base sm:text-xl text-cyan-400 font-light">.{jitter}</span>
            <span className="text-[10px] sm:text-xs text-cyan-400/70 font-semibold ml-1">METERS</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded border text-[9px] sm:text-[10px] tracking-wider font-semibold uppercase ${getZoneColor()}`}>
              {zone}
            </span>
            <span className="text-white/40 text-[9px] sm:text-[10px]">
              {depthMeters < 200 ? 'SUNLIGHT ZONE' : depthMeters < 1000 ? 'TWILIGHT REALM' : depthMeters < 4000 ? 'MIDNIGHT VOID' : depthMeters < 6000 ? 'THE ABYSS' : 'HADAL TRENCH'}
            </span>
          </div>
        </div>

        {/* Top Right: Hydrostatic Pressure & Temperature */}
        <div className="text-right space-y-2 pointer-events-auto">
          <div>
            <div className="text-white/50 text-[10px] sm:text-[11px] tracking-widest uppercase mb-0.5">
              HYDROSTATIC LOAD
            </div>
            <div className="text-lg sm:text-2xl font-light text-white tracking-tight">
              {pressureAtm} <span className="text-xs text-amber-400 font-normal">ATM</span>
            </div>
            <div className="text-[9px] sm:text-[10px] text-white/40">
              ≈ {metricTonsPerSqCm} Metric Ton / cm²
            </div>
          </div>

          <div className="flex items-center justify-end gap-1.5 text-cyan-200">
            <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs sm:text-sm font-light">{tempC}°C</span>
            <span className="text-[9px] sm:text-[10px] text-white/40">WATER TEMP</span>
          </div>
        </div>
      </div>
    </div>
  );
};
