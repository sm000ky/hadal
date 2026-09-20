import React, { useCallback, useEffect, useRef, useState } from 'react';
import { OceanScene } from './lib/three/ocean-scene';
import { hadalAudio } from './lib/audio-synth';
import { getActiveCue, NARRATION_TOTAL_DURATION } from './lib/narrative-cues';
import { LanguageCode, NarrativeCue, OceanZone } from './lib/types';
import { LaunchGate } from './components/LaunchGate';
import { CockpitHUD } from './components/CockpitHUD';
import { FloatingSubtitles } from './components/FloatingSubtitles';
import { ArchiveDossier } from './components/ArchiveDossier';
import { TransportBar } from './components/TransportBar';

export function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const vocalAudioRef = useRef<HTMLAudioElement | null>(null);
  const sceneRef = useRef<OceanScene | null>(null);

  // App Phase: 'gate' (intro), 'active' (diving/listening)
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentCue, setCurrentCue] = useState<NarrativeCue | null>(null);
  const [currentDepth, setCurrentDepth] = useState(0);
  const [currentZone, setCurrentZone] = useState<OceanZone>('EPIPELAGIC');

  // Subtitle & Language preferences
  const [lang, setLang] = useState<LanguageCode>('en');
  const [showCaptions, setShowCaptions] = useState(true);

  // Archive Dossier
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  // Initialize Three.js Scene on mount
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new OceanScene({
      canvas: canvasRef.current,
      onReady: () => {
        console.log('Ocean Scene initialized.');
      }
    });
    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
      hadalAudio.dispose();
    };
  }, []);

  // Sync Asymmetric Frustum Shift when Archive is toggled
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setCompositionShift(isArchiveOpen ? 1.0 : 0.0);
    }
  }, [isArchiveOpen]);

  // Master Audio Clock RAF Loop (Source of Truth)
  useEffect(() => {
    let animId: number;

    const updateClock = () => {
      const audio = vocalAudioRef.current;
      if (audio && !audio.paused) {
        const t = audio.currentTime;
        setCurrentTime(t);

        // Derive active cue from exact audio timestamp
        const cue = getActiveCue(t);
        setCurrentCue(cue);

        // Derive depth and zone
        if (cue) {
          setCurrentDepth(cue.depthMeters);
          setCurrentZone(cue.zone);
          if (sceneRef.current) {
            sceneRef.current.setDepth(cue.depthMeters);
          }
          hadalAudio.updateDepth(cue.depthMeters);
          hadalAudio.setDucking(true);
        } else {
          hadalAudio.setDucking(false);
          // If past end of narration, remain at 10,994m
          if (t >= NARRATION_TOTAL_DURATION - 1.0) {
            setCurrentDepth(10994);
            setCurrentZone('HADALPELAGIC');
            if (sceneRef.current) sceneRef.current.setDepth(10994);
            hadalAudio.updateDepth(10994);
          }
        }
      }
      animId = requestAnimationFrame(updateClock);
    };

    animId = requestAnimationFrame(updateClock);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Initiate Descent (Gate button clicked)
  const handleStart = useCallback(() => {
    setHasStarted(true);
    setIsPlaying(true);

    const audio = vocalAudioRef.current;
    if (audio) {
      hadalAudio.init(audio);
      audio.play().catch((e) => console.warn('Audio play prevented:', e));
    } else {
      hadalAudio.init();
    }
  }, []);

  // Play / Pause Toggle
  const handleTogglePlay = useCallback(() => {
    const audio = vocalAudioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
      hadalAudio.init();
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  // Mute Toggle
  const handleToggleMute = useCallback(() => {
    const muted = hadalAudio.toggleMute();
    setIsMuted(muted);
  }, []);

  // Seek
  const handleSeek = useCallback((time: number) => {
    const audio = vocalAudioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);

    const cue = getActiveCue(time);
    if (cue) {
      setCurrentDepth(cue.depthMeters);
      setCurrentZone(cue.zone);
      if (sceneRef.current) sceneRef.current.setDepth(cue.depthMeters);
      hadalAudio.updateDepth(cue.depthMeters);
    }
  }, []);

  // Manual Sonar Ping
  const handleManualPing = useCallback(() => {
    hadalAudio.triggerSonarPing();
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space' || e.code === 'KeyK') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        handleToggleMute();
      } else if (e.code === 'KeyP') {
        e.preventDefault();
        handleManualPing();
      } else if (e.code === 'KeyC') {
        e.preventDefault();
        setShowCaptions((prev) => !prev);
      } else if (e.code === 'KeyA') {
        e.preventDefault();
        setIsArchiveOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handleToggleMute, handleManualPing]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020408]">
      {/* 3D WebGL Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block touch-none"
      />

      {/* Hidden Master Narration Audio Element */}
      <audio
        ref={vocalAudioRef}
        src="/audio/hadal-narration.mp3"
        preload="auto"
        onEnded={() => {
          setIsPlaying(false);
          // Automatically offer archives on descent completion
          setIsArchiveOpen(true);
        }}
      />

      {/* Start / Initiation Gate */}
      {!hasStarted && <LaunchGate onStart={handleStart} />}

      {/* Submersible Cockpit HUD Telemetry */}
      {hasStarted && (
        <CockpitHUD
          depthMeters={currentDepth}
          zone={currentZone}
          onManualPing={handleManualPing}
        />
      )}

      {/* Floating Lower-Third Kinetic Subtitles */}
      {hasStarted && (
        <FloatingSubtitles
          currentCue={currentCue}
          lang={lang}
          onLangChange={setLang}
          showCaptions={showCaptions}
          onToggleCaptions={() => setShowCaptions((prev) => !prev)}
        />
      )}

      {/* Archive Dossiers Modal with Asymmetric Frustum Shift */}
      <ArchiveDossier
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        lang={lang}
      />

      {/* Bottom Scrubber & Transport Controls */}
      {hasStarted && (
        <TransportBar
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          currentTime={currentTime}
          onSeek={handleSeek}
          onManualPing={handleManualPing}
          isArchiveOpen={isArchiveOpen}
          onToggleArchive={() => setIsArchiveOpen((prev) => !prev)}
        />
      )}
    </div>
  );
}

export default App;
