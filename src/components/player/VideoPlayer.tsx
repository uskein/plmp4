import { useRef, useState, useEffect, useCallback } from "react";
import { usePlayerStore } from "@/stores";
import { assetUrl } from "@/lib/tauri";
import { formatTime } from "@/lib/utils";
import { open } from "@tauri-apps/plugin-dialog";
import AnnotationPanel from "./AnnotationPanel";

export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const annotationInputRef = useRef<HTMLTextAreaElement>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout>>();

  const {
    currentVideo,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    annotations,
    setPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    setMuted,
    saveProgress,
  } = usePlayerStore();

  const [showControls, setShowControls] = useState(true);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showAnnotationInput, setShowAnnotationInput] = useState(false);
  const [annotationText, setAnnotationText] = useState("");
  const [annotationColor, setAnnotationColor] = useState("#C9A84C");
  const [wasPlayingBeforeAnnotation, setWasPlayingBeforeAnnotation] = useState(false);

  // ─── Video element sync ────────────────────────────────────────

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTimeUpdate = () => {
      if (!isSeeking) setCurrentTime(video.currentTime);
    };
    const onLoadedMetadata = () => {
      setDuration(video.duration);
      if (currentVideo && currentVideo.playback_position > 0) {
        video.currentTime = currentVideo.playback_position;
      }
    };
    const onEnded = () => setPlaying(false);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("ended", onEnded);
    };
  }, [currentVideo, isSeeking, setCurrentTime, setDuration, setPlaying]);

  // ─── Auto-save progress every 5 seconds ────────────────────────

  useEffect(() => {
    if (!currentVideo) return;
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (video && !video.paused) {
        saveProgress(currentVideo.id, video.currentTime);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentVideo, saveProgress]);

  // ─── Controls visibility ───────────────────────────────────────

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, [isPlaying, resetHideTimer]);

  // ─── Playback controls ─────────────────────────────────────────

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.paused ? video.play() : video.pause();
  };

  const seek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(time, video.duration || 0));
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seek(pct * (duration || 0));
  };

  const handleProgressDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsSeeking(true);
    handleProgressClick(e);

    const onMove = (ev: MouseEvent) => {
      const rect = progressRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pct = (ev.clientX - rect.left) / rect.width;
      seek(pct * (duration || 0));
    };

    const onUp = () => {
      setIsSeeking(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen();
    }
  };

  // ─── Keyboard shortcuts (disabled during annotation input) ─────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!currentVideo) return;
      if (showAnnotationInput) return;
      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seek((videoRef.current?.currentTime ?? 0) - 5);
          break;
        case "ArrowRight":
          e.preventDefault();
          seek((videoRef.current?.currentTime ?? 0) + 5);
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          setMuted(!isMuted);
          if (videoRef.current) videoRef.current.muted = !isMuted;
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentVideo, isMuted, showAnnotationInput, togglePlay, setMuted]);

  // ─── Annotation controls ───────────────────────────────────────

  const openAnnotationInput = () => {
    const video = videoRef.current;
    if (video && !video.paused) {
      setWasPlayingBeforeAnnotation(true);
      video.pause();
    } else {
      setWasPlayingBeforeAnnotation(false);
    }
    setShowAnnotationInput(true);
    setTimeout(() => annotationInputRef.current?.focus(), 50);
  };

  const closeAnnotationInput = () => {
    setShowAnnotationInput(false);
    setAnnotationText("");
    if (wasPlayingBeforeAnnotation && videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleAnnotationSubmit = async () => {
    if (!annotationText.trim() || !currentVideo) return;
    const { addAnnotation } = usePlayerStore.getState();
    await addAnnotation(currentVideo.id, currentTime, annotationText.trim(), annotationColor);
    setAnnotationText("");
    setShowAnnotationInput(false);
    if (wasPlayingBeforeAnnotation && videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleInsertImage = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "Imagen", extensions: ["png", "jpg", "jpeg", "gif", "webp", "bmp"] }],
      });
      if (!selected) return;
      const path = typeof selected === "string" ? selected : selected;
      const imageMarkdown = `\n![imagen](${path})\n`;
      setAnnotationText((prev) => prev + imageMarkdown);
      annotationInputRef.current?.focus();
    } catch (err) {
      console.error("Error selecting image:", err);
    }
  };

  // ─── Seek to annotation ────────────────────────────────────────

  const seekToAnnotation = (timestamp: number) => {
    seek(timestamp);
    if (videoRef.current?.paused) videoRef.current.play();
  };

  // ─── No video state ────────────────────────────────────────────

  if (!currentVideo) {
    return (
      <div className="h-full flex items-center justify-center bg-imperial-black">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-imperial-carbon border border-imperial flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-imperial-gold">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 8l6 4-6 4V8z" fill="currentColor"/>
            </svg>
          </div>
          <p className="font-serif text-lg text-imperial-muted">Selecciona un video para reproducir</p>
        </div>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative h-full bg-black flex"
      onMouseMove={resetHideTimer}
    >
      {/* Video */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          src={assetUrl(currentVideo.file_path)}
          className="w-full h-full object-contain"
          onClick={togglePlay}
          playsInline
        />

        {/* Play overlay on click */}
        {!isPlaying && !showAnnotationInput && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity"
          >
            <div className="w-16 h-16 rounded-full bg-imperial-gold/90 flex items-center justify-center shadow-gold-glow-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#0A0A0A" className="ml-1">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </button>
        )}

        {/* Controls bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-16 pb-3 px-4">
            {/* Progress bar */}
            <div
              ref={progressRef}
              className="relative h-1.5 bg-imperial-ash/60 rounded-full cursor-pointer group mb-3"
              onMouseDown={handleProgressDown}
            >
              <div
                className="absolute top-0 left-0 h-full bg-imperial-gold rounded-full transition-[width] duration-75"
                style={{ width: `${progress}%` }}
              />
              <div className="absolute inset-0 -top-1 -bottom-1 group-hover:bg-imperial-ash/30 rounded-full transition-colors" />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-imperial-gold rounded-full shadow-gold-glow opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
              {annotations.map((ann) => (
                <div
                  key={ann.id}
                  className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full cursor-pointer z-10 hover:scale-150 transition-transform"
                  style={{
                    left: `${(ann.timestamp_seconds / (duration || 1)) * 100}%`,
                    backgroundColor: ann.highlight_color,
                  }}
                  title={ann.note_text}
                  onClick={(e) => {
                    e.stopPropagation();
                    seekToAnnotation(ann.timestamp_seconds);
                  }}
                />
              ))}
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} className="text-white hover:text-imperial-gold transition-colors">
                  {isPlaying ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1"/>
                      <rect x="14" y="4" width="4" height="16" rx="1"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
                <span className="text-xs text-imperial-cream/80 font-mono tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={showAnnotationInput ? closeAnnotationInput : openAnnotationInput}
                  className={`${showAnnotationInput ? "text-imperial-gold" : "text-imperial-cream/60 hover:text-imperial-gold"} transition-colors`}
                  title="Agregar anotación"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    {showAnnotationInput ? (
                      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round"/>
                    ) : (
                      <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
                    )}
                  </svg>
                </button>

                <button
                  onClick={() => setShowAnnotations(!showAnnotations)}
                  className={`transition-colors ${showAnnotations ? "text-imperial-gold" : "text-imperial-cream/60 hover:text-imperial-gold"}`}
                  title="Mostrar/ocultar anotaciones"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 6h16M4 12h10M4 18h14" strokeLinecap="round"/>
                  </svg>
                </button>

                <div className="flex items-center gap-2 group/vol">
                  <button
                    onClick={() => {
                      setMuted(!isMuted);
                      if (videoRef.current) videoRef.current.muted = !isMuted;
                    }}
                    className="text-imperial-cream/60 hover:text-imperial-gold transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none"/>
                        <path d="M23 9l-6 6M17 9l6 6" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none"/>
                        <path d="M15.5 8.5a5 5 0 010 7M19 5a10 10 0 010 14" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setVolume(v);
                      setMuted(v === 0);
                      if (videoRef.current) {
                        videoRef.current.volume = v;
                        videoRef.current.muted = v === 0;
                      }
                    }}
                    className="w-0 group-hover/vol:w-20 transition-all duration-200 accent-imperial-gold h-1 cursor-pointer"
                  />
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="text-imperial-cream/60 hover:text-imperial-gold transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Inline annotation input */}
        {showAnnotationInput && (
          <div className="absolute bottom-20 left-4 right-4 max-w-lg mx-auto animate-slide-up">
            <div className="glass-heavy rounded-xl p-4 shadow-glass">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-imperial-gold font-mono">{formatTime(currentTime)}</span>
                <span className="text-xs text-imperial-muted">— Nueva Anotación</span>
                <span className="text-[10px] text-imperial-muted/50 ml-auto">Markdown soportado</span>
              </div>
              <div className="flex gap-1 mb-2">
                {["#C9A84C", "#B08D57", "#6B2D3E", "#4A9B8F", "#8B7340"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setAnnotationColor(c)}
                    className={`w-5 h-5 rounded-full border-2 transition-transform ${
                      annotationColor === c ? "border-white scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <textarea
                ref={annotationInputRef}
                value={annotationText}
                onChange={(e) => setAnnotationText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleAnnotationSubmit();
                  }
                }}
                placeholder="Escribe tu anotación... (Ctrl+Enter para guardar)"
                className="input-imperial w-full text-sm min-h-[80px] max-h-[200px] resize-y font-mono"
                rows={3}
              />
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={handleInsertImage}
                  className="text-imperial-muted hover:text-imperial-gold transition-colors flex items-center gap-1.5 text-xs"
                  title="Insertar imagen"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                    <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Imagen
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={closeAnnotationInput} className="btn-imperial text-xs px-3 py-1.5">
                    Cancelar
                  </button>
                  <button onClick={handleAnnotationSubmit} className="btn-gold text-xs px-3 py-1.5">
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Annotations side panel */}
      {showAnnotations && (
        <AnnotationPanel onSeek={seekToAnnotation} onClose={() => setShowAnnotations(false)} />
      )}
    </div>
  );
}
