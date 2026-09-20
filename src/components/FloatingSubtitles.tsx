import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { LanguageCode, NarrativeCue } from '../lib/types';

interface FloatingSubtitlesProps {
  currentCue: NarrativeCue | null;
  lang: LanguageCode;
  onLangChange: (newLang: LanguageCode) => void;
  showCaptions: boolean;
  onToggleCaptions: () => void;
}

const CAPTION_HANDOVER = 0.16; // Head start given to outgoing line

function CaptionBlock({ cue, lang }: { cue: NarrativeCue; lang: LanguageCode }) {
  // English is the primary spoken script
  const translation = lang === 'id' ? cue.id_id : lang === 'ja' ? cue.ja : null;

  return (
    <div className="w-full text-center px-4 max-w-4xl select-none">
      <p 
        lang="en" 
        className="caption-legible font-serif text-[clamp(1.15rem,2.5vw,2.2rem)] font-light leading-[1.38] tracking-[-0.012em] text-white text-balance"
      >
        {cue.en}
      </p>
      {translation && (
        <p 
          lang={lang} 
          className="caption-legible mt-2 sm:mt-2.5 font-serif text-[clamp(0.85rem,1.55vw,1.25rem)] font-light leading-[1.45] text-cyan-200/80 text-balance"
        >
          {translation}
        </p>
      )}
    </div>
  );
}

export const FloatingSubtitles: React.FC<FloatingSubtitlesProps> = ({
  currentCue,
  lang,
  onLangChange,
  showCaptions,
  onToggleCaptions,
}) => {
  const [caption, setCaption] = useState<{
    current: NarrativeCue | null;
    previous: NarrativeCue | null;
  }>({
    current: null,
    previous: null,
  });

  const cueIdRef = useRef<number | null>(null);
  const captionCurrentRef = useRef<HTMLDivElement>(null);
  const captionPreviousRef = useRef<HTMLDivElement>(null);

  // Synchronize cue transitions
  useEffect(() => {
    const id = currentCue?.id ?? null;
    if (id !== cueIdRef.current) {
      cueIdRef.current = id;
      setCaption((prev) => ({
        current: currentCue,
        previous: prev.current,
      }));
    }
  }, [currentCue]);

  // Animate Current Incoming Caption (Float up from y: 8 to 0)
  useEffect(() => {
    const element = captionCurrentRef.current;
    if (!element) return;
    gsap.killTweensOf(element);

    if (!caption.current) {
      gsap.set(element, { opacity: 0, y: 0 });
      return;
    }

    gsap.fromTo(
      element,
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: 0.72,
        delay: CAPTION_HANDOVER,
        ease: 'power2.out',
      }
    );

    return () => {
      gsap.killTweensOf(element);
    };
  }, [caption.current]);

  // Animate Previous Outgoing Caption (Float up from y: 0 to -8 and dissolve)
  useEffect(() => {
    const element = captionPreviousRef.current;
    if (!element || !caption.previous) return;
    gsap.killTweensOf(element);

    gsap.fromTo(
      element,
      { opacity: 1, y: 0 },
      {
        opacity: 0,
        y: -8,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          setCaption((prev) =>
            prev.previous === caption.previous ? { ...prev, previous: null } : prev
          );
        },
      }
    );

    return () => {
      gsap.killTweensOf(element);
    };
  }, [caption.previous]);

  if (!showCaptions) {
    return (
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <button
          onClick={onToggleCaptions}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-white/40 hover:text-white text-xs font-mono transition-colors"
        >
          <span>[CC OFF]</span>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* 1. Deep Optical Vignette Scrim (identical to Pale Blue Dot) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-10 h-[52vh]"
        style={{
          background:
            'linear-gradient(to top, rgba(2,4,8,0.92) 0%, rgba(2,4,8,0.78) 28%, rgba(2,4,8,0.60) 65%, rgba(2,4,8,0) 100%)',
        }}
      />

      {/* 2. Captions Stage (Pinned just above the transport bar) */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[5.8rem] sm:bottom-[6.8rem] z-20 flex justify-center px-6 sm:px-10">
        <div className="relative h-[8.5rem] w-[min(70rem,92vw)] sm:h-[10rem]">
          {/* Outgoing layer */}
          <div
            ref={captionPreviousRef}
            aria-hidden="true"
            className="absolute inset-0 flex items-end justify-center opacity-0"
          >
            {caption.previous ? <CaptionBlock cue={caption.previous} lang={lang} /> : null}
          </div>

          {/* Incoming layer */}
          <div
            ref={captionCurrentRef}
            aria-live="polite"
            className="absolute inset-0 flex items-end justify-center opacity-0"
          >
            {caption.current ? <CaptionBlock cue={caption.current} lang={lang} /> : null}
          </div>
        </div>
      </div>

      {/* 3. Language Selector Pill (Small, clean, docked at bottom transport) */}
      <div className="fixed bottom-3 right-28 sm:right-36 z-50 pointer-events-auto flex items-center bg-black/50 border border-white/10 rounded-lg p-0.5 font-mono text-[10px] text-white/50">
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
    </>
  );
};
