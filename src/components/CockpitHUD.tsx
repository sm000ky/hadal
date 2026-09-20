import React, { useEffect, useState } from 'react';
import { OceanZone } from '../lib/types';
import { Activity, Radio, Shield, Thermometer, Waves } from 'lucide-react';

interface CockpitHUDProps {
  depthMeters: number;
  zone: OceanZone;
  onManualPing: () => void;
}

export const CockpitHUD: React.FC<CockpitHUDProps> = ({
  depthMeters,
  zone,
  onManualPing
}) => {
  // Pressure: 1 ATM at 0m, adds 1 ATM every 10m
  const pressureAtm = (1.0 + depthMeters * 0.0987).toFixed(1);
  const metricTonsPerSqCm = ((1.0 + depthMeters * 0.0987) * 0.001033).toFixed(2);

  // Temperature: 28.2°C at surface, drops to 1.2°C at bottom
  const fraction = Math.min(1, Math.max(0, depthMeters / 10994));
  const tempC = (28.2 * Math.pow(0.042, fraction)).toFixed(1);

  // Micro jitter on telemetry (simulates DSN/Acoustic ranging Doppler noise)
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
    <div className="pointer-events-none fixed inset-0 z-30 flex flex-col justify-between p-4 sm:p-8 font-mono text-xs select-none">
      {/* Top Telemetry Rail */}
      <div className="flex items-start justify-between w-full">
        {/* Top Left: Depth Meter */}
        <div className="space-y-2 pointer-events-auto">
          <div className="flex items-center gap-2 text-white/50 text-[11px] tracking-widest uppercase">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>HYDROSTATIC DEPTH</span>
          </div>
          
          <div className="flex items-baseline gap-1 text-white">
            <span className="text-3xl sm:text-5xl font-mono font-light tracking-tighter">
              -{Math.floor(depthMeters).toLocaleString()}
            </span>
            <span className="text-lg sm:text-2xl text-cyan-400 font-light">.{jitter}</span>
            <span className="text-xs text-cyan-400/70 font-semibold ml-1">METERS</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded border text-[10px] tracking-wider font-semibold uppercase ${getZoneColor()}`}>
              {zone}
            </span>
            <span className="text-white/40 text-[10px]">
              {depthMeters < 200 ? 'SUNLIGHT ZONE' : depthMeters < 1000 ? 'TWILIGHT REALM' : depthMeters < 4000 ? 'MIDNIGHT VOID' : depthMeters < 6000 ? 'THE ABYSS' : 'HADAL TRENCH'}
            </span>
          </div>
        </div>

        {/* Top Right: Hydrostatic Pressure & Temperature */}
        <div className="text-right space-y-3 pointer-events-auto">
          <div>
            <div className="text-white/50 text-[11px] tracking-widest uppercase mb-1">
              HYDROSTATIC LOAD
            </div>
            <div className="text-xl sm:text-2xl font-light text-white tracking-tight">
              {pressureAtm} <span className="text-xs text-amber-400 font-normal">ATM</span>
            </div>
            <div className="text-[10px] text-white/40">
              ≈ {metricTonsPerSqCm} Metric Ton / cm²
            </div>
          </div>

          <div className="flex items-center justify-end gap-1.5 text-cyan-200">
            <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-sm font-light">{tempC}°C</span>
            <span className="text-[10px] text-white/40">WATER TEMP</span>
          </div>
        </div>
      </div>

      {/* Center Reticle / Compass Crosshair (Subtle) */}
      <div className="absolute inset-0 m-auto w-32 h-32 pointer-events-none opacity-20 flex items-center justify-center">
        <div className="w-full h-[1px] bg-cyan-400" />
        <div className="absolute w-[1px] h-full bg-cyan-400" />
        <div className="absolute w-20 h-20 border border-cyan-400 rounded-full" />
      </div>

      {/* Bottom Telemetry Rail */}
      <div className="flex items-end justify-between w-full pb-14 sm:pb-16">
        {/* Bottom Left: Sonar Radar & Ping Control */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Circular Sonar Radar */}
          <div 
            onClick={onManualPing}
            title="Click to trigger Active Sonar Acoustic Ping"
            className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-cyan-500/40 bg-cyan-950/40 flex items-center justify-center cursor-pointer hover:border-cyan-400 transition-colors shadow-[0_0_15px_rgba(56,189,248,0.2)]"
          >
            {/* Concentric rings */}
            <div className="absolute w-10 h-10 border border-cyan-500/20 rounded-full" />
            <div className="absolute w-5 h-5 border border-cyan-500/30 rounded-full" />
            {/* Sweeper Line */}
            <div className="absolute w-full h-full rounded-full border-t-2 border-r-2 border-cyan-400/80 animate-spin" style={{ animationDuration: '3.5s' }} />
            {/* Center blip */}
            <div className="w-2 h-2 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-[11px]">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>SONAR ACTIVE (1,180 Hz)</span>
            </div>
            <div className="text-[10px] text-white/40">
              Acoustic Return: {depthMeters > 6000 ? 'TRENCH WALLS REVERB' : 'CLEAR HORIZON'}
            </div>
            <button
              onClick={onManualPing}
              className="text-[10px] text-cyan-300 hover:text-white underline decoration-cyan-500/50"
            >
              [PING RADAR]
            </button>
          </div>
        </div>

        {/* Bottom Right: Vessel Hull Integrity & Systems */}
        <div className="text-right space-y-1.5 pointer-events-auto">
          <div className="flex items-center justify-end gap-1.5 text-emerald-400 text-[11px] font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>HULL INTEGRITY: 100% NOMINAL</span>
          </div>
          <div className="text-[10px] text-white/50 flex items-center justify-end gap-2">
            <span>DSV STRELIZIA</span>
            <span>·</span>
            <span>GRADE-23 TITANIUM SPHERE</span>
          </div>
          <div className="text-[9px] text-white/30 flex items-center justify-end gap-1">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>LIFE SUPPORT 99.8% · CABIN 1.0 ATM</span>
          </div>
        </div>
      </div>
    </div>
  );
};
