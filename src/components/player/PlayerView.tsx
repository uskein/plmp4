import { useState } from "react";
import { usePlayerStore } from "@/stores";
import VideoPlayer from "@/components/player/VideoPlayer";
import type { View } from "@/App";

interface PlayerViewProps {
  onNavigate: (view: View) => void;
}

export default function PlayerView({ onNavigate }: PlayerViewProps) {
  const { currentVideo } = usePlayerStore();
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="h-full flex flex-col">
      {/* Top bar with back button */}
      <div className="flex items-center justify-between px-4 py-2 glass-heavy border-b border-imperial shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("library")}
            className="text-imperial-muted hover:text-imperial-gold transition-colors flex items-center gap-2 text-xs"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Biblioteca
          </button>
          {currentVideo && (
            <span className="text-xs text-imperial-cream truncate max-w-xs">
              {currentVideo.title}
            </span>
          )}
        </div>
        {currentVideo && (
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`text-xs transition-colors ${showInfo ? "text-imperial-gold" : "text-imperial-muted hover:text-imperial-gold"}`}
          >
            Info
          </button>
        )}
      </div>

      {/* Player + optional info */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1">
          <VideoPlayer />
        </div>

        {showInfo && currentVideo && (
          <div className="w-72 glass-heavy border-l border-imperial p-4 overflow-y-auto animate-fade-in">
            <h3 className="font-serif text-sm text-imperial-gold mb-3">Info del Video</h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-imperial-muted">Título</span>
                <p className="text-imperial-cream mt-0.5">{currentVideo.title}</p>
              </div>
              <div>
                <span className="text-imperial-muted">Archivo</span>
                <p className="text-imperial-cream/70 mt-0.5 break-all font-mono text-[10px]">
                  {currentVideo.file_path}
                </p>
              </div>
              {currentVideo.duration_seconds > 0 && (
                <div>
                  <span className="text-imperial-muted">Duración</span>
                  <p className="text-imperial-cream mt-0.5">
                    {Math.floor(currentVideo.duration_seconds / 60)}m {Math.floor(currentVideo.duration_seconds % 60)}s
                  </p>
                </div>
              )}
              {currentVideo.playback_position > 0 && (
                <div>
                  <span className="text-imperial-muted">Última Posición</span>
                  <p className="text-imperial-cream mt-0.5 font-mono">
                    {Math.floor(currentVideo.playback_position / 60)}:{String(Math.floor(currentVideo.playback_position % 60)).padStart(2, "0")}
                  </p>
                </div>
              )}
              <div>
                <span className="text-imperial-muted">Agregado</span>
                <p className="text-imperial-cream mt-0.5">
                  {new Date(currentVideo.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
