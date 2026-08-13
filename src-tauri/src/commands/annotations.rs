use crate::db::DbState;
use crate::db::models::VideoAnnotation;
use tauri::State;

#[tauri::command]
pub fn add_annotation(
    state: State<'_, DbState>,
    video_id: String,
    timestamp_seconds: f64,
    note_text: String,
    highlight_color: Option<String>,
) -> Result<VideoAnnotation, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let id = uuid::Uuid::new_v4().to_string();
    let color = highlight_color.unwrap_or_else(|| "#C9A84C".to_string());

    conn.execute(
        "INSERT INTO video_annotations (id, video_id, timestamp_seconds, note_text, highlight_color) VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![id, video_id, timestamp_seconds, note_text, color],
    )
    .map_err(|e| e.to_string())?;

    Ok(VideoAnnotation {
        id,
        video_id,
        timestamp_seconds,
        note_text,
        highlight_color: color,
        created_at: chrono::Utc::now().to_rfc3339(),
    })
}

#[tauri::command]
pub fn list_annotations(
    state: State<'_, DbState>,
    video_id: String,
) -> Result<Vec<VideoAnnotation>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, video_id, timestamp_seconds, note_text, highlight_color, created_at FROM video_annotations WHERE video_id = ?1 ORDER BY timestamp_seconds ASC")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(rusqlite::params![video_id], |row| {
            Ok(VideoAnnotation {
                id: row.get(0)?,
                video_id: row.get(1)?,
                timestamp_seconds: row.get(2)?,
                note_text: row.get(3)?,
                highlight_color: row.get(4)?,
                created_at: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(rows.filter_map(|r| r.ok()).collect())
}

#[tauri::command]
pub fn update_annotation(
    state: State<'_, DbState>,
    annotation_id: String,
    note_text: String,
    highlight_color: Option<String>,
) -> Result<VideoAnnotation, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    if let Some(color) = &highlight_color {
        conn.execute(
            "UPDATE video_annotations SET note_text = ?1, highlight_color = ?2 WHERE id = ?3",
            rusqlite::params![note_text, color, annotation_id],
        )
        .map_err(|e| e.to_string())?;
    } else {
        conn.execute(
            "UPDATE video_annotations SET note_text = ?1 WHERE id = ?2",
            rusqlite::params![note_text, annotation_id],
        )
        .map_err(|e| e.to_string())?;
    }

    let mut stmt = conn
        .prepare("SELECT id, video_id, timestamp_seconds, note_text, highlight_color, created_at FROM video_annotations WHERE id = ?1")
        .map_err(|e| e.to_string())?;

    stmt.query_row(rusqlite::params![annotation_id], |row| {
        Ok(VideoAnnotation {
            id: row.get(0)?,
            video_id: row.get(1)?,
            timestamp_seconds: row.get(2)?,
            note_text: row.get(3)?,
            highlight_color: row.get(4)?,
            created_at: row.get(5)?,
        })
    })
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_annotation(
    state: State<'_, DbState>,
    annotation_id: String,
) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "DELETE FROM video_annotations WHERE id = ?1",
        rusqlite::params![annotation_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}
