import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { Video, VideoAnnotation, Collection, VirtualNotebook, Note } from "@/types";

// ─── Video Player State ───────────────────────────────────────────────

interface PlayerState {
  currentVideo: Video | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  annotations: VideoAnnotation[];
  setCurrentVideo: (video: Video | null) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setFullscreen: (fullscreen: boolean) => void;
  loadAnnotations: (videoId: string) => Promise<void>;
  addAnnotation: (videoId: string, timestamp: number, text: string, color?: string) => Promise<void>;
  updateAnnotation: (annotationId: string, text: string, color?: string) => Promise<void>;
  deleteAnnotation: (annotationId: string) => Promise<void>;
  saveProgress: (videoId: string, timestamp: number) => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentVideo: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  isFullscreen: false,
  annotations: [],

  setCurrentVideo: (video) => set({ currentVideo: video, currentTime: 0, isPlaying: false }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  setMuted: (muted) => set({ isMuted: muted }),
  setFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),

  loadAnnotations: async (videoId) => {
    const annotations = await invoke<VideoAnnotation[]>("list_annotations", { videoId });
    set({ annotations });
  },

  addAnnotation: async (videoId, timestamp, text, color) => {
    await invoke("add_annotation", {
      videoId,
      timestampSeconds: timestamp,
      noteText: text,
      highlightColor: color ?? "#C9A84C",
    });
    await get().loadAnnotations(videoId);
  },

  updateAnnotation: async (annotationId, text, color) => {
    await invoke("update_annotation", {
      annotationId,
      noteText: text,
      highlightColor: color,
    });
    const video = get().currentVideo;
    if (video) await get().loadAnnotations(video.id);
  },

  deleteAnnotation: async (annotationId) => {
    await invoke("delete_annotation", { annotationId });
    const video = get().currentVideo;
    if (video) await get().loadAnnotations(video.id);
  },

  saveProgress: async (videoId, timestamp) => {
    await invoke("update_video_progress", { videoId, timestamp });
  },
}));

// ─── Library State ────────────────────────────────────────────────────

interface LibraryState {
  videos: Video[];
  collections: Collection[];
  currentCollectionId: string | null;
  isLoading: boolean;
  loadVideos: (collectionId?: string) => Promise<void>;
  loadCollections: (parentId?: string) => Promise<void>;
  importVideo: (filePath: string, collectionId?: string) => Promise<Video>;
  createCollection: (name: string, parentId?: string, coverImage?: string) => Promise<Collection>;
  updateCollection: (collectionId: string, name?: string, coverImage?: string) => Promise<void>;
  deleteCollection: (collectionId: string) => Promise<void>;
  deleteVideo: (videoId: string) => Promise<void>;
  setCurrentCollection: (id: string | null) => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  videos: [],
  collections: [],
  currentCollectionId: null,
  isLoading: false,

  loadVideos: async (collectionId) => {
    set({ isLoading: true });
    const id = collectionId ?? get().currentCollectionId;
    console.log("Loading videos for collection:", id);
    try {
      const videos = await invoke<Video[]>("list_videos", {
        collectionId: id ?? "",
      });
      console.log("Loaded videos:", videos.length);
      set({ videos, isLoading: false });
    } catch (err) {
      console.error("Failed to load videos:", err);
      set({ isLoading: false });
    }
  },

  loadCollections: async (parentId) => {
    const collections = await invoke<Collection[]>("list_collections", {
      parentId: parentId ?? "",
    });
    set({ collections });
  },

  importVideo: async (filePath, collectionId) => {
    try {
      const video = await invoke<Video>("import_video", {
        filePath,
        collectionId: collectionId ?? get().currentCollectionId ?? "",
      });
      await get().loadVideos();
      return video;
    } catch (err) {
      console.error("Rust import_video error:", err);
      throw err;
    }
  },

  createCollection: async (name, parentId, coverImage) => {
    const collection = await invoke<Collection>("create_collection", {
      name,
      parentId: parentId ?? "",
      coverImage: coverImage ?? null,
    });
    await get().loadCollections(parentId);
    return collection;
  },

  updateCollection: async (collectionId, name, coverImage) => {
    await invoke("update_collection", {
      collectionId,
      name: name ?? null,
      coverImage: coverImage ?? null,
    });
    await get().loadCollections(get().currentCollectionId ?? undefined);
  },

  deleteCollection: async (collectionId) => {
    await invoke("delete_collection", { collectionId });
    if (get().currentCollectionId === collectionId) {
      set({ currentCollectionId: null });
    }
    await get().loadCollections(get().currentCollectionId ?? undefined);
    await get().loadVideos(get().currentCollectionId ?? undefined);
  },

  deleteVideo: async (videoId) => {
    await invoke("delete_video", { videoId });
    await get().loadVideos();
  },

  setCurrentCollection: (id) => set({ currentCollectionId: id }),
}));

// ─── Notebooks State ──────────────────────────────────────────────────

interface NotebooksState {
  notebooks: VirtualNotebook[];
  currentNotebook: VirtualNotebook | null;
  notes: Note[];
  isLoading: boolean;
  loadNotebooks: () => Promise<void>;
  createNotebook: (title: string) => Promise<VirtualNotebook>;
  selectNotebook: (notebook: VirtualNotebook) => Promise<void>;
  loadNotes: (notebookId: string) => Promise<void>;
  createNote: (notebookId: string) => Promise<Note>;
  updateNote: (noteId: string, content: string) => Promise<void>;
}

export const useNotebooksStore = create<NotebooksState>((set, get) => ({
  notebooks: [],
  currentNotebook: null,
  notes: [],
  isLoading: false,

  loadNotebooks: async () => {
    const notebooks = await invoke<VirtualNotebook[]>("list_notebooks");
    set({ notebooks });
  },

  createNotebook: async (title) => {
    const notebook = await invoke<VirtualNotebook>("create_notebook", { title });
    await get().loadNotebooks();
    return notebook;
  },

  selectNotebook: async (notebook) => {
    set({ currentNotebook: notebook, isLoading: true });
    const notes = await invoke<Note[]>("list_notes", { notebookId: notebook.id });
    set({ notes, isLoading: false });
  },

  loadNotes: async (notebookId) => {
    const notes = await invoke<Note[]>("list_notes", { notebookId });
    set({ notes });
  },

  createNote: async (notebookId) => {
    const note = await invoke<Note>("create_note", { notebookId, content: "" });
    const notes = [...get().notes, note];
    set({ notes });
    return note;
  },

  updateNote: async (noteId, content) => {
    await invoke("update_note", { noteId, content });
    const notes = get().notes.map((n) => (n.id === noteId ? { ...n, content } : n));
    set({ notes });
  },
}));
