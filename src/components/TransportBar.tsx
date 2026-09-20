import React from 'react';
import { BookOpen, Pause, Play, Radio, Volume2, VolumeX } from 'lucide-react';
import { NARRATION_TOTAL_DURATION } from '../lib/narrative-cues';

interface TransportBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  currentTime: number;
  onSeek: (time: number) => void;
  onManualPing: () => void;
  isArchiveOpen: boolean;
  onToggleArchive: () => void;
}

export const TransportBar: React.FC<TransportBarProps> = ({
  isPlaying,
  onTogglePlay,
  isMuted,
  onToggleMute,
  currentTime,
  onSeek,
  onManualPing,
  isArchiveOpen,
  onToggleArchive
}) => {
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.max(0, (currentTime / NARRATION_TOTAL_DURATION) * 100));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 sm:px-8 py-3 bg-[#020408]/90 backdrop-blur-md border-t border-white/10 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 font-mono text-xs">
        {/* Left Play/Pause & Mute Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 transition-colors shadow-[0_0_10px_rgba(56,189,248,0.2)]"
            title={isPlaying ? 'Pause (Space / K)' : 'Play (Space / K)'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-cyan-400" />}
          </button>

          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white transition-colors"
            title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onManualPing}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-cyan-300 hover:border-cyan-500/30 transition-colors"
            title="Acoustic Sonar Ping"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>SONAR</span>
          </button>
        </div>

        {/* Center Scrubber Progress Bar */}
        <div className="flex-1 max-w-2xl flex items-center gap-3">
          <span className="text-white/40 text-[11px] w-10 text-right">
            {formatTime(currentTime)}
          </span>

          <div
            className="relative flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              onSeek(pos * NARRATION_TOTAL_DURATION);
            }}
          >
            {/* Progress Fill */}
            <div
              className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-sky-400 to-cyan-300 rounded-full group-hover:brightness-125 transition-all shadow-[0_0_8px_rgba(56,189,248,0.4)]"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Scrubber Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          <span className="text-white/40 text-[11px] w-10">
            {formatTime(NARRATION_TOTAL_DURATION)}
          </span>
        </div>

        {/* Right Dossier Toggle & Expedition Log */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleArchive}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-medium text-[11px] tracking-wider transition-all ${
              isArchiveOpen
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-white/20'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">ARCHIVES</span>
            <span className="sm:hidden">DOCS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
