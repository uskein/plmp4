import { useEffect, useState } from "react";
import { useLibraryStore, usePlayerStore } from "@/stores";
import { open } from "@tauri-apps/plugin-dialog";
import { assetUrl } from "@/lib/tauri";
import { formatDuration } from "@/lib/utils";
import type { Video } from "@/types";
import type { View } from "@/App";

interface LibraryViewProps {
  onNavigate: (view: View) => void;
}

export default function LibraryView({ onNavigate }: LibraryViewProps) {
  const {
    videos,
    collections,
    currentCollectionId,
    isLoading,
    loadVideos,
    loadCollections,
    importVideo,
    createCollection,
    updateCollection,
    deleteCollection,
    deleteVideo,
    setCurrentCollection,
  } = useLibraryStore();

  const { setCurrentVideo } = usePlayerStore();

  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionCover, setNewCollectionCover] = useState<string | null>(null);

  const [videoContextMenu, setVideoContextMenu] = useState<{ videoId: string; x: number; y: number } | null>(null);
  const [colContextMenu, setColContextMenu] = useState<{ colId: string; colName: string; x: number; y: number } | null>(null);

  const [editingCollection, setEditingCollection] = useState<{ id: string; name: string } | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    loadCollections(currentCollectionId ?? undefined);
    loadVideos(currentCollectionId ?? undefined);
  }, [currentCollectionId, loadCollections, loadVideos]);

  // Close context menus on outside click
  useEffect(() => {
    const handler = () => {
      setVideoContextMenu(null);
      setColContextMenu(null);
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  // ─── Video handlers ────────────────────────────────────────────

  const handleImport = async () => {
    try {
      const selected = await open({
        multiple: true,
        filters: [{ name: "Video", extensions: ["mp4", "mkv", "webm", "avi", "mov"] }],
      });
      if (!selected) return;
      const paths = Array.isArray(selected) ? selected : [selected];
      for (const path of paths) {
        await importVideo(path);
      }
    } catch (err) {
      console.error("Import failed:", err);
      alert("Error al importar: " + String(err));
    }
  };

  const handlePlayVideo = (video: Video) => {
    setCurrentVideo(video);
    onNavigate("player");
  };

  const handleVideoContextMenu = (e: React.MouseEvent, videoId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setVideoContextMenu({ videoId, x: e.clientX, y: e.clientY });
  };

  const handleDeleteVideo = async () => {
    if (videoContextMenu) {
      await deleteVideo(videoContextMenu.videoId);
      setVideoContextMenu(null);
    }
  };

  // ─── Collection handlers ───────────────────────────────────────

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    await createCollection(newCollectionName.trim(), undefined, newCollectionCover ?? undefined);
    setNewCollectionName("");
    setNewCollectionCover(null);
    setShowNewCollection(false);
  };

  const handlePickCoverImage = async (target: "new" | "edit") => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "Imagen", extensions: ["png", "jpg", "jpeg", "gif", "webp"] }],
      });
      if (!selected) return;
      const path = typeof selected === "string" ? selected : selected;
      if (target === "new") {
        setNewCollectionCover(path);
      } else if (editingCollection) {
        await updateCollection(editingCollection.id, undefined, path);
        setEditingCollection(null);
        await loadCollections(currentCollectionId ?? undefined);
      }
    } catch (err) {
      console.error("Error selecting cover:", err);
    }
  };

  const handleColContextMenu = (e: React.MouseEvent, colId: string, colName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setColContextMenu({ colId, colName, x: e.clientX, y: e.clientY });
  };

  const handleRenameCollection = () => {
    if (!colContextMenu) return;
    setEditingCollection({ id: colContextMenu.colId, name: colContextMenu.colName });
    setEditName(colContextMenu.colName);
    setColContextMenu(null);
  };

  const handleSaveRename = async () => {
    if (!editingCollection || !editName.trim()) return;
    await updateCollection(editingCollection.id, editName.trim());
    setEditingCollection(null);
    setEditName("");
    await loadCollections(currentCollectionId ?? undefined);
  };

  const handleDeleteCollection = async () => {
    if (!colContextMenu) return;
    if (!confirm(`¿Eliminar la carpeta "${colContextMenu.colName}"?\nLos videos se moverán a la biblioteca principal.`)) {
      setColContextMenu(null);
      return;
    }
    await deleteCollection(colContextMenu.colId);
    setColContextMenu(null);
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-imperial-gold">
            {currentCollectionId
              ? collections.find((c) => c.id === currentCollectionId)?.name ?? "Colección"
              : "Biblioteca de Videos"}
          </h1>
          <p className="text-xs text-imperial-muted mt-1">
            {videos.length} video{videos.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewCollection(true)}
            className="btn-imperial text-xs flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 4h10M2 7h10M2 10h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M7 2v10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Nueva Carpeta
          </button>
          <button onClick={handleImport} className="btn-gold text-xs flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v8M3 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 10v2h10v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Import Video
          </button>
        </div>
      </div>

      {/* New collection form */}
      {showNewCollection && (
        <div className="animate-slide-down">
          <div className="bg-imperial-carbon border border-imperial-strong rounded-xl p-4 max-w-md space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateCollection()}
                placeholder="Nombre de colección..."
                className="input-imperial flex-1 text-sm"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePickCoverImage("new")}
                className="btn-imperial text-xs flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round"/>
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                  <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Portada
              </button>
              {newCollectionCover && (
                <div className="flex items-center gap-2">
                  <img
                    src={assetUrl(newCollectionCover)}
                    alt="Portada"
                    className="w-10 h-10 rounded-lg object-cover border border-imperial"
                  />
                  <button
                    onClick={() => setNewCollectionCover(null)}
                    className="text-imperial-muted hover:text-imperial-wine-light text-xs"
                  >
                    Quitar
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleCreateCollection} className="btn-gold text-xs px-3 py-2">
                Crear
              </button>
              <button
                onClick={() => { setShowNewCollection(false); setNewCollectionName(""); setNewCollectionCover(null); }}
                className="btn-imperial text-xs px-3 py-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      {currentCollectionId && (
        <div className="flex items-center gap-2 text-xs text-imperial-muted">
          <button
            onClick={() => setCurrentCollection(null)}
            className="hover:text-imperial-gold transition-colors"
          >
            Biblioteca
          </button>
          <span>/</span>
          <span className="text-imperial-cream">
            {collections.find((c) => c.id === currentCollectionId)?.name}
          </span>
        </div>
      )}

      {/* Collections grid */}
      {collections.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-sans font-medium text-imperial-muted uppercase tracking-wider">Carpetas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {collections.map((col) => (
              <div
                key={col.id}
                className="card-imperial flex flex-col text-left hover:border-imperial-strong transition-all group cursor-pointer"
                onContextMenu={(e) => handleColContextMenu(e, col.id, col.name)}
              >
                <button
                  onClick={() => setCurrentCollection(col.id)}
                  className="flex-1 p-4 flex flex-col items-center gap-2"
                >
                  {col.cover_image ? (
                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-imperial-carbon border border-imperial/50">
                      <img
                        src={assetUrl(col.cover_image)}
                        alt={col.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-video rounded-lg bg-imperial-carbon border border-imperial flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 18 18" fill="none" className="text-imperial-gold">
                        <path d="M2 4.5C2 3.67 2.67 3 3.5 3H7l1.5 1.5H14.5c.83 0 1.5.67 1.5 1.5V13.5c0 .83-.67 1.5-1.5 1.5h-11C2.67 15 2 14.33 2 13.5V4.5z" stroke="currentColor" strokeWidth="1.2"/>
                      </svg>
                    </div>
                  )}
                  <p className="text-sm text-imperial-cream truncate w-full text-center">{col.name}</p>
                </button>
                {/* Hover actions */}
                <div className="flex items-center justify-center gap-1 pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleColContextMenu(e, col.id, col.name);
                    }}
                    className="text-imperial-muted hover:text-imperial-cream p-1 rounded transition-colors"
                    title="Opciones"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                      <circle cx="8" cy="3" r="1.5"/>
                      <circle cx="8" cy="8" r="1.5"/>
                      <circle cx="8" cy="13" r="1.5"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos grid */}
      <div className="space-y-2 flex-1">
        <h2 className="text-xs font-sans font-medium text-imperial-muted uppercase tracking-wider">Videos</h2>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-imperial animate-pulse">
                <div className="aspect-video bg-imperial-carbon" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-imperial-carbon rounded w-3/4" />
                  <div className="h-2 bg-imperial-carbon rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-full bg-imperial-carbon border border-imperial flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-imperial-muted">
                <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M10 8l6 4-6 4V8z" fill="currentColor"/>
              </svg>
            </div>
            <p className="font-serif text-imperial-muted mb-2">Sin videos aún</p>
            <p className="text-xs text-imperial-muted/60 mb-4">
              Importa tu primer video para comenzar
            </p>
            <button onClick={handleImport} className="btn-gold text-xs">
              Importar Video
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {videos.map((video) => (
              <button
                key={video.id}
                onClick={() => handlePlayVideo(video)}
                onContextMenu={(e) => handleVideoContextMenu(e, video.id)}
                className="card-imperial text-left group"
              >
                <div className="aspect-video bg-imperial-carbon relative overflow-hidden">
                  {video.thumbnail_path ? (
                    <img
                      src={assetUrl(video.thumbnail_path)}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-imperial-muted">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1"/>
                        <path d="M10 8l6 4-6 4V8z" fill="currentColor"/>
                      </svg>
                    </div>
                  )}
                  {video.duration_seconds > 0 && (
                    <span className="absolute bottom-2 right-2 bg-black/80 text-imperial-cream text-[10px] font-mono px-1.5 py-0.5 rounded">
                      {formatDuration(video.duration_seconds)}
                    </span>
                  )}
                  {video.playback_position > 0 && video.duration_seconds > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-imperial-ash/40">
                      <div
                        className="h-full bg-imperial-gold"
                        style={{ width: `${(video.playback_position / video.duration_seconds) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm text-imperial-cream truncate">{video.title}</p>
                  {video.last_watched_at && (
                    <p className="text-[10px] text-imperial-muted mt-1">
                      Última vista: {new Date(video.last_watched_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Video context menu */}
      {videoContextMenu && (
        <div
          className="fixed z-50 glass-heavy rounded-xl shadow-glass py-1 min-w-[140px]"
          style={{ top: videoContextMenu.y, left: videoContextMenu.x }}
        >
          <button
            onClick={() => {
              const video = videos.find((v) => v.id === videoContextMenu.videoId);
              if (video) handlePlayVideo(video);
              setVideoContextMenu(null);
            }}
            className="w-full px-3 py-2 text-left text-xs text-imperial-cream hover:bg-imperial-slate transition-colors"
          >
            Reproducir
          </button>
          <button
            onClick={handleDeleteVideo}
            className="w-full px-3 py-2 text-left text-xs text-imperial-wine-light hover:bg-imperial-slate transition-colors"
          >
            Eliminar
          </button>
        </div>
      )}

      {/* Collection context menu */}
      {colContextMenu && (
        <div
          className="fixed z-50 glass-heavy rounded-xl shadow-glass py-1 min-w-[160px]"
          style={{ top: colContextMenu.y, left: colContextMenu.x }}
        >
          <button
            onClick={() => setCurrentCollection(colContextMenu.colId)}
            className="w-full px-3 py-2 text-left text-xs text-imperial-cream hover:bg-imperial-slate transition-colors"
          >
            Abrir carpeta
          </button>
          <button
            onClick={handleRenameCollection}
            className="w-full px-3 py-2 text-left text-xs text-imperial-cream hover:bg-imperial-slate transition-colors"
          >
            Renombrar
          </button>
          <button
            onClick={() => handlePickCoverImage("edit")}
            className="w-full px-3 py-2 text-left text-xs text-imperial-cream hover:bg-imperial-slate transition-colors"
          >
            Cambiar portada
          </button>
          <div className="border-t border-imperial my-1" />
          <button
            onClick={handleDeleteCollection}
            className="w-full px-3 py-2 text-left text-xs text-imperial-wine-light hover:bg-imperial-slate transition-colors"
          >
            Eliminar carpeta
          </button>
        </div>
      )}

      {/* Rename collection modal */}
      {editingCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-heavy rounded-2xl shadow-glass-lg w-[400px] overflow-hidden">
            <div className="px-5 py-4 border-b border-imperial">
              <h3 className="font-serif text-sm text-imperial-gold">Renombrar carpeta</h3>
            </div>
            <div className="px-5 py-4 space-y-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
                className="input-imperial text-sm"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-imperial">
              <button
                onClick={() => setEditingCollection(null)}
                className="btn-imperial text-xs px-4 py-2"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRename}
                disabled={!editName.trim()}
                className="btn-gold text-xs px-4 py-2 disabled:opacity-40"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
