import React, { useState } from 'react';
import { ARCHIVE_PLATES } from '../lib/exploration-plates';
import { LanguageCode } from '../lib/types';
import { ChevronLeft, ChevronRight, FileText, X } from 'lucide-react';

interface ArchiveDossierProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
}

export const ArchiveDossier: React.FC<ArchiveDossierProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const currentPlate = ARCHIVE_PLATES[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : ARCHIVE_PLATES.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < ARCHIVE_PLATES.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-start p-4 sm:p-10 pointer-events-none select-none">
      {/* Dossier Card Container (Left Pinned Stage) */}
      <div className="w-full max-w-xl h-[85vh] max-h-[640px] flex flex-col justify-between p-6 sm:p-8 bg-[#020408]/85 backdrop-blur-2xl border border-white/10 rounded-xl pointer-events-auto shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-left-6 duration-500 overflow-hidden">
        {/* Top Header Rail */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <FileText className="w-4 h-4" />
            <span>ARCHIVE DOSSIER [{currentIndex + 1}/{ARCHIVE_PLATES.length}]</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              title="Close Dossier"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin scrollbar-thumb-cyan-500/20">
          {/* Eyebrow & Badges */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-semibold">
              {currentPlate.depth}
            </span>
            <span className="text-white/40">{currentPlate.year}</span>
            <span className="text-white/40">·</span>
            <span className="text-white/60">{currentPlate.expedition}</span>
          </div>

          {/* Titles */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-light text-white tracking-tight">
              {currentPlate.title}
            </h2>
            <div className="text-xs font-mono text-cyan-400/80 mt-0.5">
              {currentPlate.subtitle}
            </div>
          </div>

          {/* Description Paragraph */}
          <p className="text-xs sm:text-sm font-sans font-light leading-relaxed text-cyan-100/80">
            {lang === 'id' ? currentPlate.description_id : currentPlate.description}
          </p>

          {/* Technical Specifications Grid */}
          <div className="pt-2">
            <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2">
              INSTRUMENT & MISSION LOGS
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {currentPlate.specs.map((spec, i) => (
                <div key={i} className="p-2.5 rounded bg-white/[0.03] border border-white/5 space-y-0.5">
                  <div className="text-[9px] text-white/40">{spec.label}</div>
                  <div className="text-cyan-200 font-medium text-[11px]">{spec.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {currentPlate.tags.map((tag, i) => (
              <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Navigation Controls */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4 font-mono text-xs">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-white/70 hover:text-cyan-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>PREV</span>
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {ARCHIVE_PLATES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentIndex === i ? 'w-5 bg-cyan-400' : 'bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-white/70 hover:text-cyan-200 transition-colors"
          >
            <span>NEXT</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
