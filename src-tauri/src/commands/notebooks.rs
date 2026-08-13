use crate::db::DbState;
use crate::db::models::{Collection, VirtualNotebook, Note};
use tauri::State;

#[tauri::command]
pub fn create_collection(
    state: State<'_, DbState>,
    name: String,
    parent_id: String,
    cover_image: Option<String>,
) -> Result<Collection, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let id = uuid::Uuid::new_v4().to_string();
    let pid = if parent_id.is_empty() { None } else { Some(parent_id) };

    conn.execute(
        "INSERT INTO collections (id, name, parent_id, cover_image) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![id, name, pid, cover_image],
    )
    .map_err(|e| e.to_string())?;

    Ok(Collection {
        id,
        name,
        parent_id: pid,
        cover_image,
        created_at: chrono::Utc::now().to_rfc3339(),
    })
}

#[tauri::command]
pub fn list_collections(
    state: State<'_, DbState>,
    parent_id: String,
) -> Result<Vec<Collection>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    let query = if parent_id.is_empty() {
        "SELECT id, name, parent_id, cover_image, created_at FROM collections WHERE parent_id IS NULL ORDER BY name"
    } else {
        "SELECT id, name, parent_id, cover_image, created_at FROM collections WHERE parent_id = ?1 ORDER BY name"
    };

    let mut stmt = conn.prepare(query).map_err(|e| e.to_string())?;

    let row_mapper = |row: &rusqlite::Row| {
        Ok(Collection {
            id: row.get(0)?,
            name: row.get(1)?,
            parent_id: row.get(2)?,
            cover_image: row.get(3)?,
            created_at: row.get(4)?,
        })
    };

    let rows = if parent_id.is_empty() {
        stmt.query_map([], row_mapper)
            .map_err(|e| e.to_string())?
    } else {
        stmt.query_map(rusqlite::params![parent_id], row_mapper)
            .map_err(|e| e.to_string())?
    };

    Ok(rows.filter_map(|r| r.ok()).collect())
}

#[tauri::command]
pub fn update_collection(
    state: State<'_, DbState>,
    collection_id: String,
    name: Option<String>,
    cover_image: Option<String>,
) -> Result<Collection, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    if let Some(n) = &name {
        conn.execute(
            "UPDATE collections SET name = ?1 WHERE id = ?2",
            rusqlite::params![n, collection_id],
        )
        .map_err(|e| e.to_string())?;
    }

    if cover_image.is_some() {
        conn.execute(
            "UPDATE collections SET cover_image = ?1 WHERE id = ?2",
            rusqlite::params![cover_image, collection_id],
        )
        .map_err(|e| e.to_string())?;
    }

    let mut stmt = conn
        .prepare("SELECT id, name, parent_id, cover_image, created_at FROM collections WHERE id = ?1")
        .map_err(|e| e.to_string())?;

    stmt.query_row(rusqlite::params![collection_id], |row| {
        Ok(Collection {
            id: row.get(0)?,
            name: row.get(1)?,
            parent_id: row.get(2)?,
            cover_image: row.get(3)?,
            created_at: row.get(4)?,
        })
    })
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_collection(
    state: State<'_, DbState>,
    collection_id: String,
) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    // Move videos out of this collection before deleting
    conn.execute(
        "UPDATE videos SET collection_id = NULL WHERE collection_id = ?1",
        rusqlite::params![collection_id],
    )
    .map_err(|e| e.to_string())?;

    conn.execute(
        "DELETE FROM collections WHERE id = ?1",
        rusqlite::params![collection_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn create_notebook(
    state: State<'_, DbState>,
    title: String,
) -> Result<VirtualNotebook, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO virtual_notebooks (id, title, created_at, updated_at) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![id, title, now, now],
    )
    .map_err(|e| e.to_string())?;

    Ok(VirtualNotebook {
        id,
        title,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn list_notebooks(
    state: State<'_, DbState>,
) -> Result<Vec<VirtualNotebook>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, title, created_at, updated_at FROM virtual_notebooks ORDER BY updated_at DESC")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(VirtualNotebook {
                id: row.get(0)?,
                title: row.get(1)?,
                created_at: row.get(2)?,
                updated_at: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(rows.filter_map(|r| r.ok()).collect())
}

#[tauri::command]
pub fn create_note(
    state: State<'_, DbState>,
    notebook_id: String,
    content: Option<String>,
) -> Result<Note, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let id = uuid::Uuid::new_v4().to_string();
    let content = content.unwrap_or_default();

    let max_pos: i32 = conn
        .query_row(
            "SELECT COALESCE(MAX(position_order), -1) FROM notes WHERE notebook_id = ?1",
            rusqlite::params![notebook_id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    let position_order = max_pos + 1;

    conn.execute(
        "INSERT INTO notes (id, notebook_id, content, position_order) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![id, notebook_id, content, position_order],
    )
    .map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE virtual_notebooks SET updated_at = datetime('now') WHERE id = ?1",
        rusqlite::params![notebook_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(Note {
        id,
        notebook_id,
        content,
        position_order,
        created_at: chrono::Utc::now().to_rfc3339(),
    })
}

#[tauri::command]
pub fn update_note(
    state: State<'_, DbState>,
    note_id: String,
    content: String,
) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE notes SET content = ?1 WHERE id = ?2",
        rusqlite::params![content, note_id],
    )
    .map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE virtual_notebooks SET updated_at = datetime('now') WHERE id = (SELECT notebook_id FROM notes WHERE id = ?1)",
        rusqlite::params![note_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn list_notes(
    state: State<'_, DbState>,
    notebook_id: String,
) -> Result<Vec<Note>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, notebook_id, content, position_order, created_at FROM notes WHERE notebook_id = ?1 ORDER BY position_order ASC")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(rusqlite::params![notebook_id], |row| {
            Ok(Note {
                id: row.get(0)?,
                notebook_id: row.get(1)?,
                content: row.get(2)?,
                position_order: row.get(3)?,
                created_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(rows.filter_map(|r| r.ok()).collect())
}
