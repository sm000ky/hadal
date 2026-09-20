import React from 'react';
import { LanguageCode, NarrativeCue } from '../lib/types';
import { Subtitles } from 'lucide-react';

interface FloatingSubtitlesProps {
  currentCue: NarrativeCue | null;
  lang: LanguageCode;
  onLangChange: (newLang: LanguageCode) => void;
  showCaptions: boolean;
  onToggleCaptions: () => void;
}

export const FloatingSubtitles: React.FC<FloatingSubtitlesProps> = ({
  currentCue,
  lang,
  onLangChange,
  showCaptions,
  onToggleCaptions
}) => {
  if (!showCaptions) {
    return (
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={onToggleCaptions}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-white/40 hover:text-white text-xs font-mono transition-colors"
        >
          <Subtitles className="w-3.5 h-3.5" />
          <span>[CC OFF]</span>
        </button>
      </div>
    );
  }

  const getPrimaryText = () => {
    if (!currentCue) return '';
    switch (lang) {
      case 'id': return currentCue.id_id;
      case 'ja': return currentCue.ja;
      case 'en':
      default:
        return currentCue.en;
    }
  };

  const getSecondaryText = () => {
    if (!currentCue) return '';
    // If Indonesian is selected, show English as reference
    if (lang === 'id') return currentCue.en;
    // If Japanese is selected, show English as reference
    if (lang === 'ja') return currentCue.en;
    // If English is selected, show Indonesian below it
    return currentCue.id_id;
  };

  const primary = getPrimaryText();
  const secondary = getSecondaryText();

  return (
    <div className="fixed bottom-16 sm:bottom-20 left-0 right-0 z-40 flex flex-col items-center pointer-events-none px-6 text-center select-none">
      {/* Subtitle Box (Pure Floating Typography, No Opaque Black Box) */}
      <div className="max-w-3xl space-y-2 pointer-events-auto">
        {/* Active Cue Badge */}
        {currentCue && (
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono tracking-widest uppercase mb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            <span>CUE {String(currentCue.id).padStart(2, '0')}</span>
            <span>·</span>
            <span>-{currentCue.depthMeters}M</span>
          </div>
        )}

        {/* Primary Subtitle Line (Dual-Layer Dissolve) */}
        <div 
          className={`font-serif text-xl sm:text-3xl font-normal tracking-wide text-white leading-relaxed drop-shadow-[0_2px_18px_rgba(0,0,0,0.98)] transition-all duration-700 ${
            primary ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          {primary || <span className="opacity-0">...</span>}
        </div>

        {/* Secondary Reference Subtitle Line */}
        <div 
          className={`font-sans text-xs sm:text-sm font-light text-cyan-200/60 tracking-wider drop-shadow-[0_2px_12px_rgba(0,0,0,0.98)] transition-all duration-700 delay-100 ${
            secondary ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          {secondary}
        </div>

        {/* Language Controls & CC Toggle */}
        <div className="flex items-center justify-center gap-3 pt-2 text-[10px] font-mono text-white/40">
          <div className="flex items-center bg-black/40 rounded-md border border-white/10 p-0.5">
            <button
              onClick={() => onLangChange('en')}
              className={`px-2 py-0.5 rounded transition-colors ${
                lang === 'en' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLangChange('id')}
              className={`px-2 py-0.5 rounded transition-colors ${
                lang === 'id' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'hover:text-white'
              }`}
            >
              ID
            </button>
            <button
              onClick={() => onLangChange('ja')}
              className={`px-2 py-0.5 rounded transition-colors ${
                lang === 'ja' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'hover:text-white'
              }`}
            >
              JA
            </button>
          </div>

          <button
            onClick={onToggleCaptions}
            className="px-2 py-0.5 rounded bg-black/40 border border-white/10 hover:text-white text-cyan-400"
          >
            [CC ON]
          </button>
        </div>
      </div>
    </div>
  );
};
