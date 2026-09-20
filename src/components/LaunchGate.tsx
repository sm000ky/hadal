import React from 'react';
import { Compass, Gauge, ShieldAlert, Waves } from 'lucide-react';

interface LaunchGateProps {
  onStart: () => void;
}

export const LaunchGate: React.FC<LaunchGateProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-12 bg-[#020408]/90 backdrop-blur-xl border border-white/10 transition-opacity duration-1000">
      {/* Top Protocol Header */}
      <div className="w-full flex items-center justify-between text-xs font-mono tracking-widest text-cyan-400/80 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Waves className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>EXPEDITION // DEEP TRENCH DESCENT</span>
        </div>
        <div className="flex items-center gap-4 text-white/50">
          <span>LAT 11°22'N</span>
          <span>LON 142°35'E</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            TELEMETRY ONLINE
          </span>
        </div>
      </div>

      {/* Center Cinematic Title & Initiation Gate */}
      <div className="max-w-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-widest uppercase">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
          Mariana Trench · Challenger Deep
        </div>

        <h1 className="text-5xl sm:text-7xl font-serif font-extralight tracking-tight text-white drop-shadow-[0_0_35px_rgba(56,189,248,0.3)]">
          HADAL <span className="font-mono text-cyan-400 font-normal text-3xl sm:text-4xl block sm:inline sm:ml-3">// -10,994M</span>
        </h1>

        <p className="text-sm sm:text-base text-cyan-100/70 font-sans font-light leading-relaxed max-w-xl mx-auto">
          An interactive scientific scrollytelling descent into the deepest known wound of our planet. 
          Experience real-time hydrostatic compression, optical water extinction, and the profound silence of Earth's Hadal abyss.
        </p>

        {/* Action Button */}
        <div className="pt-4">
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center px-10 py-4 font-mono text-sm tracking-widest text-cyan-200 uppercase bg-cyan-950/40 border border-cyan-500/50 hover:border-cyan-400 rounded-lg hover:bg-cyan-900/40 hover:text-white transition-all duration-300 shadow-[0_0_25px_rgba(56,189,248,0.25)] hover:shadow-[0_0_45px_rgba(56,189,248,0.5)] active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-3">
              <span>INITIATE DESCENT</span>
              <span className="group-hover:translate-y-0.5 transition-transform">↓</span>
            </span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/10 via-cyan-400/20 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <div className="text-[11px] font-mono text-cyan-200/70 mt-3 flex items-center justify-center gap-2">
            <span>🎙️ Narrated by Sir David Attenborough</span>
            <span>·</span>
            <span>Web Audio & 3D WebGL</span>
          </div>
        </div>
      </div>

      {/* Bottom Technical Indicators */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10 pt-4 text-xs font-mono">
        <div className="space-y-1">
          <div className="text-white/40 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>MAX HYDROSTATIC PRESSURE</span>
          </div>
          <div className="text-white font-semibold">1,086.0 ATM (15,960 PSI)</div>
        </div>

        <div className="space-y-1">
          <div className="text-white/40 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>TARGET COORDINATES</span>
          </div>
          <div className="text-white font-semibold">Pacific Subduction Arc</div>
        </div>

        <div className="space-y-1">
          <div className="text-white/40">OPTICAL VISIBILITY</div>
          <div className="text-cyan-300 font-semibold">0.0% Below 1,000m</div>
        </div>

        <div className="space-y-1">
          <div className="text-white/40">AUTHORS</div>
          <div className="text-cyan-400 font-semibold">sm000ky × Zero Two</div>
        </div>
      </div>
    </div>
  );
};
