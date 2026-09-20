import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CameraViewMode, OceanScene } from './lib/three/ocean-scene';
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

  // App Phase
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentCue, setCurrentCue] = useState<NarrativeCue | null>(null);
  const [currentDepth, setCurrentDepth] = useState(0);
  const [currentZone, setCurrentZone] = useState<OceanZone>('EPIPELAGIC');

  // Interactive Surprise Features
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('CHASE');
  const [isProtocol002, setIsProtocol002] = useState(false);
  const [, setPingCount] = useState(0);

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
      },
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

  // Initiate Descent
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

  // Camera View Toggle
  const handleToggleCamera = useCallback(() => {
    if (!sceneRef.current) return;
    const nextMode = sceneRef.current.toggleCameraView();
    setCameraMode(nextMode);
  }, []);

  // Trigger Protocol 002 (Strelizia Overdrive Easter Egg)
  const handleTriggerProtocol002 = useCallback(() => {
    setIsProtocol002((prev) => {
      const next = !prev;
      sceneRef.current?.setProtocol002(next);
      if (next) {
        hadalAudio.triggerKlaxosaurResonance();
      }
      return next;
    });
  }, []);

  // Manual Sonar Ping + 3D Shockwave
  const handleManualPing = useCallback(() => {
    hadalAudio.triggerSonarPing();
    sceneRef.current?.triggerAcousticShockwave();
    setPingCount((prev) => {
      const next = prev + 1;
      // Auto-unlock easter egg on 3 pings in deep water
      if (next >= 3 && !isProtocol002) {
        handleTriggerProtocol002();
      }
      return next;
    });
  }, [handleTriggerProtocol002, isProtocol002]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      } else if (e.code === 'KeyV') {
        e.preventDefault();
        handleToggleCamera();
      } else if (e.code === 'KeyX') {
        e.preventDefault();
        handleTriggerProtocol002();
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
  }, [handleTogglePlay, handleToggleMute, handleManualPing, handleToggleCamera, handleTriggerProtocol002]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020408]">
      {/* 3D WebGL Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block touch-none cursor-crosshair"
      />

      {/* Cockpit First-Person Glass Viewport Overlay when in COCKPIT mode */}
      {cameraMode === 'COCKPIT' && (
        <div className="pointer-events-none absolute inset-0 z-10 border-[35px] sm:border-[55px] border-black/80 rounded-full opacity-60 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]" />
      )}

      {/* Protocol 002 Crimson Flare Overlay */}
      {isProtocol002 && (
        <div className="pointer-events-none absolute inset-0 z-10 border-2 border-red-500/30 bg-red-950/10 shadow-[inset_0_0_80px_rgba(239,68,68,0.25)] animate-pulse" />
      )}

      {/* Hidden Master Narration Audio Element */}
      <audio
        ref={vocalAudioRef}
        src="/audio/hadal-narration.mp3"
        preload="auto"
        onEnded={() => {
          setIsPlaying(false);
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
          cameraMode={cameraMode}
          onToggleCamera={handleToggleCamera}
          isProtocol002={isProtocol002}
          onTriggerProtocol002={handleTriggerProtocol002}
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
