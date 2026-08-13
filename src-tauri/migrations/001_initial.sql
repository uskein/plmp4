-- PLMP4 Database Schema
-- Video Library Manager with Synchronized Notes

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- Collections for organizing videos
CREATE TABLE IF NOT EXISTS collections (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    parent_id   TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (parent_id) REFERENCES collections(id) ON DELETE CASCADE
);

-- Videos in the library
CREATE TABLE IF NOT EXISTS videos (
    id                  TEXT PRIMARY KEY,
    title               TEXT NOT NULL,
    file_path           TEXT NOT NULL UNIQUE,
    collection_id       TEXT,
    duration_seconds    REAL DEFAULT 0,
    playback_position   REAL DEFAULT 0,
    thumbnail_path      TEXT,
    last_watched_at     TEXT,
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE SET NULL
);

-- Annotations tied to specific video timestamps
CREATE TABLE IF NOT EXISTS video_annotations (
    id              TEXT PRIMARY KEY,
    video_id        TEXT NOT NULL,
    timestamp_seconds REAL NOT NULL,
    note_text       TEXT NOT NULL,
    highlight_color TEXT DEFAULT '#C9A84C',
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

-- Virtual notebooks for general note-taking
CREATE TABLE IF NOT EXISTS virtual_notebooks (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Individual notes within notebooks
CREATE TABLE IF NOT EXISTS notes (
    id              TEXT PRIMARY KEY,
    notebook_id     TEXT NOT NULL,
    content         TEXT NOT NULL DEFAULT '',
    position_order  INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (notebook_id) REFERENCES virtual_notebooks(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_videos_collection ON videos(collection_id);
CREATE INDEX IF NOT EXISTS idx_videos_file_path ON videos(file_path);
CREATE INDEX IF NOT EXISTS idx_annotations_video ON video_annotations(video_id);
CREATE INDEX IF NOT EXISTS idx_annotations_timestamp ON video_annotations(video_id, timestamp_seconds);
CREATE INDEX IF NOT EXISTS idx_notes_notebook ON notes(notebook_id);
CREATE INDEX IF NOT EXISTS idx_collections_parent ON collections(parent_id);
