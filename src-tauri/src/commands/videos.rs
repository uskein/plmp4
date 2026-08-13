use crate::db::DbState;
use crate::db::models::Video;
use crate::utils::thumbnail::generate_thumbnail;
use crate::utils::video_info::get_video_duration;
use tauri::State;

#[tauri::command]
pub fn import_video(
    state: State<'_, DbState>,
    file_path: String,
    collection_id: String,
) -> Result<Video, String> {
    log::info!("Importing video: {}", file_path);

    if !std::path::Path::new(&file_path).exists() {
        return Err(format!("File not found: {}", file_path));
    }

    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    // Check if video already exists by file_path
    let existing: Option<Video> = conn
        .query_row(
            "SELECT id, title, file_path, collection_id, duration_seconds, playback_position, thumbnail_path, last_watched_at, created_at FROM videos WHERE file_path = ?1",
            rusqlite::params![file_path],
            |row| Ok(Video {
                id: row.get(0)?,
                title: row.get(1)?,
                file_path: row.get(2)?,
                collection_id: row.get(3)?,
                duration_seconds: row.get(4)?,
                playback_position: row.get(5)?,
                thumbnail_path: row.get(6)?,
                last_watched_at: row.get(7)?,
                created_at: row.get(8)?,
            }),
        )
        .ok();

    if let Some(video) = existing {
        log::info!("Video already exists with id: {}", video.id);
        return Ok(video);
    }

    let id = uuid::Uuid::new_v4().to_string();
    let title = std::path::Path::new(&file_path)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("Untitled")
        .to_string();

    // Generate thumbnail
    let thumbnail_dir = std::env::temp_dir().join("plmp4_thumbnails");
    std::fs::create_dir_all(&thumbnail_dir).ok();
    let thumbnail_path = thumbnail_dir.join(format!("{}.jpg", id));

    match generate_thumbnail(std::path::Path::new(&file_path), &thumbnail_path) {
        Ok(()) => log::info!("Thumbnail generated"),
        Err(e) => log::warn!("Thumbnail generation failed (non-fatal): {}", e),
    }

    let thumb_str = thumbnail_path.to_str().unwrap_or("");

    // Get video duration
    let duration = match get_video_duration(std::path::Path::new(&file_path)) {
        Ok(d) => {
            log::info!("Video duration: {}s", d);
            d
        }
        Err(e) => {
            log::warn!("Duration detection failed (non-fatal): {}", e);
            0.0
        }
    };

    let coll_id = if collection_id.is_empty() { None } else { Some(collection_id.clone()) };

    conn.execute(
        "INSERT INTO videos (id, title, file_path, collection_id, duration_seconds, thumbnail_path) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![id, title, file_path, coll_id, duration, thumb_str],
    )
    .map_err(|e| format!("Database insert failed: {}", e))?;

    log::info!("Video imported with id: {}", id);

    Ok(Video {
        id,
        title,
        file_path,
        collection_id: coll_id,
        duration_seconds: duration,
        playback_position: 0.0,
        thumbnail_path: if thumb_str.is_empty() { None } else { Some(thumb_str.to_string()) },
        last_watched_at: None,
        created_at: chrono::Utc::now().to_rfc3339(),
    })
}

#[tauri::command]
pub fn list_videos(
    state: State<'_, DbState>,
    collection_id: String,
) -> Result<Vec<Video>, String> {
    log::info!("list_videos called, collection_id: {:?}", collection_id);
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    // Debug: count total videos
    let total: i64 = conn
        .query_row("SELECT COUNT(*) FROM videos", [], |row| row.get(0))
        .unwrap_or(-1);
    log::info!("Total videos in DB: {}", total);

    let mut videos = Vec::new();

    if collection_id.is_empty() {
        log::info!("Querying all videos (no filter)");
        let mut stmt = conn
            .prepare("SELECT id, title, file_path, collection_id, duration_seconds, playback_position, thumbnail_path, last_watched_at, created_at FROM videos ORDER BY last_watched_at DESC")
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map([], |row| {
                Ok(Video {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    file_path: row.get(2)?,
                    collection_id: row.get(3)?,
                    duration_seconds: row.get(4)?,
                    playback_position: row.get(5)?,
                    thumbnail_path: row.get(6)?,
                    last_watched_at: row.get(7)?,
                    created_at: row.get(8)?,
                })
            })
            .map_err(|e| e.to_string())?;
        for r in rows {
            match r {
                Ok(v) => videos.push(v),
                Err(e) => log::error!("Failed to deserialize video row: {}", e),
            }
        }
    } else {
        log::info!("Querying with collection_id filter: {:?}", collection_id);
        let mut stmt = conn
            .prepare("SELECT id, title, file_path, collection_id, duration_seconds, playback_position, thumbnail_path, last_watched_at, created_at FROM videos WHERE collection_id = ?1 ORDER BY last_watched_at DESC")
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map(rusqlite::params![collection_id], |row| {
                Ok(Video {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    file_path: row.get(2)?,
                    collection_id: row.get(3)?,
                    duration_seconds: row.get(4)?,
                    playback_position: row.get(5)?,
                    thumbnail_path: row.get(6)?,
                    last_watched_at: row.get(7)?,
                    created_at: row.get(8)?,
                })
            })
            .map_err(|e| e.to_string())?;
        for r in rows {
            match r {
                Ok(v) => videos.push(v),
                Err(e) => log::error!("Failed to deserialize video row: {}", e),
            }
        }
    }

    log::info!("list_videos returning {} videos", videos.len());
    Ok(videos)
}

#[tauri::command]
pub fn update_video_progress(
    state: State<'_, DbState>,
    video_id: String,
    timestamp: f64,
) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE videos SET playback_position = ?1, last_watched_at = datetime('now') WHERE id = ?2",
        rusqlite::params![timestamp, video_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_video(
    state: State<'_, DbState>,
    video_id: String,
) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM videos WHERE id = ?1", rusqlite::params![video_id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
